<?php
/**
 * PulseWork (GridCRM) — Granular RESTful Delta API v1
 * Provides RESTful CRUD with Optimistic Concurrency Locking (version control),
 * JWT Authentication, RBAC checks, Pagination, and Real-time Event Emission.
 *
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3, 8.4+
 */

declare(strict_types=1);

if (!defined('PULSEWORK_DB')) {
    define('PULSEWORK_DB', true);
}

// Set JSON headers and CORS
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// Map URL entity paths to database table names
const ENTITY_TABLE_MAP = [
    'companies' => 'companies',
    'deals' => 'deals',
    'invoices' => 'invoices',
    'quotes' => 'quotes',
    'quotations' => 'quotes',
    'projects' => 'projects',
    'tasks' => 'tasks',
    'time_entries' => 'time_entries',
    'timeentries' => 'time_entries',
    'contacts' => 'contacts',
    'individuals' => 'individuals',
    'products' => 'products',
    'events' => 'events',
    'expenses' => 'expenses',
    'suppliers' => 'suppliers',
    'payments' => 'payments',
    'bank_statements' => 'bank_statements',
    'bank_transactions' => 'bank_transactions',
    'subscriptions' => 'subscriptions',
    'contracts' => 'contracts',
    'work_orders' => 'work_orders',
    'workorders' => 'work_orders',
    'mileage_trips' => 'mileage_trips',
    'mileagetrips' => 'mileage_trips',
    'purchase_orders' => 'purchase_orders',
    'purchaseorders' => 'purchase_orders',
    'dunning_notices' => 'dunning_notices',
    'tickets' => 'tickets',
    'staff_capacities' => 'staff_capacities',
    'warehouse_locations' => 'warehouse_locations',
    'document_templates' => 'document_templates',
    'email_templates' => 'email_templates',
    'vat_rates' => 'vat_rates',
    'integrations' => 'integrations',
    'apikeys' => 'apikeys',
    'webhooks' => 'webhooks',
    'users' => 'users',
    'company_profile' => 'company_profile',
    'legal_entities' => 'legal_entities',
    'audit_logs' => 'audit_logs',
    'email_messages' => 'email_messages',
];

// Helper: Emit real-time event to event_stream table
function emitStreamEvent(string $eventName, string $entityType, string $entityId, array $data, ?string $actorId = null): void {
    try {
        [$pdo, $engine, $prefix] = getActivePdo();
        if ($pdo) {
            $eventId = 'evt_' . bin2hex(random_bytes(8));
            $jsonStr = json_encode($data, JSON_UNESCAPED_UNICODE);
            $stmt = $pdo->prepare("INSERT INTO `{$prefix}event_stream` (`id`, `event_name`, `entity_type`, `entity_id`, `actor_id`, `data_json`, `created_at`) VALUES (:id, :ev, :et, :ei, :act, :dj, :dt)");
            $stmt->execute([
                ':id' => $eventId,
                ':ev' => $eventName,
                ':et' => $entityType,
                ':ei' => $entityId,
                ':act' => (string)($actorId ?? 'system'),
                ':dj' => $jsonStr,
                ':dt' => date('Y-m-d H:i:s'),
            ]);
        }
    } catch (\Throwable $e) {}
}

// Parse request path, method, and parameters
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$endpoint = $_GET['endpoint'] ?? '';

if (empty($pathInfo) && !empty($endpoint)) {
    $pathInfo = '/' . ltrim($endpoint, '/');
}

if (empty($pathInfo) && isset($_SERVER['REQUEST_URI'])) {
    $uriParts = explode('?', $_SERVER['REQUEST_URI'], 2);
    $uriPath = $uriParts[0];
    if (preg_match('#/api/v1/(.+)$#', $uriPath, $matches)) {
        $pathInfo = '/' . $matches[1];
    }
}

$segments = array_values(array_filter(explode('/', trim($pathInfo, '/'))));
$entitySlug = strtolower($segments[0] ?? ($_GET['entity'] ?? ''));
$entityId = $segments[1] ?? ($_GET['id'] ?? null);

if (empty($entitySlug)) {
    sendResponse(true, 'PulseWork RESTful Delta API v1 operational.', [
        'version' => '1.0.0',
        'supportedEntities' => array_keys(ENTITY_TABLE_MAP),
    ]);
}

if (!isset(ENTITY_TABLE_MAP[$entitySlug])) {
    sendResponse(false, "Unknown resource '{$entitySlug}'.", [], 404);
}

$tableNameBase = ENTITY_TABLE_MAP[$entitySlug];
[$pdo, $engine, $prefix] = getActivePdo();
ensureAllTables($pdo, $engine, $prefix);
$fullTableName = "{$prefix}{$tableNameBase}";

// Optional or required JWT authentication
$userClaims = validateJwtToken(true);
$actorId = $userClaims['sub'] ?? 'usr_session';

// Check RBAC permissions for mutating actions
if (in_array($requestMethod, ['POST', 'PUT', 'DELETE', 'PATCH'], true) && $userClaims) {
    if ($tableNameBase === 'invoices' && $requestMethod === 'DELETE') {
        enforceRolePermission($userClaims, 'manage_invoices');
    }
    if ($tableNameBase === 'users' && in_array($requestMethod, ['POST', 'PUT', 'DELETE'], true)) {
        enforceRolePermission($userClaims, 'manage_users');
    }
    if ($tableNameBase === 'apikeys' || $tableNameBase === 'webhooks') {
        enforceRolePermission($userClaims, 'manage_api_keys');
    }
}

$input = getJsonInput();

try {
    switch ($requestMethod) {
        // ====================================================================
        // GET: List collection or single item
        // ====================================================================
        case 'GET': {
            if ($entityId !== null) {
                // Fetch single resource
                if ($pdo) {
                    $stmt = $pdo->prepare("SELECT * FROM `{$fullTableName}` WHERE `id` = :id LIMIT 1");
                    $stmt->execute([':id' => $entityId]);
                    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
                    if (!$row) {
                        sendResponse(false, "Resource not found with ID '{$entityId}'.", [], 404);
                    }
                    $recordData = !empty($row['data_json']) ? json_decode($row['data_json'], true) : $row;
                    if (is_array($recordData)) {
                        $recordData['id'] = $row['id'];
                        $recordData['version'] = (int)($recordData['version'] ?? 1);
                        $recordData['updated_at'] = $row['updated_at'] ?? date('c');
                        sendResponse(true, 'Resource fetched.', ['data' => $recordData]);
                    }
                    sendResponse(true, 'Resource fetched.', ['data' => $row]);
                } else {
                    $store = readJsonStore();
                    $items = $store[$tableNameBase] ?? [];
                    foreach ($items as $item) {
                        if ((string)($item['id'] ?? '') === $entityId) {
                            sendResponse(true, 'Resource fetched.', ['data' => $item]);
                        }
                    }
                    sendResponse(false, "Resource not found with ID '{$entityId}'.", [], 404);
                }
            } else {
                // Fetch collection with pagination & delta timestamp filter
                $page = max(1, (int)($_GET['page'] ?? 1));
                $limit = max(1, min(200, (int)($_GET['limit'] ?? 50)));
                $offset = ($page - 1) * $limit;
                $updatedSince = trim((string)($_GET['updated_since'] ?? ''));

                if ($pdo) {
                    $cols = getTableColumns($pdo, $fullTableName);
                    $whereClauses = [];
                    $params = [];

                    if (!empty($updatedSince) && in_array('updated_at', $cols, true)) {
                        $whereClauses[] = "`updated_at` >= :since";
                        $params[':since'] = date('Y-m-d H:i:s', strtotime($updatedSince));
                    }

                    $whereSql = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

                    // Count total
                    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `{$fullTableName}` {$whereSql}");
                    $countStmt->execute($params);
                    $total = (int)$countStmt->fetchColumn();

                    // Query items
                    $stmt = $pdo->prepare("SELECT * FROM `{$fullTableName}` {$whereSql} ORDER BY `id` DESC LIMIT {$limit} OFFSET {$offset}");
                    $stmt->execute($params);
                    $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                    $items = [];
                    foreach ($rows as $row) {
                        if (!empty($row['data_json'])) {
                            $decoded = json_decode($row['data_json'], true);
                            if (is_array($decoded)) {
                                $decoded['id'] = $row['id'];
                                $decoded['version'] = (int)($decoded['version'] ?? 1);
                                if (!empty($row['updated_at'])) $decoded['updated_at'] = $row['updated_at'];
                                $items[] = $decoded;
                                continue;
                            }
                        }
                        $items[] = $row;
                    }

                    sendResponse(true, 'Resource collection loaded.', [
                        'data' => $items,
                        'pagination' => [
                            'page' => $page,
                            'limit' => $limit,
                            'total' => $total,
                            'pages' => ceil($total / $limit),
                        ],
                    ]);
                } else {
                    $store = readJsonStore();
                    $items = $store[$tableNameBase] ?? [];
                    $total = count($items);
                    $slice = array_slice($items, $offset, $limit);
                    sendResponse(true, 'Resource collection loaded.', [
                        'data' => $slice,
                        'pagination' => [
                            'page' => $page,
                            'limit' => $limit,
                            'total' => $total,
                            'pages' => ceil($total / $limit),
                        ],
                    ]);
                }
            }
            break;
        }

        // ====================================================================
        // POST: Create new entity record
        // ====================================================================
        case 'POST': {
            $data = is_array($input) ? $input : [];
            $id = (string)($data['id'] ?? $entityId ?? uniqid($entitySlug . '_'));
            $data['id'] = $id;
            $data['version'] = 1;
            $nowIso = date('c');
            $data['createdAt'] = $data['createdAt'] ?? $data['created_at'] ?? $nowIso;
            $data['updatedAt'] = $nowIso;

            if ($pdo) {
                syncGenericTable($pdo, $fullTableName, [$data], 'id');
            } else {
                $store = readJsonStore();
                $items = $store[$tableNameBase] ?? [];
                $items[] = $data;
                $store[$tableNameBase] = $items;
                writeJsonStore($store);
            }

            emitStreamEvent("{$entitySlug}.created", $entitySlug, $id, $data, $actorId);

            sendResponse(true, "Resource '{$entitySlug}' created successfully.", [
                'data' => $data,
            ], 201);
            break;
        }

        // ====================================================================
        // PUT / PATCH: Update entity with Optimistic Locking
        // ====================================================================
        case 'PUT':
        case 'PATCH': {
            if (!$entityId && empty($input['id'])) {
                sendResponse(false, 'Missing resource ID for update.', [], 400);
            }

            $id = (string)($entityId ?: $input['id']);
            $incomingData = is_array($input) ? $input : [];
            $incomingVersion = isset($incomingData['version']) ? (int)$incomingData['version'] : null;

            // Fetch current server record to check version
            $existingRecord = null;
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT * FROM `{$fullTableName}` WHERE `id` = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
                $row = $stmt->fetch(\PDO::FETCH_ASSOC);
                if ($row) {
                    $existingRecord = !empty($row['data_json']) ? json_decode($row['data_json'], true) : $row;
                    if (is_array($existingRecord)) {
                        $existingRecord['id'] = $row['id'];
                        $existingRecord['version'] = (int)($existingRecord['version'] ?? 1);
                    }
                }
            } else {
                $store = readJsonStore();
                $items = $store[$tableNameBase] ?? [];
                foreach ($items as $item) {
                    if ((string)($item['id'] ?? '') === $id) {
                        $existingRecord = $item;
                        break;
                    }
                }
            }

            // If entity exists and incoming version is strictly older, return HTTP 409 Conflict
            if ($existingRecord !== null && $incomingVersion !== null) {
                $currentServerVersion = (int)($existingRecord['version'] ?? 1);
                if ($incomingVersion < $currentServerVersion) {
                    sendResponse(false, "Optimistic locking conflict: this record was modified by another session.", [
                        'error' => 'Conflict',
                        'code' => 'VERSION_CONFLICT',
                        'serverRecord' => $existingRecord,
                        'serverVersion' => $currentServerVersion,
                        'submittedVersion' => $incomingVersion,
                    ], 409);
                }
            }

            // Merge and increment version
            $currentVer = $existingRecord ? (int)($existingRecord['version'] ?? 1) : 1;
            $newVer = $currentVer + 1;
            $mergedData = array_merge(is_array($existingRecord) ? $existingRecord : [], $incomingData);
            $mergedData['id'] = $id;
            $mergedData['version'] = $newVer;
            $mergedData['updatedAt'] = date('c');
            $mergedData['updated_at'] = date('Y-m-d H:i:s');

            if ($pdo) {
                syncGenericTable($pdo, $fullTableName, [$mergedData], 'id');
            } else {
                $store = readJsonStore();
                $items = $store[$tableNameBase] ?? [];
                $found = false;
                foreach ($items as $k => $item) {
                    if ((string)($item['id'] ?? '') === $id) {
                        $items[$k] = $mergedData;
                        $found = true;
                        break;
                    }
                }
                if (!$found) $items[] = $mergedData;
                $store[$tableNameBase] = $items;
                writeJsonStore($store);
            }

            emitStreamEvent("{$entitySlug}.updated", $entitySlug, $id, $mergedData, $actorId);

            sendResponse(true, "Resource '{$entitySlug}' updated successfully.", [
                'data' => $mergedData,
                'version' => $newVer,
            ]);
            break;
        }

        // ====================================================================
        // DELETE: Remove entity record
        // ====================================================================
        case 'DELETE': {
            if (!$entityId && empty($input['id'])) {
                sendResponse(false, 'Missing resource ID for deletion.', [], 400);
            }

            $id = (string)($entityId ?: $input['id']);

            if ($pdo) {
                $stmt = $pdo->prepare("DELETE FROM `{$fullTableName}` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } else {
                $store = readJsonStore();
                $items = $store[$tableNameBase] ?? [];
                $filtered = array_values(array_filter($items, function($it) use ($id) {
                    return (string)($it['id'] ?? '') !== $id;
                }));
                $store[$tableNameBase] = $filtered;
                writeJsonStore($store);
            }

            emitStreamEvent("{$entitySlug}.deleted", $entitySlug, $id, ['id' => $id], $actorId);

            sendResponse(true, "Resource '{$entitySlug}' with ID '{$id}' deleted successfully.");
            break;
        }

        default:
            sendResponse(false, "Method '{$requestMethod}' not allowed.", [], 405);
            break;
    }
} catch (\PDOException $e) {
    sendResponse(false, 'Database Error: ' . $e->getMessage(), ['code' => $e->getCode()], 500);
} catch (\Throwable $e) {
    sendResponse(false, 'Server Error: ' . $e->getMessage(), [], 500);
}
