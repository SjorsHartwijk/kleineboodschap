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
        const categorieen = [];


        // Loop door de afleveringen om labels, data en kleuren te verzamelen
        data.forEach(episode => {
            labels.push(`${episode.id}: ${episode.titel}`); // Gebruik aflevering ID als label
            dataValues.push(parseFloat(episode.tijd)); // Gebruik tijd als data

            const category = episode.categorie;
            categorieen.push(category);
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
                    backgroundColor: c => kbCategorieKleur(categorieen[c.dataIndex]),
                }]
            },
            options: {
                plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  responsive: true,
                  scales: {
                    x: {
                      title: {
                        display: false,
                      }
                    },
                    y: {
                      title: {
                        display: false,
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