// Functie om de afleveringen te laden en weer te geven in een Chart.js staafdiagram
function loadEpisodes() {
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
        // Sorteer de afleveringen op ID
        data.sort((a, b) => a.id - b.id);

        // Lijsten voor labels en data
        const labels = [];
        const dataValues = [];
        const backgroundColors = [];

        // Kleuren toewijzen aan categorieën
        const categoryColors = {
            'nieuws': '#F6CA83',
            'achtergrond': '#7B9F93',
            'reportage': '#4685AE',
            'interview': '#C46868'
        };

        // Loop door de afleveringen om labels, data en kleuren te verzamelen
        data.forEach(episode => {
            labels.push(`${episode.id}: ${episode.titel}`); // Gebruik aflevering ID als label
            dataValues.push(parseFloat(episode.tijd)); // Gebruik tijd als data

            const category = episode.categorie;
            backgroundColors.push(categoryColors[category]);
        });

        // Creeër een canvas voor de staafdiagram
        const ctx = document.getElementById('barChart').getContext('2d');

        // Creeër de staafdiagram
        const barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // Gebruik aflevering ID's als labels
                datasets: [{
                    label: 'minuten',
                    data: dataValues, // Gebruik tijd als data
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                plugins: {
                    legend: {
                      display: false,
                    }
                  },
                scales: {
                    x: {
                      title: {
                        display: false,
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Minuten'
                      },
                      ticks: {
                        stepSize: 30
                      }
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

// Roep de functie aan om de afleveringen in te laden wanneer de pagina geladen is
window.onload = loadEpisodes();