function setDefaultYear() {
    const allYears = episodesData.map(ep => ep.datum.split("-")[0]); // Haal alle jaartallen op
    const uniqueYears = [...new Set(allYears)].map(Number); // Unieke jaren als nummers
    const latestYear = Math.max(...uniqueYears); // Hoogste jaar bepalen

    document.getElementById("yearSelect").value = latestYear; // Zet als geselecteerd
    updateWrapped(); // Update de pagina direct
}

document.addEventListener("DOMContentLoaded", setDefaultYear);

fetch("episodes.json")
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        populateYearSelect();
        updateWrapped();
    });

let episodesData = [];
let barChart;

function populateYearSelect() {
    const years = [...new Set(episodesData.map(ep => ep.datum.substring(0, 4)))].sort().reverse();
    const yearSelect = document.getElementById("yearSelect");
    yearSelect.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join("");
    yearSelect.addEventListener("change", updateWrapped);
    document.getElementById("categoryFilter").addEventListener("change", updateWrapped);
}

function updateWrapped() {
    const selectedYear = document.getElementById("yearSelect").value;
    const selectedCategory = document.getElementById("categoryFilter").value;
    document.getElementById("selectedYear").textContent = selectedYear;
    document.getElementById("episodeYear").textContent = selectedYear;

    let filteredEpisodes = episodesData.filter(ep => ep.datum.startsWith(selectedYear));

    if (selectedCategory !== "all") {
        filteredEpisodes = filteredEpisodes.filter(ep => ep.categorie === selectedCategory);
    }

    const totalEpisodes = filteredEpisodes.length;
    const totalMinutes = filteredEpisodes.reduce((sum, ep) => sum + parseInt(ep.tijd, 10), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    document.getElementById("stats").innerHTML = `
        <p>Aantal afleveringen: <strong>${totalEpisodes}</strong></p>
        <p>Totaal tijd: <strong>${totalMinutes} minuten</strong> (${totalHours} uur en ${remainingMinutes} min)</p>
    `;

    // 🔹 Sorteer afleveringen voor de tabel (1 januari → 31 december)
    const sortedEpisodes = [...filteredEpisodes].sort((a, b) => new Date(a.datum) - new Date(b.datum));

    let episodeTableHTML = sortedEpisodes.map(ep =>
        `<tr>
            <td>${ep.id}</td>
            <td>${ep.titel}</td>
            <td>${ep.categorie}</td>
            <td data-min="${ep.tijd}">${ep.tijd} min</td>
            <td data-date="${ep.datum}">${formatDate(ep.datum)}</td>
        </tr>`).join("");

    document.getElementById("episodeTable").innerHTML = episodeTableHTML;

    // 🔹 Sorteer afleveringen voor de staafdiagram (1 januari → 31 december)
    const sortedForChart = [...filteredEpisodes].sort((a, b) => new Date(a.datum) - new Date(b.datum));

    updateChart(sortedForChart);
}


function updateChart(filteredEpisodes) {
    if (barChart) barChart.destroy();

    const barCtx = document.getElementById('barChart').getContext('2d');
    const episodeLabels = filteredEpisodes.map(ep => ep.titel);
    const episodeDurations = filteredEpisodes.map(ep => parseInt(ep.tijd, 10));
    const episodeColors = filteredEpisodes.map(ep => categoryColors[ep.categorie]);

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: episodeLabels,
            datasets: [{
                label: 'Tijdsduur (minuten)',
                data: episodeDurations,
                backgroundColor: episodeColors
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 🔹 Sorteerbare tabel functie (id, tijd, datum)
function sortTable(n) {
    const table = document.querySelector(".table tbody");
    let rows = Array.from(table.rows);
    const isAscending = table.getAttribute("data-sort") === "asc";

    rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[n].textContent.trim();
        let cellB = rowB.cells[n].textContent.trim();

        if (n === 3) { // Sorteer op tijd (minuten)
            return isAscending ? rowA.cells[n].dataset.min - rowB.cells[n].dataset.min 
                               : rowB.cells[n].dataset.min - rowA.cells[n].dataset.min;
        } else if (n === 4) { // Sorteer op datum (dd-mm-yyyy)
            return isAscending ? new Date(rowA.cells[n].dataset.date) - new Date(rowB.cells[n].dataset.date)
                               : new Date(rowB.cells[n].dataset.date) - new Date(rowA.cells[n].dataset.date);
        }
        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));
    table.setAttribute("data-sort", isAscending ? "desc" : "asc");
}

// 🔹 Formatteer datum naar dd-mm-yyyy
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}

// 🔹 Kleuren per categorie
const categoryColors = {
    'nieuws': '#F6CA83',
    'achtergrond': '#7B9F93',
    'reportage': '#4685AE',
    'interview': '#C46868'
};
