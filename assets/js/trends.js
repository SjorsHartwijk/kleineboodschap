// Trends op de homepage: duur door de jaren heen, verdeling van de duur en mijlpalen.
// De mijlpalen zelf worden berekend in mijlpalen.js (gedeeld met mijlpalen.html).
// Alle tijden komen uit episodes.json en zijn al omgerekend naar de gekozen afspeelsnelheid
// (zie instellingen.js). Kleuren komen uit de CSS, zodat licht/donker vanzelf meegaat.

(function () {

    function start() {
        fetch('episodes.json')
            .then(res => res.json())
            .then(data => {
                const afleveringen = data
                    .map(ep => ({ id: parseInt(ep.id, 10), titel: ep.titel, minuten: parseFloat(ep.tijd), datum: new Date(ep.datum) }))
                    .filter(ep => isFinite(ep.minuten) && !isNaN(ep.datum))
                    .sort((a, b) => a.datum - b.datum);
                if (!afleveringen.length) return;
                duurPerJaar(afleveringen);
                verdeling(afleveringen);
                mijlpalen();
            })
            .catch(fout => console.error('Trends konden niet geladen worden:', fout));
    }

    // 1. Gemiddelde duur per jaar
    function duurPerJaar(afleveringen) {
        const perJaar = {};
        afleveringen.forEach(ep => {
            const jaar = ep.datum.getFullYear();
            (perJaar[jaar] = perJaar[jaar] || []).push(ep.minuten);
        });
        // Jaren met maar een paar afleveringen (zoals 2017, met één) zeggen weinig: die vallen weg
        const jaren = Object.keys(perJaar).sort().filter(j => perJaar[j].length >= 5);
        const gemiddelden = jaren.map(j => Math.round(perJaar[j].reduce((s, m) => s + m, 0) / perJaar[j].length));

        // De kop vertelt de conclusie
        const eerste = jaren[0], laatste = jaren[jaren.length - 1];
        const van = gemiddelden[0], naar = gemiddelden[gemiddelden.length - 1];
        const kop = document.getElementById('trendDuurKop');
        if (kop) {
            kop.textContent = naar > van * 1.1 ? 'Afleveringen worden langer'
                : naar < van * 0.9 ? 'Afleveringen worden korter'
                : 'Afleveringen blijven even lang';
        }
        const tekst = document.getElementById('trendDuurTekst');
        if (tekst) {
            tekst.innerHTML = `Gemiddelde duur per jaar, van <strong>${van} minuten</strong> in ${eerste} naar <strong>${naar} minuten</strong> in ${laatste}.`;
        }

        kbGrafiek(document.getElementById('trendDuurChart'), {
            type: 'line',
            data: {
                labels: jaren,
                datasets: [{
                    label: 'Gemiddelde duur',
                    data: gemiddelden,
                    borderColor: () => kbKleur('primary'),
                    backgroundColor: () => kbKleur('primary'),
                    pointBackgroundColor: () => kbKleur('primary'),
                    pointBorderColor: () => kbKleur('surface'),
                    pointBorderWidth: 2,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: .25,
                }],
            },
            options: {
                responsive: true,
                // Tooltip zodra je ergens boven een jaar komt (of tikt), niet alleen precies op het bolletje
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => `${c.raw} minuten gemiddeld (${perJaar[c.label].length} afleveringen)` } },
                },
                scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' min' } } },
            },
        });
    }

    // 2. Verdeling van de duur in blokken van 15 minuten
    function verdeling(afleveringen) {
        const BLOK = 15;
        const max = Math.max(...afleveringen.map(ep => ep.minuten));
        const aantalBlokken = Math.floor(max / BLOK) + 1;
        const aantallen = Array(aantalBlokken).fill(0);
        afleveringen.forEach(ep => aantallen[Math.floor(ep.minuten / BLOK)]++);
        const labels = aantallen.map((_, i) => `${i * BLOK}–${(i + 1) * BLOK}`);

        const meest = aantallen.indexOf(Math.max(...aantallen));
        const binnen2uur = afleveringen.filter(ep => ep.minuten >= 60 && ep.minuten < 120).length;
        const aandeel = Math.round(binnen2uur / afleveringen.length * 100);
        const kop = document.getElementById('trendVerdelingKop');
        if (kop) kop.textContent = aandeel >= 50 ? 'De meeste duren 1 tot 2 uur' : `Het vaakst ${labels[meest]} minuten`;
        const tekst = document.getElementById('trendVerdelingTekst');
        if (tekst) {
            tekst.innerHTML = `Aantal afleveringen per kwartier aan duur. <strong>${aandeel}%</strong> duurt tussen 1 en 2 uur, `
                + `het drukste kwartier is <strong>${labels[meest]} minuten</strong>.`;
        }

        kbGrafiek(document.getElementById('trendVerdelingChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Afleveringen',
                    data: aantallen,
                    // Het drukste kwartier in inktkleur, de rest in de hoofdkleur
                    backgroundColor: c => kbKleur(c.dataIndex === meest ? 'text' : 'primary'),
                    borderRadius: 0,
                    categoryPercentage: 1,
                    barPercentage: .88,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { title: c => c[0].label + ' minuten', label: c => `${c.raw} afleveringen` } },
                },
                scales: {
                    x: { title: { display: true, text: 'minuten' }, ticks: { maxRotation: 0, autoSkip: true } },
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                },
            },
        });
    }

    // 3. Mijlpalen: de laatst behaalde en de eerstvolgende (berekening in mijlpalen.js)
    function mijlpalen() {
        const lijst = document.getElementById('trendMijlpalen');
        if (!lijst || !window.kbMijlpalen) return;
        const M = window.kbMijlpalen;
        M.laad().then(afl => {
            if (!afl.length) return;
            const r = M.bereken(afl);
            // Een tijdlijn met zes haltes: de twee laatst behaalde, dan de vier eerstvolgende.
            // De volgende gastenmijlpaal staat er altijd bij; valt die niet bij de eerste vier
            // voorspellingen, dan neemt hij de plek van de vierde in.
            let straks = r.verwacht.slice(0, 4);
            const gast = r.verwacht.find(v => v.soort === 'gast');
            if (gast && !straks.includes(gast)) straks = [...straks.slice(0, 3), gast];
            const behaald = M.alle(r).slice(0, 2).reverse();
            const uitlegVan = m => m.ep
                ? (m.soort === 'aflevering' ? m.ep.titel : `Met aflevering ${m.ep.id}: ${m.ep.titel}`)
                : (m.detail || '');
            lijst.innerHTML = behaald.map(m => `
                <li class="kb-halte">
                    <div class="kb-halte-lijn" aria-hidden="true"></div>
                    <div class="kb-halte-datum">${M.datum(m.datum)}</div>
                    <div class="kb-halte-titel">${m.titel}</div>
                    <div class="kb-halte-uitleg">${uitlegVan(m)}</div>
                </li>`).join('') + straks.map(v => `
                <li class="kb-halte is-verwacht">
                    <div class="kb-halte-lijn" aria-hidden="true"></div>
                    <div class="kb-halte-datum">${v.exact ? '' : 'rond '}${M.datum(v.datum)}</div>
                    <div class="kb-halte-titel">${v.label}</div>
                    <div class="kb-halte-uitleg">${v.exact ? 'Staat vast' : 'Verwacht bij het huidige tempo'}</div>
                </li>`).join('');
            const uitleg = document.getElementById('trendMijlpalenTekst');
            if (uitleg) {
                uitleg.textContent = `Een doorgetrokken lijn is behaald, een gestippelde lijn is verwacht. Voorspellingen op basis van het tempo van het afgelopen jaar: ${r.tempo.aantal} afleveringen, samen ${M.getal(Math.round(r.tempo.minutenPerDag * 365 / 60))} uur.`;
            }
        }).catch(fout => console.error('Mijlpalen konden niet geladen worden:', fout));
    }

    // Chart.js staat onderaan de pagina; wachten tot alles geladen is
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
