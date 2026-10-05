const response = await fetch('unload.php?year=2004');
const year = await response.json();

if (!response.ok) {
    throw new Error(`Der Endpunkt antwortet mit Status ${response.status}.
`);
}
const contentType = response.headers.get('content-type') ?? '';
if (!contentType.includes('application/json')) {
    throw new Error('Die Antwort ist kein JSON.');
}
console.log("Hello World");
console.log(year);

