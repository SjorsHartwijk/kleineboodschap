// Homepage: vandaag in het archief, kerncijfers, verdeling per categorie en records.
// De afleveringen komen via kbMijlpalen.laad() (mijlpalen.js), dus de tijden zijn al
// omgerekend naar de gekozen afspeelsnelheid (instellingen.js).

(function () {
    const M = window.kbMijlpalen;
    if (!M) return;
    const $ = id => document.getElementById(id);
    const CATEGORIEEN = ['nieuws', 'achtergrond', 'interview', 'reportage'];
    const hoofdletter = s => s.charAt(0).toUpperCase() + s.slice(1);
    const getal = n => n.toLocaleString('nl-NL');
    const veilig = s => String(s).replace(/[&<>"']/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[t]));

    function vandaagInHetArchief(afl) {
        const nu = new Date();
        $('todayDate').textContent = nu.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
        const eerder = afl
            .filter(ep => ep.datum.getMonth() === nu.getMonth() && ep.datum.getDate() === nu.getDate())
            .sort((a, b) => b.datum - a.datum);
        $('todayLeeg').hidden = eerder.length > 0;
        $('todayEpisodes').innerHTML = eerder.map(ep => `
            <li>
                <span class="kb-archief-jaar">${ep.datum.getFullYear()}</span>
                <span>
                    <span class="d-block fw-medium">${veilig(ep.titel)}</span>
                    <span class="kb-archief-meta"><span class="kb-legendablokje ${ep.categorie}" aria-hidden="true"></span>Aflevering ${ep.id} · ${ep.categorie}</span>
                </span>
            </li>`).join('');
    }

    function kerncijfers(afl) {
        const eerste = afl[0], laatste = afl[afl.length - 1];
        const minuten = afl.map(ep => ep.minuten);
        const totaal = minuten.reduce((s, m) => s + m, 0);
        const uren = Math.round(totaal / 60);
        const nu = new Date();
        let jaren = nu.getFullYear() - eerste.datum.getFullYear();
        if (nu < new Date(nu.getFullYear(), eerste.datum.getMonth(), eerste.datum.getDate())) jaren--;

        const cijfers = [
            { waarde: getal(afl.length), label: 'afleveringen', uitleg: `tot en met ${M.datum(laatste.datum)}` },
            { waarde: getal(uren), label: 'uur luistertijd', uitleg: `${Math.floor(uren / 24)} dagen en ${uren % 24} uur aan één stuk` },
            { waarde: getal(Math.round(totaal / afl.length)), label: 'minuten gemiddeld', uitleg: `van ${Math.round(Math.min(...minuten))} tot ${Math.round(Math.max(...minuten))} minuten` },
            { waarde: getal(jaren), label: 'jaar podcast', uitleg: `sinds ${M.datum(eerste.datum)}` },
        ];
        $('kbCijfers').innerHTML = cijfers.map(c => `
            <div class="kb-cijfer">
                <div class="kb-cijfer-waarde">${c.waarde}</div>
                <div class="kb-cijfer-label">${c.label}</div>
                <div class="kb-cijfer-uitleg">${c.uitleg}</div>
            </div>`).join('');
    }

    function perCategorie(afl) {
        const totaal = afl.length;
        const rijen = CATEGORIEEN.map(c => {
            const eps = afl.filter(ep => ep.categorie === c);
            const min = eps.reduce((s, ep) => s + ep.minuten, 0);
            return { c, aantal: eps.length, uren: Math.round(min / 60), pct: eps.length / totaal * 100 };
        }).sort((a, b) => b.aantal - a.aantal);
        const pct = r => r.pct.toFixed(1).replace('.', ',');

        const balk = $('kbVerdeelbalk');
        balk.setAttribute('aria-label', 'Verdeling per categorie: ' + rijen.map(r => `${r.c} ${pct(r)} procent`).join(', '));
        balk.innerHTML = rijen.map(r => `<span class="${r.c}" style="width:${r.pct.toFixed(2)}%"></span>`).join('');

        $('kbCategorieen').innerHTML = rijen.map(r => `
            <div class="col-12 col-sm-6 col-lg-3">
                <h4 class="h5 d-flex align-items-center gap-2 mb-2"><span class="kb-legendablokje ${r.c}" aria-hidden="true"></span>${hoofdletter(r.c)}</h4>
                <div class="kb-regel"><span>Afleveringen</span><span>${getal(r.aantal)}</span></div>
                <div class="kb-regel"><span>Luistertijd</span><span>${getal(r.uren)} uur</span></div>
                <div class="kb-regel"><span>Aandeel</span><span>${pct(r)}%</span></div>
            </div>`).join('');
    }

    function records(afl) {
        const opDuur = afl.slice().sort((a, b) => a.minuten - b.minuten);
        const blok = (soort, ep, top) => `
            <div class="col-12 col-lg-6">
                <div class="kb-record">
                    <div class="kb-record-getal">${Math.round(ep.minuten)}<small>min</small></div>
                    <div>
                        <div class="small kb-muted">${soort}</div>
                        <div class="fw-semibold">${veilig(ep.titel)}</div>
                        <div class="small kb-muted">Aflevering ${ep.id} · ${ep.categorie} · ${M.datum(ep.datum)}</div>
                        <details class="mt-2">
                            <summary class="small">Top 5</summary>
                            <ol>${top.map(t => `<li>${veilig(t.titel)} <span class="kb-muted">(${t.id}, ${Math.round(t.minuten)} min)</span></li>`).join('')}</ol>
                        </details>
                    </div>
                </div>
            </div>`;
        const langste = opDuur.slice(-5).reverse();
        const kortste = opDuur.slice(0, 5);
        $('kbRecords').innerHTML = blok('Langste aflevering', langste[0], langste) + blok('Kortste aflevering', kortste[0], kortste);
    }

    M.laad().then(afl => {
        if (!afl.length) return;
        vandaagInHetArchief(afl);
        kerncijfers(afl);
        perCategorie(afl);
        records(afl);
    }).catch(fout => console.error('Homepage kon niet geladen worden:', fout));
})();
