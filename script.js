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
    nextButton.disabled = activeSlide === slides.length - 1;

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
    goToSlide(activeSlide + 1);
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

                // Keine Punkte
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 0
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
                },

                title: {
                    display: true,
                    text: "Entwicklung der Anzahl Kinos von 1966 bis 2025",                       // dein Text bleibt unverändert
                    color: "#ffffff",
                    font: {
                        family: '"Nova Flat", system-ui',   // dieselbe Schrift wie die h2-Titel
                        size: 24,                           // vorher: 16
                        weight: "normal"
                    },
                    padding: {
                        bottom: 20
                    },
                    align: "start"
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

    const maxY = Math.max(
        ...points1966.map(point => point.y),
        ...points2025.map(point => point.y)
    );

    scatterChart = new Chart(scatterCanvas, {
        type: "scatter",

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

                title: {
                    display: true,
                    text: "Kapazitätsentwicklung im Schweizer Kinosektor (1966–2025)",
                    color: "#ffffff",
                    font: {
                        family: '"Nova Flat", system-ui',   // dieselbe Schrift wie die h2-Titel
                        size: 24,                           // vorher: 16
                        weight: "normal"
                    },
                    padding: {
                        bottom: 20
                    },
                    align: "start"
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

                    ticks: {
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