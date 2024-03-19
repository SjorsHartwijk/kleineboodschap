// Dit bestand berekend de snelle statistieken

// Functie om het gemiddelde aantal minuten te berekenen van het 'tijd' attribuut in het 'episodes.json' bestand
function calculateAverageMinutes() {
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
        // Bereken het totale aantal minuten en het aantal afleveringen
        let totalMinutes = 0;
        const numEpisodes = data.length;
        data.forEach(episode => {
            totalMinutes += parseFloat(episode.tijd); // Converteer het tijd attribuut naar een getal en tel op bij het totaal
        });

        // Bereken het gemiddelde aantal minuten
        const averageMinutes = totalMinutes / numEpisodes;

        // Toon het gemiddelde aantal minuten op de HTML-pagina
        const averageMinutesElement = document.getElementById('averageMinutes');
        averageMinutesElement.textContent = `${averageMinutes.toFixed(0)}`;
    })
    .catch(error => {
        console.error('Error:', error);
        const averageMinutesElement = document.getElementById('averageMinutes');
        averageMinutesElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
    });
}
// Functie om het aantal JSON-objecten in het 'episodes.json' bestand te tellen en weer te geven
function countJSONObjects() {
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
        // Tel het aantal objecten in het JSON-array
        const count = data.length;

        // Toon het aantal objecten op de HTML-pagina
        const jsonCountElement = document.getElementById('afleveringenCount');
        jsonCountElement.textContent = `${count}`;
    })
    .catch(error => {
        console.error('Error:', error);
        const jsonCountElement = document.getElementById('afleveringenCount');
        jsonCountElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
    });
}

// Functie om het aantal JSON-items te tellen waarbij de 'categorie' gelijk is aan 'interview'
function countInterview() {
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
        // Tel het aantal items waarbij de 'categorie' gelijk is aan 'interview'
        const interviewCount = data.reduce((accumulator, episode) => {
            return accumulator + (episode.categorie === 'interview' ? 1 : 0);
        }, 0);

        // Toon het aantal items op de HTML-pagina
        const countInterviewElement = document.getElementById('countInterview');
        countInterviewElement.textContent = `${interviewCount}`;
    })
    .catch(error => {
        console.error('Error:', error);
        const countInterviewElement = document.getElementById('countInterview');
        countInterviewElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
    });
}
// Functie om het percentage van afleveringen met de categorie 'nieuws' te berekenen
function calculatePercentageNieuws() {
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
        // Tel het aantal items waarbij de 'categorie' gelijk is aan 'nieuws'
        const nieuwsCount = data.reduce((accumulator, episode) => {
            return accumulator + (episode.categorie === 'nieuws' ? 1 : 0);
        }, 0);

        // Bereken het totale aantal afleveringen
        const totalEpisodes = data.length;

        // Bereken het percentage van nieuwsafleveringen
        const percentageNieuws = (nieuwsCount / totalEpisodes) * 100;

        // Toon het percentage op de HTML-pagina
        const percentageNieuwsElement = document.getElementById('percentageNieuws');
        percentageNieuwsElement.textContent = `${percentageNieuws.toFixed(0)}%`;
    })
    .catch(error => {
        console.error('Error:', error);
        const percentageNieuwsElement = document.getElementById('percentageNieuws');
        percentageNieuwsElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
    });
}
// Functie om de langste en kortste aflevering op te halen en weer te geven
function findShortestAndLongestEpisodes() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        // Sorteer de afleveringen op basis van de tijd
        const sortedEpisodes = data.sort((a, b) => a.tijd - b.tijd);

        // De eerste aflevering is de kortste
        const shortestEpisode = sortedEpisodes[0];
        // De laatste aflevering is de langste
        const longestEpisode = sortedEpisodes[sortedEpisodes.length - 1];

        // Vul de kortste aflevering in het span-element met id "shortestEpisodeInfo"
        document.getElementById('shortestEpisodeInfo').innerHTML = `${shortestEpisode.id}: ${shortestEpisode.titel} is een ${shortestEpisode.categorie}-aflevering en duurt slechts <strong>${shortestEpisode.tijd} minuten</strong>`;

        // Vul de langste aflevering in het span-element met id "longestEpisodeInfo"
        document.getElementById('longestEpisodeInfo').innerHTML = `${longestEpisode.id}: ${longestEpisode.titel} is een ${longestEpisode.categorie}-aflevering en is recordhouder van de langste aflevering, de aflevering duurt <strong>${longestEpisode.tijd} minuten</strong>`;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function calculateEpisodeHours() {
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

        // Bereken de som van het aantal minuten uit alle afleveringen
        const totalMinutes = data.reduce((total, episode) => total + parseInt(episode.tijd), 0);

        // Rond de som van minuten af naar hele uren
        const totalHours = Math.round(totalMinutes / 60);

        // Toon de som van het aantal minuten afgerond naar hele uren op de pagina
        const totalMinutesElement = document.getElementById('totalMinutes');
        totalMinutesElement.textContent = `Alle afleveringen van Kleine Boodschap duren in totaal ${totalMinutes} minuten, dat is ${totalHours} uur aan Kleine Boodschap!`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}
// top 5 langste en top 5 korste afleveringen
function showTop5Episodes() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        // Sorteer de afleveringen op basis van de tijd
        const sortedEpisodes = data.slice().sort((a, b) => a.tijd - b.tijd);

        // Top 5 langste afleveringen
        const top5LongestEpisodes = sortedEpisodes.slice(-5).reverse(); // Draai de volgorde om (langste eerst)

        // Vul de lijst met de top 5 langste afleveringen
        const longestEpisodesListElement = document.getElementById('longestEpisodesList');
        top5LongestEpisodes.forEach(episode => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.classList.add('small');
            listItem.textContent = `${episode.id}: ${episode.titel} - ${episode.tijd} minuten (${formatDate(episode.datum)})`;
            longestEpisodesListElement.appendChild(listItem);
        });

        // Top 5 kortste afleveringen
        const top5ShortestEpisodes = sortedEpisodes.slice(0, 5);

        // Vul de lijst met de top 5 kortste afleveringen
        const shortestEpisodesListElement = document.getElementById('shortestEpisodesList');
        top5ShortestEpisodes.forEach(episode => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.classList.add('small');
            listItem.textContent = `${episode.id}: ${episode.titel} - ${episode.tijd} minuten (${formatDate(episode.datum)})`;
            shortestEpisodesListElement.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}

// Functie om de datum te formatteren naar de Nederlandse datumnotatie (dd-mm-yyyy)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
// Roep de functies aan wanneer de pagina geladen is
window.onload = calculateEpisodeHours();
window.onload = findShortestAndLongestEpisodes();
window.onload = showTop5Episodes();
window.onload = calculatePercentageNieuws();
window.onload = countInterview();
window.onload = calculateAverageMinutes();
window.onload = countJSONObjects();