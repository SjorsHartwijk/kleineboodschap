// Functie om de categorieën van afleveringen te bundelen en weer te geven in een Chart.js cirkeldiagram
function loadCategories() {
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
        // Object om het aantal afleveringen per categorie bij te houden
        const episodesPerCategory = {
            'nieuws': 0,
            'achtergrond': 0,
            'reportage': 0,
            'interview': 0
        };

        // Loop door de afleveringen om ze op te tellen per categorie
        data.forEach(episode => {
            const category = episode.categorie;
            episodesPerCategory[category]++;
        });

        // Labels en data voor het donut chart
        const labels = Object.keys(episodesPerCategory);
        const datalabel = labels.map(label => episodesPerCategory[label]);
        const backgroundColors = labels.map(label => categoryColors[label]);
            // Creeër een canvas voor het cirkeldiagram
            const ctx = document.getElementById('donutChart').getContext('2d');
            // Creeër het cirkeldiagram
            const pieChart = new Chart(ctx, {
                type: 'polarArea',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Aantal afleveringen',
                        data: datalabel,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    response: true,
                    plugins: {
                        legend: {
                            position: 'left',
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
    // Roep de functie aan om de categorieën weer te geven in het cirkeldiagram wanneer de pagina geladen is
    window.onload = loadCategories;