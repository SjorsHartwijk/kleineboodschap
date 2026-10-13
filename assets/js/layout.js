// Dit bestand bouwt de gedeelde navigatie (boven en mobiel) en de footer voor alle pagina's.
// Een pagina toevoegen of wijzigen hoeft daardoor alleen nog hier te gebeuren.
//
// Gebruik in een pagina:
//   <div data-layout="nav"></div>          navigatie bovenaan
//   <div data-layout="mobile-nav"></div>   zwevende navigatie onderaan op mobiel
//   <div data-layout="footer"></div>       footer
// Een class of style op de placeholder wordt overgenomen op het element dat ervoor in de plaats komt.
// Met data-container="container" kies je een andere container voor de navigatie (standaard container-xxl).

(function () {
    const paginas = [
        { href: 'index.html', titel: 'Home', mobiel: 'Statistieken', icoon: 'bi-bar-chart', icoonActief: 'bi-bar-chart-fill' },
        { href: 'afleveringen.html', titel: 'Afleveringen', mobiel: 'Afleveringen', icoon: 'bi-list-ul' },
        { href: 'kaart.html', titel: 'Kaart', mobiel: 'Kaart', icoon: 'bi-geo-alt' },
        { href: 'kalender.html', titel: 'Kalender', mobiel: 'Kalender', icoon: 'bi-calendar3' },
        { href: 'gasten.html', titel: 'Gasten', mobiel: 'Gasten', icoon: 'bi-people' },
        { href: 'reeks.html', titel: 'Reeks', mobiel: 'Reeks', icoon: 'bi-arrows' },
        { href: 'wrapped.html', titel: 'Wrapped', mobiel: 'Wrapped', icoon: 'bi-star', wrapped: true },
        { href: 'over.html', titel: 'Over' },
    ];

    const bestand = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
    const isActief = pagina => pagina.href.replace(/\.html$/, '') === bestand;

    // Wrapped is zichtbaar van 1 januari t/m eind februari, en natuurlijk altijd op de Wrapped-pagina zelf
    const maand = new Date().getMonth();
    const toonWrapped = maand <= 1 || bestand === 'wrapped';
    const zichtbaar = paginas.filter(p => !p.wrapped || toonWrapped);

    function klassen(pagina, basis) {
        return [basis, isActief(pagina) && 'active', pagina.wrapped && !isActief(pagina) && 'wrappedBtn']
            .filter(Boolean).join(' ');
    }

    function nav(container) {
        const links = zichtbaar.map(p => `
                    <li class="nav-item"><a class="${klassen(p, 'nav-link')}" href="${p.href}" title="${p.titel}"${isActief(p) ? ' aria-current="page"' : ''}>${p.titel}</a></li>`).join('');
        return `
    <nav class="navbar navbar-top navbar-expand-lg navbar-dark bg-theme">
        <div class="${container}">
            <a class="navbar-brand" href="index.html"><img src="assets/images/logo2.png" alt="Logo Kleine Boodschap Data" title="Kleine Boodschap Data"> <span
                    class="d-none d-md-inline-block">Kleine Boodschap Data</span><span
                    class="d-inline-block d-md-none">KB Data</span></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Navigatie openen"><span
                    class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">${links}
                    <li class="nav-item"><a class="nav-link" href="https://bsky.app/profile/kbdata.nl" rel="nofollow noopener" target="_blank" title="Bluesky" aria-label="Bluesky"><i class="bi bi-bluesky"></i></a></li>
                    <li class="nav-item"><a class="nav-link" href="https://kleineboodschap.com" rel="nofollow noopener" target="_blank">Kleine Boodschap <i class="bi bi-box-arrow-up-right"></i></a></li>
                </ul>
            </div>
        </div>
    </nav>`;
    }

    function mobieleNav() {
        const links = zichtbaar.filter(p => p.mobiel).map(p => {
            const icoon = isActief(p) && p.icoonActief ? p.icoonActief : p.icoon;
            return `
            <a href="${p.href}" class="${klassen(p, 'text-decoration-none')}" title="${p.mobiel}"${isActief(p) ? ' aria-current="page"' : ''}>
                <i class="bi ${icoon} d-block"></i>
                <span class="small">${p.mobiel}</span>
            </a>`;
        }).join('');
        return `
<div class="container-fluid d-md-none">
    <nav class="navbar navbar-bottom shadow-lg fixed-bottom">
        <div class="container d-flex justify-content-between text-center">${links}
        </div>
    </nav>
</div>`;
    }

    function footer() {
        return `
    <footer class="d-none d-md-block bg-dark py-4 mt-auto">
        <div class="container px-5">
            <div class="row align-items-center justify-content-between flex-column flex-sm-row">
                <div class="col-auto">
                    <div class="small m-0 text-white">Copyright &copy; Sjors Hartwijk ${new Date().getFullYear()}</div>
                </div>
                <div class="col-auto">
                    <a class="link-light small" href="index.html">Home</a>
                    <span class="text-white mx-1">&middot;</span>
                    <a class="link-light small" href="over.html">Over</a>
                    <span class="text-white mx-1">&middot;</span>
                    <a class="link-light small" href="https://bsky.app/profile/kbdata.nl" rel="noopener" target="_blank">Bluesky</a>
                    <span class="text-white mx-1">&middot;</span>
                    <a class="link-light small" href="https://sjorshartwijk.nl/" rel="noopener" target="_blank">Sjors Hartwijk</a>
                    <span class="text-white mx-1">&middot;</span>
                    <a class="link-light small" href="https://kleineboodschap.com" rel="noopener" target="_blank">Kleine Boodschap</a>
                </div>
            </div>
        </div>
    </footer>`;
    }

    function plaats(placeholder) {
        const soort = placeholder.dataset.layout;
        const html = soort === 'nav' ? nav(placeholder.dataset.container || 'container-xxl')
            : soort === 'mobile-nav' ? mobieleNav()
            : soort === 'footer' ? footer()
            : null;
        if (!html) return;

        const sjabloon = document.createElement('template');
        sjabloon.innerHTML = html.trim();
        const element = sjabloon.content.firstElementChild;
        // Bij de mobiele navigatie zitten class en style op de <nav>, niet op de omhullende div
        const doel = soort === 'mobile-nav' ? element.querySelector('nav') : element;
        if (placeholder.className) doel.classList.add(...placeholder.classList);
        if (placeholder.getAttribute('style')) doel.setAttribute('style', placeholder.getAttribute('style'));
        placeholder.replaceWith(element);
    }

    function render() {
        document.querySelectorAll('[data-layout]').forEach(plaats);
    }

    // Direct renderen wat er al staat (de navigatie bovenaan, zonder verspringen),
    // en de rest zodra de pagina helemaal is ingeladen
    render();
    document.addEventListener('DOMContentLoaded', render);
})();
