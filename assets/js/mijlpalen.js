// Berekening van mijlpalen, gedeeld door de homepage (trends.js) en mijlpalen.html.
// Alles wordt bij elke paginaweergave opnieuw berekend uit episodes.json, dus nieuwe
// afleveringen leveren automatisch nieuwe mijlpalen en bijgewerkte voorspellingen op.
// Tijden zijn al omgerekend naar de gekozen afspeelsnelheid (zie instellingen.js).
//
//   kbMijlpalen.laad()          -> Promise met afleveringen, gesorteerd op datum
//   kbMijlpalen.bereken(afl)    -> { luistertijd, afleveringen, categorieen, jubilea, verwacht, tempo, ... }
//   kbMijlpalen.datum(d)        -> '22 april 2019'

(function () {
    const DAG = 864e5;
    const CATEGORIEEN = ['nieuws', 'achtergrond', 'reportage', 'interview'];
    const NAMEN = { nieuws: 'nieuws', achtergrond: 'achtergrond', reportage: 'reportage', interview: 'interview' };

    const datum = d => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    const getal = n => n.toLocaleString('nl-NL');
    const rangtelwoord = n => n + (n === 1 || n === 8 || n >= 20 ? 'ste' : 'de');

    function laad() {
        return fetch('episodes.json')
            .then(res => res.json())
            .then(data => data
                .map(ep => ({
                    id: parseInt(ep.id, 10),
                    titel: ep.titel,
                    categorie: ep.categorie,
                    minuten: parseFloat(ep.tijd),
                    datum: new Date(ep.datum),
                }))
                .filter(ep => isFinite(ep.minuten) && !isNaN(ep.datum))
                .sort((a, b) => a.datum - b.datum || a.id - b.id));
    }

    function bereken(afl) {
        const eerste = afl[0];
        const laatste = afl[afl.length - 1];

        // Tempo van het afgelopen jaar, voor de voorspellingen
        const jaarTerug = new Date(laatste.datum.getTime() - 365 * DAG);
        const recent = afl.filter(ep => ep.datum > jaarTerug);
        const tempo = {
            aantal: recent.length,
            minutenPerDag: recent.reduce((s, ep) => s + ep.minuten, 0) / 365,
            dagenPerAflevering: 365 / Math.max(1, recent.length),
            perCategorie: Object.fromEntries(CATEGORIEEN.map(c => [c, recent.filter(ep => ep.categorie === c).length])),
        };
        const naDagen = dagen => new Date(laatste.datum.getTime() + dagen * DAG);

        // Luistertijd: elke 100 uur (plus de eerste 50)
        const luistertijd = [];
        const STAP_UUR = 100;
        let totaal = 0;
        let doel = 50;
        afl.forEach(ep => {
            totaal += ep.minuten;
            while (totaal >= doel * 60) {
                luistertijd.push({ uur: doel, datum: ep.datum, ep });
                doel = doel < STAP_UUR ? STAP_UUR : doel + STAP_UUR;
            }
        });
        const voorspelUur = uur => tempo.minutenPerDag > 0 ? naDagen((uur * 60 - totaal) / tempo.minutenPerDag) : null;

        // Afleveringen: de eerste en elke 50e
        const afleveringen = afl
            .filter(ep => ep.id === 1 || ep.id % 50 === 0)
            .sort((a, b) => a.id - b.id)
            .map(ep => ({ nummer: ep.id, datum: ep.datum, ep }));
        const hoogsteId = Math.max(...afl.map(ep => ep.id));
        const volgendeId = Math.floor(hoogsteId / 50) * 50 + 50;

        // Per categorie: de eerste en elke 50e van die categorie
        const categorieen = {};
        const tellers = {};
        CATEGORIEEN.forEach(c => { categorieen[c] = []; tellers[c] = 0; });
        afl.forEach(ep => {
            if (!(ep.categorie in tellers)) return;
            const n = ++tellers[ep.categorie];
            if (n === 1 || n % 50 === 0) categorieen[ep.categorie].push({ nummer: n, datum: ep.datum, ep });
        });

        // Jubilea: elk jaar sinds de eerste aflevering
        const jubilea = [];
        for (let jaar = 1; ; jaar++) {
            const d = new Date(eerste.datum);
            d.setFullYear(d.getFullYear() + jaar);
            if (d > new Date()) break;
            jubilea.push({ jaren: jaar, datum: d, aantal: afl.filter(ep => ep.datum <= d).length });
        }
        const volgendJubileum = new Date(eerste.datum);
        volgendJubileum.setFullYear(volgendJubileum.getFullYear() + jubilea.length + 1);

        // Voorspellingen voor de eerstvolgende mijlpaal van elk soort
        const verwacht = [];
        const volgendUur = doel;
        const uurDatum = voorspelUur(volgendUur);
        if (uurDatum) verwacht.push({ soort: 'luistertijd', label: `${getal(volgendUur)} uur luistertijd`, datum: uurDatum });
        verwacht.push({
            soort: 'aflevering',
            label: `Aflevering ${volgendeId}`,
            datum: naDagen((volgendeId - hoogsteId) * tempo.dagenPerAflevering),
        });
        CATEGORIEEN.forEach(c => {
            const per = tempo.perCategorie[c];
            if (!per) return;
            const volgende = Math.floor(tellers[c] / 50) * 50 + 50;
            verwacht.push({
                soort: 'categorie', categorie: c,
                label: `${rangtelwoord(volgende)} ${NAMEN[c]}-aflevering`,
                datum: naDagen((volgende - tellers[c]) * 365 / per),
            });
        });
        verwacht.push({ soort: 'jubileum', label: `${jubilea.length + 1} jaar Kleine Boodschap`, datum: volgendJubileum, exact: true });
        verwacht.sort((a, b) => a.datum - b.datum);

        return {
            eerste, laatste, totaalMinuten: totaal, tempo, CATEGORIEEN, tellers,
            luistertijd, afleveringen, categorieen, jubilea, verwacht, voorspelUur,
        };
    }

    // Alle behaalde mijlpalen in één lijst, nieuwste eerst
    function alle(r) {
        const lijst = [];
        r.luistertijd.forEach(m => lijst.push({ soort: 'luistertijd', datum: m.datum, titel: `${getal(m.uur)} uur luistertijd`, ep: m.ep }));
        r.afleveringen.forEach(m => lijst.push({ soort: 'aflevering', datum: m.datum, titel: m.nummer === 1 ? 'De allereerste aflevering' : `Aflevering ${m.nummer}`, ep: m.ep }));
        CATEGORIEEN.forEach(c => r.categorieen[c].forEach(m => lijst.push({
            soort: 'categorie', categorie: c, datum: m.datum, ep: m.ep,
            titel: m.nummer === 1 ? `Eerste ${NAMEN[c]}-aflevering` : `${rangtelwoord(m.nummer)} ${NAMEN[c]}-aflevering`,
        })));
        r.jubilea.forEach(m => lijst.push({ soort: 'jubileum', datum: m.datum, titel: `${m.jaren} jaar Kleine Boodschap`, detail: `${getal(m.aantal)} afleveringen tot dan toe` }));
        return lijst.sort((a, b) => b.datum - a.datum);
    }

    const ICONEN = { luistertijd: 'bi-headphones', aflevering: 'bi-collection-play', categorie: 'bi-tag', jubileum: 'bi-cake2' };

    window.kbMijlpalen = { laad, bereken, alle, datum, getal, rangtelwoord, ICONEN };
})();
