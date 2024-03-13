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
function getLongestAndShortestEpisodes() {
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
        // Zoek de aflevering met het hoogste aantal minuten
        let longestEpisode = data.reduce((max, episode) => max.tijd > episode.tijd ? max : episode);

        // Zoek de aflevering met het laagste aantal minuten
        let shortestEpisode = data.reduce((min, episode) => min.tijd < episode.tijd ? min : episode);

        // Toon het ID, de titel en het aantal minuten van de langste aflevering
        const longestEpisodeElement = document.getElementById('longestEpisode');
        longestEpisodeElement.textContent = `${longestEpisode.id}: ${longestEpisode.titel} is een ${longestEpisode.categorie}-aflevering en is recordhouder van langste aflevering en duurt ${longestEpisode.tijd} minuten`;

        // Toon het ID, de titel en het aantal minuten van de kortste aflevering
        const shortestEpisodeElement = document.getElementById('shortestEpisode');
        shortestEpisodeElement.textContent = `${shortestEpisode.id}: ${shortestEpisode.titel} is een ${shortestEpisode.categorie}-aflevering en duurt slechts ${shortestEpisode.tijd} minuten`;
    })
    .catch(error => {
        console.error('Error:', error);
        const longestEpisodeElement = document.getElementById('longestEpisode');
        longestEpisodeElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
        const shortestEpisodeElement = document.getElementById('shortestEpisode');
        shortestEpisodeElement.textContent = 'Er is een fout opgetreden bij het laden van de gegevens.';
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
// Roep de functies aan wanneer de pagina geladen is
window.onload = calculateEpisodeHours();
window.onload = getLongestAndShortestEpisodes();
window.onload = calculatePercentageNieuws();
window.onload = countInterview();
window.onload = calculateAverageMinutes();
window.onload = countJSONObjects();