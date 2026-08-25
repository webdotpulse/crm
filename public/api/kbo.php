<?php
/**
 * PulseWork CRM & Peppol Hub - Real-time KBO / BCE & EU VIES Proxy Endpoint
 * Resolves CORS restrictions when running inside web browsers.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$vat = preg_replace('/[^0-9A-Za-z]/', '', $_GET['vat'] ?? '');
$country = strtoupper($_GET['country'] ?? 'BE');

if (empty($vat)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing VAT / Enterprise Number parameter', 'isValid' => false]);
    exit;
}

// Strip country code from number if present at the start
if (str_starts_with(strtoupper($vat), $country)) {
    $vat = substr($vat, strlen($country));
}

// Normalize Belgian VAT (10 digits starting with 0)
if ($country === 'BE' && strlen($vat) === 9) {
    $vat = '0' . $vat;
}

$ctx = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Accept: application/json\r\nUser-Agent: PulseWork-CRM/3.0\r\n",
        'timeout' => 5,
        'ignore_errors' => true
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ]
]);

// 1. Query Official European Commission VIES REST API
$viesUrl = "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/{$country}/vat/{$vat}";
$response = @file_get_contents($viesUrl, false, $ctx);

if ($response !== false) {
    $data = json_decode($response, true);
    if (is_array($data) && !empty($data['isValid'])) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

// 2. Fallback to VATcomply
$vatComplyUrl = "https://api.vatcomply.com/vat?vat_number={$country}{$vat}";
$response2 = @file_get_contents($vatComplyUrl, false, $ctx);
if ($response2 !== false) {
    $data2 = json_decode($response2, true);
    if (is_array($data2) && !empty($data2['valid'])) {
        echo json_encode([
            'isValid' => true,
            'name' => $data2['name'] ?? '',
            'address' => $data2['address'] ?? '',
            'vatNumber' => $vat,
            'source' => 'VATcomply Global Registry',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

// 3. Fallback check for KBO Public Search HTML if Belgian entity
if ($country === 'BE' && strlen($vat) === 10) {
    $kboHtmlUrl = "https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=" . urlencode($vat);
    $htmlResponse = @file_get_contents($kboHtmlUrl, false, $ctx);
    if ($htmlResponse !== false) {
        // Extract company name and address using regex from official KBO table
        $nameMatch = [];
        $addrMatch = [];
        if (preg_match('/<td[^>]*class="first"[^>]*>Naam<\/td>\s*<td[^>]*>(.*?)<\/td>/is', $htmlResponse, $nameMatch) ||
            preg_match('/<td[^>]*class="first"[^>]*>Dénomination<\/td>\s*<td[^>]*>(.*?)<\/td>/is', $htmlResponse, $nameMatch)) {
            $extractedName = trim(strip_tags($nameMatch[1]));
            
            if (preg_match('/<td[^>]*class="first"[^>]*>Zetel<\/td>\s*<td[^>]*>(.*?)<\/td>/is', $htmlResponse, $addrMatch) ||
                preg_match('/<td[^>]*class="first"[^>]*>Siège<\/td>\s*<td[^>]*>(.*?)<\/td>/is', $htmlResponse, $addrMatch)) {
                $extractedAddr = trim(preg_replace('/\s+/', ' ', strip_tags($addrMatch[1])));
                
                echo json_encode([
                    'isValid' => true,
                    'name' => $extractedName,
                    'address' => $extractedAddr,
                    'vatNumber' => $vat,
                    'source' => 'KBO / BCE Public Search Portal',
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
        }
    }
}

http_response_code(404);
echo json_encode(['error' => 'Enterprise not found or registry unreachable', 'isValid' => false]);
