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

        const totalEpisodes = data.length;
        const newsPercentage = (totalNewsEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const newsStatisticsElement = document.getElementById('newsStatistics');
        newsStatisticsElement.innerHTML = `
            <h2 class="h5 card-title">Nieuws</h2>
            <p class="card-text">Aantal afleveringen: <strong>${totalNewsEpisodes}</strong><br/>
            <strong>${newsPercentage.toFixed(1)}%</strong> van alle afleveringen is een nieuws aflevering.</p>
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

        const totalEpisodes = data.length;
        const achtergrondPercentage = (totalAchtergrondEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const achtergrondStatisticsElement = document.getElementById('achtergrondStatistics');
        achtergrondStatisticsElement.innerHTML = `
            <h2 class="h5 card-title">Achtergrond</h2>
            <p class="card-text">Aantal afleveringen: <strong>${totalAchtergrondEpisodes}</strong><br/>
            <strong>${achtergrondPercentage.toFixed(1)}%</strong> van alle afleveringen is een achtergrond aflevering.</p>
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

        const totalEpisodes = data.length;
        const reportagePercentage = (totalReportageEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const reportageStatisticsElement = document.getElementById('reportageStatistics');
        reportageStatisticsElement.innerHTML = `
            <h2 class="h5 card-title">Reportage</h2>
            <p class="card-text">Aantal afleveringen: <strong>${totalReportageEpisodes}</strong><br/>
            <strong>${reportagePercentage.toFixed(1)}%</strong> van alle afleveringen is een reportage.</p>
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

        const totalEpisodes = data.length;
        const interviewPercentage = (totalInterviewEpisodes / totalEpisodes) * 100;

        // Weergeef de statistieken
        const interviewStatisticsElement = document.getElementById('interviewStatistics');
        interviewStatisticsElement.innerHTML = `
            <h2 class="h5 card-title">Interviews</h2>
            <p class="card-text">Aantal afleveringen: <strong>${totalInterviewEpisodes}</strong><br/>
            <strong>${interviewPercentage.toFixed(1)}%</strong> van alle afleveringen is een interview.</p>
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
