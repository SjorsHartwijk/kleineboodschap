// Voorspellingen op de homepage: de volgende aflevering en een voorspelling voor het lopende jaar.
// Alles is gebaseerd op het afgelopen jaar aan afleveringen en wordt bij elke paginaweergave
// opnieuw berekend. De afleveringen komen via kbMijlpalen.laad() (mijlpalen.js), dus de tijden
// zijn al omgerekend naar de gekozen afspeelsnelheid (instellingen.js).

(function () {
    const M = window.kbMijlpalen;
    if (!M) return;
    const $ = id => document.getElementById(id);
    const DAG = 864e5;
    const CATEGORIEEN = ['nieuws', 'achtergrond', 'interview', 'reportage'];
    const WEEKDAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    const getal = n => n.toLocaleString('nl-NL');
    const hoofdletter = s => s.charAt(0).toUpperCase() + s.slice(1);
    const regel = (links, rechts) => `<div class="kb-regel"><span>${links}</span><span>${rechts}</span></div>`;

    // De datums in episodes.json staan op middernacht UTC; vandaag rekenen we op dezelfde manier
    function vandaagUtc() {
        const nu = new Date();
        return new Date(Date.UTC(nu.getFullYear(), nu.getMonth(), nu.getDate()));
    }

    function volgendeAflevering(afl, recent) {
        const laatste = afl[afl.length - 1];

        // Vaste verschijndag: de weekdag waarop het afgelopen jaar de meeste afleveringen uitkwamen
        const perDag = [0, 0, 0, 0, 0, 0, 0];
        recent.forEach(ep => perDag[ep.datum.getUTCDay()]++);
        const dag = perDag.indexOf(Math.max(...perDag));

        // Eerstvolgende keer die weekdag, na de laatste aflevering en niet in het verleden
        let datum = new Date(Math.max(laatste.datum.getTime() + DAG, vandaagUtc().getTime()));
        while (datum.getUTCDay() !== dag) datum = new Date(datum.getTime() + DAG);

        // Kans per categorie: het aandeel van het afgelopen jaar
        const kansen = CATEGORIEEN
            .map(c => ({ c, pct: Math.round(recent.filter(ep => ep.categorie === c).length / recent.length * 100) }))
            .filter(k => k.pct > 0)
            .sort((a, b) => b.pct - a.pct);

        const datumTekst = datum.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
        $('voorspelVolgende').innerHTML = `
            <div class="kb-record">
                <div class="kb-record-getal">${datum.getUTCDate()}<small>${datum.toLocaleDateString('nl-NL', { month: 'short', timeZone: 'UTC' }).replace('.', '')}</small></div>
                <div>
                    <div class="small kb-muted">Aflevering ${laatste.id + 1}</div>
                    <div class="fw-semibold">${hoofdletter(datumTekst)}</div>
                    <div class="small kb-muted">${perDag[dag]} van de ${recent.length} afleveringen van het afgelopen jaar verschenen op een ${WEEKDAGEN[dag]}</div>
                </div>
            </div>
            <p class="mt-3 mb-0">Waarschijnlijk zal dit een ${kansen[0].c}-aflevering zijn.</p>
            <h4 class="h6 mt-4 mb-2">Kans per categorie</h4>
            <div class="kb-kansen">${kansen.map(k => regel(`<span class="kb-legendablokje ${k.c}" aria-hidden="true"></span> ${hoofdletter(k.c)}`, `${k.pct}%`)).join('')}</div>`;
    }

    function jaarVoorspelling(afl, recent) {
        const laatste = afl[afl.length - 1];
        const jaar = vandaagUtc().getUTCFullYear();
        const vanJaar = j => afl.filter(ep => ep.datum.getUTCFullYear() === j);
        const som = (eps, f) => eps.reduce((s, ep) => s + f(ep), 0);

        // Tot nu toe dit jaar
        const nu = vanJaar(jaar);
        const nuMinuten = som(nu, ep => ep.minuten);
        const nuGasten = som(nu, ep => ep.gasten.length);

        // Wat er tot en met 31 december nog bij komt, in het tempo van het afgelopen jaar
        const eindeJaar = Date.UTC(jaar, 11, 31);
        const vanaf = Math.max(laatste.datum.getTime(), Date.UTC(jaar, 0, 1) - DAG);
        const restDagen = Math.max(0, (eindeJaar - vanaf) / DAG);
        const erbij = Math.round(restDagen * recent.length / 365);
        const gemMinuten = som(recent, ep => ep.minuten) / recent.length;
        const gemGasten = som(recent, ep => ep.gasten.length) / recent.length;

        const totaal = nu.length + erbij;
        const totaalUur = Math.round((nuMinuten + erbij * gemMinuten) / 60);
        const totaalGasten = Math.round(nuGasten + erbij * gemGasten);

        // Vergelijken met eerdere volle jaren (het startjaar 2017 had maar één aflevering)
        const eerdere = [];
        for (let j = afl[0].datum.getUTCFullYear(); j < jaar; j++) {
            const eps = vanJaar(j);
            if (eps.length >= 5) eerdere.push({ j, aantal: eps.length, uur: Math.round(som(eps, ep => ep.minuten) / 60), gasten: som(eps, ep => ep.gasten.length) });
        }
        const record = (veld) => eerdere.reduce((a, b) => b[veld] > a[veld] ? b : a);
        const vergelijk = (waarde, veld, eenheid) => {
            if (!eerdere.length) return '';
            const r = record(veld);
            return waarde > r[veld]
                ? `<span class="kb-voorspel-record">record</span>`
                : `<span class="kb-muted small">record ${r.j}: ${getal(r[veld])}${eenheid}</span>`;
        };
        const recordUur = eerdere.length && totaalUur > record('uur').uur;
        const recordAantal = eerdere.length && totaal > record('aantal').aantal;
        const conclusie = recordUur && recordAantal ? `${jaar} gaat op weg naar een recordjaar, in afleveringen én in luistertijd.`
            : recordUur ? `${jaar} gaat op weg naar het jaar met de meeste luistertijd ooit.`
            : recordAantal ? `${jaar} gaat op weg naar het jaar met de meeste afleveringen ooit.`
            : `Geen recordjaar, maar wel een jaar met rond ${getal(totaal)} afleveringen.`;

        $('voorspelJaar').innerHTML = `
            <div class="kb-record">
                <div class="kb-record-getal">${getal(totaal)}<small>afl.</small></div>
                <div>
                    <div class="small kb-muted">Verwacht voor ${jaar}</div>
                    <div class="fw-semibold">${conclusie}</div>
                    <div class="small kb-muted">Nu ${getal(nu.length)} afleveringen, nog rond ${getal(erbij)} tot en met 31 december</div>
                </div>
            </div>
            <div class="mt-3">
                ${regel(`Afleveringen ${vergelijk(totaal, 'aantal', '')}`, `${getal(nu.length)} → ${getal(totaal)}`)}
                ${regel(`Luistertijd ${vergelijk(totaalUur, 'uur', ' uur')}`, `${getal(Math.round(nuMinuten / 60))} → ${getal(totaalUur)} uur`)}
                ${regel(`Personen te gast ${vergelijk(totaalGasten, 'gasten', '')}`, `${getal(nuGasten)} → ${getal(totaalGasten)}`)}
            </div>`;
    }

    function start() {
        if (!$('voorspelVolgende') || !$('voorspelJaar')) return;
        M.laad().then(afl => {
            if (afl.length < 2) return;
            const laatste = afl[afl.length - 1];
            const recent = afl.filter(ep => ep.datum > new Date(laatste.datum.getTime() - 365 * DAG));
            volgendeAflevering(afl, recent);
            jaarVoorspelling(afl, recent);
            $('voorspelUitleg').textContent = `Voorspellingen op basis van het afgelopen jaar: ${recent.length} afleveringen. Het blijft een schatting.`;
        }).catch(fout => console.error('Voorspellingen konden niet geladen worden:', fout));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
