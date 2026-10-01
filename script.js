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

/* ----------------------------------
   MAUS-PARALLAX
---------------------------------- */

const pointerQuery = window.matchMedia("(pointer: fine)");
const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

let animationFrame = null;
let lastTime = null;

function parallaxEnabled() {
    return pointerQuery.matches && !motionQuery.matches;
}

function startAnimation() {
    if (animationFrame === null && parallaxEnabled()) {
        lastTime = null;
        animationFrame = requestAnimationFrame(animateParallax);
    }
}

window.addEventListener("pointermove", (event) => {
    if (!parallaxEnabled() || event.pointerType !== "mouse") return;

    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;

    startAnimation();
});

// Beim Verlassen des Fensters zurück zur Mitte.
function resetTarget() {
    targetX = 0;
    targetY = 0;
    startAnimation();
}

document.documentElement.addEventListener("pointerleave", resetTarget);
window.addEventListener("blur", resetTarget);

function animateParallax(time) {
    const delta = lastTime === null
        ? 16.67
        : Math.min(time - lastTime, 50);

    lastTime = time;

    // Gleiche Glättung bei verschiedenen Bildschirmfrequenzen.
    const easing = 1 - Math.pow(1 - 0.055, delta / 16.67);

    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;

    const settled =
        Math.abs(targetX - currentX) < 0.001 &&
        Math.abs(targetY - currentY) < 0.001;

    if (settled) {
        currentX = targetX;
        currentY = targetY;
    }

    layers.forEach((layer) => {
        const speedX = Number(layer.dataset.speedX) || 0;
        const speedY = Number(layer.dataset.speedY) || 0;

        layer.style.transform = `translate3d(
            ${currentX * speedX}px,
            ${currentY * speedY}px,
            0
        )`;
    });

    // Nur animieren, solange sich tatsächlich etwas bewegt.
    animationFrame = settled
        ? null
        : requestAnimationFrame(animateParallax);
}

function updateMotionSettings() {
    if (parallaxEnabled()) return;

    cancelAnimationFrame(animationFrame);
    animationFrame = null;

    targetX = targetY = currentX = currentY = 0;

    layers.forEach((layer) => {
        layer.style.removeProperty("transform");
    });
}

pointerQuery.addEventListener("change", updateMotionSettings);
motionQuery.addEventListener("change", updateMotionSettings);

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