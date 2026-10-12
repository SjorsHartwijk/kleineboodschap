// Haalt nieuwe afleveringen op uit de RSS-feed van Kleine Boodschap, voegt ze toe aan
// afleveringen.csv en zet de csv om naar episodes.json. Daarna is er ruimte om gasten
// toe te voegen aan gasten.txt, en vraagt het script of de commit mag plaatsvinden.
//
//   node update.js               nieuwe afleveringen toevoegen, daarna vragen om te committen
//   node update.js --no-commit   alleen bestanden bijwerken, niet vragen om te committen
//   node update.js --check       bestaande data vergelijken met de feed (wijzigt niets)

const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const FEED = 'https://kleineboodschap.fireside.fm/rss';
const CSV = 'afleveringen.csv';
const GASTEN = 'gasten.txt';
const CATEGORIEEN = ['nieuws', 'achtergrond', 'interview', 'reportage'];

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const COMMIT = !args.includes('--no-commit');

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
}

// Datum in Nederlandse tijd, zodat een aflevering van maandag 00:30 niet op zondag valt
function datum(pubDate) {
  return new Date(pubDate).toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
}

function minuten(duur) {
  const delen = duur.split(':').map(Number);
  const sec = delen.reduce((tot, d) => tot * 60 + d, 0);
  return Math.round(sec / 60);
}

async function haalFeed() {
  const res = await fetch(FEED);
  if (!res.ok) throw new Error(`Feed ophalen mislukt: ${res.status}`);
  const xml = await res.text();
  return xml.split('<item>').slice(1).map(item => {
    const id = Number(tag(item, 'itunes:episode'));
    return {
      id,
      titel: tag(item, 'itunes:title').replace(/^\d+:\s*/, ''),
      tijd: minuten(tag(item, 'itunes:duration')),
      datum: datum(tag(item, 'pubDate')),
      tekst: tag(item, 'itunes:subtitle'),
    };
  }).filter(e => e.id).sort((a, b) => a.id - b.id);
}

// Minimale csv-parser die quotes rond titels met komma's begrijpt
function parseRegel(regel) {
  const velden = [];
  let huidig = '', inQuotes = false;
  for (let i = 0; i < regel.length; i++) {
    const c = regel[i];
    if (inQuotes) {
      if (c === '"' && regel[i + 1] === '"') { huidig += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else huidig += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { velden.push(huidig); huidig = ''; }
    else huidig += c;
  }
  velden.push(huidig);
  return velden;
}

function csvVeld(v) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function leesCsv() {
  const regels = fs.readFileSync(CSV, 'utf8').split(/\r?\n/).filter(r => r.trim());
  return regels.slice(1).map(r => {
    const [id, taal, titel, tijd, datum, categorie] = parseRegel(r);
    return { id: Number(id), taal, titel, tijd: Number(tijd), datum, categorie };
  });
}

// Doet een gok op basis van de titel en omschrijving; je kunt altijd zelf iets anders kiezen
function raadCategorie(e) {
  const t = (e.titel + ' ' + e.tekst).toLowerCase();
  if (/^(in gesprek met|mijmeren met|aan tafel met)/.test(e.titel.toLowerCase())) return 'interview';
  if (/nieuwsaflevering|nieuws/.test(t)) return 'nieuws';
  if (/opening|première|reportage|verslag/.test(t)) return 'reportage';
  return 'achtergrond';
}

// Leest antwoorden via een wachtrij, zodat ook doorgegeven invoer (bv. via een pipe) niet verloren gaat
function maakLezer() {
  const rl = readline.createInterface({ input: process.stdin });
  const regels = [];
  const wachtend = [];
  let gesloten = false;
  rl.on('line', regel => wachtend.length ? wachtend.shift()(regel) : regels.push(regel));
  rl.on('close', () => { gesloten = true; wachtend.splice(0).forEach(r => r(null)); });
  return {
    async vraag(tekst) {
      process.stdout.write(tekst);
      const regel = regels.length ? regels.shift()
        : gesloten ? null
        : await new Promise(resolve => wachtend.push(resolve));
      if (regel === null) throw new Error('\nInvoer afgebroken.');
      return regel.trim();
    },
    close: () => rl.close(),
  };
}

function controleer(feed, lokaal) {
  const perId = new Map(feed.map(e => [e.id, e]));
  const ids = lokaal.map(e => e.id);
  const dubbel = ids.filter((id, i) => ids.indexOf(id) !== i);
  const max = Math.max(...feed.map(e => e.id));
  const ontbreekt = [];
  for (let i = 1; i <= max; i++) if (!ids.includes(i)) ontbreekt.push(i);

  if (dubbel.length) console.log('Dubbele ids:', dubbel.join(', '));
  if (ontbreekt.length) console.log('Ontbrekende ids:', ontbreekt.join(', '));

  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const e of lokaal) {
    const f = perId.get(e.id);
    if (!f) continue;
    const verschil = [];
    if (norm(e.titel) !== norm(f.titel)) verschil.push(`titel "${e.titel}" → "${f.titel}"`);
    if (e.datum !== f.datum) verschil.push(`datum ${e.datum} → ${f.datum}`);
    if (Math.abs(e.tijd - f.tijd) > 1) verschil.push(`tijd ${e.tijd} → ${f.tijd}`);
    if (verschil.length) console.log(`${e.id}: ${verschil.join(', ')}`);
  }
}

async function main() {
  const feed = await haalFeed();
  const lokaal = leesCsv();

  if (CHECK) return controleer(feed, lokaal);

  const hoogste = Math.max(...lokaal.map(e => e.id));
  const nieuw = feed.filter(e => e.id > hoogste);
  if (!nieuw.length) {
    console.log(`Geen nieuwe afleveringen (laatste is ${hoogste}).`);
    return;
  }

  const rl = maakLezer();
  const regels = [];
  const metGasten = [];
  for (const e of nieuw) {
    console.log(`\n${e.id}: ${e.titel} (${e.datum}, ${e.tijd} min)`);
    const gok = raadCategorie(e);
    let categorie = '';
    while (!CATEGORIEEN.includes(categorie)) {
      categorie = (await rl.vraag(`  Categorie [${CATEGORIEEN.join('/')}] (Enter = ${gok}): `)) || gok;
    }
    const taal = (await rl.vraag('  Taal (Enter = nl): ')) || 'nl';
    let locatie = '';
    if (categorie === 'reportage' || categorie === 'achtergrond') {
      locatie = await rl.vraag('  Locatie als "lat, long" (Enter = geen): ');
    }
    const velden = [e.id, taal, csvVeld(e.titel), e.tijd, e.datum, categorie];
    if (locatie) velden.push(...locatie.split(',').map(s => s.trim()));
    regels.push(velden.join(','));
    if (categorie === 'achtergrond' || categorie === 'interview') metGasten.push(e);
  }

  const huidig = fs.readFileSync(CSV, 'utf8');
  const nl = huidig.includes('\r\n') ? '\r\n' : '\n';
  const scheiding = huidig.endsWith('\n') ? '' : nl;
  fs.writeFileSync(CSV, huidig + scheiding + regels.join(nl));
  console.log(`\n${nieuw.length} aflevering(en) toegevoegd aan ${CSV}.`);

  execSync('node convert.js', { stdio: 'inherit' });

  if (!COMMIT) {
    rl.close();
    console.log('\nGeen commit gemaakt (--no-commit).');
    return;
  }

  if (metGasten.length) {
    console.log(`\nLet op: deze aflevering(en) kunnen gasten hebben:`);
    metGasten.forEach(e => console.log(`  ${e.id}: ${e.titel}`));
    console.log(`Voeg de gasten nu onderaan ${GASTEN} toe (één per regel, als "Naam,") en sla het bestand op.`);
  }

  const laatste = nieuw[nieuw.length - 1];
  const bericht = nieuw.length === 1
    ? `Aflevering ${laatste.id}: ${laatste.titel}`
    : `Afleveringen ${nieuw[0].id} t/m ${laatste.id}`;

  let antwoord = '';
  while (!['j', 'n'].includes(antwoord)) {
    antwoord = (await rl.vraag(`\nMag de commit "${bericht}" plaatsvinden? (j/n): `)).toLowerCase();
  }
  rl.close();

  if (antwoord === 'n') {
    console.log('Geen commit gemaakt. De bestanden zijn wel bijgewerkt, je kunt later zelf committen.');
    return;
  }

  execSync(`git add ${CSV} episodes.json ${GASTEN}`, { stdio: 'inherit' });
  execSync('git commit -F -', { input: bericht, stdio: ['pipe', 'inherit', 'inherit'] });
  console.log(`Commit gemaakt: ${bericht}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
