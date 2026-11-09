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

    function modus() {
        return keuze === 'auto' ? (media.matches ? 'dark' : 'light') : keuze;
    }

    function kleur(naam) {
        return getComputedStyle(root).getPropertyValue('--kb-' + naam).trim();
    }

    function werkGrafiekenBij() {
        if (!window.Chart) return;
        const tekst = kleur('muted') || Chart.defaults.color;
        const rand = kleur('border') || Chart.defaults.borderColor;
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
    }

    function pasToe() {
        root.setAttribute('data-bs-theme', modus());
        werkKnoppenBij();
        werkGrafiekenBij();
        document.dispatchEvent(new CustomEvent('kb-thema', { detail: { keuze, modus: modus() } }));
    }

    // Direct (nog vóór de stylesheets) de modus zetten
    root.setAttribute('data-bs-theme', modus());

    // Systeeminstelling live volgen
    const bijSysteemWissel = () => { if (keuze === 'auto') pasToe(); };
    if (media.addEventListener) media.addEventListener('change', bijSysteemWissel);
    else if (media.addListener) media.addListener(bijSysteemWissel);

    // Wijziging in een ander tabblad overnemen
    window.addEventListener('storage', e => {
        if (e.key === SLEUTEL || e.key === null) { keuze = leesKeuze(); pasToe(); }
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
    window.kbCategorieKleur = categorie => kleur('cat-' + categorie) || kleur('muted');
    window.kbThema = {
        keuze: () => keuze,
        modus,
        zet(nieuw) {
            if (!KEUZES.includes(nieuw)) return;
            keuze = nieuw;
            bewaarKeuze(keuze);
            pasToe();
        },
    };
})();
