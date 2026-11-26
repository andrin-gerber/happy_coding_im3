const slidesContainer = document.querySelector("#slides");
const slides = [...document.querySelectorAll(".slide")];
const layers = [...document.querySelectorAll(".parallax-layer")];

const previousButton = document.querySelector("#previousSlide");
const nextButton = document.querySelector("#nextSlide");
const counter = document.querySelector("#slideCounter");

let activeSlide = 0;

const ABOUT_SLIDE_INDEX = 0;
const INTRO_SLIDE_INDEX = 1;

/* =========================================
   PARALLAX
   ========================================= */

const pointerQuery = window.matchMedia(
    "(pointer: fine)"
);

const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

layers.forEach((layer) => {
    const depth = Number(layer.dataset.depth);

    if (!Number.isFinite(depth)) {
        return;
    }

    const normalizedDepth = Math.max(
        0,
        Math.min(1, depth)
    );

    layer.style.setProperty(
        "--depth",
        normalizedDepth
    );

    layer.style.zIndex = String(
        Math.round(10 + normalizedDepth * 70)
    );
});

/* ----------------------------------
   SEITENWECHSEL
---------------------------------- */

function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;

    activeSlide = index;

    // Prozent bezieht sich auf die Breite des Containers.
    // Dieser ist genau eine Viewportbreite breit.
    slidesContainer.style.transform =
        `translate3d(-${activeSlide * 100}%, 0, 0)`;

    slides.forEach((slide, index) => {
        // Verhindert Tastaturfokus auf unsichtbaren Seiten.
        slide.inert = index !== activeSlide;
    });

    previousButton.disabled = activeSlide === ABOUT_SLIDE_INDEX;
    const isLastSlide = activeSlide === slides.length - 1;

    nextButton.disabled = false;

    nextButton.textContent = isLastSlide
        ? "Zurück zum Anfang"
        : "Weiter →";

    nextButton.setAttribute(
        "aria-label",
        isLastSlide
            ? "Zurück zum Anfang"
            : "Nächste Seite"
    );

// Zurückbutton auf der Autorenseite ausblenden
    previousButton.style.visibility =
        activeSlide === ABOUT_SLIDE_INDEX
            ? "hidden"
            : "visible";

// Buttontext abhängig von der Seite ändern
    previousButton.textContent =
        activeSlide === INTRO_SLIDE_INDEX
            ? "Über das Projekt"
            : "← Zurück";

// Barrierefreiheit
    previousButton.setAttribute(
        "aria-label",
        activeSlide === INTRO_SLIDE_INDEX
            ? "Über das Projekt"
            : "Vorherige Seite"
    );

    if (activeSlide === ABOUT_SLIDE_INDEX) {
        counter.textContent = "Über uns";
    } else {
        counter.textContent =
            `${activeSlide} / ${slides.length - 1}`;
    }

    // Falls der gerade fokussierte Button deaktiviert wurde,
    // wandert der Fokus zum anderen Navigationsbutton.
    if (document.activeElement === previousButton &&
        previousButton.disabled) {
        nextButton.focus();
    }

    if (document.activeElement === nextButton &&
        nextButton.disabled) {
        previousButton.focus();
    }
}

previousButton.addEventListener("click", () => {
    goToSlide(activeSlide - 1);
});

nextButton.addEventListener("click", () => {

    if (activeSlide === slides.length - 1) {

        // Zurück zur Titelseite
        goToSlide(INTRO_SLIDE_INDEX);

    } else {

        // Normaler Seitenwechsel
        goToSlide(activeSlide + 1);
    }

});

// Optional: Navigation über die Pfeiltasten.
window.addEventListener("keydown", (event) => {
    const editing = event.target instanceof Element &&
        event.target.closest(
            "input, textarea, select, [contenteditable]"
        );

    if (editing || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(activeSlide + 1);
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(activeSlide - 1);
    }
});

/* ----------------------------------
   SIDEWAYS INPUT (wheel, trackpad, touch)
---------------------------------- */

const TRANSITION_MS = 1100;   // same as the CSS transition
let wheelLockUntil = 0;

// Gestures that belong to the map or form controls must not change slides.
function shouldIgnoreGesture(target) {
    return target instanceof Element &&
        Boolean(target.closest("#swissMap, input, textarea, select"));
}

// On mobile, .split-layout / .history-layout scroll vertically inside.
function canScrollVertically(el) {
    while (el && el !== document.body) {
        const style = getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) &&
            el.scrollHeight > el.clientHeight) {
            return true;
        }
        el = el.parentElement;
    }
    return false;
}

window.addEventListener("wheel", (event) => {
    if (event.ctrlKey) return;                       // pinch-zoom
    if (shouldIgnoreGesture(event.target)) return;   // let Leaflet zoom

    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (!horizontal && canScrollVertically(event.target)) return;

    event.preventDefault();

    const delta = horizontal ? event.deltaX : event.deltaY;
    const now = performance.now();

    // While a transition runs (and while trackpad inertia keeps
    // firing events) ignore input, so one swipe = one slide.
    if (now < wheelLockUntil) {
        wheelLockUntil = Math.max(wheelLockUntil, now + 120);
        return;
    }

    if (Math.abs(delta) < 8) return;

    const before = activeSlide;
    goToSlide(activeSlide + (delta > 0 ? 1 : -1));

    if (activeSlide !== before) {
        wheelLockUntil = now + TRANSITION_MS;
    }
}, { passive: false });


/* Touch swipe */
let touchStartX = 0;
let touchStartY = 0;
let touchTracking = false;

slidesContainer.addEventListener("touchstart", (event) => {
    touchTracking =
        event.touches.length === 1 &&
        !shouldIgnoreGesture(event.target);

    if (!touchTracking) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, { passive: true });

slidesContainer.addEventListener("touchend", (event) => {
    if (!touchTracking) return;
    touchTracking = false;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // Must be mostly horizontal and long enough.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;

    goToSlide(activeSlide + (dx < 0 ? 1 : -1));
}, { passive: true });

slidesContainer.addEventListener("touchcancel", () => {
    touchTracking = false;
}, { passive: true });

/* -----------------------------------------
   TIEFE DER BILDER VORBEREITEN
   ----------------------------------------- */

layers.forEach((layer) => {

    const depth = Number(
        layer.dataset.depth
    );

    /*
       Elemente ohne data-depth,
       zum Beispiel der Titel,
       werden hier übersprungen.
    */

    if (!Number.isFinite(depth)) {
        return;
    }


    /*
       Tiefe auf 0 bis 1 begrenzen.
    */

    const normalizedDepth = Math.max(
        0,
        Math.min(1, depth)
    );


    /*
       Tiefe an CSS weitergeben.
    */

    layer.style.setProperty(
        "--depth",
        normalizedDepth
    );


    /*
       Elemente mit hoher Tiefe liegen vorne.
    */

    layer.style.zIndex = String(
        Math.round(
            10 + normalizedDepth * 70
        )
    );

});


/* -----------------------------------------
   PARALLAX VARIABLEN
   ----------------------------------------- */

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

let animationFrame = null;
let lastTime = null;


/* -----------------------------------------
   IST PARALLAX AKTIV?
   ----------------------------------------- */

function parallaxEnabled() {

    return (
        pointerQuery.matches &&
        !motionQuery.matches
    );

}


/* -----------------------------------------
   ANIMATION STARTEN
   ----------------------------------------- */

function startAnimation() {

    if (
        animationFrame === null &&
        parallaxEnabled()
    ) {

        lastTime = null;

        animationFrame =
            requestAnimationFrame(
                animateParallax
            );
    }

}


/* -----------------------------------------
   MAUSPOSITION
   ----------------------------------------- */

window.addEventListener(
    "pointermove",
    (event) => {

        if (
            !parallaxEnabled() ||
            event.pointerType !== "mouse"
        ) {
            return;
        }


        /*
           Werte von -1 bis +1 erzeugen.
        */

        targetX =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 2;


        targetY =
            (
                event.clientY /
                window.innerHeight -
                0.5
            ) * 2;


        startAnimation();
    }
);


/* -----------------------------------------
   MAUS VERLÄSST DAS FENSTER
   ----------------------------------------- */

function resetTarget() {

    targetX = 0;
    targetY = 0;

    startAnimation();
}


document.documentElement.addEventListener(
    "pointerleave",
    resetTarget
);

window.addEventListener(
    "blur",
    resetTarget
);


/* -----------------------------------------
   EIGENTLICHE ANIMATION
   ----------------------------------------- */

function animateParallax(time) {

    const delta =
        lastTime === null
            ? 16.67
            : Math.min(
                time - lastTime,
                50
            );


    lastTime = time;


    /*
       Sanfte Bewegung.
    */

    const easing =
        1 -
        Math.pow(
            1 - 0.055,
            delta / 16.67
        );


    currentX +=
        (targetX - currentX) *
        easing;


    currentY +=
        (targetY - currentY) *
        easing;


    /*
       Prüfen, ob die Bewegung fertig ist.
    */

    const settled =
        Math.abs(
            targetX - currentX
        ) < 0.001
        &&
        Math.abs(
            targetY - currentY
        ) < 0.001;


    if (settled) {

        currentX = targetX;
        currentY = targetY;

    }


    /* -------------------------------------
       ALLE PARALLAX ELEMENTE BEWEGEN
       ------------------------------------- */

    layers.forEach((layer) => {

        const depth =
            Number(
                layer.dataset.depth
            );


        let speedX;
        let speedY;


        /*
           BILDER

           data-depth steuert automatisch
           die Geschwindigkeit.
        */

        if (Number.isFinite(depth)) {

            const normalizedDepth =
                Math.max(
                    0,
                    Math.min(
                        1,
                        depth
                    )
                );


            /*
               Hinten:
               kaum Bewegung.

               Vorne:
               starke Bewegung.
            */

            speedX =
                6 +
                normalizedDepth * 55;


            speedY =
                4 +
                normalizedDepth * 38;


        } else {

            /*
               TITEL oder andere Elemente.

               Hier werden weiterhin
               data-speed-x und
               data-speed-y benutzt.
            */

            speedX =
                Number(
                    layer.dataset.speedX
                ) || 0;


            speedY =
                Number(
                    layer.dataset.speedY
                ) || 0;

        }


        layer.style.transform =
            `translate3d(
                ${currentX * speedX}px,
                ${currentY * speedY}px,
                0
            )`;

    });


    /*
       Nur weiter animieren,
       solange Bewegung vorhanden ist.
    */

    animationFrame =
        settled
            ? null
            : requestAnimationFrame(
                animateParallax
            );

}


/* -----------------------------------------
   REDUCED MOTION
   ----------------------------------------- */

function updateMotionSettings() {

    if (parallaxEnabled()) {
        return;
    }


    if (animationFrame !== null) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    animationFrame = null;


    targetX = 0;
    targetY = 0;

    currentX = 0;
    currentY = 0;


    layers.forEach((layer) => {

        layer.style.removeProperty(
            "transform"
        );

    });

}


pointerQuery.addEventListener(
    "change",
    updateMotionSettings
);

motionQuery.addEventListener(
    "change",
    updateMotionSettings
);

// Start directly on the intro without animation
slidesContainer.style.transition = "none";

goToSlide(INTRO_SLIDE_INDEX);

// Force the browser to apply the initial position
void slidesContainer.offsetWidth;

// Restore the normal slide animation
slidesContainer.style.transition = "";

const chartCanvas = document.querySelector("#cinemaChart");

let cinemaChart = null;
let scatterChart = null;


const CINEMA_EVENTS = [
    {
        year: 1968,
        label: "Fernsehen",
        description:
            "1968 wurde in der Schweiz das Farbfernsehen eingeführt. Das Fernsehen machte die Unterhaltung zu Hause zunehmend attraktiver und stellte eine Konkurrenz zum Kino dar."
    },
    {
        year: 1980,
        label: "VHS / DVD",
        description:
            "Mit der Verbreitung von Videokassetten und später DVDs konnten Filme unabhängig vom Kinoprogramm zu Hause angesehen werden. Dadurch entstand eine zusätzliche Konkurrenz zum klassischen Kinobesuch."
    },
    {
        year: 1995,
        label: "Multiplex-Boom",
        description:
            "Ab den 1990er-Jahren entstanden vermehrt grosse Kinokomplexe mit mehreren Sälen. Die Kinolandschaft entwickelte sich zunehmend weg vom traditionellen Einzelkino."
    },
    {
        year: 2014,
        label: "Streaming",
        description:
            "Mit dem Schweizer Markteintritt von Netflix im Jahr 2014 gewann Streaming weiter an Bedeutung. Filme und Serien wurden zunehmend jederzeit und bequem von zu Hause aus abrufbar."
    },
    {
        year: 2020,
        label: "Corona",
        description:
            "Die Corona-Pandemie führte zu vorübergehenden Kinoschliessungen und massiven Besucherrückgängen. Viele Kinobetriebe gerieten dadurch unter wirtschaftlichen Druck."
    }
];

const cinemaTimelinePlugin = {
    id: "cinemaTimeline",

    // Linien und Beschriftungen zeichnen
    beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;

        if (!chartArea) return;

        const { top, bottom, left, right } = chartArea;

        const mobile = window.matchMedia(
            "(max-width: 700px)"
        ).matches;

        const fontSize = mobile ? 10 : 12;
        const rowHeight = fontSize + 9;

        chart.cinemaEventPositions = [];

        ctx.save();

        ctx.font =
            `${fontSize}px "Nova Flat", sans-serif`;

        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const rowEnds = [];

        CINEMA_EVENTS.forEach(event => {
            const index = chart.data.labels.findIndex(
                year => Number(year) === event.year
            );

            if (index === -1) return;

            const x = scales.x.getPixelForValue(index);

            if (x < left || x > right) return;

            // Vertikale dunkelrote Linie
            // Vertikale dunkelrote Linie
            ctx.beginPath();
            ctx.strokeStyle = "#8b0000";
            ctx.lineWidth = mobile ? 1.5 : 2;

            ctx.setLineDash([4, 5]);

            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            ctx.setLineDash([]);

            // Breite der Beschriftung
            const textWidth =
                ctx.measureText(event.label).width;

            // Verhindert abgeschnittene Beschriftungen
            const labelX = Math.max(
                left,
                Math.min(x + 6, right - textWidth - 4)
            );

            // Verhindert überlappende Beschriftungen
            let row = 0;

            while (
                rowEnds[row] !== undefined &&
                labelX < rowEnds[row] + 8
                ) {
                row++;
            }

            rowEnds[row] = labelX + textWidth;

            const labelY = top + 8 + row * rowHeight;

            // Position für Beschriftung und Hover speichern
            chart.cinemaEventPositions.push({
                ...event,
                x: x,
                labelX: labelX,
                labelY: labelY,
                width: textWidth,
                height: fontSize
            });
        });

        // Beschriftungen über den roten Linien zeichnen
        chart.cinemaEventPositions.forEach(event => {
            ctx.fillStyle = "#000000";

            ctx.fillRect(
                event.labelX - 2,
                event.labelY - 2,
                event.width + 4,
                event.height + 4
            );

            ctx.fillStyle = "#ffffff";

            ctx.fillText(
                event.label,
                event.labelX,
                event.labelY
            );
        });

        ctx.restore();
    },

    // Maus- und Touch-Interaktion
    afterEvent(chart, args) {
        const event = args.event;
        const positions =
            chart.cinemaEventPositions || [];

        const container = chart.canvas.parentElement;

        let tooltip = container.querySelector(
            ".cinema-event-tooltip"
        );

        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "cinema-event-tooltip";
            tooltip.setAttribute("role", "tooltip");

            container.appendChild(tooltip);
        }

        // Tooltip ausblenden
        if (
            event.type === "mouseout" ||
            event.x == null ||
            event.y == null
        ) {
            tooltip.style.display = "none";
            chart.canvas.style.cursor = "default";
            return;
        }

        // Hover über der Beschriftung
        const hoveredLabel = positions.find(item =>
            event.x >= item.labelX - 4 &&
            event.x <= item.labelX + item.width + 4 &&
            event.y >= item.labelY - 4 &&
            event.y <= item.labelY + item.height + 4
        );

        // Hover über der vertikalen Linie
        const hoveredLine = positions.find(item =>
            Math.abs(event.x - item.x) <= 7 &&
            event.y >= chart.chartArea.top &&
            event.y <= chart.chartArea.bottom
        );

        const activeEvent =
            hoveredLabel || hoveredLine;

        if (!activeEvent) {
            tooltip.style.display = "none";
            chart.canvas.style.cursor = "default";
            return;
        }

        // Tooltip-Inhalt
        const heading = document.createElement("strong");

        heading.textContent =
            `${activeEvent.year} – ${activeEvent.label}`;

        const description = document.createElement("p");

        description.textContent =
            activeEvent.description;

        tooltip.replaceChildren(heading, description);

        tooltip.style.display = "block";
        chart.canvas.style.cursor = "pointer";

        // Tooltip innerhalb des Diagramms positionieren
        let x = event.x + 14;
        let y = event.y + 14;

        if (x + tooltip.offsetWidth > chart.width - 8) {
            x = event.x - tooltip.offsetWidth - 14;
        }

        if (y + tooltip.offsetHeight > chart.height - 8) {
            y = event.y - tooltip.offsetHeight - 14;
        }

        tooltip.style.left = `${Math.max(4, x)}px`;
        tooltip.style.top = `${Math.max(4, y)}px`;
    },

    // Tooltip bei Grössenänderung ausblenden
    resize(chart) {
        const tooltip = chart.canvas.parentElement
            ?.querySelector(".cinema-event-tooltip");

        if (tooltip) {
            tooltip.style.display = "none";
        }
    },

    // Beim Löschen des Charts aufräumen
    afterDestroy(chart) {
        chart.canvas.parentElement
            ?.querySelector(".cinema-event-tooltip")
            ?.remove();
    }
};

function createCinemaChart(diagram1) {
    const chartCanvas = document.querySelector("#cinemaChart");

    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    // Falls bereits ein Chart existiert
    if (cinemaChart) {
        cinemaChart.destroy();
    }

    cinemaChart = new Chart(chartCanvas, {
        type: "line",

        plugins: [cinemaTimelinePlugin],

        data: {
            labels: diagram1.map(item => item.year),

            datasets: [{
                label: "Anzahl Kinos",
                data: diagram1.map(item => item.cinema_ch_total),

                borderColor: "#ffffff",
                borderWidth: 3,

                spanGaps: true,

                tension: 0,
                fill: false,

                pointRadius: 0,       // No dots normally
                pointHoverRadius: 6,  // Show a dot on hover
                pointHitRadius: 12    // Easier mouse targeting
            }]
        },



        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,

            // Zusätzlich global für diesen Chart:
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 0,
                    hitRadius: 0
                }
            },

            plugins: {
                legend: {
                    display: false
                }
                },



            scales: {
                x: {
                    ticks: {
                        display: true,
                        color: "#aaaaaa",
                        autoSkip: false,


                        callback: function(value) {
                            const year = Number(this.getLabelForValue(value));

                            return year % 5 === 0 ? year : "";
                        }
                    },

                    grid: {
                        display: false
                    },

                    border: {
                        color: "#555555"
                    },


                    title: {
                        display: true,
                        text: "Jahr",
                        color: "#aaaaaa"
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        display: true,
                        color: "#aaaaaa",
                        precision: 0
                    },

                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    },

                    border: {
                        color: "#555555"
                    },

                    title: {
                        display: true,
                        text: "Anzahl Kinos",
                        color: "#aaaaaa"
                    }
                }
            }
        }
    });
}

function groupScatterPoints(data, hallKey, cinemaKey) {
    const groups = new Map();

    data.forEach(item => {
        const rawHalls = item[hallKey];
        const rawCinemas = item[cinemaKey];

        // Missing data
        if (
            rawHalls === null ||
            rawCinemas === null ||
            rawHalls === undefined ||
            rawCinemas === undefined
        ) {
            return;
        }

        const halls = Number(rawHalls);
        const cinemas = Number(rawCinemas);

        if (
            !Number.isFinite(halls) ||
            !Number.isFinite(cinemas)
        ) {
            return;
        }

        const key = `${halls}-${cinemas}`;

        if (!groups.has(key)) {
            groups.set(key, {
                x: halls,
                y: cinemas,
                count: 0
            });
        }

        groups.get(key).count++;
    });

    return [...groups.values()];
}

const SCATTER_POINT_SIZE = {
    desktop: {
        base: 4,
        multiplier: 2,
        max: 18
    },

    mobile: {
        base: 1.5,
        multiplier: 0.8,
        max: 7
    }
};


function getScatterRadius(context, hover = false) {
    const count = context.raw?.count ?? 1;

    const mobile =
        window.matchMedia("(max-width: 700px)").matches;

    const settings = mobile
        ? SCATTER_POINT_SIZE.mobile
        : SCATTER_POINT_SIZE.desktop;

    let radius =
        settings.base +
        Math.sqrt(count) * settings.multiplier;

    radius = Math.min(
        radius,
        settings.max
    );

    if (hover) {
        radius += 2;
    }

    return radius;
}

const scatterReferenceLinePlugin = {
    id: "scatterReferenceLine",

    beforeDatasetsDraw(chart) {

        chart.scatterReferenceLine = null;

        // Nur anzeigen, wenn 1966 sichtbar ist
        if (!chart.isDatasetVisible(0)) {
            const tooltip = chart.scatterReferenceTooltip;

            if (tooltip) {
                tooltip.style.display = "none";
            }

            return;
        }

        const { ctx, scales } = chart;
        const xScale = scales.x;
        const yScale = scales.y;

        const maxDiagonalValue = Math.min(
            xScale.max,
            yScale.max
        );

        const xStart = xScale.getPixelForValue(0);
        const yStart = yScale.getPixelForValue(0);

        const xEnd = xScale.getPixelForValue(maxDiagonalValue);
        const yEnd = yScale.getPixelForValue(maxDiagonalValue);

        // Position der Linie für Hover speichern
        chart.scatterReferenceLine = {
            xStart,
            yStart,
            xEnd,
            yEnd
        };

        // Diagonale Linie zeichnen
        ctx.save();

        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.5;

        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();

        ctx.restore();
    },

    // Hover über der diagonalen Linie
    afterEvent(chart, args) {

        const event = args.event;
        const line = chart.scatterReferenceLine;
        const container = chart.canvas.parentElement;

        let tooltip = chart.scatterReferenceTooltip;

        if (!tooltip) {
            tooltip = document.createElement("div");

            tooltip.className = "cinema-event-tooltip";
            tooltip.setAttribute("role", "tooltip");

            container.appendChild(tooltip);

            chart.scatterReferenceTooltip = tooltip;
        }

        // Tooltip ausblenden
        if (
            !line ||
            !chart.isDatasetVisible(0) ||
            event.type === "mouseout" ||
            event.x == null ||
            event.y == null ||
            !args.inChartArea
        ) {
            tooltip.style.display = "none";
            return;
        }

        // Abstand zwischen Maus und diagonaler Linie
        const dx = line.xEnd - line.xStart;
        const dy = line.yEnd - line.yStart;

        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) {
            tooltip.style.display = "none";
            return;
        }

        const t = Math.max(0, Math.min(1,
            (
                (event.x - line.xStart) * dx +
                (event.y - line.yStart) * dy
            ) / lengthSquared
        ));

        const nearestX = line.xStart + t * dx;
        const nearestY = line.yStart + t * dy;

        const distance = Math.hypot(
            event.x - nearestX,
            event.y - nearestY
        );

        // Hover-Toleranz: 8 Pixel
        // Datenpunkte behalten ihren eigenen Tooltip
        if (
            distance > 8 ||
            chart.getActiveElements().length > 0
        ) {
            tooltip.style.display = "none";
            return;
        }

        // Beschreibung
        tooltip.innerHTML = `
            <strong>1 Kino = 1 Saal</strong>
            <p>
                1966 entsprach ein Kino häufig einem
                einzelnen Kinosaal. Dieses Kinomodell war damals verbreitet.
            </p>
        `;

        tooltip.style.display = "block";

        // Tooltip positionieren
        let x = event.x + 14;
        let y = event.y + 14;

        if (x + tooltip.offsetWidth > chart.width - 8) {
            x = event.x - tooltip.offsetWidth - 14;
        }

        if (y + tooltip.offsetHeight > chart.height - 8) {
            y = event.y - tooltip.offsetHeight - 14;
        }

        tooltip.style.left = `${Math.max(4, x)}px`;
        tooltip.style.top = `${Math.max(4, y)}px`;
    },

    resize(chart) {
        if (chart.scatterReferenceTooltip) {
            chart.scatterReferenceTooltip.style.display = "none";
        }
    },

    beforeDestroy(chart) {
        chart.scatterReferenceTooltip?.remove();
    }
};
function createScatterChart(diagram3) {
    const scatterCanvas = document.querySelector("#scatterChart");

    if (!scatterCanvas || typeof Chart === "undefined") {
        return;
    }

    if (scatterChart) {
        scatterChart.destroy();
    }

    // 1966
    const points1966 = groupScatterPoints(
        diagram3,
        "hall_mun_total_1966",
        "cinema_mun_total_1966"
    );



    // 2025
    const points2025 = groupScatterPoints(
        diagram3,
        "hall_mun_total_2025",
        "cinema_mun_total_2025"
    );

    // NEU: Gemeinsames Maximum der X-Achse
    const maxX = Math.ceil(
        Math.max(
            ...points1966.map(point => point.x),
            ...points2025.map(point => point.x)
        ) / 5
    ) * 5;

    // Bestehende Berechnung der Y-Achse
    const maxY = Math.max(
        ...points1966.map(point => point.y),
        ...points2025.map(point => point.y)
    );


    scatterChart = new Chart(scatterCanvas, {
        type: "scatter",

        plugins: [scatterReferenceLinePlugin],

        data: {
            datasets: [
                {
                    label: "1966",
                    data: points1966,

                    backgroundColor:
                        "rgba(255, 255, 255, 0.45)",

                    borderColor:
                        "rgba(255, 255, 255, 0.8)",

                    clip: 0,

                    pointRadius: function(context) {
                        return getScatterRadius(context);
                    },

                    pointHoverRadius: function(context) {
                        return getScatterRadius(context, true);
                    }
                },

                {
                    label: "2025",
                    data: points2025,


                    backgroundColor:
                        "rgba(255, 180, 180, 0.65)",

                    borderColor:
                        "rgba(255, 180, 180, 1)",

                    clip: 0,

                    pointRadius: function(context) {
                        return getScatterRadius(context);
                    },

                    pointHoverRadius: function(context) {
                        return getScatterRadius(context, true);
                    }
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,

            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#aaaaaa"
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const point = context.raw;

                            return [
                                `Säle: ${point.x}`,
                                `Kinos: ${point.y}`,
                                `Gemeinden: ${point.count}`
                            ];
                        }
                    }
                }
            },

            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    min: 0,
                    max: maxX,

                    ticks: {
                        color: "#aaaaaa",
                        precision: 0,
                        stepSize: 5,
                        autoSkip: false,
                    },

                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    },

                    border: {
                        color: "#555555"
                    },

                    title: {
                        display: true,
                        text: "Anzahl Kinosäle pro Gemeinde",
                        color: "#aaaaaa"
                    }
                },

                y: {
                    min: 0,
                    max: maxY + 1,

                    ticks: {
                        color: "#aaaaaa",
                        precision: 0,
                        stepSize: 1
                    },

                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    },

                    border: {
                        color: "#555555"
                    },

                    title: {
                        display: true,
                        text: "Anzahl Kinos pro Gemeinde",
                        color: "#aaaaaa"
                    }
                }
            }
        }
    });
}