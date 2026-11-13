// Grafiek van alle afleveringen (duur per aflevering, gekleurd per categorie).
// Benaming naar de as met de afleveringen:
// - #barChart:  grafiek horizontaal, afleveringen op de x-as (homepage op tablet/desktop en grafiek.html)
// - #barChartV: grafiek verticaal, tijd op de x-as en de afleveringen onder elkaar (homepage; op mobiel de enige)
//
// Elke categorie is een eigen Chart.js-dataset (met de categoriekleur).
// De legenda (#grafiekLegenda) filtert: een klik op een categorie haalt die afleveringen uit alle
// grafieken tegelijk. Daarbij worden de grafieken opnieuw gevuld met alleen de zichtbare afleveringen,
// zodat de overgebleven staven aansluiten zonder gaten. Ook de blokjes in het mozaïek verdwijnen
// (via een class op .kb-filtergebied).

(function () {
    const CATEGORIEEN = ['achtergrond', 'nieuws', 'interview', 'reportage'];
    const naam = c => c.charAt(0).toUpperCase() + c.slice(1);
    const verborgen = new Set();
    const grafieken = [];
    let afleveringen = [];
    // De afleveringen die na het filter overblijven; alleen deze staan op de as,
    // zodat de overgebleven staven aansluiten en er geen gaten ontstaan
    let zichtbaar = [];
    const herbereken = () => { zichtbaar = afleveringen.filter(ep => !verborgen.has(ep.categorie)); };

    // Eén dataset per categorie; afleveringen van een andere categorie zijn leeg (null),
    // en met grouped: false staat elke staaf midden op zijn eigen plek
    const reeks = c => zichtbaar.map(ep => ep.categorie === c ? parseFloat(ep.tijd) : null);
    function datasets() {
        return CATEGORIEEN.map(c => ({
            label: naam(c),
            categorie: c,
            data: reeks(c),
            backgroundColor: () => kbCategorieKleur(c),
            grouped: false,
            skipNull: true,
        }));
    }
    const tooltip = {
        callbacks: {
            title: items => { const ep = zichtbaar[items[0].dataIndex]; return `${ep.id}: ${ep.titel}`; },
            label: item => `${item.raw} minuten · ${zichtbaar[item.dataIndex].categorie}`,
        },
    };

    // Een grafiek opnieuw vullen met de zichtbare afleveringen (labels en alle datasets)
    function vul(grafiek) {
        grafiek.data.labels = zichtbaar.map(grafiek.$label);
        grafiek.data.datasets.forEach((ds, i) => { ds.data = reeks(CATEGORIEEN[i]); });
    }

    function maakHorizontaal() {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;
        const label = ep => `${ep.id}: ${ep.titel}`;
        const vastVlak = canvas.parentElement.classList.contains('kb-grafiekvlak');
        // Pas maken als de grafiek in beeld komt (zie kbGrafiek in theme.js); data van dat moment
        kbGrafiek(canvas, () => ({
            type: 'bar',
            data: { labels: zichtbaar.map(label), datasets: datasets() },
            options: {
                responsive: true,
                // Op grafiek.html bepaalt het vlak de hoogte (vult het scherm); daarmee hangt de hoogte
                // niet af van de breedte en kan de scrollbalk niet blijven verschijnen en verdwijnen
                maintainAspectRatio: !vastVlak,
                plugins: { legend: { display: false }, tooltip },
                scales: {
                    x: { title: { display: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 30 } },
                },
            },
        })).then(grafiek => {
            grafiek.$label = label;
            grafieken.push(grafiek);
        });
    }

    // Verticaal: één rij per aflevering, in een blok dat zelf scrolt
    let verticaal = null, verticaalGestart = false;
    function maakVerticaal() {
        const canvas = document.getElementById('barChartV');
        if (!canvas || verticaalGestart || !afleveringen.length) return;
        verticaalGestart = true;
        zetHoogte(canvas);
        const label = ep => String(ep.id);
        kbGrafiek(canvas, () => (zetHoogte(canvas), {
            type: 'bar',
            data: { labels: zichtbaar.map(label), datasets: datasets() },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip },
                scales: {
                    x: { position: 'top', beginAtZero: true, ticks: { stepSize: 30, maxRotation: 0, autoSkip: true, callback: v => v + ' min' } },
                    y: { ticks: { autoSkip: true, autoSkipPadding: 6, font: { size: 10 } } },
                },
                datasets: { bar: { categoryPercentage: 1, barPercentage: .8 } },
            },
        })).then(grafiek => {
            verticaal = grafiek;
            verticaal.$label = label;
            grafieken.push(verticaal);
        });
    }
    // De verticale grafiek is zo hoog als het aantal rijen dat zichtbaar is
    function zetHoogte(canvas) {
        const hoogte = Math.max(zichtbaar.length, 1) * 14 + 60;
        canvas.parentElement.style.height = `${hoogte}px`;
        return hoogte;
    }

    // Legenda als filter: knoppen per categorie met het aantal afleveringen
    function bouwLegenda() {
        const plek = document.getElementById('grafiekLegenda');
        if (!plek) return;
        plek.innerHTML = CATEGORIEEN.map(c => {
            const aantal = afleveringen.filter(ep => ep.categorie === c).length;
            return `<button type="button" class="kb-filterknop" data-categorie="${c}" aria-pressed="${!verborgen.has(c)}">
                <span class="kb-legendablokje ${c}" aria-hidden="true"></span>${naam(c)} <span class="kb-muted">${aantal}</span></button>`;
        }).join('');
        plek.addEventListener('click', e => {
            const knop = e.target.closest('[data-categorie]');
            if (knop) wissel(knop.dataset.categorie, knop);
        });
    }

    function wissel(c, knop) {
        const aan = verborgen.has(c);
        if (aan) verborgen.delete(c); else verborgen.add(c);
        knop.setAttribute('aria-pressed', aan);
        // Alle grafieken opnieuw vullen met alleen de zichtbare afleveringen: de staven sluiten aan
        herbereken();
        grafieken.forEach(g => {
            vul(g);
            if (g === verticaal) {
                // Nieuwe hoogte direct meegeven, zodat de rijen even dik blijven en de grafiek korter wordt
                // (een lopende animatie eerst stoppen, anders stelt Chart.js het formaat uit)
                const hoogte = zetHoogte(g.canvas);
                g.stop();
                g.resize(g.canvas.parentElement.clientWidth, hoogte);
            }
            g.update();
        });
        // Mozaïek en andere weergaven: class op het filtergebied
        document.querySelectorAll('.kb-filtergebied').forEach(el => el.classList.toggle('verberg-' + c, !aan));
    }

    fetch('episodes.json')
        .then(res => { if (!res.ok) throw new Error('Failed to load JSON data'); return res.json(); })
        .then(data => {
            afleveringen = data.slice().sort((a, b) => a.id - b.id);
            herbereken();
            bouwLegenda();
            maakHorizontaal();
            // De verticale grafiek pas tekenen als zijn tab zichtbaar is (anders heeft hij geen breedte)
            if (document.getElementById('grafiekV')?.classList.contains('active')) maakVerticaal();
        })
        .catch(error => console.error('Error:', error));

    // Tabs op de homepage: op mobiel bestaat de horizontale tab niet, dus dan is verticaal de standaard
    const tabV = document.getElementById('grafiekV-tab');
    if (!tabV) return;
    tabV.addEventListener('shown.bs.tab', maakVerticaal);
    const mobiel = window.matchMedia('(max-width: 767.98px)');
    function kiesTab() {
        const tabH = document.getElementById('grafiek-tab');
        if (mobiel.matches && tabH.classList.contains('active')) bootstrap.Tab.getOrCreateInstance(tabV).show();
    }
    document.addEventListener('DOMContentLoaded', kiesTab);
    mobiel.addEventListener('change', kiesTab);
})();
