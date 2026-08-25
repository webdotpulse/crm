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
                    'installed' => false,
                ]);
            }

            try {
                $pdo = getPdoConnection($stored, 3);
                $prefix = $stored['tablePrefix'] ?? 'pw_';
                $tablesStmt = $pdo->query("SHOW TABLES LIKE '{$prefix}%'");
                $tables = $tablesStmt->fetchAll(\PDO::FETCH_COLUMN);

                // Check if users exist to report installation status
                $usersCount = 0;
                if (in_array("{$prefix}users", $tables)) {
                    $uStmt = $pdo->query("SELECT COUNT(*) FROM `{$prefix}users`");
                    $usersCount = (int)$uStmt->fetchColumn();
                }

                sendResponse(true, 'Connected to Combell MySQL database.', [
                    'configured' => true,
                    'installed' => $usersCount > 0,
                    'host' => $stored['host'] ?? '',
                    'database' => $stored['database'] ?? '',
                    'tablePrefix' => $prefix,
                    'tables_count' => count($tables),
                    'users_count' => $usersCount,
                ]);
            } catch (\Throwable $e) {
                sendResponse(false, 'MySQL configuration exists but connection failed: ' . $e->getMessage(), [
                    'configured' => true,
                    'installed' => false,
                    'host' => $stored['host'] ?? '',
                    'database' => $stored['database'] ?? '',
                    'error' => $e->getMessage(),
                ], 500);
            }
            break;
        }

        case 'bootstrap':
        case 'load_state': {
            $stored = getStoredConfig();
            if (!$stored) {
                sendResponse(true, 'MySQL is not configured.', [
                    'configured' => false,
                    'installed' => false,
                ]);
            }

            try {
                $pdo = getPdoConnection($stored, 5);
                $prefix = $stored['tablePrefix'] ?? 'pw_';

                // Check if users table exists
                $checkTable = $pdo->query("SHOW TABLES LIKE '{$prefix}users'")->fetchAll(\PDO::FETCH_COLUMN);
                if (empty($checkTable)) {
                    sendResponse(true, 'Database configured but tables not initialized.', [
                        'configured' => true,
                        'installed' => false,
                    ]);
                }

                // Fetch users
                $usersStmt = $pdo->query("SELECT * FROM `{$prefix}users` ORDER BY created_at ASC");
                $rawUsers = $usersStmt->fetchAll();

                if (empty($rawUsers)) {
                    sendResponse(true, 'No registered users found.', [
                        'configured' => true,
                        'installed' => false,
                    ]);
                }

                $users = array_map(function($u) {
                    return [
                        'id' => $u['id'],
                        'name' => $u['name'],
                        'email' => $u['email'],
                        'role' => $u['role'],
                        'roleLabel' => $u['role_label'] ?? 'User',
                        'passwordHash' => $u['password_hash'] ?? null,
                        'pinCode' => $u['pin_code'] ?? '',
                        'twoFactorEnabled' => !empty($u['two_factor_enabled']),
                        'twoFactorSecret' => $u['two_factor_secret'] ?? null,
                        'backupCodes' => !empty($u['backup_codes']) ? json_decode($u['backup_codes'], true) : [],
                        'customPermissions' => !empty($u['custom_permissions']) ? json_decode($u['custom_permissions'], true) : [],
                        'department' => $u['department'] ?? 'Management',
                        'phone' => $u['phone'] ?? null,
                        'status' => $u['status'] ?? 'active',
                        'lastLogin' => $u['last_login'] ?? null,
                    ];
                }, $rawUsers);

                // Fetch Company Profile
                $compStmt = $pdo->query("SELECT profile_data FROM `{$prefix}company_profile` WHERE id = 'default' LIMIT 1");
                $compRow = $compStmt->fetch();
                $companyProfile = $compRow ? json_decode($compRow['profile_data'], true) : null;

                // Fetch Legal Entities
                $entStmt = $pdo->query("SELECT entity_data FROM `{$prefix}legal_entities` ORDER BY is_default DESC");
                $rawEntities = $entStmt->fetchAll(\PDO::FETCH_COLUMN);
                $legalEntities = array_values(array_filter(array_map(function($e) {
                    return json_decode($e, true);
                }, $rawEntities)));

                // Fetch Companies (Clients)
                $companiesStmt = $pdo->query("SELECT data_json FROM `{$prefix}companies` ORDER BY created_at DESC");
                $rawCompanies = $companiesStmt->fetchAll(\PDO::FETCH_COLUMN);
                $companies = array_values(array_filter(array_map(function($c) {
                    return json_decode($c, true);
                }, $rawCompanies)));

                // Fetch Deals
                $dealsStmt = $pdo->query("SELECT data_json FROM `{$prefix}deals` ORDER BY updated_at DESC");
                $rawDeals = $dealsStmt->fetchAll(\PDO::FETCH_COLUMN);
                $deals = array_values(array_filter(array_map(function($d) {
                    return json_decode($d, true);
                }, $rawDeals)));

                // Fetch Quotes
                $quotesStmt = $pdo->query("SELECT data_json FROM `{$prefix}quotes` ORDER BY updated_at DESC");
                $rawQuotes = $quotesStmt->fetchAll(\PDO::FETCH_COLUMN);
                $quotes = array_values(array_filter(array_map(function($q) {
                    return json_decode($q, true);
                }, $rawQuotes)));

                // Fetch Invoices
                $invStmt = $pdo->query("SELECT data_json FROM `{$prefix}invoices` ORDER BY updated_at DESC");
                $rawInvoices = $invStmt->fetchAll(\PDO::FETCH_COLUMN);
                $invoices = array_values(array_filter(array_map(function($i) {
                    return json_decode($i, true);
                }, $rawInvoices)));

                // Fetch Projects
                $projStmt = $pdo->query("SELECT data_json FROM `{$prefix}projects` ORDER BY updated_at DESC");
                $rawProj = $projStmt->fetchAll(\PDO::FETCH_COLUMN);
                $projects = array_values(array_filter(array_map(function($p) {
                    return json_decode($p, true);
                }, $rawProj)));

                // Fetch Tasks
                $tasksStmt = $pdo->query("SELECT data_json FROM `{$prefix}tasks` ORDER BY updated_at DESC");
                $rawTasks = $tasksStmt->fetchAll(\PDO::FETCH_COLUMN);
                $tasks = array_values(array_filter(array_map(function($t) {
                    return json_decode($t, true);
                }, $rawTasks)));

                // Fetch Expenses
                $expStmt = $pdo->query("SELECT data_json FROM `{$prefix}expenses` ORDER BY updated_at DESC");
                $rawExp = $expStmt->fetchAll(\PDO::FETCH_COLUMN);
                $expenses = array_values(array_filter(array_map(function($x) {
                    return json_decode($x, true);
                }, $rawExp)));

                // Fetch Audit Logs
                $auditStmt = $pdo->query("SELECT * FROM `{$prefix}audit_logs` ORDER BY timestamp DESC LIMIT 200");
                $rawLogs = $auditStmt->fetchAll();
                $auditLogs = array_map(function($l) {
                    return [
                        'id' => $l['id'],
                        'timestamp' => $l['timestamp'],
                        'actorId' => $l['actor_id'],
                        'actorName' => $l['actor_name'],
                        'actorEmail' => $l['actor_email'],
                        'action' => $l['action'],
                        'category' => $l['category'],
                        'severity' => $l['severity'],
                        'ipAddress' => $l['ip_address'],
                        'details' => $l['details'],
                        'integrityHash' => $l['integrity_hash'],
                    ];
                }, $rawLogs);

                // Fetch Settings
                $settingsStmt = $pdo->query("SELECT key_name, value_json FROM `{$prefix}settings`");
                $rawSettings = $settingsStmt->fetchAll();
                $settings = [];
                foreach ($rawSettings as $s) {
                    $decoded = json_decode($s['value_json'], true);
                    $settings[$s['key_name']] = $decoded !== null ? $decoded : $s['value_json'];
                }

                sendResponse(true, 'Server bootstrap data loaded successfully.', [
                    'configured' => true,
                    'installed' => true,
                    'data' => [
                        'users' => $users,
                        'companyProfile' => $companyProfile,
                        'legalEntities' => $legalEntities,
                        'companies' => $companies,
                        'deals' => $deals,
                        'quotes' => $quotes,
                        'invoices' => $invoices,
                        'projects' => $projects,
                        'tasks' => $tasks,
                        'expenses' => $expenses,
                        'auditLogs' => $auditLogs,
                        'settings' => $settings,
                    ],
                    'dbConfig' => [
                        'mode' => 'mysql',
                        'host' => $stored['host'] ?? '',
                        'port' => (int)($stored['port'] ?? 3306),
                        'database' => $stored['database'] ?? '',
                        'username' => $stored['username'] ?? '',
                        'tablePrefix' => $prefix,
                        'isConfigured' => true,
                        'lastTestedAt' => date('c'),
                    ]
                ]);
            } catch (\Throwable $e) {
                sendResponse(false, 'Failed to fetch bootstrap data: ' . $e->getMessage(), [
                    'configured' => true,
                    'installed' => false,
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

            $pdo = getPdoConnection($stored, 15);
            $prefix = $stored['tablePrefix'] ?? 'pw_';
            $data = $input['data'] ?? [];

            $pdo->beginTransaction();
            try {
                // Sync users
                if (!empty($data['users']) && is_array($data['users'])) {
                    $uStmt = $pdo->prepare("INSERT INTO `{$prefix}users` (
                        id, name, email, role, role_label, password_hash, pin_code,
                        two_factor_enabled, two_factor_secret, backup_codes,
                        custom_permissions, department, phone, status, last_login
                    ) VALUES (
                        :id, :name, :email, :role, :role_label, :password_hash, :pin_code,
                        :two_factor_enabled, :two_factor_secret, :backup_codes,
                        :custom_permissions, :department, :phone, :status, :last_login
                    ) ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        email = VALUES(email),
                        role = VALUES(role),
                        role_label = VALUES(role_label),
                        password_hash = IFNULL(VALUES(password_hash), password_hash),
                        pin_code = VALUES(pin_code),
                        two_factor_enabled = VALUES(two_factor_enabled),
                        two_factor_secret = VALUES(two_factor_secret),
                        backup_codes = VALUES(backup_codes),
                        custom_permissions = VALUES(custom_permissions),
                        department = VALUES(department),
                        phone = VALUES(phone),
                        status = VALUES(status),
                        last_login = VALUES(last_login)");

                    foreach ($data['users'] as $u) {
                        $uStmt->execute([
                            ':id' => $u['id'],
                            ':name' => $u['name'] ?? '',
                            ':email' => $u['email'] ?? '',
                            ':role' => $u['role'] ?? 'user',
                            ':role_label' => $u['roleLabel'] ?? 'User',
                            ':password_hash' => $u['passwordHash'] ?? null,
                            ':pin_code' => $u['pinCode'] ?? '',
                            ':two_factor_enabled' => !empty($u['twoFactorEnabled']) ? 1 : 0,
                            ':two_factor_secret' => $u['twoFactorSecret'] ?? null,
                            ':backup_codes' => !empty($u['backupCodes']) ? json_encode($u['backupCodes']) : null,
                            ':custom_permissions' => !empty($u['customPermissions']) ? json_encode($u['customPermissions']) : null,
                            ':department' => $u['department'] ?? 'Management',
                            ':phone' => $u['phone'] ?? null,
                            ':status' => $u['status'] ?? 'active',
                            ':last_login' => !empty($u['lastLogin']) ? date('Y-m-d H:i:s', strtotime($u['lastLogin'])) : null,
                        ]);
                    }
                }

                // Sync company profile
                if (!empty($data['companyProfile'])) {
                    $cpStmt = $pdo->prepare("INSERT INTO `{$prefix}company_profile` (id, profile_data) VALUES ('default', :data) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)");
                    $cpStmt->execute([':data' => json_encode($data['companyProfile'])]);
                }

                // Sync legal entities
                if (!empty($data['legalEntities']) && is_array($data['legalEntities'])) {
                    $leStmt = $pdo->prepare("INSERT INTO `{$prefix}legal_entities` (id, name, entity_data, is_default) VALUES (:id, :name, :data, :is_default) ON DUPLICATE KEY UPDATE name = VALUES(name), entity_data = VALUES(entity_data), is_default = VALUES(is_default)");
                    foreach ($data['legalEntities'] as $le) {
                        $leStmt->execute([
                            ':id' => $le['id'],
                            ':name' => $le['name'] ?? 'Entity',
                            ':data' => json_encode($le),
                            ':is_default' => !empty($le['isDefault']) ? 1 : 0,
                        ]);
                    }
                }

                // Sync companies
                if (isset($data['companies']) && is_array($data['companies'])) {
                    $compStmt = $pdo->prepare("INSERT INTO `{$prefix}companies` (id, name, data_json) VALUES (:id, :name, :data) ON DUPLICATE KEY UPDATE name = VALUES(name), data_json = VALUES(data_json)");
                    foreach ($data['companies'] as $c) {
                        $compStmt->execute([
                            ':id' => $c['id'],
                            ':name' => $c['name'] ?? '',
                            ':data' => json_encode($c),
                        ]);
                    }
                }

                // Sync deals
                if (isset($data['deals']) && is_array($data['deals'])) {
                    $dStmt = $pdo->prepare("INSERT INTO `{$prefix}deals` (id, title, stage, amount, data_json) VALUES (:id, :title, :stage, :amount, :data) ON DUPLICATE KEY UPDATE title = VALUES(title), stage = VALUES(stage), amount = VALUES(amount), data_json = VALUES(data_json)");
                    foreach ($data['deals'] as $d) {
                        $dStmt->execute([
                            ':id' => $d['id'],
                            ':title' => $d['title'] ?? '',
                            ':stage' => $d['stage'] ?? '',
                            ':amount' => (float)($d['value'] ?? $d['amount'] ?? 0),
                            ':data' => json_encode($d),
                        ]);
                    }
                }

                // Sync quotes
                if (isset($data['quotes']) && is_array($data['quotes'])) {
                    $qStmt = $pdo->prepare("INSERT INTO `{$prefix}quotes` (id, quote_number, total_amount, data_json) VALUES (:id, :num, :amount, :data) ON DUPLICATE KEY UPDATE quote_number = VALUES(quote_number), total_amount = VALUES(total_amount), data_json = VALUES(data_json)");
                    foreach ($data['quotes'] as $q) {
                        $qStmt->execute([
                            ':id' => $q['id'],
                            ':num' => $q['number'] ?? $q['quoteNumber'] ?? '',
                            ':amount' => (float)($q['total'] ?? 0),
                            ':data' => json_encode($q),
                        ]);
                    }
                }

                // Sync invoices
                if (isset($data['invoices']) && is_array($data['invoices'])) {
                    $iStmt = $pdo->prepare("INSERT INTO `{$prefix}invoices` (id, invoice_number, status, total_amount, data_json) VALUES (:id, :num, :status, :amount, :data) ON DUPLICATE KEY UPDATE invoice_number = VALUES(invoice_number), status = VALUES(status), total_amount = VALUES(total_amount), data_json = VALUES(data_json)");
                    foreach ($data['invoices'] as $inv) {
                        $iStmt->execute([
                            ':id' => $inv['id'],
                            ':num' => $inv['number'] ?? $inv['invoiceNumber'] ?? '',
                            ':status' => $inv['status'] ?? 'draft',
                            ':amount' => (float)($inv['total'] ?? 0),
                            ':data' => json_encode($inv),
                        ]);
                    }
                }

                // Sync projects
                if (isset($data['projects']) && is_array($data['projects'])) {
                    $pStmt = $pdo->prepare("INSERT INTO `{$prefix}projects` (id, name, status, data_json) VALUES (:id, :name, :status, :data) ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status), data_json = VALUES(data_json)");
                    foreach ($data['projects'] as $p) {
                        $pStmt->execute([
                            ':id' => $p['id'],
                            ':name' => $p['name'] ?? '',
                            ':status' => $p['status'] ?? 'in_progress',
                            ':data' => json_encode($p),
                        ]);
                    }
                }

                // Sync tasks
                if (isset($data['tasks']) && is_array($data['tasks'])) {
                    $tStmt = $pdo->prepare("INSERT INTO `{$prefix}tasks` (id, project_id, status, data_json) VALUES (:id, :project_id, :status, :data) ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), status = VALUES(status), data_json = VALUES(data_json)");
                    foreach ($data['tasks'] as $t) {
                        $tStmt->execute([
                            ':id' => $t['id'],
                            ':project_id' => $t['projectId'] ?? '',
                            ':status' => $t['status'] ?? 'todo',
                            ':data' => json_encode($t),
                        ]);
                    }
                }

                // Sync expenses
                if (isset($data['expenses']) && is_array($data['expenses'])) {
                    $eStmt = $pdo->prepare("INSERT INTO `{$prefix}expenses` (id, amount, data_json) VALUES (:id, :amount, :data) ON DUPLICATE KEY UPDATE amount = VALUES(amount), data_json = VALUES(data_json)");
                    foreach ($data['expenses'] as $e) {
                        $eStmt->execute([
                            ':id' => $e['id'],
                            ':amount' => (float)($e['total'] ?? $e['amount'] ?? 0),
                            ':data' => json_encode($e),
                        ]);
                    }
                }

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
