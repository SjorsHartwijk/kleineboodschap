function setDefaultYear() {
    const currentYear = new Date().getFullYear();
    const defaultYear = currentYear - 1;
    const yearSelect = document.getElementById("yearSelect");
    if (yearSelect) {
        yearSelect.value = defaultYear;
        updateWrapped();
    }
}

document.addEventListener("DOMContentLoaded", setDefaultYear);

fetch("episodes.json")
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        // Buiten de Wrapped-periode wordt de inhoud van de pagina vervangen door een melding
        if (!document.getElementById("yearSelect")) return;
        populateYearSelect();
        updateWrapped();
    });

let episodesData = [];
let barChart;

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const years = [...new Set(episodesData.map(ep => ep.datum.substring(0, 4)))].filter(year => parseInt(year) < currentYear).sort().reverse();
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
    // Jaartal in de paginatitel volgt het gekozen jaar (geen vast jaartal in de HTML)
    if (selectedYear) document.title = `Kleine Boodschap Wrapped ${selectedYear} - Kleine Boodschap Data`;

    let filteredEpisodes = episodesData.filter(ep => ep.datum.startsWith(selectedYear));

    if (selectedCategory !== "all") {
        filteredEpisodes = filteredEpisodes.filter(ep => ep.categorie === selectedCategory);
    }

    document.getElementById("stats").innerHTML = statistiekKaarten(filteredEpisodes, selectedCategory);

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


// 🔹 Statistieken als kaartjes: aantal, luistertijd, gemiddelde, langste en (bij alle categorieën) favoriete categorie
function statistiekKaarten(afleveringen, categorie) {
    if (!afleveringen.length) {
        return `<div class="col-12"><div class="card"><div class="card-body">Geen afleveringen gevonden voor deze keuze.</div></div></div>`;
    }
    const minuten = afleveringen.map(ep => parseInt(ep.tijd, 10));
    const totaal = minuten.reduce((s, m) => s + m, 0);
    const langste = afleveringen.reduce((a, b) => parseInt(b.tijd, 10) > parseInt(a.tijd, 10) ? b : a);
    const kaart = (titel, waarde, uitleg) => `
        <div class="col">
            <div class="card h-100">
                <div class="card-body">
                    <div class="small kb-muted">${titel}</div>
                    <div class="kb-wrapped-waarde">${waarde}</div>
                    ${uitleg ? `<div class="small kb-muted">${uitleg}</div>` : ''}
                </div>
            </div>
        </div>`;

    const kaarten = [
        kaart('Afleveringen', afleveringen.length),
        kaart('Luistertijd', `${Math.floor(totaal / 60)} uur`, `${totaal % 60} minuten erbij, ${totaal.toLocaleString('nl-NL')} minuten in totaal`),
        kaart('Gemiddelde duur', `${Math.round(totaal / afleveringen.length)} min`),
        kaart('Langste aflevering', `${langste.tijd} min`, `${langste.id}: ${langste.titel}`),
    ];
    if (categorie === 'all') {
        const telling = {};
        afleveringen.forEach(ep => { telling[ep.categorie] = (telling[ep.categorie] || 0) + 1; });
        const [favoriet, aantal] = Object.entries(telling).sort((a, b) => b[1] - a[1])[0];
        kaarten.push(kaart('Meeste afleveringen', `<span class="badge ${favoriet} kb-wrapped-blokje">&nbsp;</span> ${favoriet[0].toUpperCase() + favoriet.slice(1)}`, `${aantal} van de ${afleveringen.length} afleveringen`));
    }
    return kaarten.join('');
}

function updateChart(filteredEpisodes) {
    if (barChart) barChart.destroy();

    const barCtx = document.getElementById('barChart').getContext('2d');
    const episodeDurations = filteredEpisodes.map(ep => parseInt(ep.tijd, 10));
    // Functie i.p.v. vaste kleuren, zodat de grafiek meekleurt met licht/donker
    const episodeColors = c => kbCategorieKleur(filteredEpisodes[c.dataIndex]?.categorie);

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            // Afleveringsnummers op de as (titels passen er niet leesbaar onder), titel in de tooltip
            labels: filteredEpisodes.map(ep => ep.id),
            datasets: [{
                label: 'Tijdsduur (minuten)',
                data: episodeDurations,
                backgroundColor: episodeColors,
                borderRadius: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                // De kleuren zijn per categorie; de legenda staat als HTML boven de grafiek
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: c => {
                            const ep = filteredEpisodes[c[0].dataIndex];
                            return `${ep.id}: ${ep.titel}`;
                        },
                        label: c => `${c.raw} minuten · ${filteredEpisodes[c.dataIndex].categorie}`
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'aflevering' }, ticks: { autoSkip: true, maxRotation: 0 } },
                y: { beginAtZero: true, title: { display: true, text: 'minuten' } }
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
