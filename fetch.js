let dataPromise = null;


async function loadData() {

    // Wenn die Daten bereits geladen werden/wurden,
    // dieselben Daten wiederverwenden.
    if (dataPromise) {
        return dataPromise;
    }


    dataPromise = (async () => {

        const url = "unload.php";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Der Endpunkt antwortet mit Status ${response.status}.`
            );
        }


        const contentType =
            response.headers.get("content-type") ?? "";


        if (!contentType.includes("application/json")) {
            throw new Error(
                "Die Antwort ist kein JSON."
            );
        }


        return await response.json();

    })();


    return dataPromise;
}

async function initCharts() {
    try {
        const data = await loadData();

        console.log(data.diagram1);
        console.log(data.diagram2);
        console.log(data.diagram3);


        // Erst JETZT den Chart erstellen
        createCinemaChart(data.diagram1);
        createScatterChart(data.diagram3);
        console.log(data.diagram2);
        console.log(data.diagram3);

    } catch (error) {
        console.error(error);
    }
}



async function initMap() {
    try {
        const data = await loadData();

        console.log("Diagramm 2:", data.diagram2);

        await createCinemaMap(
            data.diagram2
        );

    } catch (error) {
        console.error(
            "Map Fehler:",
            error
        );
    }
}

initCharts();
initMap();



