# Lettertypes

| Bestand | Lettertype | Gebruik |
|---|---|---|
| `alegreya-normal-*.woff2`, `alegreya-italic-*.woff2` | Alegreya (variabel, gewicht 400–900) | koppen en grote getallen |
| `geist-normal-*.woff2` | Geist (variabel, gewicht 100–900) | lopende tekst |

- **Tekensets.** Alleen `latin` en `latin-ext` zijn opgenomen. De browser laadt het `latin-ext`-bestand pas als er zo'n teken op de pagina staat; zie de `unicode-range` in `assets/css/style.scss`.
- **Preload.** De twee meest gebruikte bestanden, `geist-normal-latin` en `alegreya-normal-latin`, worden in elke pagina vooraf geladen met `<link rel="preload">`.
- **Licentie.** Beide lettertypes vallen onder de SIL Open Font License 1.1: https://openfontlicense.org. Ze mogen vrij gebruikt en meegeleverd worden, maar niet los verkocht.
  - Alegreya: © The Alegreya Project Authors (https://github.com/huertatipografica/Alegreya).
  - Geist: © Vercel (https://github.com/vercel/geist-font).
- **Herkomst.** De bestanden zijn ongewijzigd overgenomen van Google Fonts (fonts.gstatic.com).
