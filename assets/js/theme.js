// Kleurmodus (licht, donker of systeem) voor alle pagina's.
// Dit script staat in de <head>, vóór de stylesheets, zodat de juiste modus al vastligt
// voordat er iets getekend wordt (geen flits van de verkeerde modus).
//
// De keuze wordt per bezoeker onthouden in localStorage onder 'kb-thema':
//   'light' | 'dark' | 'auto' (auto = volg de systeeminstelling, ook bij live wijzigingen)
//
// Voor scripts:
//   kbKleur('primary')          -> waarde van de CSS-variabele --kb-primary in de huidige modus
//   kbCategorieKleur('nieuws')  -> kleur van een categorie in de huidige modus
//   kbThema.keuze()             -> 'light' | 'dark' | 'auto'
//   kbThema.zet('dark')         -> modus kiezen en onthouden
//
// Toegankelijkheid (los van licht/donker, werkt met allebei):
//   'kb-contrast'  'aan' | 'uit' | niets (= volg de systeeminstelling "meer contrast")
//                  -> data-kb-contrast="hoog" op <html>
//   'kb-patronen'  'aan' | niets
//                  -> data-kb-patronen="aan" op <html>; categorieën krijgen naast een kleur
//                     ook een patroon, en kbCategorieKleur() geeft dan een CanvasPattern
//   kbThema.contrast() / kbThema.zetContrast(true|false)
//   kbThema.patronen() / kbThema.zetPatronen(true|false)
// Bij elke wisseling wordt het event 'kb-thema' op document afgevuurd en worden
// Chart.js-grafieken opnieuw getekend (gebruik daarvoor functies als kleur, zie de grafiekscripts).

(function () {
    const SLEUTEL = 'kb-thema';
    const KEUZES = ['light', 'dark', 'auto'];
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const root = document.documentElement;

    function leesKeuze() {
        try {
            const waarde = localStorage.getItem(SLEUTEL);
            return KEUZES.includes(waarde) ? waarde : 'auto';
        } catch (e) {
            return 'auto';
        }
    }

    function bewaarKeuze(keuze) {
        try {
            if (keuze === 'auto') localStorage.removeItem(SLEUTEL);
            else localStorage.setItem(SLEUTEL, keuze);
        } catch (e) { /* bv. privévenster of geblokkeerde opslag: dan alleen voor deze pagina */ }
    }

    let keuze = leesKeuze();

    // Hoog contrast en patronen
    const mediaContrast = window.matchMedia('(prefers-contrast: more)');
    function lees(sleutel) {
        try { return localStorage.getItem(sleutel); } catch (e) { return null; }
    }
    function bewaar(sleutel, waarde) {
        try {
            if (waarde === null) localStorage.removeItem(sleutel);
            else localStorage.setItem(sleutel, waarde);
        } catch (e) { /* alleen voor deze pagina */ }
    }
    let contrastKeuze = lees('kb-contrast');   // 'aan' | 'uit' | null (volg systeem)
    let patronenAan = lees('kb-patronen') === 'aan';
    const contrastAan = () => contrastKeuze === 'aan' || (contrastKeuze !== 'uit' && mediaContrast.matches);

    function zetAttributen() {
        root.setAttribute('data-bs-theme', modus());
        if (contrastAan()) root.setAttribute('data-kb-contrast', 'hoog');
        else root.removeAttribute('data-kb-contrast');
        if (patronenAan) root.setAttribute('data-kb-patronen', 'aan');
        else root.removeAttribute('data-kb-patronen');
    }

    function modus() {
        return keuze === 'auto' ? (media.matches ? 'dark' : 'light') : keuze;
    }

    function kleur(naam) {
        return getComputedStyle(root).getPropertyValue('--kb-' + naam).trim();
    }

    function werkGrafiekenBij() {
        if (!window.Chart) return;
        const tekst = kleur('muted') || Chart.defaults.color;
        // Rasterlijnen: eigen kleur bij hoog contrast (zwarte lijnen zijn daar te druk), anders de randkleur
        const rand = kleur('raster') || kleur('border') || Chart.defaults.borderColor;
        // Standaard voor grafieken die nog gemaakt worden: huisstijlletter en rechte balken
        Chart.defaults.color = tekst;
        Chart.defaults.borderColor = rand;
        Chart.defaults.font.family = 'Geist, system-ui, sans-serif';
        Chart.defaults.elements.bar.borderRadius = 0;
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.boxHeight = 12;
        // Bestaande grafieken: Chart.js onthoudt as- en legendakleuren per grafiek,
        // dus die zetten we hier expliciet en tekenen we opnieuw
        Object.values(Chart.instances || {}).forEach(grafiek => {
            const opties = grafiek.config.options;
            opties.scales = opties.scales || {};
            Object.keys(grafiek.scales || {}).forEach(id => {
                const as = opties.scales[id] = opties.scales[id] || {};
                as.ticks = Object.assign(as.ticks || {}, { color: tekst });
                as.grid = Object.assign(as.grid || {}, { color: rand });
                as.border = Object.assign(as.border || {}, { color: rand });
                as.title = Object.assign(as.title || {}, { color: tekst });
            });
            opties.plugins = opties.plugins || {};
            const legenda = opties.plugins.legend = opties.plugins.legend || {};
            legenda.labels = Object.assign(legenda.labels || {}, { color: tekst });
            grafiek.update('none');
        });
    }

    function werkKnoppenBij() {
        document.querySelectorAll('[data-kb-thema]').forEach(knop => {
            const actief = knop.getAttribute('data-kb-thema') === keuze;
            knop.classList.toggle('active', actief);
            knop.setAttribute('aria-pressed', actief ? 'true' : 'false');
        });
        document.querySelectorAll('[data-kb-optie=contrast]').forEach(el => { el.checked = contrastAan(); });
        document.querySelectorAll('[data-kb-optie=patronen]').forEach(el => { el.checked = patronenAan; });
    }

    function pasToe() {
        zetAttributen();
        werkKnoppenBij();
        werkGrafiekenBij();
        document.dispatchEvent(new CustomEvent('kb-thema', { detail: { keuze, modus: modus() } }));
    }

    // Direct (nog vóór de stylesheets) de modus, het contrast en de patronen zetten
    zetAttributen();

    // Systeeminstelling live volgen
    const bijSysteemWissel = () => { if (keuze === 'auto') pasToe(); };
    if (media.addEventListener) media.addEventListener('change', bijSysteemWissel);
    else if (media.addListener) media.addListener(bijSysteemWissel);
    const bijContrastWissel = () => { if (contrastKeuze === null) pasToe(); };
    if (mediaContrast.addEventListener) mediaContrast.addEventListener('change', bijContrastWissel);

    // Wijziging in een ander tabblad overnemen
    window.addEventListener('storage', e => {
        if ([SLEUTEL, 'kb-contrast', 'kb-patronen', null].includes(e.key)) {
            keuze = leesKeuze();
            contrastKeuze = lees('kb-contrast');
            patronenAan = lees('kb-patronen') === 'aan';
            pasToe();
        }
    });

    // Schakelaars voor contrast en patronen (ook door layout.js geplaatst)
    document.addEventListener('change', e => {
        const optie = e.target.getAttribute && e.target.getAttribute('data-kb-optie');
        if (optie === 'contrast') window.kbThema.zetContrast(e.target.checked);
        if (optie === 'patronen') window.kbThema.zetPatronen(e.target.checked);
    });

    // Klikken op een keuzeknop (de knoppen worden door layout.js geplaatst)
    document.addEventListener('click', e => {
        const knop = e.target.closest && e.target.closest('[data-kb-thema]');
        if (!knop) return;
        window.kbThema.zet(knop.getAttribute('data-kb-thema'));
    });

    // Zodra de stylesheets en Chart.js er zijn: meta-kleur, knoppen en grafiekstandaarden bijwerken.
    // DOMContentLoaded komt vóór de grafiekscripts hun data hebben opgehaald.
    document.addEventListener('DOMContentLoaded', () => { werkKnoppenBij(); werkGrafiekenBij(); });
    window.addEventListener('load', () => { werkGrafiekenBij(); });

    window.kbKleur = kleur;

    // Grafieken pas maken als ze (bijna) in beeld komen, en Chart.js pas dan laden.
    // Dat scheelt veel rekenwerk bij het laden, vooral op telefoons; een grafiek die verborgen is
    // (display: none, zoals een niet-actieve tab) wordt pas gemaakt zodra hij zichtbaar wordt.
    //   kbGrafiek(canvas, config) -> Promise met de Chart; config mag ook een functie zijn die de
    //   config teruggeeft (dan wordt de data pas op het moment van tekenen opgebouwd)
    const CHART_JS = 'assets/vendor/chartjs-4.6.1/chart.umd.min.js';
    let chartLader = null;
    function laadChart() {
        if (window.Chart) return Promise.resolve(window.Chart);
        if (!chartLader) {
            chartLader = new Promise((klaar, fout) => {
                const script = document.createElement('script');
                script.src = CHART_JS;
                script.onload = () => { werkGrafiekenBij(); klaar(window.Chart); };
                script.onerror = () => fout(new Error('Chart.js kon niet geladen worden'));
                document.head.appendChild(script);
            });
        }
        return chartLader;
    }
    function bijnaInBeeld(el) {
        if (!('IntersectionObserver' in window)) return Promise.resolve();
        return new Promise(klaar => {
            const kijker = new IntersectionObserver(items => {
                if (items.some(i => i.isIntersecting)) { kijker.disconnect(); klaar(); }
            }, { rootMargin: '400px 0px' });
            kijker.observe(el);
        });
    }
    window.kbGrafiek = (canvas, config) => bijnaInBeeld(canvas)
        .then(laadChart)
        .then(C => new C(canvas, typeof config === 'function' ? config() : config));
    // Patronen per categorie, zelfde als in de CSS: achtergrond effen, nieuws schuine strepen,
    // interview stippen, reportage ruitjes. Een tegel van 8x8 px met de categoriekleur als ondergrond.
    const patroonCache = new Map();
    function patroon(categorie, basis) {
        const lijn = kleur('patroon') || 'rgba(255,255,255,.7)';
        const sleutel = `${categorie}|${basis}|${lijn}`;
        if (patroonCache.has(sleutel)) return patroonCache.get(sleutel);
        const tegel = document.createElement('canvas');
        tegel.width = tegel.height = 8;
        const ctx = tegel.getContext('2d');
        ctx.fillStyle = basis;
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillStyle = ctx.strokeStyle = lijn;
        ctx.lineWidth = 2;
        if (categorie === 'nieuws') {
            ctx.beginPath();
            ctx.moveTo(-2, 10); ctx.lineTo(10, -2);
            ctx.moveTo(-2, 2); ctx.lineTo(2, -2);
            ctx.moveTo(6, 10); ctx.lineTo(10, 6);
            ctx.stroke();
        } else if (categorie === 'interview') {
            ctx.beginPath();
            ctx.arc(4, 4, 1.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (categorie === 'reportage') {
            ctx.fillRect(0, 0, 8, 1.5);
            ctx.fillRect(0, 0, 1.5, 8);
        }
        const resultaat = ctx.createPattern(tegel, 'repeat') || basis;
        patroonCache.set(sleutel, resultaat);
        return resultaat;
    }

    window.kbCategorieKleur = categorie => {
        const basis = kleur('cat-' + categorie) || kleur('muted');
        return patronenAan && categorie !== 'achtergrond' && kleur('cat-' + categorie) ? patroon(categorie, basis) : basis;
    };
    window.kbThema = {
        keuze: () => keuze,
        contrast: contrastAan,
        patronen: () => patronenAan,
        zetContrast(aan) {
            // Komt de keuze overeen met de systeeminstelling, dan volgen we het systeem weer
            contrastKeuze = !!aan === mediaContrast.matches ? null : (aan ? 'aan' : 'uit');
            bewaar('kb-contrast', contrastKeuze);
            pasToe();
        },
        zetPatronen(aan) {
            patronenAan = !!aan;
            bewaar('kb-patronen', patronenAan ? 'aan' : null);
            pasToe();
        },
        modus,
        zet(nieuw) {
            if (!KEUZES.includes(nieuw)) return;
            keuze = nieuw;
            bewaarKeuze(keuze);
            pasToe();
        },
    };
})();
