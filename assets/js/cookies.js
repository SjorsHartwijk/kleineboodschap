// Cookiemelding en toestemming voor alle pagina's.
// Gebruik in een pagina (onderaan de body):  <script src="assets/js/cookies.js"></script>
//
// - Google Analytics wordt ALLEEN geladen nadat de bezoeker daar toestemming voor geeft.
// - De keuze staat in localStorage onder 'cookieConsent' ('accepted' of 'rejected').
// - Elk element met data-kb-cookies opent de melding opnieuw (footer, instellingenmenu),
//   zodat bezoekers hun keuze altijd kunnen wijzigen of intrekken.

(function () {
    const GA_ID = 'G-7ZT79EJ36K';
    const SLEUTEL = 'cookieConsent';

    // Overzicht van alles wat de site op het apparaat van de bezoeker bewaart
    const NOODZAKELIJK = [
        { naam: 'cookieConsent', soort: 'Lokale opslag', duur: 'Tot je hem wist', doel: 'Onthoudt je keuze in deze melding.' },
        { naam: 'kb-thema', soort: 'Lokale opslag', duur: 'Tot je hem wist', doel: 'Onthoudt of je de site licht, donker of volgens je systeem wilt zien.' },
        { naam: 'kb-snelheid', soort: 'Cookie', duur: '1 jaar', doel: 'Onthoudt je afspeelsnelheid, zodat alle tijden op de site daarop worden omgerekend. Alleen als je een andere snelheid dan 1,0× kiest.' },
    ];
    const ANALYTISCH = [
        { naam: '_ga', soort: 'Cookie', duur: '2 jaar', doel: 'Onderscheidt bezoekers met een willekeurig nummer.' },
        { naam: '_ga_' + GA_ID.replace(/^G-/, ''), soort: 'Cookie', duur: '2 jaar', doel: 'Houdt je bezoek (sessie) bij.' },
    ];

    function leesKeuze() {
        try { return localStorage.getItem(SLEUTEL); } catch (e) { return null; }
    }
    function bewaarKeuze(waarde) {
        try { localStorage.setItem(SLEUTEL, waarde); } catch (e) { /* opslag geblokkeerd */ }
    }

    let gaGeladen = false;
    function laadGA() {
        window['ga-disable-' + GA_ID] = false;
        if (gaGeladen) return;
        gaGeladen = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', GA_ID);
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);
    }

    // Toestemming ingetrokken: GA stilzetten en de GA-cookies verwijderen
    function stopGA() {
        window['ga-disable-' + GA_ID] = true;
        const domeinen = ['', location.hostname, '.' + location.hostname.replace(/^www\./, '')];
        document.cookie.split('; ').map(c => c.split('=')[0]).filter(n => /^_ga(_|$)/.test(n)).forEach(naam => {
            domeinen.forEach(d => {
                document.cookie = naam + '=; Max-Age=0; Path=/' + (d ? '; Domain=' + d : '');
            });
        });
    }

    function tabel(rijen) {
        return `
                <ul class="kb-cookielijst">${rijen.map(r => `
                    <li><code>${r.naam}</code> <span class="kb-muted">· ${r.soort} · ${r.duur}</span><br>${r.doel}</li>`).join('')}
                </ul>`;
    }

    function html() {
        return `
    <div id="cookieConsentBanner" class="kb-cookies" role="dialog" aria-modal="false" aria-labelledby="kbCookiesTitel" hidden>
        <figure class="mb-3">
            <blockquote class="blockquote mb-1">
                <p class="mb-0"><small><em>Wie knabbelt een cookie van dit huisje?</em></small></p>
            </blockquote>
            <figcaption class="blockquote-footer mb-0"><cite>Heks</cite></figcaption>
        </figure>
        <h2 id="kbCookiesTitel" class="h5">Cookies op deze website</h2>
        <p class="small">Deze website bewaart een paar kleine dingen op je apparaat om goed te werken. Daarnaast willen we graag met <strong>Google Analytics</strong> bijhouden hoe de site wordt gebruikt, maar alleen als jij daar toestemming voor geeft. Je kunt je keuze altijd wijzigen via <em>Cookies</em> onderaan de pagina of in het instellingenmenu (tandwiel).</p>

        <div class="kb-cookiegroep">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="kbCookiesNodig" checked disabled>
                <label class="form-check-label fw-semibold" for="kbCookiesNodig">Noodzakelijk</label>
            </div>
            <p class="small mb-1">Nodig om je voorkeuren te onthouden. Deze gegevens blijven op je apparaat en worden niet gedeeld. Staan altijd aan.</p>
            <details class="small">
                <summary>Bekijk wat er wordt opgeslagen</summary>${tabel(NOODZAKELIJK)}
            </details>
        </div>

        <div class="kb-cookiegroep">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="kbCookiesAnalyse">
                <label class="form-check-label fw-semibold" for="kbCookiesAnalyse">Analytisch (Google Analytics)</label>
            </div>
            <p class="small mb-1">Statistieken over het bezoek, zoals welke pagina's bekeken worden, hoe lang en met wat voor apparaat. Hiermee kan ik de site verbeteren. De gegevens worden verwerkt door Google. Staat uit, tenzij je hem aanzet.</p>
            <details class="small">
                <summary>Bekijk welke cookies Google Analytics plaatst</summary>${tabel(ANALYTISCH)}
            </details>
        </div>

        <div class="kb-cookieknoppen">
            <button type="button" class="btn btn-primary btn-sm" data-kb-cookiekeuze="weigeren">Weigeren</button>
            <button type="button" class="btn btn-primary btn-sm" data-kb-cookiekeuze="opslaan">Keuze opslaan</button>
            <button type="button" class="btn btn-primary btn-sm" data-kb-cookiekeuze="accepteren">Accepteren</button>
        </div>
    </div>`;
    }

    let banner;
    function maakBanner() {
        if (banner) return banner;
        const sjabloon = document.createElement('template');
        sjabloon.innerHTML = html().trim();
        banner = sjabloon.content.firstElementChild;
        document.body.appendChild(banner);
        banner.addEventListener('click', e => {
            const knop = e.target.closest('[data-kb-cookiekeuze]');
            if (!knop) return;
            const keuze = knop.getAttribute('data-kb-cookiekeuze');
            const analyse = keuze === 'accepteren' || (keuze === 'opslaan' && banner.querySelector('#kbCookiesAnalyse').checked);
            pasToe(analyse);
            verberg();
        });
        banner.addEventListener('keydown', e => { if (e.key === 'Escape' && leesKeuze()) verberg(); });
        return banner;
    }

    function pasToe(analyse) {
        bewaarKeuze(analyse ? 'accepted' : 'rejected');
        if (analyse) laadGA(); else stopGA();
    }

    function toon() {
        maakBanner();
        banner.querySelector('#kbCookiesAnalyse').checked = leesKeuze() === 'accepted';
        banner.hidden = false;
        banner.querySelector('#kbCookiesAnalyse').focus({ preventScroll: true });
    }

    function verberg() {
        if (banner) banner.hidden = true;
    }

    // Openen vanuit footer of instellingenmenu
    document.addEventListener('click', e => {
        const link = e.target.closest && e.target.closest('[data-kb-cookies]');
        if (!link) return;
        e.preventDefault();
        toon();
    });

    function start() {
        const keuze = leesKeuze();
        if (keuze === 'accepted') laadGA();
        else if (keuze !== 'rejected') toon();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    window.kbCookies = { toon };
})();
