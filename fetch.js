
async function loadChartData() {
    const url = 'unload.php';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Der Endpunkt antwortet mit Status ${response.status}.`
        );
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        throw new Error(
            'Die Antwort ist kein JSON. Öffne unload.php direkt im Browser.'
        );
    }

    return await response.json();
}


async function chart1() {
    try {
        const data = await loadChartData();

        console.log(data);
        console.log(data.diagram1);

        const diagram1 = data.diagram1;

        const chartCanvas = document.querySelector("#cinemaChart");

        if (chartCanvas && typeof Chart !== "undefined") {

            const cinemaChart = new Chart(chartCanvas, {
                type: "line",

                data: {
                    labels: diagram1.map(item => item.year),

                    datasets: [{
                        label: "Anzahl Kinos",

                        data: diagram1.map(item => item.cinema_ch_total),

                        borderColor: "#ffffff",
                        borderWidth: 3,
                        pointBackgroundColor: "#ffffff",
                        pointRadius: 4,
                        pointHoverRadius: 7,

                        tension: 0,
                        fill: false,
                        spanGaps: false
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
                                display: true,
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

    } catch (error) {
        console.error("Fehler beim Laden der Diagrammdaten:", error);
    }
}

chart1();