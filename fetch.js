async function loadData() {
    const url = "unload.php";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Der Endpunkt antwortet mit Status ${response.status}.`
        );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
        throw new Error(
            "Die Antwort ist kein JSON."
        );
    }

    return await response.json();
}


async function initCharts() {
    try {
        const data = await loadData();

        console.log(data.diagram1);

        // Erst JETZT den Chart erstellen
        createCinemaChart(data.diagram1);

    } catch (error) {
        console.error(error);
    }
}

initCharts();