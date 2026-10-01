const slidesContainer = document.querySelector("#slides");
const slides = [...document.querySelectorAll(".slide")];
const layers = [...document.querySelectorAll(".parallax-layer")];

const previousButton = document.querySelector("#previousSlide");
const nextButton = document.querySelector("#nextSlide");
const counter = document.querySelector("#slideCounter");

let activeSlide = 0;

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

    previousButton.disabled = activeSlide === 0;
    nextButton.disabled = activeSlide === slides.length - 1;

    counter.textContent = `${activeSlide + 1} / ${slides.length}`;

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

/* =========================================
   PARALLAX
   ========================================= */

const layers = [
    ...document.querySelectorAll(".parallax-layer")
];

const pointerQuery = window.matchMedia(
    "(pointer: fine)"
);

const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


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

goToSlide(0);

const chartCanvas = document.querySelector("#cinemaChart");

let cinemaChart = null;

if (chartCanvas && typeof Chart !== "undefined") {
    cinemaChart = new Chart(chartCanvas, {
        type: "line",

        data: {
            labels: [],
            datasets: [{
                label: "Anzahl Kinos",
                data: [],

                borderColor: "#ffffff",
                borderWidth: 3,
                pointBackgroundColor: "#ffffff",
                pointRadius: 4,
                pointHoverRadius: 7,

                tension: 0,
                fill: false
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    ticks: {
                        display: false,
                        color: "#aaaaaa"
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
                        // Zahlen erst anzeigen, wenn Daten vorhanden sind.
                        display: false,
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