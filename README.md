# Kleine Boodschap Data

Kleine Boodschap Data is een verzameling van verschillende interessante en minder interessante feiten over de podcast 'Kleine Boodschap'. Deze worden weergegeven door middel van datavisualisatie.

## Installatie

Het project kan je lokaal draaien op je computer, het is uitsluitend geschikt in de webbrowser. 

## Gebruik

Elke week wordt er een nieuwe aflevering van Kleine Boodschap gepubliceerd, het toevoegen van een aflevering aan de dataset gebeurd als volgt:

### Aflevering toevoegen
Zorg ervoor dat je node.js hebt geinstalleerd.

Voeg de data van een aflevering toe aan het afleveringen.csv bestand, begin op een nieuwe regel en voeg toe als volgt:

```csv
id,titel,tijd,datum,categorie
```
Navigeer vervolgens in een terminalvenster naar het project en voer volgend commando uit
```terminal
node convert.js
```


De afleveringen in de csv worden omgezet naar het episodes.json bestand. De grafieken en data op de index pagina gebruiken dit bestand als bron van de data, het is belangrijk dat dit bestand altijd beschikbaar is.

## Bijdragen

Pull requests zijn welkom. Voor grote veranderingen, open alsjeblieft eerst een probleem om te bespreken wat je zou willen veranderen.
