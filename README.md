# Kleine Boodschap Data

Kleine Boodschap Data is een verzameling van verschillende interessante en minder interessante feiten over de podcast 'Kleine Boodschap'. Deze worden weergegeven door middel van datavisualisatie.

## Installatie

Het project kan je lokaal draaien op je computer, het is uitsluitend geschikt in de webbrowser. 

## Gebruik

Elke week wordt er een nieuwe aflevering van Kleine Boodschap gepubliceerd, het toevoegen van een aflevering aan de dataset gebeurd als volgt:

### Aflevering toevoegen (automatisch)
Het script `update.js` haalt nieuwe afleveringen op uit de RSS-feed van Kleine Boodschap (https://kleineboodschap.fireside.fm/rss). Titel, duur en datum komen uit de feed; categorie, taal en locatie vul je zelf in.

**Eenmalig voorbereiden**
1. Installeer [node.js](https://nodejs.org) versie 18 of hoger (controleer met `node -v`).
2. Open een terminal in de projectmap en installeer de afhankelijkheden:
   ```terminal
   npm install
   ```

**Elke week, na een nieuwe aflevering**
1. Open een terminal in de projectmap en voer uit:
   ```terminal
   node update.js
   ```
2. Het script toont per nieuwe aflevering het nummer, de titel, de datum en de duur, en stelt een paar vragen:
   - **Categorie**: kies uit `nieuws`, `achtergrond`, `interview` of `reportage`. Tussen haakjes staat een gok van het script; druk op Enter om die over te nemen of typ zelf een categorie.
   - **Taal**: druk op Enter voor `nl`, of typ `en` voor een Engelstalige aflevering.
   - **Locatie** (alleen bij achtergrond en reportage): typ de coördinaten als `51.6497, 5.0435` of druk op Enter als er geen locatie is.
3. Het script voegt de aflevering(en) toe aan `afleveringen.csv` en zet die om naar `episodes.json`.
4. Is het een achtergrond- of interviewaflevering, dan herinnert het script je eraan om gasten toe te voegen. Laat de terminal openstaan, voeg de gasten onderaan `gasten.txt` toe (één per regel in het formaat `Voornaam Achternaam,`) en sla het bestand op.
5. Het script vraagt daarna of de commit mag plaatsvinden, bijvoorbeeld `Aflevering 528: Titel van de aflevering`:
   - Typ `j` om te committen. `afleveringen.csv`, `episodes.json` en `gasten.txt` worden samen in één commit gezet.
   - Typ `n` om niet te committen. De bestanden blijven wel bijgewerkt, zodat je later zelf kunt committen.
6. Push de commit naar GitHub zodat de website wordt bijgewerkt:
   ```terminal
   git push
   ```

Is er geen nieuwe aflevering, dan meldt het script `Geen nieuwe afleveringen` en verandert er niets.

**Extra opties**
- `node update.js --no-commit` werkt de bestanden bij en slaat de vraag om te committen over.
- `node update.js --check` vergelijkt de bestaande data met de feed en wijzigt niets. Let op: een aantal verschillen is bewust. De datums volgen niet de feed, en bij enkele titels bevat de feed zelf een typefout (zoals 243 "Lavelaar" en 388 "Almo Nieto") of is onze titel uitgebreider (86, 210, 229 en 418).

### Aflevering toevoegen (handmatig)
Zorg ervoor dat je node.js hebt geinstalleerd.

Voeg de data van een aflevering toe aan het afleveringen.csv bestand, begin op een nieuwe regel en voeg toe als volgt:

```csv
id,taal,titel,tijd,datum,categorie,latitude,longitude
```
Navigeer vervolgens in een terminalvenster naar het project en voer volgend commando uit
```terminal
node convert.js
```


De afleveringen in de csv worden omgezet naar het episodes.json bestand. De grafieken en data op de index pagina gebruiken dit bestand als bron van de data, het is belangrijk dat dit bestand altijd beschikbaar is.

### Navigatie en footer
De navigatie bovenaan, de mobiele navigatie en de footer staan op één plek: `assets/js/layout.js`. Een pagina toevoegen aan het menu doe je door die toe te voegen aan de lijst `paginas` in dat bestand. In elke pagina staan alleen placeholders:

```html
<div data-layout="nav"></div>
<script src="assets/js/layout.js"></script>
...
<div data-layout="mobile-nav"></div>
<div data-layout="footer"></div>
```

De knop naar Wrapped wordt automatisch alleen getoond van 1 januari t/m eind februari (en altijd op de Wrapped-pagina zelf).

## Bijdragen

Pull requests zijn welkom. Voor grote veranderingen, open alsjeblieft eerst een probleem om te bespreken wat je zou willen veranderen.
