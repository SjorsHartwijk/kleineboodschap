// Maak de grote afleveringen staaftabel
fetch('episodes.json')
.then(response => {
    // Controleer of het laden van het bestand succesvol is
    if (!response.ok) {
        throw new Error('Failed to load JSON data');
    }
    return response.json();
})
.then(data => {
    // Extract de benodigde gegevens uit het JSON-object
    const titel = data.map(episode => `${episode.id}: ${episode.titel}`);
    const tijd = data.map(episode => episode.tijd);
    const category = data.map(episode => episode.categorie);
    
    // Creeër een canvas voor de Bar Chart
    const episodes = document.getElementById('episodes');
    // Creeër de Bar Chart
    new Chart(episodes, {
        type: 'bar',
        data: {
        labels: titel,
            datasets: [{
                label: 'minuten',
                data: tijd,
                backgroundColor: '#F6CA83',
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
})