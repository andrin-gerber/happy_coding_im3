const response = await fetch('unload.php?city=Bern');
const summers = await response.json();

if (!response.ok) {
    throw new Error(`Der Endpunkt antwortet mit Status ${response.status}.
`);
}
const contentType = response.headers.get('content-type') ?? '';
if (!contentType.includes('application/json')) {
    throw new Error('Die Antwort ist kein JSON.
    ');
}