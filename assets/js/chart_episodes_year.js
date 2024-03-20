// Functie om de afleveringen per jaar te tellen en weer te geven in een Chart.js gestapelde staafdiagram
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
        // Object om het aantal afleveringen per jaar en categorie bij te houden
        const episodesPerYear = {};

        // Loop door de afleveringen om ze te groeperen per jaar en categorie
        data.forEach(episode => {
            const year = new Date(episode.datum).getFullYear();
            const category = episode.categorie;

            if (!episodesPerYear[year]) {
                episodesPerYear[year] = {
                    'nieuws': 0,
                    'achtergrond': 0,
                    'reportage': 0,
                    'interview': 0
                };
            }

            episodesPerYear[year][category]++;
        });

        // Labels voor het staafdiagram
        const years = Object.keys(episodesPerYear);
        const labels = years.map(year => year.toString());

        // Data voor het staafdiagram per categorie
        const datasets = Object.keys(categoryColors).map(category => {
            return {
                label: category,
                data: years.map(year => episodesPerYear[year][category] || 0),
                backgroundColor: categoryColors[category]
            };
        });

        // Creeër een canvas voor het staafdiagram
        const ctx = document.getElementById('yearBarChart').getContext('2d');

        // Creeër het staafdiagram
        const barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      ticks: {
                        stepSize: 5
                      }
                    }
                  },
                  plugins: {
                    legend: {
                        position: 'bottom',
                        display: true
                    }
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

// Kleuren toewijzen aan categorieën
const categoryColors = {
    'nieuws': '#F2CB65',
    'achtergrond': '#619079',
    'reportage': '#44687D',
    'interview': '#AC1A2E'
};