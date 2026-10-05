
async function chart1() {
    const url = 'unload.php';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Der Endpunkt antwortet mit Status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        throw new Error(
            'Die Antwort ist kein JSON. Öffne unload.php direkt im Browser.',
        );
    }

    return await response.json();
}



console.log("Hello World");
console.log(chart1());