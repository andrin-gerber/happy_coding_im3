const MAP_POINT_SIZE = {
    desktop: {
        multiplier: 5
    },

    mobile: {
        multiplier: 2.5
    }
};

function getMapPointRadius(count) {
    const mobile =
        window.matchMedia("(max-width: 700px)").matches;

    const settings = mobile
        ? MAP_POINT_SIZE.mobile
        : MAP_POINT_SIZE.desktop;

    return Math.sqrt(count) * settings.multiplier;
}

function getMapPointColor(count) {

    const maxCount = 20;
    const intensity = 0.65;

    const factor = Math.min(
        Math.max((count - 1) / (maxCount - 1), 0),
        1
    ) * intensity;

    const red = Math.round(255 - 55 * factor);
    const green = Math.round(255 - 210 * factor);
    const blue = Math.round(255 - 210 * factor);

    return `rgb(${red}, ${green}, ${blue})`;
}


async function createCinemaMap(diagram2) {
    const container = document.querySelector("#swissMap");
    const slider = document.querySelector("#mapYear");
    const yearOutput = document.querySelector("#mapYearValue");
    const status = document.querySelector("#mapStatus");

    if (!container || !slider || !yearOutput || !status) {
        return;
    }

    if (typeof L === "undefined") {
        status.textContent = "Leaflet konnte nicht geladen werden.";
        return;
    }

    const validYears = [
        ...new Set(
            diagram2.flatMap(item =>
                Object.keys(item)
                    .filter(key => /^\d{4}$/.test(key))
                    .map(Number)
            )
        )
    ]
        .filter(year =>
            diagram2.some(item => {
                const value = item[String(year)];

                return (
                    value !== null &&
                    value !== undefined
                );
            })
        )
        .sort((a, b) => a - b);


    if (validYears.length === 0) {
        status.textContent =
            "Keine Jahresdaten vorhanden.";

        return;
    }


// Slider verwendet jetzt Positionen,
// nicht direkt Jahreszahlen.
    slider.min = 0;
    slider.max = validYears.length - 1;
    slider.step = 1;

// Start at first available year
    slider.value = 0;

    yearOutput.value = validYears[0];


    // ================================
    // MAP ERSTELLEN
    // ================================

    const map = L.map(container, {
        zoomControl: true,
        dragging: true,
        touchZoom: true,
        maxZoom: 12,

        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0
    }).setView([46.8, 8.2], 7);


    map.attributionControl.addAttribution("© swisstopo");


    // ================================
    // EBENE FÜR KINOS
    // ================================

    map.createPane("cinemaPoints");

    map.getPane("cinemaPoints").style.zIndex = "400";


    // ================================
    // EBENE FÜR KANTONSGRENZEN
    // ================================

    map.createPane("cantonBorders");

    map.getPane("cantonBorders").style.zIndex = "450";
    map.getPane("cantonBorders").style.pointerEvents = "none";


    // ================================
    // GEOJSON LADEN
    // ================================

    const response = await fetch("data/kantone.geojson");

    if (!response.ok) {
        throw new Error(
            `GeoJSON konnte nicht geladen werden: HTTP ${response.status}`
        );
    }

    const geojson = await response.json();


    // ================================
    // KANTONSGRENZEN
    // ================================

    const borders = L.geoJSON(geojson, {
        pane: "cantonBorders",
        interactive: false,

        style: {
            color: "#ffffff",
            weight: 1,
            opacity: 1,
            fill: false
        }
    }).addTo(map);


    const bounds = borders.getBounds();

    if (!bounds.isValid()) {
        throw new Error(
            "Die Datei enthält keine gültigen Kartenflächen."
        );
    }


    // ================================
    // LAYER FÜR KINODATEN
    // ================================

    const cinemaLayer = L.layerGroup().addTo(map);


    // ================================
    // JAHR ANZEIGEN
    // ================================

    function updateYear() {
        const yearIndex = Number(slider.value);
        const year = validYears[yearIndex];

        yearOutput.value = year;

        // Alte Punkte entfernen
        cinemaLayer.clearLayers();

        let totalCinemas = 0;
        let municipalitiesWithCinema = 0;


        diagram2.forEach(item => {

            // Beispiel:
            // item["2025"]
            const cinemaCount = item[year];


            // null = keine Daten
            // 0 = kein Kino
            if (
                cinemaCount === null ||
                cinemaCount === undefined ||
                Number(cinemaCount) <= 0
            ) {
                return;
            }


            const latitude = Number(item.latitude);
            const longitude = Number(item.longitude);
            const count = Number(cinemaCount);


            // ungültige Koordinaten überspringen
            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                return;
            }


            totalCinemas += count;
            municipalitiesWithCinema++;


            // Grössere Anzahl Kinos = grösserer Kreis
            const radius = getMapPointRadius(count);
            const pointColor = getMapPointColor(count);



            const marker = L.circleMarker(
                [latitude, longitude],
                {
                    pane: "cinemaPoints",

                    radius: radius,

                    color: pointColor,
                    weight: 1,
                    opacity: 1,

                    fillColor: pointColor,
                    fillOpacity: 0.55
                }
            );


            // Tooltip bei Hover
            marker.bindTooltip(
                `${item.municipality}: ${count} ${
                    count === 1 ? "Kino" : "Kinos"
                }`
            );


            marker.addTo(cinemaLayer);
        });


        status.textContent =
            `${year}: ${totalCinemas} Kinos in ` +
            `${municipalitiesWithCinema} Gemeinden`;
    }


    // ================================
    // SLIDER
    // ================================

    slider.addEventListener(
        "input",
        updateYear
    );


    slider.addEventListener(
        "keydown",
        event => {
            event.stopPropagation();
        }
    );


    // ================================
    // KARTE EINPASSEN
    // ================================

    function fitMap() {
        if (
            !container.clientWidth ||
            !container.clientHeight
        ) {
            return;
        }

        map.invalidateSize({
            pan: false
        });

        map.fitBounds(bounds, {
            padding: [15, 15],
            animate: false
        });
    }


    fitMap();
    updateYear();


    // ================================
    // RESIZE
    // ================================

    const observer = new ResizeObserver(
        fitMap
    );

    observer.observe(container);


    // Nach Slide-Animation neu berechnen
    document
        .querySelector("#slides")
        ?.addEventListener(
            "transitionend",
            event => {

                if (
                    event.target.id === "slides" &&
                    event.propertyName === "transform"
                ) {
                    fitMap();
                }

            }
        );
}