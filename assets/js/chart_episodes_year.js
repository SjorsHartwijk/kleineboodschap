// Functie om de afleveringen per jaar te tellen en weer te geven in een Chart.js staafdiagram
function loadEpisodesPerYear() {
    // Fetch het JSON-bestand
    fetch('episodes.json')
    .then(response => {
        // Controleer of het laden van het bestand succesvol is
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        // Object om het aantal afleveringen per jaar bij te houden
        const episodesPerYear = {};

        // Loop door de afleveringen om ze te groeperen per jaar
        data.forEach(episode => {
            const year = new Date(episode.datum).getFullYear();

            if (year in episodesPerYear) {
                episodesPerYear[year]++;
            } else {
                episodesPerYear[year] = 1;
            }
        });

        // Jaren sorteren
        const sortedYears = Object.keys(episodesPerYear).sort((a, b) => a - b);

        // Labels en data voor het staafdiagram
        const labels = sortedYears;
        const dataValues = sortedYears.map(year => episodesPerYear[year]);

        // Creeër een canvas voor het staafdiagram
        const barChartCanvas = document.getElementById('yearBarChart').getContext('2d');

        // Creeër het staafdiagram
        const barChart = new Chart(barChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Aantal afleveringen',
                    data: dataValues,
                    backgroundColor: '#4685AE', // Blauwe kleur voor alle staven
                }]
            },
            options: {
                plugins: {
                    legend: {
                      display: false,
                    }
                  },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}

// Roep de functie aan om de afleveringen per jaar weer te geven wanneer de pagina geladen is
window.onload = loadEpisodesPerYear();