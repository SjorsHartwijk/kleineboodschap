// Afleveringkiezer (luisteren.html): kies hoeveel tijd je hebt, de soort aflevering,
// eventueel alleen afleveringen over een plek in de Efteling en een periode, en krijg
// drie afleveringen die in die tijd passen.
// De tijden in episodes.json zijn al omgerekend naar de gekozen afspeelsnelheid (instellingen.js).
// De keuzes staan in de URL, zodat je een selectie kunt delen of bewaren als bladwijzer:
//   luisteren.html?min=45&soort=interview,reportage&plek=1&periode=nieuw
// Er wordt niets in de browser opgeslagen.

(function () {
    const $ = id => document.getElementById(id);
    const CATEGORIEEN = ['nieuws', 'achtergrond', 'interview', 'reportage'];
    const AANTAL = 3;           // aantal voorstellen per keer
    const ONDERGRENS = 0.6;       // een voorstel vult minstens 60% van je tijd...
    const RUIME_ONDERGRENS = 0.3; // ...of 30% als er anders te weinig zijn
    const LANG = 120;             // "2 uur of meer"

    // Midden van de Efteling: alleen locaties binnen 1 km tellen als "plek in de Efteling".
    // Daarmee vallen o.a. het theater, het golfpark en musea elders in het land af.
    const EFTELING = { lat: 51.6497, lon: 5.0480, km: 1 };

    const TIJDEN = [
        { min: 15, label: '15 min', bij: 'even koffie' },
        { min: 30, label: '30 min', bij: 'woon-werk' },
        { min: 45, label: '45 min', bij: 'een rondje hardlopen' },
        { min: 60, label: '1 uur', bij: 'de afwas en meer' },
        { min: 90, label: '1,5 uur', bij: 'de Efteling op en neer' },
        { min: 'lang', label: '2 uur of meer', bij: 'een lange rit' },
    ];
    const PERIODES = [
        { waarde: 'alles', label: 'Alle afleveringen' },
        { waarde: 'nieuw', label: 'Laatste 12 maanden' },
        { waarde: 'archief', label: 'Uit het archief' },
    ];

    const hoofdletter = s => s.charAt(0).toUpperCase() + s.slice(1);
    const veilig = s => String(s).replace(/[&<>"']/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[t]));
    const datum = d => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    const duurTekst = m => m < 60 ? `${m} minuten` : `${Math.floor(m / 60)} uur${m % 60 ? ` en ${m % 60} minuten` : ''}`;

    function inEfteling(ep) {
        if (!isFinite(ep.lat) || !isFinite(ep.lon)) return false;
        const dy = (ep.lat - EFTELING.lat) * 111.2;
        const dx = (ep.lon - EFTELING.lon) * 111.2 * Math.cos(EFTELING.lat * Math.PI / 180);
        return Math.hypot(dx, dy) <= EFTELING.km;
    }

    // Keuzes uit de URL lezen, met nette standaardwaarden
    function leesKeuze() {
        const p = new URLSearchParams(location.search);
        const min = p.get('min');
        const soorten = (p.get('soort') || '').split(',').filter(s => CATEGORIEEN.includes(s));
        return {
            min: min === 'lang' ? 'lang' : Math.min(120, Math.max(5, Math.round((parseInt(min, 10) || 45) / 5) * 5)),
            soorten: new Set(soorten.length ? soorten : CATEGORIEEN),
            plek: p.get('plek') === '1',
            periode: PERIODES.some(x => x.waarde === p.get('periode')) ? p.get('periode') : 'alles',
        };
    }

    function schrijfKeuze(k) {
        const p = new URLSearchParams();
        p.set('min', k.min);
        if (k.soorten.size < CATEGORIEEN.length) p.set('soort', [...k.soorten].join(','));
        if (k.plek) p.set('plek', '1');
        if (k.periode !== 'alles') p.set('periode', k.periode);
        history.replaceState(null, '', `${location.pathname}?${p}`);
    }

    function start(afleveringen) {
        const keuze = leesKeuze();
        const gezien = new Set(); // al getoonde voorstellen bij deze keuze
        const jaarGeleden = new Date();
        jaarGeleden.setFullYear(jaarGeleden.getFullYear() - 1);

        // Knoppen opbouwen
        $('kiezerTijden').innerHTML = TIJDEN.map(t => `
            <button type="button" class="btn btn-outline-secondary kb-tijdknop" data-min="${t.min}">${t.label}<span>${t.bij}</span></button>`).join('');
        $('kiezerSoorten').innerHTML = CATEGORIEEN.map(c => `
            <button type="button" class="kb-filterknop" data-soort="${c}"><span class="kb-legendablokje ${c}" aria-hidden="true"></span>${hoofdletter(c)}</button>`).join('');
        $('kiezerPeriode').innerHTML = PERIODES.map(p => `
            <button type="button" class="btn btn-outline-secondary" data-periode="${p.waarde}">${p.label}</button>`).join('');
        const schuif = $('kiezerMinuten');

        // Alle knoppen en velden laten zien wat er gekozen is
        function toonKeuze() {
            document.querySelectorAll('[data-min]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.min === String(keuze.min))));
            document.querySelectorAll('[data-soort]').forEach(b => b.setAttribute('aria-pressed', String(keuze.soorten.has(b.dataset.soort))));
            document.querySelectorAll('[data-periode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.periode === keuze.periode)));
            schuif.value = keuze.min === 'lang' ? LANG : keuze.min;
            $('kiezerMinutenWaarde').textContent = keuze.min === 'lang' ? '2 uur of meer' : duurTekst(keuze.min);
            $('kiezerPlek').checked = keuze.plek;
        }

        function filter() {
            return afleveringen.filter(ep =>
                keuze.soorten.has(ep.categorie)
                && (!keuze.plek || inEfteling(ep))
                && (keuze.periode === 'alles' || (keuze.periode === 'nieuw') === (ep.datum >= jaarGeleden)));
        }

        // Afleveringen die in de tijd passen; als het er te weinig zijn, mag de ondergrens omlaag
        function passend(lijst) {
            if (keuze.min === 'lang') return { lijst: lijst.filter(ep => ep.minuten >= LANG), ruim: false };
            const binnen = ondergrens => lijst.filter(ep => ep.minuten <= keuze.min && ep.minuten >= keuze.min * ondergrens);
            const krap = binnen(ONDERGRENS);
            if (krap.length >= AANTAL) return { lijst: krap, ruim: false };
            const ruim = binnen(RUIME_ONDERGRENS);
            return ruim.length > krap.length ? { lijst: ruim, ruim: true } : { lijst: krap, ruim: false };
        }

        // Willekeurig kiezen, en pas herhalen als alles een keer langs is geweest
        function kies(lijst) {
            let nieuw = lijst.filter(ep => !gezien.has(ep.id));
            if (nieuw.length < Math.min(AANTAL, lijst.length)) {
                gezien.clear();
                nieuw = lijst.slice();
            }
            for (let i = nieuw.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nieuw[i], nieuw[j]] = [nieuw[j], nieuw[i]];
            }
            const keus = nieuw.slice(0, AANTAL);
            keus.forEach(ep => gezien.add(ep.id));
            return keus;
        }

        function reden(ep) {
            if (keuze.min === 'lang') return `Duurt ${duurTekst(ep.minuten)}`;
            const over = keuze.min - ep.minuten;
            return over <= 3 ? `Past precies in je ${duurTekst(keuze.min)}` : `Nog ${duurTekst(over)} over`;
        }

        function kaart(ep) {
            return `
            <div class="col-12 col-lg-4">
                <div class="kb-record kb-tip">
                    <div class="kb-record-getal">${ep.minuten}<small>min</small></div>
                    <div>
                        <div class="small kb-muted">${reden(ep)}</div>
                        <div class="fw-semibold">${veilig(ep.titel)}</div>
                        <div class="small kb-muted"><span class="kb-legendablokje ${ep.categorie}" aria-hidden="true"></span> Aflevering ${ep.id} · ${ep.categorie} · ${datum(ep.datum)}</div>
                        <button type="button" class="btn btn-link btn-sm p-0 mt-2 kb-kopieer" data-titel="${veilig(ep.titel)}"><i class="bi bi-copy" aria-hidden="true"></i> Kopieer titel</button>
                    </div>
                </div>
            </div>`;
        }

        function toon() {
            const selectie = filter();
            const { lijst, ruim } = passend(selectie);
            const voorstellen = kies(lijst);
            $('kiezerOpnieuw').disabled = lijst.length <= AANTAL;

            if (!lijst.length) {
                const tip = keuze.plek ? 'Probeer het zonder de plek in de Efteling'
                    : keuze.soorten.size < CATEGORIEEN.length ? 'Probeer het met meer soorten'
                    : keuze.periode !== 'alles' ? 'Probeer het met alle afleveringen'
                    : 'Probeer wat meer tijd';
                $('kiezerTeller').textContent = selectie.length
                    ? `Geen aflevering past in deze tijd. ${tip}.`
                    : `Geen afleveringen met deze keuze. ${tip}.`;
                $('kiezerVoorstellen').innerHTML = '';
                return;
            }
            const aantal = lijst.length === 1 ? '1 aflevering past' : `${lijst.length} afleveringen passen`;
            $('kiezerTeller').textContent = `${aantal} bij je keuze${ruim ? ', ook wat kortere, want er zijn er maar weinig die je tijd vullen' : ''}.`;
            $('kiezerVoorstellen').innerHTML = voorstellen.map(kaart).join('');
        }

        // Elke wijziging: opslaan in de URL, opnieuw beginnen met kiezen en tonen
        function wijzig() {
            gezien.clear();
            schrijfKeuze(keuze);
            toonKeuze();
            toon();
        }

        $('kiezerTijden').addEventListener('click', e => {
            const b = e.target.closest('[data-min]');
            if (!b) return;
            keuze.min = b.dataset.min === 'lang' ? 'lang' : Number(b.dataset.min);
            wijzig();
        });
        schuif.addEventListener('input', () => {
            $('kiezerMinutenWaarde').textContent = duurTekst(Number(schuif.value));
        });
        schuif.addEventListener('change', () => {
            keuze.min = Number(schuif.value);
            wijzig();
        });
        $('kiezerSoorten').addEventListener('click', e => {
            const b = e.target.closest('[data-soort]');
            if (!b) return;
            const s = b.dataset.soort;
            if (keuze.soorten.has(s)) {
                // Minstens één soort blijft aan
                if (keuze.soorten.size === 1) return;
                keuze.soorten.delete(s);
            } else keuze.soorten.add(s);
            wijzig();
        });
        $('kiezerPlek').addEventListener('change', e => {
            keuze.plek = e.target.checked;
            wijzig();
        });
        $('kiezerPeriode').addEventListener('click', e => {
            const b = e.target.closest('[data-periode]');
            if (!b) return;
            keuze.periode = b.dataset.periode;
            wijzig();
        });
        $('kiezerOpnieuw').addEventListener('click', toon);
        $('kiezerVoorstellen').addEventListener('click', e => {
            const b = e.target.closest('.kb-kopieer');
            if (!b || !navigator.clipboard) return;
            navigator.clipboard.writeText(b.dataset.titel).then(() => {
                b.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Gekopieerd';
                setTimeout(() => { b.innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i> Kopieer titel'; }, 2000);
            }).catch(() => {});
        });

        schrijfKeuze(keuze);
        toonKeuze();
        toon();
    }

    fetch('episodes.json')
        .then(res => res.json())
        .then(data => start(data
            .map(ep => ({
                id: parseInt(ep.id, 10),
                titel: ep.titel,
                categorie: ep.categorie,
                minuten: Math.round(parseFloat(ep.tijd)),
                datum: new Date(ep.datum),
                lat: parseFloat(ep.latitude),
                lon: parseFloat(ep.longitude),
            }))
            .filter(ep => isFinite(ep.minuten) && !isNaN(ep.datum) && CATEGORIEEN.includes(ep.categorie))))
        .catch(fout => {
            console.error('Afleveringen konden niet geladen worden:', fout);
            $('kiezerTeller').textContent = 'De afleveringen konden niet geladen worden. Probeer het later nog eens.';
        });
})();
