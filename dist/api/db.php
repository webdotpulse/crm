<?php
/**
 * GridCRM & Peppol Hub - Enterprise Database Bridge API
 * Supports MySQL PDO with automatic SQLite fallback & JSON Store fallback.
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3, 8.4+
 */

declare(strict_types=1);
define('PULSEWORK_DB', true);

// Set JSON headers and CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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

// Fallback JSON Store Helper
function getJsonStorePath(): string {
    if (is_writable(__DIR__) || (!file_exists(JSON_STORE_FILE) && is_writable(__DIR__)) || (file_exists(JSON_STORE_FILE) && is_writable(JSON_STORE_FILE))) {
        return JSON_STORE_FILE;
    }
    $tmpDir = sys_get_temp_dir();
    return rtrim($tmpDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'pulsework_store.json';
}

function readJsonStore(): array {
    $path = getJsonStorePath();
    if (file_exists($path)) {
        try {
            $content = @file_get_contents($path);
            if ($content) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) return $decoded;
            }
        } catch (\Throwable $e) {}
    }
    return [];
}

function writeJsonStore(array $data): bool {
    $path = getJsonStorePath();
    $existing = readJsonStore();
    $merged = array_merge($existing, $data);
    $encoded = json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    return @file_put_contents($path, $encoded, LOCK_EX) !== false;
}

/**
 * Returns an active database handle: [PDO|null, 'mysql'|'sqlite'|'json', prefix, config]
 */
function getActivePdo(?array $explicitCfg = null): array {
    $cfg = $explicitCfg ?: getStoredConfig();
    
    // Tier 1: MySQL PDO
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
            \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci, sql_mode='NO_ENGINE_SUBSTITUTION'",
        ];

        try {
            $pdo = new \PDO($dsn, $user, $pass, $options);
            return [$pdo, 'mysql', $prefix, $cfg];
        } catch (\PDOException $e) {
            // If explicit configuration was given, rethrow so connection test reports it
            if ($explicitCfg !== null) {
                throw $e;
            }
            // Otherwise, fall through to SQLite / JSON
        }
    }

    // Tier 2: SQLite Server-side Database
    if (in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
        try {
            $sqlitePath = SQLITE_FILE;
            if (!is_writable(__DIR__) && !file_exists($sqlitePath)) {
                $sqlitePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'pulsework_data.sqlite';
            }
            $pdo = new \PDO('sqlite:' . $sqlitePath);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
            $pdo->exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
            $prefix = 'pw_';
            return [$pdo, 'sqlite', $prefix, [
                'mode' => 'sqlite',
                'host' => 'localhost (Server Database)',
                'database' => basename($sqlitePath),
                'tablePrefix' => 'pw_',
                'isConfigured' => true,
            ]];
        } catch (\Throwable $e) {
            // Fall through to JSON store
        }
    }

    // Tier 3: JSON File Store fallback
    return [null, 'json', 'pw_', [
        'mode' => 'json',
        'host' => 'Server Local (JSON Store)',
        'database' => basename(getJsonStorePath()),
        'tablePrefix' => 'pw_',
        'isConfigured' => true,
    ]];
}

// In-memory cache for table column metadata
$GLOBALS['_PW_TABLE_COLUMNS'] = [];

function getTableColumns(\PDO $pdo, string $tableName): array {
    global $_PW_TABLE_COLUMNS;
    if (isset($_PW_TABLE_COLUMNS[$tableName])) {
        return $_PW_TABLE_COLUMNS[$tableName];
    }

    $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
    $columns = [];

    try {
        if ($driver === 'mysql') {
            $stmt = $pdo->query("SHOW COLUMNS FROM `{$tableName}`");
            if ($stmt) {
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $columns[] = strtolower($row['Field'] ?? '');
                }
            }
        } elseif ($driver === 'sqlite') {
            $stmt = $pdo->query("PRAGMA table_info(`{$tableName}`)");
            if ($stmt) {
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $columns[] = strtolower($row['name'] ?? '');
                }
            }
        }
    } catch (\Throwable $e) {
        $columns = [];
    }

    $_PW_TABLE_COLUMNS[$tableName] = $columns;
    return $columns;
}

/**
 * Ensure all tables exist in the database with resilient schemas and self-healing columns
 */
function ensureAllTables(?\PDO $pdo, string $engine, string $prefix): void {
    if (!$pdo) return;

    $isSqlite = ($engine === 'sqlite');
    $textCol = $isSqlite ? 'TEXT' : 'LONGTEXT';
    $pkId = 'VARCHAR(128) PRIMARY KEY';
    $engineClause = $isSqlite ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    $tableDefinitions = [
        "CREATE TABLE IF NOT EXISTS `{$prefix}users` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `email` VARCHAR(255) DEFAULT '',
            `role` VARCHAR(64) DEFAULT 'admin',
            `role_label` VARCHAR(128) DEFAULT '',
            `password_hash` VARCHAR(255) DEFAULT '',
            `pin_code` VARCHAR(32) DEFAULT '1234',
            `two_factor_enabled` TINYINT(1) DEFAULT 0,
            `two_factor_secret` VARCHAR(255) DEFAULT '',
            `backup_codes` {$textCol},
            `custom_permissions` {$textCol},
            `department` VARCHAR(128) DEFAULT '',
            `phone` VARCHAR(64) DEFAULT '',
            `status` VARCHAR(32) DEFAULT 'active',
            `last_login` DATETIME NULL,
            `data_json` {$textCol},
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}company_profile` (
            `id` VARCHAR(64) PRIMARY KEY,
            `profile_data` {$textCol},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}legal_entities` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `entity_data` {$textCol},
            `data_json` {$textCol},
            `is_default` TINYINT(1) DEFAULT 0,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}companies` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `data_json` {$textCol},
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}individuals` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}contacts` (
            `id` {$pkId},
            `company_id` VARCHAR(128) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}products` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `sku` VARCHAR(128) DEFAULT '',
            `price` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}events` (
            `id` {$pkId},
            `title` VARCHAR(255) DEFAULT '',
            `start_date` VARCHAR(64) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}deals` (
            `id` {$pkId},
            `title` VARCHAR(255) DEFAULT '',
            `stage` VARCHAR(64) DEFAULT '',
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}quotes` (
            `id` {$pkId},
            `quote_number` VARCHAR(64) DEFAULT '',
            `total_amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}invoices` (
            `id` {$pkId},
            `invoice_number` VARCHAR(64) DEFAULT '',
            `status` VARCHAR(64) DEFAULT '',
            `total_amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}payments` (
            `id` {$pkId},
            `invoice_id` VARCHAR(128) DEFAULT '',
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}projects` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `status` VARCHAR(64) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}tasks` (
            `id` {$pkId},
            `project_id` VARCHAR(128) DEFAULT '',
            `status` VARCHAR(64) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}time_entries` (
            `id` {$pkId},
            `project_id` VARCHAR(128) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}expenses` (
            `id` {$pkId},
            `amount` DECIMAL(15,2) DEFAULT 0.00,
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}suppliers` (
            `id` {$pkId},
            `name` VARCHAR(255) DEFAULT '',
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}bank_statements` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}bank_transactions` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}subscriptions` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}contracts` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}work_orders` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}mileage_trips` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}purchase_orders` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}dunning_notices` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}tickets` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}staff_capacities` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}warehouse_locations` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}document_templates` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}email_templates` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}vat_rates` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}integrations` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}apikeys` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}webhooks` (
            `id` {$pkId},
            `data_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}audit_logs` (
            `id` {$pkId},
            `timestamp` DATETIME NULL,
            `actor_name` VARCHAR(255) DEFAULT '',
            `action` VARCHAR(255) DEFAULT '',
            `data_json` {$textCol},
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};",

        "CREATE TABLE IF NOT EXISTS `{$prefix}settings` (
            `key_name` VARCHAR(128) PRIMARY KEY,
            `value_json` {$textCol},
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ){$engineClause};"
    ];

    foreach ($tableDefinitions as $sql) {
        try {
            $pdo->exec($sql);
        } catch (\Throwable $e) {}
    }

    // Proactive self-healing schema migration for existing MySQL & SQLite databases
    if ($engine === 'mysql') {
        $migrations = [
            // Ensure data_json exists on all tables
            "ALTER TABLE `{$prefix}legal_entities` ADD COLUMN `data_json` LONGTEXT NULL",
            "ALTER TABLE `{$prefix}legal_entities` MODIFY COLUMN `name` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}legal_entities` MODIFY COLUMN `entity_data` LONGTEXT NULL",
            "UPDATE `{$prefix}legal_entities` SET `data_json` = `entity_data` WHERE (`data_json` IS NULL OR `data_json` = '') AND `entity_data` IS NOT NULL",
            
            "ALTER TABLE `{$prefix}company_profile` ADD COLUMN `data_json` LONGTEXT NULL",
            "ALTER TABLE `{$prefix}company_profile` MODIFY COLUMN `profile_data` LONGTEXT NULL",
            "UPDATE `{$prefix}company_profile` SET `data_json` = `profile_data` WHERE (`data_json` IS NULL OR `data_json` = '') AND `profile_data` IS NOT NULL",

            "ALTER TABLE `{$prefix}users` MODIFY COLUMN `name` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}users` MODIFY COLUMN `email` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}companies` MODIFY COLUMN `name` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}individuals` MODIFY COLUMN `name` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}products` MODIFY COLUMN `name` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}events` MODIFY COLUMN `title` VARCHAR(255) NULL DEFAULT ''",
            "ALTER TABLE `{$prefix}audit_logs` MODIFY COLUMN `data_json` LONGTEXT NULL",
        ];

        foreach ($migrations as $mSql) {
            try {
                $pdo->exec($mSql);
            } catch (\Throwable $e) {}
        }
    } elseif ($engine === 'sqlite') {
        $sqliteMigrations = [
            "ALTER TABLE `{$prefix}legal_entities` ADD COLUMN `data_json` TEXT",
            "ALTER TABLE `{$prefix}company_profile` ADD COLUMN `data_json` TEXT",
        ];
        foreach ($sqliteMigrations as $mSql) {
            try {
                $pdo->exec($mSql);
            } catch (\Throwable $e) {}
        }
    }
}

/**
 * Fetch all items from a table as an array
 */
function fetchCollection(?\PDO $pdo, string $tableName): array {
    if (!$pdo) return [];

    try {
        $cols = getTableColumns($pdo, $tableName);

        if (in_array('data_json', $cols, true)) {
            $stmt = $pdo->query("SELECT data_json FROM `{$tableName}`");
            $rows = $stmt ? $stmt->fetchAll(\PDO::FETCH_COLUMN) : [];
            $items = array_values(array_filter(array_map(function($r) {
                return is_string($r) ? json_decode($r, true) : null;
            }, $rows)));
            if (!empty($items)) return $items;
        }

        if (in_array('entity_data', $cols, true)) {
            $stmt = $pdo->query("SELECT entity_data FROM `{$tableName}`");
            $rows = $stmt ? $stmt->fetchAll(\PDO::FETCH_COLUMN) : [];
            $items = array_values(array_filter(array_map(function($r) {
                return is_string($r) ? json_decode($r, true) : null;
            }, $rows)));
            if (!empty($items)) return $items;
        }

        if (in_array('profile_data', $cols, true)) {
            $stmt = $pdo->query("SELECT profile_data FROM `{$tableName}`");
            $rows = $stmt ? $stmt->fetchAll(\PDO::FETCH_COLUMN) : [];
            $items = array_values(array_filter(array_map(function($r) {
                return is_string($r) ? json_decode($r, true) : null;
            }, $rows)));
            if (!empty($items)) return $items;
        }

        $stmt = $pdo->query("SELECT * FROM `{$tableName}`");
        return $stmt ? $stmt->fetchAll(\PDO::FETCH_ASSOC) : [];
    } catch (\Throwable $e) {
        return [];
    }
}

/**
 * Dynamically syncs array of items into a generic table matching actual columns
 */
function syncGenericTable(?\PDO $pdo, string $tableName, array $items, string $idField = 'id'): void {
    if (!$pdo || empty($items)) return;

    $cols = getTableColumns($pdo, $tableName);
    if (empty($cols)) return;

    $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
    $nowStr = date('Y-m-d H:i:s');

    foreach ($items as $item) {
        if (!is_array($item)) continue;

        $id = (string)($item[$idField] ?? $item['id'] ?? uniqid('item_'));
        $jsonStr = json_encode($item, JSON_UNESCAPED_UNICODE);

        $rowValues = [];

        if (in_array('id', $cols, true)) {
            $rowValues['id'] = $id;
        }
        if (in_array('data_json', $cols, true)) {
            $rowValues['data_json'] = $jsonStr;
        }
        if (in_array('entity_data', $cols, true)) {
            $rowValues['entity_data'] = $jsonStr;
        }
        if (in_array('profile_data', $cols, true)) {
            $rowValues['profile_data'] = $jsonStr;
        }
        if (in_array('name', $cols, true)) {
            $rowValues['name'] = (string)($item['name'] ?? $item['title'] ?? $item['companyName'] ?? $item['clientName'] ?? '');
        }
        if (in_array('title', $cols, true)) {
            $rowValues['title'] = (string)($item['title'] ?? $item['name'] ?? '');
        }
        if (in_array('email', $cols, true)) {
            $rowValues['email'] = (string)($item['email'] ?? '');
        }
        if (in_array('role', $cols, true)) {
            $rowValues['role'] = (string)($item['role'] ?? 'admin');
        }
        if (in_array('role_label', $cols, true)) {
            $rowValues['role_label'] = (string)($item['roleLabel'] ?? $item['role_label'] ?? '');
        }
        if (in_array('phone', $cols, true)) {
            $rowValues['phone'] = (string)($item['phone'] ?? '');
        }
        if (in_array('department', $cols, true)) {
            $rowValues['department'] = (string)($item['department'] ?? '');
        }
        if (in_array('status', $cols, true)) {
            $rowValues['status'] = (string)($item['status'] ?? 'active');
        }
        if (in_array('stage', $cols, true)) {
            $rowValues['stage'] = (string)($item['stage'] ?? '');
        }
        if (in_array('sku', $cols, true)) {
            $rowValues['sku'] = (string)($item['sku'] ?? '');
        }
        if (in_array('quote_number', $cols, true)) {
            $rowValues['quote_number'] = (string)($item['quote_number'] ?? $item['quoteNumber'] ?? '');
        }
        if (in_array('invoice_number', $cols, true)) {
            $rowValues['invoice_number'] = (string)($item['invoice_number'] ?? $item['invoiceNumber'] ?? '');
        }
        if (in_array('amount', $cols, true)) {
            $rowValues['amount'] = (float)($item['amount'] ?? 0);
        }
        if (in_array('total_amount', $cols, true)) {
            $rowValues['total_amount'] = (float)($item['total_amount'] ?? $item['totalAmount'] ?? $item['amount'] ?? 0);
        }
        if (in_array('is_default', $cols, true)) {
            $rowValues['is_default'] = !empty($item['isDefault']) || !empty($item['is_default']) ? 1 : 0;
        }
        if (in_array('actor_name', $cols, true)) {
            $rowValues['actor_name'] = (string)($item['actor_name'] ?? $item['actorName'] ?? $item['userName'] ?? '');
        }
        if (in_array('action', $cols, true)) {
            $rowValues['action'] = (string)($item['action'] ?? '');
        }
        if (in_array('timestamp', $cols, true)) {
            $rowValues['timestamp'] = (string)($item['timestamp'] ?? $nowStr);
        }
        if (in_array('updated_at', $cols, true)) {
            $rowValues['updated_at'] = $nowStr;
        }
        if (in_array('created_at', $cols, true)) {
            $rowValues['created_at'] = (string)($item['createdAt'] ?? $item['created_at'] ?? $nowStr);
        }

        if (empty($rowValues)) continue;

        $fieldNames = array_keys($rowValues);
        $escapedFields = array_map(function($f) { return "`{$f}`"; }, $fieldNames);
        $placeholders = array_map(function($f) { return ":{$f}"; }, $fieldNames);

        $params = [];
        foreach ($rowValues as $k => $v) {
            $params[":{$k}"] = $v;
        }

        if ($driver === 'mysql') {
            $updateClauses = [];
            foreach ($fieldNames as $f) {
                if ($f === 'id' || $f === 'created_at') continue;
                $updateClauses[] = "`{$f}` = VALUES(`{$f}`)";
            }
            $updateSql = !empty($updateClauses) ? implode(', ', $updateClauses) : "`updated_at` = NOW()";
            $sql = "INSERT INTO `{$tableName}` (" . implode(', ', $escapedFields) . ") VALUES (" . implode(', ', $placeholders) . ") ON DUPLICATE KEY UPDATE {$updateSql}";
        } else {
            $sql = "INSERT OR REPLACE INTO `{$tableName}` (" . implode(', ', $escapedFields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        }

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (\Throwable $e) {}
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
            if (!$pdo) {
                sendResponse(false, 'Unable to initialize PDO connection.', [], 400);
            }

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
                if ($pdo) {
                    if (!empty($initialData['admin'])) {
                        syncGenericTable($pdo, "{$prefix}users", [$initialData['admin']]);
                    }
                    if (!empty($initialData['companyProfile'])) {
                        syncGenericTable($pdo, "{$prefix}company_profile", [
                            array_merge(['id' => 'default'], $initialData['companyProfile'])
                        ]);
                    }
                    if (!empty($initialData['legalEntity'])) {
                        syncGenericTable($pdo, "{$prefix}legal_entities", [$initialData['legalEntity']]);
                    }
                } else {
                    writeJsonStore([
                        'users' => !empty($initialData['admin']) ? [$initialData['admin']] : [],
                        'companyProfile' => $initialData['companyProfile'] ?? null,
                        'legalEntities' => !empty($initialData['legalEntity']) ? [$initialData['legalEntity']] : [],
                    ]);
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

                $usersCount = 0;
                if ($pdo) {
                    $usersStmt = $pdo->query("SELECT COUNT(*) FROM `{$prefix}users`");
                    $usersCount = (int)($usersStmt ? $usersStmt->fetchColumn() : 0);
                } else {
                    $store = readJsonStore();
                    $usersCount = count($store['users'] ?? []);
                }

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

            if ($pdo) {
                // Fetch users
                $users = fetchCollection($pdo, "{$prefix}users");
                if (empty($users)) {
                    try {
                        $uStmt = $pdo->query("SELECT * FROM `{$prefix}users`");
                        $rawU = $uStmt ? $uStmt->fetchAll() : [];
                        if (!empty($rawU)) {
                            $users = array_map(function($u) {
                                return [
                                    'id' => $u['id'],
                                    'name' => $u['name'] ?? '',
                                    'email' => $u['email'] ?? '',
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
                    $cpStmt = $pdo->query("SELECT data_json, profile_data FROM `{$prefix}company_profile` WHERE id = 'default' LIMIT 1");
                    $cpRow = $cpStmt ? $cpStmt->fetch() : null;
                    if ($cpRow) {
                        $rawJson = !empty($cpRow['data_json']) ? $cpRow['data_json'] : ($cpRow['profile_data'] ?? null);
                        if ($rawJson) {
                            $companyProfile = json_decode($rawJson, true);
                        }
                    }
                } catch (\Throwable $e) {}

                // Fetch Legal Entities
                $legalEntities = fetchCollection($pdo, "{$prefix}legal_entities");

                // Fetch Collections
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
            } else {
                // Tier 3 JSON store load
                $store = readJsonStore();
                $users = $store['users'] ?? [];
                $companyProfile = $store['companyProfile'] ?? null;
                $legalEntities = $store['legalEntities'] ?? [];
                $companies = $store['companies'] ?? [];
                $individuals = $store['individuals'] ?? [];
                $contacts = $store['contacts'] ?? [];
                $products = $store['products'] ?? [];
                $events = $store['events'] ?? [];
                $deals = $store['deals'] ?? [];
                $quotes = $store['quotes'] ?? [];
                $invoices = $store['invoices'] ?? [];
                $payments = $store['payments'] ?? [];
                $projects = $store['projects'] ?? [];
                $tasks = $store['tasks'] ?? [];
                $timeEntries = $store['timeEntries'] ?? [];
                $expenses = $store['expenses'] ?? [];
                $suppliers = $store['suppliers'] ?? [];
                $bankStatements = $store['bankStatements'] ?? [];
                $bankTransactions = $store['bankTransactions'] ?? [];
                $subscriptions = $store['subscriptions'] ?? [];
                $contracts = $store['contracts'] ?? [];
                $workOrders = $store['workOrders'] ?? [];
                $mileageTrips = $store['mileageTrips'] ?? [];
                $purchaseOrders = $store['purchaseOrders'] ?? [];
                $dunningNotices = $store['dunningNotices'] ?? [];
                $tickets = $store['tickets'] ?? [];
                $staffCapacities = $store['staffCapacities'] ?? [];
                $warehouseLocations = $store['warehouseLocations'] ?? [];
                $documentTemplates = $store['documentTemplates'] ?? [];
                $emailTemplates = $store['emailTemplates'] ?? [];
                $vatRates = $store['vatRates'] ?? [];
                $integrations = $store['integrations'] ?? [];
                $apiKeys = $store['apiKeys'] ?? [];
                $webhooks = $store['webhooks'] ?? [];
                $auditLogs = $store['auditLogs'] ?? [];
                $settings = $store['settings'] ?? [];
            }

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

            if ($pdo) {
                $inTx = false;
                try {
                    if ($pdo->inTransaction() === false) {
                        $pdo->beginTransaction();
                        $inTx = true;
                    }

                    // Sync users
                    if (isset($data['users']) && is_array($data['users'])) {
                        syncGenericTable($pdo, "{$prefix}users", $data['users']);
                    }

                    // Sync company profile
                    if (!empty($data['companyProfile'])) {
                        $cpObj = is_array($data['companyProfile']) ? $data['companyProfile'] : [];
                        $cpObj['id'] = 'default';
                        syncGenericTable($pdo, "{$prefix}company_profile", [$cpObj]);
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
                        $setCols = getTableColumns($pdo, "{$prefix}settings");
                        $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
                        $setSql = ($driver === 'mysql')
                            ? "INSERT INTO `{$prefix}settings` (`key_name`, `value_json`, `updated_at`) VALUES (:k, :v, NOW()) ON DUPLICATE KEY UPDATE `value_json` = VALUES(`value_json`), `updated_at` = NOW()"
                            : "INSERT OR REPLACE INTO `{$prefix}settings` (`key_name`, `value_json`, `updated_at`) VALUES (:k, :v, datetime('now'))";
                        $setStmt = $pdo->prepare($setSql);
                        foreach ($data['settings'] as $k => $v) {
                            $setStmt->execute([
                                ':k' => (string)$k,
                                ':v' => is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE),
                            ]);
                        }
                    }

                    if ($inTx && $pdo->inTransaction()) {
                        $pdo->commit();
                    }
                    sendResponse(true, 'Database successfully updated and synchronized.', [
                        'engine' => $engine,
                    ]);
                } catch (\Throwable $e) {
                    if ($inTx && $pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    // Also write to JSON store as resilient backup
                    writeJsonStore($data);
                    sendResponse(false, 'Transaction sync failed: ' . $e->getMessage(), [
                        'error' => $e->getMessage(),
                    ], 200);
                }
            } else {
                // Tier 3 JSON store sync
                writeJsonStore($data);
                sendResponse(true, 'State synchronized with server JSON store.', [
                    'engine' => 'json',
                ]);
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
    ], 200);
} catch (\Throwable $e) {
    sendResponse(false, 'Server Error: ' . $e->getMessage(), [], 200);
}
