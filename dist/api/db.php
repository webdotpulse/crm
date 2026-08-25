<?php
/**
 * PulseWork CRM & Peppol Hub - Combell MySQL Database Bridge API
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3 (PDO MySQL Extension)
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

function getStoredConfig(): ?array {
    if (file_exists(CONFIG_FILE)) {
        try {
            $cfg = include CONFIG_FILE;
            if (is_array($cfg)) return $cfg;
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

function getPdoConnection(array $cfg, int $timeout = 5): \PDO {
    $host = $cfg['host'] ?? '127.0.0.1';
    $port = (int)($cfg['port'] ?? 3306);
    $dbname = $cfg['database'] ?? '';
    $user = $cfg['username'] ?? '';
    $pass = $cfg['password'] ?? '';

    if (empty($host) || empty($dbname) || empty($user)) {
        throw new \InvalidArgumentException('Incomplete MySQL connection parameters (host, database, and username required).');
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $options = [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_TIMEOUT => $timeout,
        \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ];

    return new \PDO($dsn, $user, $pass, $options);
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

            $pdo = getPdoConnection($cfg, 4);
            $versionStmt = $pdo->query("SELECT VERSION() as ver");
            $verRow = $versionStmt->fetch();
            $serverVersion = $verRow['ver'] ?? 'Unknown MySQL';

            // Check existing tables
            $tablesStmt = $pdo->query("SHOW TABLES");
            $tables = $tablesStmt->fetchAll(\PDO::FETCH_COLUMN);

            $latency = round((microtime(true) - $start) * 1000, 2);

            sendResponse(true, 'Connection successful! Combell MySQL server reached.', [
                'server_version' => $serverVersion,
                'tables_count' => count($tables),
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
                'tablePrefix' => preg_replace('/[^a-zA-Z0-9_]/', '', $input['tablePrefix'] ?? 'pw_'),
            ];

            $pdo = getPdoConnection($cfg, 8);
            $prefix = $cfg['tablePrefix'] ?: 'pw_';

            $tablesSql = [
                "CREATE TABLE IF NOT EXISTS `{$prefix}users` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `email` VARCHAR(255) NOT NULL UNIQUE,
                    `role` VARCHAR(64) NOT NULL DEFAULT 'admin',
                    `role_label` VARCHAR(128),
                    `password_hash` VARCHAR(255),
                    `pin_code` VARCHAR(32),
                    `two_factor_enabled` TINYINT(1) DEFAULT 0,
                    `two_factor_secret` VARCHAR(255),
                    `backup_codes` TEXT,
                    `custom_permissions` TEXT,
                    `department` VARCHAR(128),
                    `phone` VARCHAR(64),
                    `status` VARCHAR(32) DEFAULT 'active',
                    `last_login` DATETIME,
                    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}company_profile` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `profile_data` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}legal_entities` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `entity_data` LONGTEXT NOT NULL,
                    `is_default` TINYINT(1) DEFAULT 0,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}companies` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `data_json` LONGTEXT NOT NULL,
                    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}individuals` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}contacts` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `company_id` VARCHAR(64),
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}deals` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `title` VARCHAR(255),
                    `stage` VARCHAR(64),
                    `amount` DECIMAL(15,2) DEFAULT 0.00,
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}quotes` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `quote_number` VARCHAR(64),
                    `total_amount` DECIMAL(15,2) DEFAULT 0.00,
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}invoices` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `invoice_number` VARCHAR(64),
                    `status` VARCHAR(64),
                    `total_amount` DECIMAL(15,2) DEFAULT 0.00,
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}projects` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `name` VARCHAR(255),
                    `status` VARCHAR(64),
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}tasks` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `project_id` VARCHAR(64),
                    `status` VARCHAR(64),
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}expenses` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `amount` DECIMAL(15,2) DEFAULT 0.00,
                    `data_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}audit_logs` (
                    `id` VARCHAR(64) PRIMARY KEY,
                    `timestamp` DATETIME NOT NULL,
                    `actor_id` VARCHAR(64),
                    `actor_name` VARCHAR(255),
                    `actor_email` VARCHAR(255),
                    `action` VARCHAR(255) NOT NULL,
                    `category` VARCHAR(64),
                    `severity` VARCHAR(32),
                    `ip_address` VARCHAR(64),
                    `details` TEXT,
                    `integrity_hash` VARCHAR(128),
                    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

                "CREATE TABLE IF NOT EXISTS `{$prefix}settings` (
                    `key_name` VARCHAR(128) PRIMARY KEY,
                    `value_json` LONGTEXT NOT NULL,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
            ];

            foreach ($tablesSql as $sql) {
                $pdo->exec($sql);
            }

            // Save connection config to config.php safely
            $exportedConfig = "<?php\n" .
                "// PulseWork Database Configuration\n" .
                "defined('PULSEWORK_DB') or die('Direct access forbidden');\n" .
                "return " . var_export($cfg, true) . ";\n";
            file_put_contents(CONFIG_FILE, $exportedConfig, LOCK_EX);
            @chmod(CONFIG_FILE, 0600);

            // If initial data is provided, insert it
            $initialData = $input['initialData'] ?? null;
            if (is_array($initialData)) {
                // Insert Admin User
                if (!empty($initialData['admin'])) {
                    $adm = $initialData['admin'];
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}users` (
                        id, name, email, role, role_label, password_hash, pin_code,
                        two_factor_enabled, two_factor_secret, backup_codes,
                        custom_permissions, department, phone, status, last_login
                    ) VALUES (
                        :id, :name, :email, :role, :role_label, :password_hash, :pin_code,
                        :two_factor_enabled, :two_factor_secret, :backup_codes,
                        :custom_permissions, :department, :phone, :status, :last_login
                    ) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW()");

                    $stmt->execute([
                        ':id' => $adm['id'] ?? 'usr-admin-1',
                        ':name' => $adm['name'] ?? 'Administrator',
                        ':email' => $adm['email'] ?? 'admin@pulsework.local',
                        ':role' => $adm['role'] ?? 'admin',
                        ':role_label' => $adm['roleLabel'] ?? 'System Administrator',
                        ':password_hash' => $adm['passwordHash'] ?? null,
                        ':pin_code' => $adm['pinCode'] ?? '1234',
                        ':two_factor_enabled' => !empty($adm['twoFactorEnabled']) ? 1 : 0,
                        ':two_factor_secret' => $adm['twoFactorSecret'] ?? null,
                        ':backup_codes' => !empty($adm['backupCodes']) ? json_encode($adm['backupCodes']) : null,
                        ':custom_permissions' => !empty($adm['customPermissions']) ? json_encode($adm['customPermissions']) : null,
                        ':department' => $adm['department'] ?? 'Management',
                        ':phone' => $adm['phone'] ?? null,
                        ':status' => 'active',
                        ':last_login' => date('Y-m-d H:i:s'),
                    ]);
                }

                // Insert Company Profile
                if (!empty($initialData['companyProfile'])) {
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)");
                    $stmt->execute([':data' => json_encode($initialData['companyProfile'])]);
                }

                // Insert Legal Entity
                if (!empty($initialData['legalEntity'])) {
                    $le = $initialData['legalEntity'];
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}legal_entities` (id, name, entity_data, is_default) VALUES (:id, :name, :data, 1) ON DUPLICATE KEY UPDATE entity_data = VALUES(entity_data)");
                    $stmt->execute([
                        ':id' => $le['id'] ?? 'ent-1',
                        ':name' => $le['name'] ?? 'Primary Entity',
                        ':data' => json_encode($le),
                    ]);
                }

                // Insert Initial Audit Log
                if (!empty($initialData['auditLog'])) {
                    $log = $initialData['auditLog'];
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}audit_logs` (
                        id, timestamp, actor_id, actor_name, actor_email, action, category, severity, ip_address, details, integrity_hash
                    ) VALUES (
                        :id, :timestamp, :actor_id, :actor_name, :actor_email, :action, :category, :severity, :ip_address, :details, :integrity_hash
                    )");
                    $stmt->execute([
                        ':id' => $log['id'] ?? 'log-1',
                        ':timestamp' => date('Y-m-d H:i:s'),
                        ':actor_id' => $log['actorId'] ?? '',
                        ':actor_name' => $log['actorName'] ?? '',
                        ':actor_email' => $log['actorEmail'] ?? '',
                        ':action' => $log['action'] ?? 'First-Run Setup',
                        ':category' => $log['category'] ?? 'security',
                        ':severity' => $log['severity'] ?? 'info',
                        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                        ':details' => $log['details'] ?? 'System initialized via Combell MySQL',
                        ':integrity_hash' => $log['integrityHash'] ?? '',
                    ]);
                }
            }

            sendResponse(true, 'Combell MySQL Database schema and tables initialized successfully!', [
                'tables_created' => count($tablesSql),
                'prefix' => $prefix,
            ]);
            break;
        }

        case 'status': {
            $stored = getStoredConfig();
            if (!$stored) {
                sendResponse(true, 'MySQL is not configured yet. Using browser local database.', [
                    'configured' => false,
                ]);
            }

            try {
                $pdo = getPdoConnection($stored, 3);
                $prefix = $stored['tablePrefix'] ?? 'pw_';
                $tablesStmt = $pdo->query("SHOW TABLES LIKE '{$prefix}%'");
                $tables = $tablesStmt->fetchAll(\PDO::FETCH_COLUMN);

                sendResponse(true, 'Connected to Combell MySQL database.', [
                    'configured' => true,
                    'host' => $stored['host'] ?? '',
                    'database' => $stored['database'] ?? '',
                    'tablePrefix' => $prefix,
                    'tables_count' => count($tables),
                ]);
            } catch (\Throwable $e) {
                sendResponse(false, 'MySQL configuration exists but connection failed: ' . $e->getMessage(), [
                    'configured' => true,
                    'host' => $stored['host'] ?? '',
                    'database' => $stored['database'] ?? '',
                    'error' => $e->getMessage(),
                ], 500);
            }
            break;
        }

        case 'sync_all': {
            $stored = getStoredConfig();
            if (!$stored) {
                sendResponse(false, 'MySQL database is not configured on the server.', [], 400);
            }

            $pdo = getPdoConnection($stored, 10);
            $prefix = $stored['tablePrefix'] ?? 'pw_';
            $data = $input['data'] ?? [];

            $pdo->beginTransaction();
            try {
                // Sync settings
                if (!empty($data['settings'])) {
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}settings` (key_name, value_json) VALUES (:k, :v) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)");
                    foreach ($data['settings'] as $k => $v) {
                        $stmt->execute([':k' => $k, ':v' => is_string($v) ? $v : json_encode($v)]);
                    }
                }

                // Sync audit logs
                if (!empty($data['auditLogs']) && is_array($data['auditLogs'])) {
                    $stmt = $pdo->prepare("INSERT INTO `{$prefix}audit_logs` (
                        id, timestamp, actor_id, actor_name, actor_email, action, category, severity, ip_address, details, integrity_hash
                    ) VALUES (
                        :id, :timestamp, :actor_id, :actor_name, :actor_email, :action, :category, :severity, :ip_address, :details, :integrity_hash
                    ) ON DUPLICATE KEY UPDATE action=VALUES(action)");

                    foreach ($data['auditLogs'] as $l) {
                        $stmt->execute([
                            ':id' => $l['id'],
                            ':timestamp' => date('Y-m-d H:i:s', strtotime($l['timestamp'] ?? 'now')),
                            ':actor_id' => $l['actorId'] ?? '',
                            ':actor_name' => $l['actorName'] ?? '',
                            ':actor_email' => $l['actorEmail'] ?? '',
                            ':action' => $l['action'] ?? '',
                            ':category' => $l['category'] ?? 'security',
                            ':severity' => $l['severity'] ?? 'info',
                            ':ip_address' => $l['ipAddress'] ?? '127.0.0.1',
                            ':details' => $l['details'] ?? '',
                            ':integrity_hash' => $l['integrityHash'] ?? '',
                        ]);
                    }
                }

                $pdo->commit();
                sendResponse(true, 'Data synchronized with Combell MySQL database.');
            } catch (\Throwable $e) {
                $pdo->rollBack();
                sendResponse(false, 'Sync transaction failed: ' . $e->getMessage(), [], 500);
            }
            break;
        }

        default:
            sendResponse(false, "Unknown action '{$action}' requested.", [], 400);
            break;
    }
} catch (\PDOException $e) {
    sendResponse(false, 'MySQL Database Error: ' . $e->getMessage(), [
        'code' => $e->getCode(),
    ], 500);
} catch (\Throwable $e) {
    sendResponse(false, 'Server Error: ' . $e->getMessage(), [], 500);
}
