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
        // Object om categorieën en bijbehorende tijden bij te houden
        const categories = {};
        // Loop door de afleveringen om categorieën en tijden te bundelen
        data.forEach(episode => {
            const category = episode.categorie;
            if (category in categories) {
                categories[category] += parseFloat(episode.tijd); // Tijd toevoegen aan bestaande categorie
            } else {
                categories[category] = parseFloat(episode.tijd); // Nieuwe categorie maken
            }
        });
        // Kleuren toewijzen aan categorieën
        const categoryColors = {
            'nieuws': '#F6CA83',
            'achtergrond': '#7B9F93',
            'reportage': '#4685AE',
            'interview': '#C46868'
        };
        // Labels en data voor het cirkeldiagram
            const labels = Object.keys(categories);
            const dataValues = Object.values(categories);
            const backgroundColors = labels.map(category => categoryColors[category]);
            // Creeër een canvas voor het cirkeldiagram
            const ctx = document.getElementById('pieChart').getContext('2d');
            // Creeër het cirkeldiagram
            const pieChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                          display: false,
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