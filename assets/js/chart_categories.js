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
    // Maak een object om de telling van categorieën bij te houden
    const categoryCount = {};

    // Loop door de JSON-data om de categorieën te tellen
    data.forEach(episode => {
        const category = episode.categorie;
        if (category in categoryCount) {
            categoryCount[category]++;
        } else {
            categoryCount[category] = 1;
        }
    });

    // Haal de labels en data op voor de Pie Chart
    const labels = Object.keys(categoryCount);
    const dataValues = Object.values(categoryCount);

    // Creeër een canvas voor de Pie Chart
    const ctx = document.getElementById('categories_pie').getContext('2d');

    // Creeër de Pie Chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Categorieën',
                data: dataValues,
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',  // Rood
                    'rgba(54, 162, 235, 1)',  // Blauw
                    'rgba(255, 206, 86, 1)',  // Geel
                    'rgba(75, 192, 192, 1)',  // Groen
                    'rgba(153, 102, 255, 1)'  // Paars
                    // Je kunt meer kleuren toevoegen indien nodig
                ]
            }]
        }
    });
})
.catch(error => {
    console.error('Error:', error);
    alert('Er is een fout opgetreden bij het laden van de gegevens.');
});