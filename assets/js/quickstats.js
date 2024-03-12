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
// Roep de functies aan wanneer de pagina geladen is
window.onload = countInterview();
window.onload = calculateAverageMinutes();
window.onload = countJSONObjects();