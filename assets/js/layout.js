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
        { href: 'mijlpalen.html', titel: 'Mijlpalen' },
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
    <nav class="navbar navbar-top">
        <div class="${container}">
            <a class="navbar-brand" href="index.html"><img src="assets/images/logo2.png" alt="Logo Kleine Boodschap Data" title="Kleine Boodschap Data"> <span
                    class="d-none d-md-inline-block">Kleine Boodschap Data</span><span
                    class="d-inline-block d-md-none">KB Data</span></a>
            <div class="d-flex align-items-center gap-2 ms-auto">${instellingen()}
                <button class="btn kb-icoonknop navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Menu openen" title="Menu"><i class="bi bi-list" aria-hidden="true"></i></button>
            </div>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav py-2">${links}
                    <li class="nav-item"><a class="nav-link" href="https://bsky.app/profile/kbdata.nl" rel="nofollow noopener" target="_blank" title="Bluesky"><i class="bi bi-bluesky"></i> Bluesky</a></li>
                    <li class="nav-item"><a class="nav-link" href="https://kleineboodschap.com" rel="nofollow noopener" target="_blank">Kleine Boodschap <i class="bi bi-box-arrow-up-right"></i></a></li>
                </ul>
            </div>
        </div>
    </nav>`;
    }

    // Tandwiel met instellingen: afspeelsnelheid (instellingen.js) en kleurmodus (theme.js)
    function instellingen() {
        const keuze = window.kbThema ? window.kbThema.keuze() : 'auto';
        const s = window.kbSnelheid || { MIN: 0.5, MAX: 3, STAP: 0.1, STANDAARD: 1, waarde: () => 1, formatteer: x => x + '×' };
        const snelheid = s.waarde();
        const opties = [
            { waarde: 'light', titel: 'Licht', icoon: 'bi-sun-fill' },
            { waarde: 'dark', titel: 'Donker', icoon: 'bi-moon-stars-fill' },
            { waarde: 'auto', titel: 'Systeem', icoon: 'bi-laptop' },
        ];
        const modusKnoppen = opties.map(o => `
                            <button type="button" class="btn kb-modusknop${o.waarde === keuze ? ' active' : ''}" data-kb-thema="${o.waarde}" aria-pressed="${o.waarde === keuze}"><i class="bi ${o.icoon}" aria-hidden="true"></i><span>${o.titel}</span></button>`).join('');
        const badge = snelheid !== s.STANDAARD
            ? `<span class="kb-snelheid-badge" aria-hidden="true">${s.formatteer(snelheid)}</span>` : '';
        return `
                <div class="dropdown">
                    <button class="btn kb-icoonknop position-relative" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-label="Instellingen" title="Instellingen"><i class="bi bi-gear" aria-hidden="true"></i>${badge}</button>
                    <div class="dropdown-menu dropdown-menu-end kb-instellingen">
                        <div class="kb-instellingen-titel">Instellingen</div>
                        <div class="kb-instelling">
                            <div class="d-flex justify-content-between align-items-baseline">
                                <label for="kbSnelheid" class="kb-instelling-label">Afspeelsnelheid</label>
                                <output for="kbSnelheid" id="kbSnelheidWaarde" class="fw-semibold">${s.formatteer(snelheid)}</output>
                            </div>
                            <input type="range" class="form-range" id="kbSnelheid" min="${s.MIN}" max="${s.MAX}" step="${s.STAP}" value="${snelheid}" aria-describedby="kbSnelheidUitleg">
                            <div class="kb-schaal kb-muted small" aria-hidden="true"><span style="left:0">${s.formatteer(s.MIN)}</span><span style="left:${(s.STANDAARD - s.MIN) / (s.MAX - s.MIN) * 100}%">${s.formatteer(s.STANDAARD)}</span><span style="left:100%">${s.formatteer(s.MAX)}</span></div>
                            <p id="kbSnelheidUitleg" class="kb-muted small mb-0 mt-2">Alle tijden op de site worden omgerekend naar jouw snelheid.</p>
                            <button type="button" class="btn btn-link btn-sm p-0 mt-1" id="kbSnelheidReset"${snelheid === s.STANDAARD ? ' hidden' : ''}>Terug naar ${s.formatteer(s.STANDAARD)}</button>
                        </div>
                        <div class="kb-instelling">
                            <div class="kb-instelling-label mb-2" id="kbModusLabel">Weergave</div>
                            <div class="kb-modusknoppen" role="group" aria-labelledby="kbModusLabel">${modusKnoppen}
                            </div>
                        </div>
                        <div class="kb-instelling">
                            <button type="button" class="btn btn-link btn-sm p-0 d-inline-flex align-items-center gap-2" data-kb-cookies><i class="bi bi-cookie" aria-hidden="true"></i> Cookie-instellingen</button>
                        </div>
                    </div>
                </div>`;
    }

    // Slider koppelen: waarde live tonen, pas toepassen als de bezoeker klaar is met schuiven
    function koppelInstellingen(element) {
        const slider = element.querySelector('#kbSnelheid');
        if (!slider || !window.kbSnelheid) return;
        const uitvoer = element.querySelector('#kbSnelheidWaarde');
        const reset = element.querySelector('#kbSnelheidReset');
        let wacht;
        slider.addEventListener('input', () => {
            uitvoer.textContent = kbSnelheid.formatteer(parseFloat(slider.value));
        });
        // 'change' komt bij loslaten, maar bij pijltjestoetsen bij elke stap: kort wachten
        slider.addEventListener('change', () => {
            clearTimeout(wacht);
            wacht = setTimeout(() => kbSnelheid.zet(slider.value), 600);
        });
        reset.addEventListener('click', () => kbSnelheid.zet(kbSnelheid.STANDAARD));
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
    <footer class="d-none d-md-block py-4 mt-auto">
        <div class="container px-5">
            <div class="row align-items-center justify-content-between flex-column flex-sm-row">
                <div class="col-auto">
                    <div class="small m-0">Copyright &copy; Sjors Hartwijk ${new Date().getFullYear()}</div>
                </div>
                <div class="col-auto">
                    <a class="small" href="index.html">Home</a>
                    <span class="mx-1">&middot;</span>
                    <a class="small" href="over.html">Over</a>
                    <span class="mx-1">&middot;</span>
                    <a class="small" href="https://bsky.app/profile/kbdata.nl" rel="noopener" target="_blank">Bluesky</a>
                    <span class="mx-1">&middot;</span>
                    <a class="small" href="https://sjorshartwijk.nl/" rel="noopener" target="_blank">Sjors Hartwijk</a>
                    <span class="mx-1">&middot;</span>
                    <a class="small" href="https://kleineboodschap.com" rel="noopener" target="_blank">Kleine Boodschap</a>
                    <span class="mx-1">&middot;</span>
                    <a class="small" href="#" data-kb-cookies>Cookies</a>
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
        if (soort === 'nav') koppelInstellingen(element);
    }

    function render() {
        document.querySelectorAll('[data-layout]').forEach(plaats);
    }

    // Direct renderen wat er al staat (de navigatie bovenaan, zonder verspringen),
    // en de rest zodra de pagina helemaal is ingeladen
    render();
    document.addEventListener('DOMContentLoaded', render);
})();
