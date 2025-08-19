function calculateNewsStatistics() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        const newsEpisodes = data.filter(episode => episode.categorie === 'nieuws');
        const totalNewsEpisodes = newsEpisodes.length;
        let totalNewsMinutes = 0;

        // Loop door de nieuwsafleveringen en tel de tijd in minuten op
        newsEpisodes.forEach(episode => {
            totalNewsMinutes += parseInt(episode.tijd);
        });
        // Bereken het totale aantal uren
        const totalNewsHours = totalNewsMinutes / 60;

        const totalEpisodes = data.length;
        const newsPercentage = (totalNewsEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const newsStatisticsElement = document.getElementById('newsStatistics');
        newsStatisticsElement.innerHTML = `
            <h3 class="h5 card-title">Nieuws</h3>
            <p class="card-text">Aantal afleveringen: <strong>${totalNewsEpisodes}</strong></p>
            <p class="card-text">De nieuws afleveringen duren opgeteld bij elkaar <strong>${totalNewsHours.toFixed(0)} uur</strong>.</p>
            <p class="card-text"><strong>${newsPercentage.toFixed(1)}%</strong> van alle afleveringen is een nieuws aflevering.</p>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}
function calculateAchtergrondStatistics() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        const achtergrondEpisodes = data.filter(episode => episode.categorie === 'achtergrond');
        const totalAchtergrondEpisodes = achtergrondEpisodes.length;
        let totalAchtergrondMinutes = 0;

        // Loop door de achtergond afleveringen en tel de tijd in minuten op
        achtergrondEpisodes.forEach(episode => {
            totalAchtergrondMinutes += parseInt(episode.tijd);
        });
        // Bereken het totale aantal uren
        const totalAchtergrondHours = totalAchtergrondMinutes / 60;

        const totalEpisodes = data.length;
        const achtergrondPercentage = (totalAchtergrondEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const achtergrondStatisticsElement = document.getElementById('achtergrondStatistics');
        achtergrondStatisticsElement.innerHTML = `
        <h3 class="h5 card-title">Achtergronden</h3>
        <p class="card-text">Aantal afleveringen: <strong>${totalAchtergrondEpisodes}</strong></p>
        <p class="card-text">De achtergrond afleveringen duren opgeteld bij elkaar <strong>${totalAchtergrondHours.toFixed(0)} uur</strong>.</p>
        <p class="card-text"><strong>${achtergrondPercentage.toFixed(1)}%</strong> van alle afleveringen is een achtergrond aflevering.</p>
    `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}

function calculateReportageStatistics() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        const reportageEpisodes = data.filter(episode => episode.categorie === 'reportage');
        const totalReportageEpisodes = reportageEpisodes.length;
        let totalReportageMinutes = 0;

        // Loop door de achtergond afleveringen en tel de tijd in minuten op
        reportageEpisodes.forEach(episode => {
            totalReportageMinutes += parseInt(episode.tijd);
        });
        // Bereken het totale aantal uren
        const totalReportageHours = totalReportageMinutes / 60;

        const totalEpisodes = data.length;
        const reportagePercentage = (totalReportageEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const reportageStatisticsElement = document.getElementById('reportageStatistics');
        reportageStatisticsElement.innerHTML = `
        <h3 class="h5 card-title">Reportages</h3>
        <p class="card-text">Aantal afleveringen: <strong>${totalReportageEpisodes}</strong></p>
        <p class="card-text">De reportages duren opgeteld bij elkaar <strong>${totalReportageHours.toFixed(0)} uur</strong>.</p>
        <p class="card-text"><strong>${reportagePercentage.toFixed(1)}%</strong> van alle afleveringen reportages.</p>
    `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}
function calculateInterviewStatistics() {
    fetch('episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return response.json();
    })
    .then(data => {
        const interviewEpisodes = data.filter(episode => episode.categorie === 'interview');
        const totalInterviewEpisodes = interviewEpisodes.length;
        let totalInterviewMinutes = 0;

        // Loop door de achtergond afleveringen en tel de tijd in minuten op
        interviewEpisodes.forEach(episode => {
            totalInterviewMinutes += parseInt(episode.tijd);
        });
        // Bereken het totale aantal uren
        const totalInterviewHours = totalInterviewMinutes / 60;

        const totalEpisodes = data.length;
        const interviewPercentage = (totalInterviewEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const interviewStatisticsElement = document.getElementById('interviewStatistics');
        interviewStatisticsElement.innerHTML = `
        <h3 class="h5 card-title">Interviews</h3>
        <p class="card-text">Aantal afleveringen: <strong>${totalInterviewEpisodes}</strong></p>
        <p class="card-text">De interviews duren opgeteld bij elkaar <strong>${totalInterviewHours.toFixed(0)} uur</strong>.</p>
        <p class="card-text"><strong>${interviewPercentage.toFixed(1)}%</strong> van alle afleveringen zijn interviews.</p>
    `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het laden van de gegevens.');
    });
}

// Roep de functie aan om de statistieken voor nieuws te berekenen en weer te geven
calculateInterviewStatistics();
calculateReportageStatistics();
calculateNewsStatistics();
calculateAchtergrondStatistics();
