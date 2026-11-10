// Favoriete afleveringen op de Wrapped-pagina.
// De bezoeker klikt op het hartje bij een aflevering; per jaar wordt een lijstje bijgehouden
// (max. MAX stuks, in de volgorde van aanklikken). Dat lijstje kan als afbeelding gedeeld worden.
//
// Opslag: alleen in de browser van de bezoeker, localStorage 'kb-favorieten' = { "2025": [id, id, ...] }
//
// Voor wrapped.js:
//   kbFavorieten.knop(ep)           -> HTML voor het hartje in een tabelrij
//   kbFavorieten.toon(jaar, alle)   -> lijstje en voorbeeldafbeelding bijwerken voor dit jaar

(function () {
    const SLEUTEL = 'kb-favorieten';
    const MAX = 5;

    // De afbeelding heeft vaste kleuren (de wrapped-kleuren), los van licht/donker op de site
    const BEELD = {
        breedte: 1080,
        hoogte: 1350, // 4:5, past op Instagram, Bluesky, Facebook, LinkedIn en WhatsApp
        bg: '#0D3149',
        tekst: '#FFFFFF',
        muted: '#B8C4CC',
        accent: '#6FB0DC',
        lijn: 'rgba(255, 255, 255, .14)',
        cat: { achtergrond: '#6FB0DC', nieuws: '#F0A24B', interview: '#C49BCB', reportage: '#8BC48F' }
    };

    let jaar = null;
    let afleveringen = [];
    let melding = '';

    function leesAlles() {
        try {
            const data = JSON.parse(localStorage.getItem(SLEUTEL));
            return data && typeof data === 'object' ? data : {};
        } catch (e) {
            return {};
        }
    }

    // Werkt ook als opslag geblokkeerd is: dan alleen voor deze pagina
    let alles = leesAlles();

    function bewaar() {
        try {
            localStorage.setItem(SLEUTEL, JSON.stringify(alles));
        } catch (e) { /* bv. privévenster */ }
    }

    const lijst = () => (alles[jaar] || []).slice(0, MAX);
    const isFavoriet = id => lijst().includes(String(id));
    const aflevering = id => afleveringen.find(ep => String(ep.id) === String(id));

    function escape(tekst) {
        return String(tekst).replace(/[&<>"']/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[t]));
    }

    function knop(ep) {
        const aan = isFavoriet(ep.id);
        return `<button type="button" class="kb-hartje${aan ? ' is-favoriet' : ''}" data-favoriet="${escape(ep.id)}"
            aria-pressed="${aan}" aria-label="${aan ? 'Verwijder uit' : 'Voeg toe aan'} favorieten: ${escape(ep.titel)}">
            <i class="bi ${aan ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i></button>`;
    }

    function wissel(id) {
        id = String(id);
        const huidige = lijst();
        melding = '';
        if (huidige.includes(id)) {
            alles[jaar] = huidige.filter(i => i !== id);
        } else if (huidige.length >= MAX) {
            melding = `Je kunt maximaal ${MAX} favorieten kiezen. Haal er eerst een weg.`;
        } else {
            alles[jaar] = [...huidige, id];
        }
        if (!alles[jaar]?.length) delete alles[jaar];
        bewaar();
        werkHartjesBij();
        toonLijst();
    }

    function werkHartjesBij() {
        document.querySelectorAll('[data-favoriet]').forEach(btn => {
            if (btn.closest('#favorietenLijst')) return;
            const ep = aflevering(btn.dataset.favoriet);
            if (ep) btn.outerHTML = knop(ep);
        });
    }

    function toonLijst() {
        const doel = document.getElementById('favorietenLijst');
        if (!doel) return;
        const favorieten = lijst().map(aflevering).filter(Boolean);
        document.getElementById('favorietenAantal').textContent = `${favorieten.length}/${MAX}`;
        document.getElementById('favorietenMelding').textContent = melding;
        document.getElementById('favorietenMelding').classList.toggle('d-none', !melding);
        document.querySelectorAll('[data-favorieten-actie]').forEach(btn => { btn.disabled = !favorieten.length; });

        if (!favorieten.length) {
            doel.innerHTML = `<p class="kb-muted mb-0">Klik op het <i class="bi bi-heart" aria-hidden="true"></i> hartje bij een aflevering
                in de tabel hieronder om hem aan je favorieten van ${escape(jaar)} toe te voegen. Daarna kun je je lijstje als afbeelding delen.</p>`;
        } else {
            doel.innerHTML = `<ol class="kb-favorieten mb-0">${favorieten.map(ep => `
                <li>
                    <span class="badge ${escape(ep.categorie)} kb-wrapped-blokje">&nbsp;</span>
                    <span class="kb-favorieten-titel">${escape(ep.id)}: ${escape(ep.titel)}</span>
                    <button type="button" class="btn btn-sm btn-link kb-favorieten-weg" data-favoriet="${escape(ep.id)}"
                        aria-label="Verwijder ${escape(ep.titel)} uit favorieten"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
                </li>`).join('')}</ol>`;
        }
        tekenVoorbeeld(favorieten);
    }

    // ---------- Afbeelding ----------

    let logo = null;
    function laadLogo() {
        if (!logo) {
            logo = new Promise((ok, fout) => {
                const img = new Image();
                img.onload = () => {
                    // Het logo is zwart; maak er een witte versie van voor de donkere achtergrond
                    const c = document.createElement('canvas');
                    c.width = img.naturalWidth;
                    c.height = img.naturalHeight;
                    const ctx = c.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.fillStyle = BEELD.tekst;
                    ctx.fillRect(0, 0, c.width, c.height);
                    ok(c);
                };
                img.onerror = fout;
                img.src = 'assets/images/logo2.png';
            });
        }
        return logo;
    }

    function laadLetters() {
        if (!document.fonts) return Promise.resolve();
        return Promise.all([
            document.fonts.load('700 72px Alegreya'),
            document.fonts.load('600 40px Geist'),
            document.fonts.load('400 30px Geist')
        ]).catch(() => {});
    }

    // Breekt tekst af over max. 'regels' regels; de laatste regel krijgt zo nodig '…'
    function breekAf(ctx, tekst, breedte, regels) {
        const woorden = tekst.split(' ');
        const uit = [];
        let regel = '';
        for (let i = 0; i < woorden.length; i++) {
            const probeer = regel ? regel + ' ' + woorden[i] : woorden[i];
            if (ctx.measureText(probeer).width <= breedte || !regel) {
                regel = probeer;
                continue;
            }
            if (uit.length === regels - 1) {
                regel = probeer;
                break;
            }
            uit.push(regel);
            regel = woorden[i];
        }
        const rest = uit.length === regels - 1 && woorden.join(' ') !== [...uit, regel].join(' ');
        if (ctx.measureText(regel).width > breedte || rest) {
            while (regel.length && ctx.measureText(regel + '…').width > breedte) regel = regel.slice(0, -1);
            regel = regel.trimEnd() + '…';
        }
        uit.push(regel);
        return uit;
    }

    async function maakAfbeelding(favorieten) {
        const [beeldLogo] = await Promise.all([laadLogo(), laadLetters()]);
        const { breedte: B, hoogte: H } = BEELD;
        const marge = 80;
        const c = document.createElement('canvas');
        c.width = B;
        c.height = H;
        const ctx = c.getContext('2d');
        ctx.textBaseline = 'alphabetic';

        ctx.fillStyle = BEELD.bg;
        ctx.fillRect(0, 0, B, H);

        // Kop
        ctx.fillStyle = BEELD.accent;
        ctx.font = '600 34px Geist, system-ui, sans-serif';
        ctx.fillText(`KLEINE BOODSCHAP WRAPPED ${jaar}`, marge, 150);
        ctx.fillStyle = BEELD.tekst;
        ctx.font = '700 76px Alegreya, Georgia, serif';
        ctx.fillText('Mijn favoriete', marge, 240);
        ctx.fillText('afleveringen', marge, 320);

        // Lijst
        const boven = 390;
        const onder = H - 200;
        const n = favorieten.length;
        const rij = Math.min(200, (onder - boven) / n);
        const titelMaat = 38;
        const metaMaat = 26;
        const metaAfstand = 10;
        const nummerBreedte = 90;

        favorieten.forEach((ep, i) => {
            const y = boven + i * rij;
            ctx.fillStyle = BEELD.lijn;
            ctx.fillRect(marge, y, B - 2 * marge, 2);

            ctx.fillStyle = BEELD.cat[ep.categorie] || BEELD.accent;
            ctx.fillRect(marge, y + 22, 8, rij - 44);

            ctx.fillStyle = BEELD.tekst;
            ctx.font = '700 64px Alegreya, Georgia, serif';
            ctx.textAlign = 'center';
            const midden = y + rij / 2;
            ctx.fillText(String(i + 1), marge + 24 + nummerBreedte / 2, midden + 22);
            ctx.textAlign = 'left';

            const x = marge + 24 + nummerBreedte + 16;
            const tekstBreedte = B - marge - x;
            ctx.font = `600 ${titelMaat}px Geist, system-ui, sans-serif`;
            const regels = breekAf(ctx, ep.titel, tekstBreedte, 2);
            // Titel en metaregel als één blok verticaal gecentreerd in de rij
            const regelHoogte = titelMaat * 1.2;
            const blok = regels.length * regelHoogte + metaAfstand + metaMaat;
            const ty = midden - blok / 2 + titelMaat * 0.95;
            regels.forEach((r, j) => { ctx.fillText(r, x, ty + j * regelHoogte); });

            ctx.fillStyle = BEELD.muted;
            ctx.font = `400 ${metaMaat}px Geist, system-ui, sans-serif`;
            const categorie = ep.categorie.charAt(0).toUpperCase() + ep.categorie.slice(1);
            const metaY = midden - blok / 2 + regels.length * regelHoogte + metaAfstand + metaMaat * 0.85;
            ctx.fillText(`Aflevering ${ep.id} · ${categorie} · ${ep.tijd} min`, x, metaY);
        });
        ctx.fillStyle = BEELD.lijn;
        ctx.fillRect(marge, boven + n * rij, B - 2 * marge, 2);

        // Voet: logo en kbdata.nl
        const logoMaat = 96;
        const voetY = H - 80 - logoMaat;
        ctx.drawImage(beeldLogo, marge, voetY, logoMaat, logoMaat);
        ctx.fillStyle = BEELD.tekst;
        ctx.font = '600 44px Geist, system-ui, sans-serif';
        ctx.fillText('kbdata.nl', marge + logoMaat + 28, voetY + logoMaat / 2 + 16);
        ctx.fillStyle = BEELD.muted;
        ctx.font = '400 30px Geist, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('#kleineboodschap', B - marge, voetY + logoMaat / 2 + 12);
        ctx.textAlign = 'left';

        return c;
    }

    let voorbeeldUrl = null;
    let tekenRonde = 0;
    async function tekenVoorbeeld(favorieten) {
        const img = document.getElementById('favorietenVoorbeeld');
        if (!img) return;
        const ronde = ++tekenRonde;
        if (!favorieten.length) {
            img.closest('.kb-favorieten-voorbeeld').classList.add('d-none');
            return;
        }
        const c = await maakAfbeelding(favorieten);
        if (ronde !== tekenRonde) return; // inmiddels alweer gewijzigd
        const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
        if (voorbeeldUrl) URL.revokeObjectURL(voorbeeldUrl);
        voorbeeldUrl = URL.createObjectURL(blob);
        img.src = voorbeeldUrl;
        img.closest('.kb-favorieten-voorbeeld').classList.remove('d-none');
    }

    async function bestand() {
        const favorieten = lijst().map(aflevering).filter(Boolean);
        const c = await maakAfbeelding(favorieten);
        const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
        return new File([blob], `kleine-boodschap-wrapped-${jaar}-favorieten.png`, { type: 'image/png' });
    }

    function download(file) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    async function deel() {
        const file = await bestand();
        const data = {
            files: [file],
            title: `Mijn favoriete Kleine Boodschap-afleveringen van ${jaar}`,
            text: `Mijn favoriete afleveringen van Kleine Boodschap in ${jaar}. Maak je eigen lijstje op https://kbdata.nl/wrapped.html #kleineboodschap`
        };
        // Deelmenu van het apparaat (telefoon, Windows, macOS); anders gewoon downloaden
        if (navigator.canShare && navigator.canShare({ files: data.files })) {
            try {
                await navigator.share(data);
            } catch (e) {
                if (e.name !== 'AbortError') download(file);
            }
        } else {
            download(file);
        }
    }

    document.addEventListener('click', e => {
        const hartje = e.target.closest('[data-favoriet]');
        if (hartje) return wissel(hartje.dataset.favoriet);
        const actie = e.target.closest('[data-favorieten-actie]');
        if (!actie) return;
        if (actie.dataset.favorietenActie === 'deel') deel();
        else bestand().then(download);
    });

    window.kbFavorieten = {
        knop,
        toon(nieuwJaar, alle) {
            jaar = String(nieuwJaar);
            afleveringen = alle;
            melding = '';
            document.querySelectorAll('[data-favorieten-jaar]').forEach(el => { el.textContent = jaar; });
            toonLijst();
        }
    };
})();
