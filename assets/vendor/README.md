# Bibliotheken van derden

Deze bestanden worden zelf gehost in plaats van via een CDN. Dat scheelt verbindingen naar andere servers en houdt bezoekersgegevens binnen de site. De versie staat in de mapnaam. Bij een update zet je een nieuwe map neer en pas je de verwijzingen in de `.html`-bestanden aan.

| Map | Bibliotheek | Licentie | Bron |
|---|---|---|---|
| `bootstrap-6.0.0-alpha.2` | Bootstrap 6.0.0-alpha.2 (css en js-bundle), klaargezet met `npm run bootstrap:build`, zie `bootstrap-build/README.md` | MIT | https://getbootstrap.com |
| `bootstrap-icons-1.13.1` | Bootstrap Icons 1.13.1 | MIT | https://icons.getbootstrap.com |
| `chartjs-4.6.1` | Chart.js 4.6.1 (UMD-build) | MIT | https://www.chartjs.org |
| `leaflet-1.9.4` | Leaflet 1.9.4 (alleen op kaart.html) | BSD-2-Clause | https://leafletjs.com |

De bestanden zijn ongewijzigd overgenomen uit de npm-pakketten (Bootstrap via `npm run bootstrap:build`, de overige via jsDelivr). De copyrightvermeldingen staan in de kop van elk bestand.
