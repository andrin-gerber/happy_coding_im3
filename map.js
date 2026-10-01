(async () => {
    const container = document.querySelector("#swissMap");
    const slider = document.querySelector("#mapYear");
    const yearOutput = document.querySelector("#mapYearValue");
    const status = document.querySelector("#mapStatus");

    if (!container || !slider || !yearOutput || !status) return;

    if (typeof L === "undefined") {
        status.textContent =
            "Leaflet konnte nicht geladen werden.";
        return;
    }

    // Der Jahresregler verändert zunächst nur die Jahresanzeige.
    // Die Heatmap-Daten kommen später aus deinem Backend.
    function updateYear() {
        yearOutput.value = slider.value;

        status.textContent =
            `Noch keine Kinodaten für ${slider.value} vorhanden.`;
    }

    slider.addEventListener("input", updateYear);

    // Pfeiltasten bedienen den Regler, ohne Slides zu wechseln.
    slider.addEventListener("keydown", event => {
        event.stopPropagation();
    });

    try {
        const map = L.map(container, {
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false,
            boxZoom: false,
            touchZoom: false,
            keyboard: false,
            zoomSnap: 0
        }).setView([46.8, 8.2], 7);

        map.attributionControl.addAttribution("© swisstopo");

        // Eigene Ebene: Grenzen liegen später über der Heatmap.
        map.createPane("cantonBorders");
        map.getPane("cantonBorders").style.zIndex = "450";
        map.getPane("cantonBorders").style.pointerEvents = "none";

        const response = await fetch("data/kantone.geojson");

        if (!response.ok) {
            throw new Error(
                `GeoJSON konnte nicht geladen werden: HTTP ${response.status}`
            );
        }

        const geojson = await response.json();

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
            throw new Error("Die Datei enthält keine gültigen Kartenflächen.");
        }

        function fitMap() {
            if (!container.clientWidth || !container.clientHeight) return;

            map.invalidateSize({ pan: false });

            map.fitBounds(bounds, {
                padding: [15, 15],
                animate: false
            });
        }

        fitMap();
        updateYear();

        // Karte bei Änderung der Fenstergröße neu einpassen.
        const observer = new ResizeObserver(fitMap);
        observer.observe(container);

        // Auch nach deiner horizontalen Slide-Animation einpassen.
        document.querySelector("#slides")
            ?.addEventListener("transitionend", event => {
                if (
                    event.target.id === "slides" &&
                    event.propertyName === "transform"
                ) {
                    fitMap();
                }
            });
    } catch (error) {
        console.error("Kartenfehler:", error);

        status.textContent =
            "Karte konnte nicht geladen werden. Prüfe data/kantone.geojson.";
    }
})();