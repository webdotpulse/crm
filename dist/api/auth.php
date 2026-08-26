<?php
/**
 * PulseWork (GridCRM) — Server-Side JWT Authentication & RBAC Engine
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
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load common DB library if not already loaded
if (!function_exists('getActivePdo')) {
    require_once __DIR__ . '/db.php';
}

const JWT_DEFAULT_SECRET = 'pw_crm_jwt_sec_89f02c91b53e7a124d77';
const JWT_EXPIRATION_SECONDS = 28800; // 8 hours

// Base64URL encoding / decoding
function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + 4 - strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function getJwtSecret(): string {
    $cfg = getStoredConfig();
    if ($cfg && !empty($cfg['jwtSecret'])) {
        return (string)$cfg['jwtSecret'];
    }
    return JWT_DEFAULT_SECRET;
}

/**
 * Generate a signed JWT token
 */
function generateJwtToken(array $payload, ?string $secret = null): string {
    $secret = $secret ?: getJwtSecret();
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    
    $now = time();
    $defaultClaims = [
        'iss' => 'PulseWork',
        'iat' => $now,
        'exp' => $now + JWT_EXPIRATION_SECONDS,
    ];
    $tokenPayload = array_merge($defaultClaims, $payload);
    
    $encodedHeader = base64UrlEncode((string)json_encode($header, JSON_UNESCAPED_SLASHES));
    $encodedPayload = base64UrlEncode((string)json_encode($tokenPayload, JSON_UNESCAPED_SLASHES));
    
    $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
    $encodedSignature = base64UrlEncode($signature);
    
    return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
}

/**
 * Verify and decode a JWT token string. Returns decoded payload array or null if invalid.
 */
function verifyJwtToken(string $token, ?string $secret = null): ?array {
    $secret = $secret ?: getJwtSecret();
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    
    $expectedSignature = base64UrlEncode(hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true));
    if (!hash_equals($expectedSignature, $encodedSignature)) {
        return null;
    }
    
    $payload = json_decode(base64UrlDecode($encodedPayload), true);
    if (!is_array($payload)) {
        return null;
    }
    
    // Validate expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Extract Bearer token from HTTP request headers or query string
 */
function extractBearerToken(): ?string {
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    
    if (!empty($authHeader) && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    
    if (!empty($_GET['token'])) {
        return trim((string)$_GET['token']);
    }
    
    return null;
}

/**
 * Middleware: Validates Bearer token and returns user claims array or terminates with 401.
 */
function validateJwtToken(bool $optional = false): ?array {
    $token = extractBearerToken();
    if (!$token) {
        if ($optional) return null;
        sendResponse(false, 'Missing or invalid access token', ['code' => 'UNAUTHORIZED'], 401);
    }
    
    $claims = verifyJwtToken($token);
    if (!$claims) {
        if ($optional) return null;
        sendResponse(false, 'Expired or invalid access token', ['code' => 'TOKEN_EXPIRED_OR_INVALID'], 401);
    }
    
    return $claims;
}

/**
 * Server-Side Role-Based Access Control (RBAC)
 */
const ROLE_HIERARCHY = [
    'owner' => 100,
    'admin' => 90,
    'finance' => 70,
    'sales' => 60,
    'project_manager' => 60,
    'hr' => 50,
    'support' => 40,
    'accountant' => 30,
    'user' => 20,
];

function checkRolePermission(array $userClaims, string $requiredPermission): bool {
    $role = strtolower((string)($userClaims['role'] ?? 'user'));
    
    // Super admins and owners have all permissions
    if ($role === 'owner' || $role === 'admin') {
        return true;
    }
    
    $customPermissions = $userClaims['permissions'] ?? [];
    if (is_array($customPermissions) && in_array($requiredPermission, $customPermissions, true)) {
        return true;
    }
    
    $rolePermissionMap = [
        'finance' => ['manage_crm', 'manage_invoices', 'manage_peppol', 'export_financials', 'view_audit_logs'],
        'sales' => ['manage_crm', 'manage_invoices'],
        'project_manager' => ['manage_crm', 'manage_inventory'],
        'accountant' => ['export_financials', 'view_audit_logs'],
        'hr' => ['manage_hr', 'view_audit_logs'],
        'support' => ['manage_support', 'manage_crm'],
    ];
    
    $allowed = $rolePermissionMap[$role] ?? [];
    return in_array($requiredPermission, $allowed, true);
}

function enforceRolePermission(array $userClaims, string $requiredPermission): void {
    if (!checkRolePermission($userClaims, $requiredPermission)) {
        sendResponse(false, "Forbidden: insufficient permissions for '{$requiredPermission}'", [
            'code' => 'FORBIDDEN',
            'requiredPermission' => $requiredPermission,
            'userRole' => $userClaims['role'] ?? 'unknown',
        ], 403);
    }
}

/**
 * Pure PHP Base32 Decoding for TOTP (RFC 6238)
 */
function base32DecodeTotp(string $b32): string {
    $b32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $b32));
    $lut = [
        'A'=>0,'B'=>1,'C'=>2,'D'=>3,'E'=>4,'F'=>5,'G'=>6,'H'=>7,
        'I'=>8,'J'=>9,'K'=>10,'L'=>11,'M'=>12,'N'=>13,'O'=>14,'P'=>15,
        'Q'=>16,'R'=>17,'S'=>18,'T'=>19,'U'=>20,'V'=>21,'W'=>22,'X'=>23,
        'Y'=>24,'Z'=>25,'2'=>26,'3'=>27,'4'=>28,'5'=>29,'6'=>30,'7'=>31
    ];
    
    $binary = '';
    $len = strlen($b32);
    for ($i = 0; $i < $len; $i++) {
        $ch = $b32[$i];
        if (!isset($lut[$ch])) continue;
        $binary .= sprintf('%05b', $lut[$ch]);
    }
    
    $bytes = '';
    $binLen = strlen($binary);
    for ($i = 0; $i + 8 <= $binLen; $i += 8) {
        $bytes .= chr((int)bindec(substr($binary, $i, 8)));
    }
    return $bytes;
}

/**
 * Verify TOTP code against secret with drift window (±1 step = 30s)
 */
function verifyTotpPhp(string $secret, string $candidateCode, int $window = 1): bool {
    $secretBytes = base32DecodeTotp($secret);
    if (empty($secretBytes)) return false;
    
    $cleanCode = trim($candidateCode);
    $timeStep = (int)floor(time() / 30);
    
    for ($i = -$window; $i <= $window; $i++) {
        $currentStep = $timeStep + $i;
        $timeBytes = pack('N*', 0) . pack('N*', $currentStep);
        $hmac = hash_hmac('sha1', $timeBytes, $secretBytes, true);
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $hashPart = substr($hmac, $offset, 4);
        $value = unpack('N', $hashPart)[1] & 0x7FFFFFFF;
        $code = str_pad((string)($value % 1000000), 6, '0', STR_PAD_LEFT);
        
        if (hash_equals($code, $cleanCode)) {
            return true;
        }
    }
    return false;
}

/**
 * Find user record by email or name across MySQL, SQLite, and JSON Store
 */
function findUserByEmailOrName(string $identifier): ?array {
    [$pdo, $engine, $prefix] = getActivePdo();
    ensureAllTables($pdo, $engine, $prefix);
    
    $clean = trim($identifier);
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT * FROM `{$prefix}users` WHERE LOWER(`email`) = LOWER(:id1) OR LOWER(`name`) = LOWER(:id2) LIMIT 1");
        $stmt->execute([':id1' => $clean, ':id2' => $clean]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if ($row) {
            if (!empty($row['data_json'])) {
                $decoded = json_decode($row['data_json'], true);
                if (is_array($decoded)) {
                    return array_merge($row, $decoded);
                }
            }
            return $row;
        }
    } else {
        $store = readJsonStore();
        $users = $store['users'] ?? [];
        foreach ($users as $u) {
            if (strcasecmp((string)($u['email'] ?? ''), $clean) === 0 || strcasecmp((string)($u['name'] ?? ''), $clean) === 0) {
                return $u;
            }
        }
    }
    return null;
}

// ============================================================================
// Direct Execution API Route Handling
// ============================================================================
$scriptName = basename($_SERVER['SCRIPT_FILENAME'] ?? '');
if ($scriptName === 'auth.php' || (isset($_GET['action']) && in_array($_GET['action'], ['login', 'verify_token', 'me'], true))) {
    $action = $_GET['action'] ?? $_POST['action'] ?? 'status';
    $input = getJsonInput();
    
    switch ($action) {
        case 'login': {
            $email = trim((string)($input['email'] ?? $input['emailOrName'] ?? ''));
            $password = (string)($input['password'] ?? '');
            $totpCode = trim((string)($input['totpCode'] ?? $input['totp_code'] ?? ''));
            
            if (empty($email)) {
                sendResponse(false, 'Email or username is required.', [], 400);
            }
            
            $user = findUserByEmailOrName($email);
            if (!$user) {
                sendResponse(false, 'User account not found. Please verify your credentials.', ['code' => 'USER_NOT_FOUND'], 404);
            }
            
            if (($user['status'] ?? 'active') === 'suspended') {
                sendResponse(false, 'This account has been suspended by a workspace administrator.', ['code' => 'ACCOUNT_SUSPENDED'], 403);
            }
            
            // Password verification
            $pwdHash = $user['password_hash'] ?? $user['passwordHash'] ?? '';
            $pinCode = $user['pin_code'] ?? $user['pinCode'] ?? '';
            
            $passwordMatched = false;
            if (!empty($pwdHash)) {
                if (password_verify($password, $pwdHash)) {
                    $passwordMatched = true;
                } elseif (hash_equals(hash('sha256', $password), $pwdHash)) {
                    $passwordMatched = true;
                }
            }
            
            if (!$passwordMatched && !empty($pinCode) && $password === $pinCode) {
                $passwordMatched = true;
            }
            
            // If user has no password set yet (fresh installation / demo user)
            if (!$passwordMatched && empty($pwdHash) && empty($pinCode) && strlen($password) >= 3) {
                $passwordMatched = true;
            }
            
            if (!$passwordMatched) {
                sendResponse(false, 'Incorrect password or security PIN code.', ['code' => 'INVALID_CREDENTIALS'], 401);
            }
            
            // 2FA TOTP verification
            $has2Fa = !empty($user['two_factor_enabled']) || !empty($user['twoFactorEnabled']);
            $secret2Fa = $user['two_factor_secret'] ?? $user['twoFactorSecret'] ?? '';
            $backupCodes = $user['backup_codes'] ?? $user['backupCodes'] ?? [];
            if (is_string($backupCodes)) {
                $backupCodes = json_decode($backupCodes, true) ?: [];
            }
            
            if ($has2Fa && !empty($secret2Fa)) {
                if (empty($totpCode)) {
                    sendResponse(false, 'Two-Factor Authentication required.', [
                        'requires2fa' => true,
                        'email' => $user['email'] ?? $email,
                    ], 200);
                }
                
                $totpValid = verifyTotpPhp($secret2Fa, $totpCode);
                if (!$totpValid && !empty($backupCodes) && in_array(strtoupper($totpCode), array_map('strtoupper', $backupCodes), true)) {
                    $totpValid = true;
                }
                
                if (!$totpValid) {
                    sendResponse(false, 'Invalid 6-digit authenticator code or recovery code.', [
                        'requires2fa' => true,
                        'code' => 'INVALID_2FA_CODE',
                    ], 401);
                }
            }
            
            // Issue Signed JWT
            $userId = (string)($user['id'] ?? uniqid('usr_'));
            $role = (string)($user['role'] ?? 'admin');
            $customPermissions = $user['custom_permissions'] ?? $user['customPermissions'] ?? [];
            if (is_string($customPermissions)) {
                $customPermissions = json_decode($customPermissions, true) ?: [];
            }
            
            $claims = [
                'sub' => $userId,
                'email' => $user['email'] ?? $email,
                'name' => $user['name'] ?? '',
                'role' => $role,
                'permissions' => $customPermissions,
            ];
            
            $token = generateJwtToken($claims);
            
            // Safe user sanitized output
            $safeUser = [
                'id' => $userId,
                'name' => $user['name'] ?? '',
                'email' => $user['email'] ?? $email,
                'role' => $role,
                'roleLabel' => $user['role_label'] ?? $user['roleLabel'] ?? 'Administrator',
                'twoFactorEnabled' => $has2Fa,
                'department' => $user['department'] ?? 'Management',
                'phone' => $user['phone'] ?? '',
                'status' => $user['status'] ?? 'active',
                'customPermissions' => $customPermissions,
            ];
            
            sendResponse(true, 'Authentication successful.', [
                'token' => $token,
                'tokenType' => 'Bearer',
                'expiresIn' => JWT_EXPIRATION_SECONDS,
                'user' => $safeUser,
            ]);
            break;
        }
        
        case 'me':
        case 'verify_token': {
            $claims = validateJwtToken();
            sendResponse(true, 'Token is valid.', [
                'user' => $claims,
            ]);
            break;
        }
        
        default:
            sendResponse(true, 'Auth service operational.', ['endpoints' => ['POST /api/auth.php?action=login', 'GET /api/auth.php?action=verify_token']]);
            break;
    }
}
