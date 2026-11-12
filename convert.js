const fs = require('fs');
const csv = require('csv-parser');

const csvFile = 'afleveringen.csv';
const jsonFile = 'episodes.json';
const data = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    // Lege velden (geen locatie, geen gasten) laten we weg, zodat episodes.json compact blijft
    for (const veld of Object.keys(row)) if (row[veld] === '' || row[veld] === undefined) delete row[veld];
    // Gasten staan in de csv als "Naam; Naam" en worden in de json een lijst
    if (row.gasten) row.gasten = row.gasten.split(';').map(n => n.trim()).filter(Boolean);
    data.push(row);
  })
  .on('end', () => {
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 4));
    console.log(`CSV-bestand "${csvFile}" is succesvol omgezet naar JSON-bestand "${jsonFile}".`);
  });