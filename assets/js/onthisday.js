// Functie om afleveringen van vandaag in voorgaande jaren op te halen en weer te geven
function vandaagOpDezeDag() {
    // Haal de huidige datum op
    const today = new Date();
    const currentMonth = today.toLocaleDateString('nl-NL', { month: 'long' }); // Maandnaam in het Nederlands
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();


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
        // Filter de afleveringen die op dezelfde datum als vandaag in voorgaande jaren zijn gepubliceerd
        const todayEpisodes = data.filter(episode => {
            const episodeDate = new Date(episode.datum);
            const episodeMonth = episodeDate.toLocaleDateString('nl-NL', { month: 'long' }); // Maandnaam in het Nederlands
            const episodeDay = episodeDate.getDate();
            return episodeMonth === currentMonth && episodeDay === currentDate;
        });

        // Toon de afleveringen op de pagina
        const todayEpisodesElement = document.getElementById('todayEpisodes');
        if (todayEpisodes.length > 0) {
            todayEpisodes.forEach(episode => {
                const episodeDate = new Date(episode.datum);
                const formattedDate = episodeDate.getDate() + ' ' + episodeDate.toLocaleDateString('nl-NL', { month: 'long' }) + ' ' + episodeDate.getFullYear();
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = `Aflevering ${episode.id}: ${episode.titel} kwam uit op ${formattedDate}`;
                todayEpisodesElement.appendChild(listItem);
            });
        } else {
            todayEpisodesElement.textContent = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}

// Roep de functie aan om de afleveringen van vandaag in voorgaande jaren op te halen wanneer de pagina geladen is

window.onload = vandaagOpDezeDag();