<?php
/**
 * PulseWork (GridCRM) — Real-time Event Stream (Server-Sent Events)
 * Streams live multi-user mutations and data events to connected clients.
 *
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3, 8.4+
 */

declare(strict_types=1);

if (!defined('PULSEWORK_DB')) {
    define('PULSEWORK_DB', true);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$action = $_GET['action'] ?? ($_GET['stream'] ? 'stream' : 'status');

if ($action === 'publish') {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $claims = validateJwtToken();
    $input = getJsonInput();

    $eventName = trim((string)($input['event'] ?? $input['event_name'] ?? 'custom.event'));
    $entityType = trim((string)($input['entity'] ?? $input['entity_type'] ?? 'general'));
    $entityId = trim((string)($input['entityId'] ?? $input['entity_id'] ?? ''));
    $data = is_array($input['data'] ?? null) ? $input['data'] : [];
    $actorId = (string)($claims['sub'] ?? 'usr_session');

    emitStreamEvent($eventName, $entityType, $entityId, $data, $actorId);
    sendResponse(true, 'Event published successfully.');
}

if ($action === 'stream' || isset($_GET['stream'])) {
    // Authenticate token via query or header
    $token = extractBearerToken();
    $claims = $token ? verifyJwtToken($token) : null;
    $currentActorId = $claims['sub'] ?? '';

    // Disable buffering and compression
    if (function_exists('apache_setenv')) {
        @apache_setenv('no-gzip', '1');
    }
    @ini_set('zlib.output_compression', '0');
    @ini_set('implicit_flush', '1');
    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    ob_implicit_flush(true);

    // SSE headers
    header('Content-Type: text/event-stream; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');
    header('Access-Control-Allow-Origin: *');

    echo ": connected\n\n";
    flush();

    [$pdo, $engine, $prefix] = getActivePdo();
    ensureAllTables($pdo, $engine, $prefix);

    $lastEventTime = date('Y-m-d H:i:s', time() - 30);
    $loopCount = 0;
    $maxLoops = 60; // 30-second SSE window to prevent hanging PHP worker indefinitely

    while ($loopCount < $maxLoops && !connection_aborted()) {
        $loopCount++;

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `{$prefix}event_stream` WHERE `created_at` > :lastTime ORDER BY `created_at` ASC LIMIT 25");
                $stmt->execute([':lastTime' => $lastEventTime]);
                $events = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                foreach ($events as $evt) {
                    $lastEventTime = $evt['created_at'];
                    $payload = [
                        'id' => $evt['id'],
                        'event' => $evt['event_name'],
                        'entity' => $evt['entity_type'],
                        'entityId' => $evt['entity_id'],
                        'actorId' => $evt['actor_id'],
                        'timestamp' => $evt['created_at'],
                        'data' => !empty($evt['data_json']) ? json_decode($evt['data_json'], true) : [],
                    ];

                    echo "id: " . $evt['id'] . "\n";
                    echo "event: " . $evt['event_name'] . "\n";
                    echo "data: " . json_encode($payload, JSON_UNESCAPED_UNICODE) . "\n\n";
                    flush();
                }
            } catch (\Throwable $e) {}
        }

        // Heartbeat ping every 5 seconds to keep connection alive
        if ($loopCount % 5 === 0) {
            echo ": ping " . time() . "\n\n";
            flush();
        }

        usleep(1000000); // 1 second interval
    }

    echo "event: reconnect\ndata: {}\n\n";
    flush();
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
sendResponse(true, 'Events stream service operational.', [
    'streamUrl' => '/api/events.php?stream=1',
    'publishUrl' => 'POST /api/events.php?action=publish',
]);
