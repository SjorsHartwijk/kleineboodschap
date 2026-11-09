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
                snelheidNotitie();
                duurPerJaar(afleveringen);
                verdeling(afleveringen);
                mijlpalen();
            })
            .catch(fout => console.error('Trends konden niet geladen worden:', fout));
    }

    // Bij een andere afspeelsnelheid dan 1,0x een korte toelichting tonen
    function snelheidNotitie() {
        const el = document.getElementById('trendsSnelheid');
        if (!el || !window.kbSnelheid || kbSnelheid.waarde() === kbSnelheid.STANDAARD) return;
        el.textContent = `Alle tijden zijn omgerekend naar jouw afspeelsnelheid van ${kbSnelheid.formatteer(kbSnelheid.waarde())}.`;
        el.hidden = false;
    }

    // 1. Gemiddelde duur per jaar
    function duurPerJaar(afleveringen) {
        const perJaar = {};
        afleveringen.forEach(ep => {
            const jaar = ep.datum.getFullYear();
            (perJaar[jaar] = perJaar[jaar] || []).push(ep.minuten);
        });
        const jaren = Object.keys(perJaar).sort();
        const gemiddelden = jaren.map(j => Math.round(perJaar[j].reduce((s, m) => s + m, 0) / perJaar[j].length));

        const eerste = jaren[0], laatste = jaren[jaren.length - 1];
        const tekst = document.getElementById('trendDuurTekst');
        if (tekst) {
            tekst.innerHTML = `Van gemiddeld <strong>${gemiddelden[0]} minuten</strong> in ${eerste} naar <strong>${gemiddelden[gemiddelden.length - 1]} minuten</strong> in ${laatste}.`;
        }

        new Chart(document.getElementById('trendDuurChart'), {
            type: 'line',
            data: {
                labels: jaren,
                datasets: [{
                    label: 'Gemiddelde duur',
                    data: gemiddelden,
                    borderColor: () => kbKleur('primary'),
                    backgroundColor: () => kbKleur('primary'),
                    pointBackgroundColor: () => kbKleur('primary'),
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: .3,
                }],
            },
            options: {
                responsive: true,
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
        const tekst = document.getElementById('trendVerdelingTekst');
        if (tekst) {
            tekst.innerHTML = `De meeste afleveringen duren <strong>${labels[meest]} minuten</strong>. `
                + `<strong>${Math.round(binnen2uur / afleveringen.length * 100)}%</strong> duurt tussen 1 en 2 uur.`;
        }

        new Chart(document.getElementById('trendVerdelingChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Afleveringen',
                    data: aantallen,
                    backgroundColor: () => kbKleur('primary'),
                    borderRadius: 3,
                    categoryPercentage: 1,
                    barPercentage: .9,
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
            const behaald = M.alle(r).slice(0, 3);
            const straks = r.verwacht.slice(0, 2);
            lijst.innerHTML = behaald.map(m => `
                <li class="kb-mijlpaal">
                    <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
                    <div><strong>${m.titel}</strong> op ${M.datum(m.datum)}
                    ${m.ep ? `<div class="small kb-muted">${m.soort === 'aflevering' ? '' : `met aflevering ${m.ep.id}: `}${m.ep.titel}</div>` : m.detail ? `<div class="small kb-muted">${m.detail}</div>` : ''}</div>
                </li>`).join('') + straks.map(v => `
                <li class="kb-mijlpaal kb-mijlpaal-straks">
                    <i class="bi bi-hourglass-split" aria-hidden="true"></i>
                    <div><strong>${v.label}</strong> ${v.exact ? 'op' : 'verwacht rond'} ${M.datum(v.datum)}</div>
                </li>`).join('');
            const uitleg = document.getElementById('trendMijlpalenTekst');
            if (uitleg) {
                uitleg.textContent = `Voorspellingen op basis van het tempo van het afgelopen jaar: ${r.tempo.aantal} afleveringen, samen ${M.getal(Math.round(r.tempo.minutenPerDag * 365 / 60))} uur.`;
            }
        }).catch(fout => console.error('Mijlpalen konden niet geladen worden:', fout));
    }

    // Chart.js staat onderaan de pagina; wachten tot alles geladen is
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
