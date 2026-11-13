// Berekening van mijlpalen, gedeeld door de homepage (trends.js) en mijlpalen.html.
// Alles wordt bij elke paginaweergave opnieuw berekend uit episodes.json, dus nieuwe
// afleveringen leveren automatisch nieuwe mijlpalen en bijgewerkte voorspellingen op.
// Tijden zijn al omgerekend naar de gekozen afspeelsnelheid (zie instellingen.js).
//
//   kbMijlpalen.laad()          -> Promise met afleveringen, gesorteerd op datum
//   kbMijlpalen.bereken(afl)    -> { luistertijd, afleveringen, categorieen, gasten, jubilea, verwacht, tempo, ... }
//   kbMijlpalen.records(afl)    -> { langste, kortste, perCategorie, stilte, vaakstTeGast, ... }
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
                    gasten: ep.gasten || [],
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

        // Gasten: de eerste unieke gast en daarna elke 50e (wie vaker te gast was, telt één keer)
        const STAP_GASTEN = 50;
        const gezien = new Set();
        const gasten = [];
        let nieuwRecent = 0;
        afl.forEach(ep => ep.gasten.forEach(naam => {
            if (gezien.has(naam)) return;
            gezien.add(naam);
            if (ep.datum > jaarTerug) nieuwRecent++;
            if (gezien.size === 1 || gezien.size % STAP_GASTEN === 0) gasten.push({ nummer: gezien.size, naam, datum: ep.datum, ep });
        }));
        tempo.nieuweGasten = nieuwRecent;
        const aantalGasten = gezien.size;
        const volgendeGast = Math.floor(aantalGasten / STAP_GASTEN) * STAP_GASTEN + STAP_GASTEN;
        const voorspelGast = n => nieuwRecent > 0 ? naDagen((n - aantalGasten) * 365 / nieuwRecent) : null;

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

        // Voorspellingen voor de eerstvolgende mijlpaal van elk soort ('kort' is het label in de lijstjes op mijlpalen.html)
        const verwacht = [];
        const volgendUur = doel;
        const uurDatum = voorspelUur(volgendUur);
        if (uurDatum) verwacht.push({ soort: 'luistertijd', label: `${getal(volgendUur)} uur luistertijd`, kort: `${getal(volgendUur)} uur`, datum: uurDatum });
        verwacht.push({
            soort: 'aflevering',
            label: `Aflevering ${volgendeId}`,
            kort: `Aflevering ${volgendeId}`,
            datum: naDagen((volgendeId - hoogsteId) * tempo.dagenPerAflevering),
        });
        CATEGORIEEN.forEach(c => {
            const per = tempo.perCategorie[c];
            if (!per) return;
            const volgende = Math.floor(tellers[c] / 50) * 50 + 50;
            verwacht.push({
                soort: 'categorie', categorie: c,
                label: `${rangtelwoord(volgende)} ${NAMEN[c]}-aflevering`,
                kort: rangtelwoord(volgende),
                datum: naDagen((volgende - tellers[c]) * 365 / per),
            });
        });
        const gastDatum = voorspelGast(volgendeGast);
        if (gastDatum) verwacht.push({ soort: 'gast', label: `${rangtelwoord(volgendeGast)} gast`, kort: `${rangtelwoord(volgendeGast)} gast`, datum: gastDatum });
        verwacht.push({ soort: 'jubileum', label: `${jubilea.length + 1} jaar Kleine Boodschap`, kort: `${jubilea.length + 1} jaar`, datum: volgendJubileum, exact: true });
        verwacht.sort((a, b) => a.datum - b.datum);

        return {
            eerste, laatste, totaalMinuten: totaal, tempo, CATEGORIEEN, tellers,
            luistertijd, afleveringen, categorieen, jubilea, verwacht, voorspelUur,
            gasten, aantalGasten, volgendeGast, STAP_GASTEN, voorspelGast,
        };
    }

    // Records over alle afleveringen (afl gesorteerd op datum, zoals laad() teruggeeft)
    function records(afl) {
        const opDuur = afl.slice().sort((a, b) => a.minuten - b.minuten);
        const som = (eps, f) => eps.reduce((s, ep) => s + f(ep), 0);
        const hoogste = (lijst, f) => lijst.reduce((a, b) => f(b) > f(a) ? b : a);

        // Langste aflevering per categorie
        const perCategorie = CATEGORIEEN
            .map(c => afl.filter(ep => ep.categorie === c))
            .filter(eps => eps.length)
            .map(eps => hoogste(eps, ep => ep.minuten));

        // Per jaar en per maand (jaren met minder dan 5 afleveringen, zoals 2017, tellen niet mee)
        const perJaar = new Map(), perMaand = new Map();
        afl.forEach(ep => {
            const j = ep.datum.getUTCFullYear(), m = ep.datum.toISOString().slice(0, 7);
            if (!perJaar.has(j)) perJaar.set(j, []);
            if (!perMaand.has(m)) perMaand.set(m, []);
            perJaar.get(j).push(ep);
            perMaand.get(m).push(ep);
        });
        const jaren = [...perJaar.entries()].filter(([, eps]) => eps.length >= 5)
            .map(([jaar, eps]) => ({ jaar, aantal: eps.length, minuten: som(eps, ep => ep.minuten) }));
        const maanden = [...perMaand.entries()].map(([maand, eps]) => ({ maand, aantal: eps.length, minuten: som(eps, ep => ep.minuten) }));

        // Langste stilte tussen twee afleveringen
        let stilte = { dagen: 0 };
        for (let i = 1; i < afl.length; i++) {
            const dagen = Math.round((afl[i].datum - afl[i - 1].datum) / DAG);
            if (dagen > stilte.dagen) stilte = { dagen, van: afl[i - 1], tot: afl[i] };
        }

        // Gasten
        const tellingGasten = new Map();
        afl.forEach(ep => ep.gasten.forEach(n => tellingGasten.set(n, (tellingGasten.get(n) || 0) + 1)));
        const meestGast = Math.max(0, ...tellingGasten.values());
        const vaakstTeGast = [...tellingGasten.entries()].filter(([, n]) => n === meestGast).map(([naam]) => naam);
        const meesteGasten = hoogste(afl, ep => ep.gasten.length);

        return {
            langste: opDuur.slice(-5).reverse(),
            kortste: opDuur.slice(0, 5),
            perCategorie,
            meesteAfleveringen: jaren.length ? hoogste(jaren, j => j.aantal) : null,
            meesteLuistertijd: jaren.length ? hoogste(jaren, j => j.minuten) : null,
            druksteMaand: hoogste(maanden, m => m.aantal),
            langsteMaand: hoogste(maanden, m => m.minuten),
            stilte,
            vaakstTeGast, meestGast, meesteGasten,
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
        r.gasten.forEach(m => lijst.push({
            soort: 'gast', datum: m.datum, ep: m.ep,
            titel: m.nummer === 1 ? `Eerste gast: ${m.naam}` : `${rangtelwoord(m.nummer)} gast: ${m.naam}`,
        }));
        r.jubilea.forEach(m => lijst.push({ soort: 'jubileum', datum: m.datum, titel: `${m.jaren} jaar Kleine Boodschap`, detail: `${getal(m.aantal)} afleveringen tot dan toe` }));
        return lijst.sort((a, b) => b.datum - a.datum);
    }

    const ICONEN = { luistertijd: 'bi-headphones', aflevering: 'bi-collection-play', categorie: 'bi-tag', gast: 'bi-mic', jubileum: 'bi-cake2' };

    window.kbMijlpalen = { laad, bereken, records, alle, datum, getal, rangtelwoord, ICONEN };
})();
