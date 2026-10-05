function fetchJson(string $url): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    return json_decode($response, true);
}

header('Content-Type: text/plain; charset=utf-8');



const response = await fetch('unload.php');
const year = await response.json();

if (!response.ok) {
    throw new Error(`Der Endpunkt antwortet mit Status ${response.status}.
`);
}
const contentType = response.headers.get('content-type') ?? '';
if (!contentType.includes('application/json')) {
    throw new Error('Die Antwort ist kein JSON.');
}