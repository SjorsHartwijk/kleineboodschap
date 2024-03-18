const fs = require('fs');
const csv = require('csv-parser');

const csvFile = 'afleveringen.csv';
const jsonFile = 'episodes.json';
const data = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 4));
    console.log(`CSV-bestand "${csvFile}" is succesvol omgezet naar JSON-bestand "${jsonFile}".`);
  });