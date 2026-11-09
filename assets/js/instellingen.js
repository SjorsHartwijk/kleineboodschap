// Afspeelsnelheid (0,5x t/m 3,0x, standaard 1,0x) voor alle pagina's.
// Dit script staat in de <head>, vóór alle andere scripts.
//
// De snelheid wordt per bezoeker bewaard in de cookie 'kb-snelheid' (1 jaar geldig).
// Alle tijden op de site komen uit episodes.json; dit script past het veld 'tijd' (minuten)
// van elke aflevering aan voordat een pagina de data krijgt: tijd = duur / snelheid,
// afgerond op hele minuten. Zo kloppen alle statistieken, tabellen en grafieken
// automatisch met de gekozen snelheid.
//
// Voor scripts:
//   kbSnelheid.waarde()      -> huidige snelheid, bv. 1.5
//   kbSnelheid.zet(1.5)      -> snelheid kiezen, bewaren en de pagina opnieuw laden
//   kbSnelheid.formatteer(x) -> '1,5×'

(function () {
    const COOKIE = 'kb-snelheid';
    const MIN = 0.5, MAX = 3, STAP = 0.1, STANDAARD = 1;

    function begrens(waarde) {
        const getal = Math.round(parseFloat(String(waarde).replace(',', '.')) / STAP) * STAP;
        if (!isFinite(getal)) return STANDAARD;
        return Math.min(MAX, Math.max(MIN, Math.round(getal * 10) / 10));
    }

    function leesCookie() {
        try {
            const deel = document.cookie.split('; ').find(c => c.startsWith(COOKIE + '='));
            return deel ? begrens(decodeURIComponent(deel.split('=')[1])) : STANDAARD;
        } catch (e) {
            return STANDAARD;
        }
    }

    function bewaarCookie(waarde) {
        try {
            if (waarde === STANDAARD) {
                document.cookie = COOKIE + '=; Max-Age=0; Path=/; SameSite=Lax';
            } else {
                const veilig = location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = COOKIE + '=' + waarde + '; Max-Age=31536000; Path=/; SameSite=Lax' + veilig;
            }
        } catch (e) { /* cookies geblokkeerd: dan alleen voor deze pagina */ }
    }

    const snelheid = leesCookie();

    function formatteer(waarde) {
        return waarde.toFixed(1).replace('.', ',') + '×';
    }

    // episodes.json onderscheppen en de tijden omrekenen
    if (snelheid !== STANDAARD && window.fetch) {
        const origineel = window.fetch.bind(window);
        window.fetch = function (bron, opties) {
            const url = typeof bron === 'string' ? bron : (bron && bron.url) || '';
            const isAfleveringen = /(^|\/)episodes\.json$/.test(url.split(/[?#]/)[0]);
            const antwoord = origineel(bron, opties);
            if (!isAfleveringen) return antwoord;
            return antwoord.then(res => {
                if (!res.ok) return res;
                return res.clone().json().then(data => {
                    if (!Array.isArray(data)) return res;
                    const omgerekend = data.map(ep => {
                        const minuten = parseFloat(ep.tijd);
                        if (!isFinite(minuten)) return ep;
                        return Object.assign({}, ep, { tijd: String(Math.max(1, Math.round(minuten / snelheid))) });
                    });
                    return new Response(JSON.stringify(omgerekend), {
                        status: res.status,
                        statusText: res.statusText,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }).catch(() => res);
            });
        };
    }

    // Elk element met data-kb-snelheid-notitie krijgt een korte toelichting als de
    // snelheid niet 1,0x is (en blijft anders verborgen). Zet er zelf 'hidden' op.
    function vulNotities() {
        if (snelheid === STANDAARD) return;
        document.querySelectorAll('[data-kb-snelheid-notitie]').forEach(el => {
            el.textContent = `Alle tijden zijn omgerekend naar jouw afspeelsnelheid van ${formatteer(snelheid)}.`;
            el.hidden = false;
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vulNotities);
    else vulNotities();

    window.kbSnelheid = {
        MIN, MAX, STAP, STANDAARD,
        waarde: () => snelheid,
        formatteer,
        zet(nieuw) {
            const waarde = begrens(nieuw);
            if (waarde === snelheid) return;
            bewaarCookie(waarde);
            // Alle data op de pagina is met de oude snelheid berekend: opnieuw laden
            location.reload();
        },
    };
})();
