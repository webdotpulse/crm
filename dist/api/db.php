<?php
/**
 * GridCRM & Peppol Hub - Enterprise Database Bridge API
 * Supports MySQL PDO with automatic SQLite fallback for instant zero-config server persistence.
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3+
 */

declare(strict_types=1);
define('PULSEWORK_DB', true);

// Set JSON headers and CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

const CONFIG_FILE = __DIR__ . '/config.php';
const SQLITE_FILE = __DIR__ . '/data.sqlite';
const JSON_STORE_FILE = __DIR__ . '/store.json';

function getStoredConfig(): ?array {
    if (file_exists(CONFIG_FILE)) {
        try {
            $cfg = include CONFIG_FILE;
            if (is_array($cfg) && !empty($cfg['host']) && !empty($cfg['database']) && !empty($cfg['username'])) {
                return $cfg;
            }
        } catch (\Throwable $e) {}
    }
    return null;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function sendResponse(bool $success, string $message, array $extra = [], int $httpCode = 200): void {
    http_response_code($httpCode);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
        'timestamp' => date('c'),
    ], $extra), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Returns an active PDO connection (MySQL if configured, otherwise SQLite / Server Store)
 */
function getActivePdo(?array $explicitCfg = null): array {
    $cfg = $explicitCfg ?: getStoredConfig();
    
    if ($cfg && !empty($cfg['host']) && !empty($cfg['database']) && !empty($cfg['username'])) {
        $host = $cfg['host'];
        $port = (int)($cfg['port'] ?? 3306);
        $dbname = $cfg['database'];
        $user = $cfg['username'];
        $pass = $cfg['password'] ?? '';
        $prefix = preg_replace('/[^a-zA-Z0-9_]/', '', $cfg['tablePrefix'] ?? 'pw_') ?: 'pw_';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $options = [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_TIMEOUT => 6,
            \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];

        $pdo = new \PDO($dsn, $user, $pass, $options);
        return [$pdo, 'mysql', $prefix, $cfg];
    }

    // Fallback: SQLite server-side database
    $pdo = new \PDO('sqlite:' . SQLITE_FILE);
    $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
    $prefix = 'pw_';
    return [$pdo, 'sqlite', $prefix, [
        'mode' => 'sqlite',
        'host' => 'localhost (Server Database)',
        'database' => 'data.sqlite',
        'tablePrefix' => 'pw_',
        'isConfigured' => true,
    ]];
}

/**
 * Ensure all tables exist in the database
 */
function ensureAllTables(\PDO $pdo, string $engine, string $prefix): void {
    $isSqlite = ($engine === 'sqlite');
    $textCol = $isSqlite ? 'TEXT' : 'LONGTEXT';
    $pkId = $isSqlite ? 'VARCHAR(128) PRIMARY KEY' : 'VARCHAR(128) PRIMARY KEY';
    $engineClause = $isSqlite ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    $tableDefinitions = [
        "CREATE TABLE IF NOT EXISTS `{$prefix}users` (
            `id` {$pkId},
            `name` VARCHAR(255) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `role` VARCHAR(64) NOT NULL DEFAULT 'admin',
            `role_label` VARCHAR(128),
            `password_hash` VARCHAR(255),
            `pin_code` VARCHAR(32),
            `two_factor_enabled` TINYINT(1) DEFAULT 0,
            `two_factor_secret` VARCHAR(255),
            `backup_codes` {$textCol},
            `custom_permissions` {$textCol},
            `department` VARCHAR(128),
            `phone` VARCHAR(64),
            `status` VARCHAR(32) DEFAULT 'active',
            `last_login` DATETIME,
            `data_json` {$textCol},
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}company_profile` (
            `id` VARCHAR(64) PRIMARY KEY,
            `profile_data` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}legal_entities` (
            `id` {$pkId},
            `name` VARCHAR(255) NOT NULL,
            `entity_data` {$textCol} NOT NULL,
            `is_default` TINYINT(1) DEFAULT 0,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}companies` (
            `id` {$pkId},
            `name` VARCHAR(255) NOT NULL,
            `data_json` {$textCol} NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}individuals` (
            `id` {$pkId},
            `name` VARCHAR(255) NOT NULL,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}contacts` (
            `id` {$pkId},
            `company_id` VARCHAR(128),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}products` (
            `id` {$pkId},
            `name` VARCHAR(255) NOT NULL,
            `sku` VARCHAR(128),
            `price` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}events` (
            `id` {$pkId},
            `title` VARCHAR(255) NOT NULL,
            `start_date` VARCHAR(64),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}deals` (
            `id` {$pkId},
            `title` VARCHAR(255),
            `stage` VARCHAR(64),
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}quotes` (
            `id` {$pkId},
            `quote_number` VARCHAR(64),
            `total_amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}invoices` (
            `id` {$pkId},
            `invoice_number` VARCHAR(64),
            `status` VARCHAR(64),
            `total_amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}payments` (
            `id` {$pkId},
            `invoice_id` VARCHAR(128),
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}projects` (
            `id` {$pkId},
            `name` VARCHAR(255),
            `status` VARCHAR(64),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}tasks` (
            `id` {$pkId},
            `project_id` VARCHAR(128),
            `status` VARCHAR(64),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}time_entries` (
            `id` {$pkId},
            `project_id` VARCHAR(128),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}expenses` (
            `id` {$pkId},
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}suppliers` (
            `id` {$pkId},
            `name` VARCHAR(255),
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}bank_statements` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}bank_transactions` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}subscriptions` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}contracts` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}work_orders` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}mileage_trips` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}purchase_orders` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}dunning_notices` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}tickets` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}staff_capacities` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}warehouse_locations` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}document_templates` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}email_templates` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}vat_rates` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}integrations` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}apikeys` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}webhooks` (
            `id` {$pkId},
            `data_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}audit_logs` (
            `id` {$pkId},
            `timestamp` DATETIME,
            `actor_name` VARCHAR(255),
            `action` VARCHAR(255),
            `data_json` {$textCol} NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}settings` (
            `key_name` VARCHAR(128) PRIMARY KEY,
            `value_json` {$textCol} NOT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};"
    ];

    foreach ($tableDefinitions as $sql) {
        $pdo->exec($sql);
    }
}

/**
 * Fetch all items from a table as an array
 */
function fetchCollection(\PDO $pdo, string $tableName): array {
    try {
        $stmt = $pdo->query("SELECT data_json FROM `{$tableName}`");
        $rows = $stmt->fetchAll(\PDO::FETCH_COLUMN);
        return array_values(array_filter(array_map(function($r) {
            return is_string($r) ? json_decode($r, true) : null;
        }, $rows)));
    } catch (\Throwable $e) {
        return [];
    }
}

/**
 * Sync array of items into a generic table
 */
function syncGenericTable(\PDO $pdo, string $tableName, array $items, string $idField = 'id'): void {
    if (empty($items)) return;

    $stmt = $pdo->prepare("INSERT OR REPLACE INTO `{$tableName}` (id, data_json, updated_at) VALUES (:id, :data, datetime('now'))");
    // For MySQL support ON DUPLICATE KEY UPDATE
    if ($pdo->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql') {
        $stmt = $pdo->prepare("INSERT INTO `{$tableName}` (id, data_json, updated_at) VALUES (:id, :data, NOW()) ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW()");
    }

    foreach ($items as $item) {
        if (!is_array($item)) continue;
        $id = (string)($item[$idField] ?? $item['id'] ?? uniqid('item_'));
        $stmt->execute([
            ':id' => $id,
            ':data' => json_encode($item, JSON_UNESCAPED_UNICODE),
        ]);
    }
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';
$input = getJsonInput();

try {
    switch ($action) {
        case 'test_connection': {
            $start = microtime(true);
            $cfg = [
                'host' => trim($input['host'] ?? ''),
                'port' => (int)($input['port'] ?? 3306),
                'database' => trim($input['database'] ?? ''),
                'username' => trim($input['username'] ?? ''),
                'password' => (string)($input['password'] ?? ''),
            ];

            [$pdo, $engine] = getActivePdo($cfg);
            $verStmt = $pdo->query("SELECT VERSION() as ver");
            $verRow = $verStmt ? $verStmt->fetch() : null;
            $serverVersion = $verRow['ver'] ?? 'MySQL Server';
            $latency = round((microtime(true) - $start) * 1000, 2);

            sendResponse(true, 'Database connection successful!', [
                'server_version' => $serverVersion,
                'latency_ms' => $latency,
            ]);
            break;
        }

        case 'initialize_schema': {
            $cfg = [
                'host' => trim($input['host'] ?? ''),
                'port' => (int)($input['port'] ?? 3306),
                'database' => trim($input['database'] ?? ''),
                'username' => trim($input['username'] ?? ''),
                'password' => (string)($input['password'] ?? ''),
                'tablePrefix' => preg_replace('/[^a-zA-Z0-9_]/', '', $input['tablePrefix'] ?? 'pw_') ?: 'pw_',
            ];

            [$pdo, $engine, $prefix] = getActivePdo($cfg['host'] ? $cfg : null);
            ensureAllTables($pdo, $engine, $prefix);

            // If MySQL config provided, save to config.php
            if (!empty($cfg['host']) && !empty($cfg['database']) && !empty($cfg['username'])) {
                $exportedConfig = "<?php\n" .
                    "// GridCRM Database Configuration\n" .
                    "defined('PULSEWORK_DB') or die('Direct access forbidden');\n" .
                    "return " . var_export($cfg, true) . ";\n";
                @file_put_contents(CONFIG_FILE, $exportedConfig, LOCK_EX);
                @chmod(CONFIG_FILE, 0600);
            }

            // Save initial data if supplied
            $initialData = $input['initialData'] ?? null;
            if (is_array($initialData)) {
                if (!empty($initialData['admin'])) {
                    $adm = $initialData['admin'];
                    syncGenericTable($pdo, "{$prefix}users", [$adm]);
                }
                if (!empty($initialData['companyProfile'])) {
                    $stmt = $pdo->prepare($pdo->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql'
                        ? "INSERT INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)"
                        : "INSERT OR REPLACE INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data)");
                    $stmt->execute([':data' => json_encode($initialData['companyProfile'], JSON_UNESCAPED_UNICODE)]);
                }
                if (!empty($initialData['legalEntity'])) {
                    syncGenericTable($pdo, "{$prefix}legal_entities", [$initialData['legalEntity']]);
                }
            }

            sendResponse(true, 'Database schema initialized successfully.', [
                'engine' => $engine,
                'prefix' => $prefix,
            ]);
            break;
        }

        case 'status': {
            try {
                [$pdo, $engine, $prefix, $cfg] = getActivePdo();
                ensureAllTables($pdo, $engine, $prefix);

                $usersStmt = $pdo->query("SELECT COUNT(*) FROM `{$prefix}users`");
                $usersCount = (int)($usersStmt ? $usersStmt->fetchColumn() : 0);

                sendResponse(true, 'Database operational.', [
                    'configured' => true,
                    'installed' => $usersCount > 0,
                    'engine' => $engine,
                    'host' => $cfg['host'] ?? 'Server Local',
                    'database' => $cfg['database'] ?? 'data.sqlite',
                    'tablePrefix' => $prefix,
                    'users_count' => $usersCount,
                ]);
            } catch (\Throwable $e) {
                sendResponse(false, 'Database connection error: ' . $e->getMessage(), [
                    'configured' => false,
                    'installed' => false,
                    'error' => $e->getMessage(),
                ]);
            }
            break;
        }

        case 'bootstrap':
        case 'load_state': {
            [$pdo, $engine, $prefix, $cfg] = getActivePdo();
            ensureAllTables($pdo, $engine, $prefix);

            // Fetch users
            $users = fetchCollection($pdo, "{$prefix}users");
            
            // If empty in users table, try raw query if schema had individual user columns
            if (empty($users)) {
                try {
                    $uStmt = $pdo->query("SELECT * FROM `{$prefix}users`");
                    $rawU = $uStmt ? $uStmt->fetchAll() : [];
                    if (!empty($rawU)) {
                        $users = array_map(function($u) {
                            return [
                                'id' => $u['id'],
                                'name' => $u['name'],
                                'email' => $u['email'],
                                'role' => $u['role'] ?? 'admin',
                                'roleLabel' => $u['role_label'] ?? 'Administrator',
                                'passwordHash' => $u['password_hash'] ?? null,
                                'pinCode' => $u['pin_code'] ?? '1234',
                                'twoFactorEnabled' => !empty($u['two_factor_enabled']),
                                'twoFactorSecret' => $u['two_factor_secret'] ?? null,
                                'backupCodes' => !empty($u['backup_codes']) ? json_decode($u['backup_codes'], true) : [],
                                'customPermissions' => !empty($u['custom_permissions']) ? json_decode($u['custom_permissions'], true) : [],
                                'department' => $u['department'] ?? 'Management',
                                'phone' => $u['phone'] ?? '',
                                'status' => $u['status'] ?? 'active',
                            ];
                        }, $rawU);
                    }
                } catch (\Throwable $e) {}
            }

            // Fetch Company Profile
            $companyProfile = null;
            try {
                $cpStmt = $pdo->query("SELECT profile_data FROM `{$prefix}company_profile` WHERE id = 'default' LIMIT 1");
                $cpRow = $cpStmt ? $cpStmt->fetch() : null;
                if ($cpRow && !empty($cpRow['profile_data'])) {
                    $companyProfile = json_decode($cpRow['profile_data'], true);
                }
            } catch (\Throwable $e) {}

            // Fetch Legal Entities
            $legalEntities = fetchCollection($pdo, "{$prefix}legal_entities");
            if (empty($legalEntities)) {
                try {
                    $leStmt = $pdo->query("SELECT entity_data FROM `{$prefix}legal_entities`");
                    $rawLe = $leStmt ? $leStmt->fetchAll(\PDO::FETCH_COLUMN) : [];
                    $legalEntities = array_values(array_filter(array_map(function($e) {
                        return json_decode($e, true);
                    }, $rawLe)));
                } catch (\Throwable $e) {}
            }

            // Fetch All Collections
            $companies = fetchCollection($pdo, "{$prefix}companies");
            $individuals = fetchCollection($pdo, "{$prefix}individuals");
            $contacts = fetchCollection($pdo, "{$prefix}contacts");
            $products = fetchCollection($pdo, "{$prefix}products");
            $events = fetchCollection($pdo, "{$prefix}events");
            $deals = fetchCollection($pdo, "{$prefix}deals");
            $quotes = fetchCollection($pdo, "{$prefix}quotes");
            $invoices = fetchCollection($pdo, "{$prefix}invoices");
            $payments = fetchCollection($pdo, "{$prefix}payments");
            $projects = fetchCollection($pdo, "{$prefix}projects");
            $tasks = fetchCollection($pdo, "{$prefix}tasks");
            $timeEntries = fetchCollection($pdo, "{$prefix}time_entries");
            $expenses = fetchCollection($pdo, "{$prefix}expenses");
            $suppliers = fetchCollection($pdo, "{$prefix}suppliers");
            $bankStatements = fetchCollection($pdo, "{$prefix}bank_statements");
            $bankTransactions = fetchCollection($pdo, "{$prefix}bank_transactions");
            $subscriptions = fetchCollection($pdo, "{$prefix}subscriptions");
            $contracts = fetchCollection($pdo, "{$prefix}contracts");
            $workOrders = fetchCollection($pdo, "{$prefix}work_orders");
            $mileageTrips = fetchCollection($pdo, "{$prefix}mileage_trips");
            $purchaseOrders = fetchCollection($pdo, "{$prefix}purchase_orders");
            $dunningNotices = fetchCollection($pdo, "{$prefix}dunning_notices");
            $tickets = fetchCollection($pdo, "{$prefix}tickets");
            $staffCapacities = fetchCollection($pdo, "{$prefix}staff_capacities");
            $warehouseLocations = fetchCollection($pdo, "{$prefix}warehouse_locations");
            $documentTemplates = fetchCollection($pdo, "{$prefix}document_templates");
            $emailTemplates = fetchCollection($pdo, "{$prefix}email_templates");
            $vatRates = fetchCollection($pdo, "{$prefix}vat_rates");
            $integrations = fetchCollection($pdo, "{$prefix}integrations");
            $apiKeys = fetchCollection($pdo, "{$prefix}apikeys");
            $webhooks = fetchCollection($pdo, "{$prefix}webhooks");
            $auditLogs = fetchCollection($pdo, "{$prefix}audit_logs");

            // Fetch Settings
            $settings = [];
            try {
                $setStmt = $pdo->query("SELECT key_name, value_json FROM `{$prefix}settings`");
                $rawSet = $setStmt ? $setStmt->fetchAll() : [];
                foreach ($rawSet as $s) {
                    $decoded = json_decode($s['value_json'], true);
                    $settings[$s['key_name']] = $decoded !== null ? $decoded : $s['value_json'];
                }
            } catch (\Throwable $e) {}

            $hasInstalledData = !empty($users) || !empty($companies) || !empty($companyProfile);

            sendResponse(true, 'State loaded successfully from database.', [
                'configured' => true,
                'installed' => $hasInstalledData,
                'engine' => $engine,
                'data' => [
                    'users' => $users,
                    'companyProfile' => $companyProfile,
                    'legalEntities' => $legalEntities,
                    'companies' => $companies,
                    'individuals' => $individuals,
                    'contacts' => $contacts,
                    'products' => $products,
                    'events' => $events,
                    'deals' => $deals,
                    'quotes' => $quotes,
                    'invoices' => $invoices,
                    'payments' => $payments,
                    'projects' => $projects,
                    'tasks' => $tasks,
                    'timeEntries' => $timeEntries,
                    'expenses' => $expenses,
                    'suppliers' => $suppliers,
                    'bankStatements' => $bankStatements,
                    'bankTransactions' => $bankTransactions,
                    'subscriptions' => $subscriptions,
                    'contracts' => $contracts,
                    'workOrders' => $workOrders,
                    'mileageTrips' => $mileageTrips,
                    'purchaseOrders' => $purchaseOrders,
                    'dunningNotices' => $dunningNotices,
                    'tickets' => $tickets,
                    'staffCapacities' => $staffCapacities,
                    'warehouseLocations' => $warehouseLocations,
                    'documentTemplates' => $documentTemplates,
                    'emailTemplates' => $emailTemplates,
                    'vatRates' => $vatRates,
                    'integrations' => $integrations,
                    'apiKeys' => $apiKeys,
                    'webhooks' => $webhooks,
                    'auditLogs' => $auditLogs,
                    'settings' => $settings,
                ],
                'dbConfig' => [
                    'mode' => $engine,
                    'host' => $cfg['host'] ?? 'Server Local',
                    'port' => (int)($cfg['port'] ?? 3306),
                    'database' => $cfg['database'] ?? 'data.sqlite',
                    'username' => $cfg['username'] ?? 'db_user',
                    'tablePrefix' => $prefix,
                    'isConfigured' => true,
                    'lastTestedAt' => date('c'),
                ]
            ]);
            break;
        }

        case 'sync_all':
        case 'save_all': {
            [$pdo, $engine, $prefix] = getActivePdo();
            ensureAllTables($pdo, $engine, $prefix);

            $data = $input['data'] ?? [];
            if (!is_array($data) || empty($data)) {
                sendResponse(true, 'No sync payload provided.');
            }

            if ($pdo->inTransaction() === false) {
                $pdo->beginTransaction();
            }

            try {
                // Sync users
                if (isset($data['users']) && is_array($data['users'])) {
                    syncGenericTable($pdo, "{$prefix}users", $data['users']);
                }

                // Sync company profile
                if (!empty($data['companyProfile'])) {
                    $cpStmt = $pdo->prepare($pdo->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql'
                        ? "INSERT INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)"
                        : "INSERT OR REPLACE INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data)");
                    $cpStmt->execute([':data' => json_encode($data['companyProfile'], JSON_UNESCAPED_UNICODE)]);
                }

                // Sync legal entities
                if (isset($data['legalEntities']) && is_array($data['legalEntities'])) {
                    syncGenericTable($pdo, "{$prefix}legal_entities", $data['legalEntities']);
                }

                // Sync all CRM collections
                $collectionMappings = [
                    'companies' => "{$prefix}companies",
                    'individuals' => "{$prefix}individuals",
                    'contacts' => "{$prefix}contacts",
                    'products' => "{$prefix}products",
                    'events' => "{$prefix}events",
                    'deals' => "{$prefix}deals",
                    'quotes' => "{$prefix}quotes",
                    'invoices' => "{$prefix}invoices",
                    'payments' => "{$prefix}payments",
                    'projects' => "{$prefix}projects",
                    'tasks' => "{$prefix}tasks",
                    'timeEntries' => "{$prefix}time_entries",
                    'expenses' => "{$prefix}expenses",
                    'suppliers' => "{$prefix}suppliers",
                    'bankStatements' => "{$prefix}bank_statements",
                    'bankTransactions' => "{$prefix}bank_transactions",
                    'subscriptions' => "{$prefix}subscriptions",
                    'contracts' => "{$prefix}contracts",
                    'workOrders' => "{$prefix}work_orders",
                    'mileageTrips' => "{$prefix}mileage_trips",
                    'purchaseOrders' => "{$prefix}purchase_orders",
                    'dunningNotices' => "{$prefix}dunning_notices",
                    'tickets' => "{$prefix}tickets",
                    'staffCapacities' => "{$prefix}staff_capacities",
                    'warehouseLocations' => "{$prefix}warehouse_locations",
                    'documentTemplates' => "{$prefix}document_templates",
                    'emailTemplates' => "{$prefix}email_templates",
                    'vatRates' => "{$prefix}vat_rates",
                    'integrations' => "{$prefix}integrations",
                    'apiKeys' => "{$prefix}apikeys",
                    'webhooks' => "{$prefix}webhooks",
                    'auditLogs' => "{$prefix}audit_logs",
                ];

                foreach ($collectionMappings as $stateKey => $tableName) {
                    if (isset($data[$stateKey]) && is_array($data[$stateKey])) {
                        syncGenericTable($pdo, $tableName, $data[$stateKey]);
                    }
                }

                // Sync settings
                if (!empty($data['settings']) && is_array($data['settings'])) {
                    $setStmt = $pdo->prepare($pdo->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql'
                        ? "INSERT INTO `{$prefix}settings` (key_name, value_json) VALUES (:k, :v) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)"
                        : "INSERT OR REPLACE INTO `{$prefix}settings` (key_name, value_json) VALUES (:k, :v)");
                    foreach ($data['settings'] as $k => $v) {
                        $setStmt->execute([
                            ':k' => (string)$k,
                            ':v' => is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE),
                        ]);
                    }
                }

                $pdo->commit();
                sendResponse(true, 'Database successfully updated and synchronized.');
            } catch (\Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                sendResponse(false, 'Transaction sync failed: ' . $e->getMessage(), [], 500);
            }
            break;
        }

        default:
            sendResponse(false, "Unknown action '{$action}' requested.", [], 400);
            break;
    }
} catch (\PDOException $e) {
    sendResponse(false, 'Database Error: ' . $e->getMessage(), [
        'code' => $e->getCode(),
    ], 500);
} catch (\Throwable $e) {
    sendResponse(false, 'Server Error: ' . $e->getMessage(), [], 500);
}
