# Bootstrap-bestanden

De site gebruikt Bootstrap 6 met de standaard breekpunten van Bootstrap 6: `sm` 576, `md` 768, `lg` 1024, `xl` 1280 en `2xl` 1536 px. De containers zijn daarbij 540, 720, 960, 1200 en 1440 px breed; 1440 px (de `2xl`-container) is de maximale breedte van de pagina's en de navigatie. Let op: dit zijn andere waarden dan in Bootstrap 5 (`lg` 992, `xl` 1200, `xxl` 1400).

## Klaarzetten

```terminal
npm install
npm run bootstrap:build
```

Dit kopieert `bootstrap.min.css` en `bootstrap.bundle.min.js` ongewijzigd uit het npm-pakket naar `assets/vendor/bootstrap-<versie>/`.

## Update naar een nieuwe Bootstrap-versie

1. Zet de versie van `bootstrap` in `package.json` op de nieuwe versie en voer `npm install` uit.
2. Voer `npm run bootstrap:build` uit.
3. Pas de verwijzing in `assets/js/bootstrap-global.js` en de `<link>` in de `.html`-bestanden aan naar de nieuwe mapnaam.
4. Lees de migratiegids op https://getbootstrap.com/docs/6.0/guides/migration/ en controleer alle pagina's.

## Eigen CSS

`assets/css/style.scss` wordt met Sass gecompileerd (`npx sass --style=compressed --no-source-map assets/css/style.scss assets/css/style.css`). Daarin staan vaste breekpunten (`min-width: 1024px` enzovoort) die gelijk moeten blijven aan die van Bootstrap.

De bundel is alleen geschikt voor browsers die Bootstrap 6 ondersteunt: Chrome en Edge 138, Firefox 147 en Safari 26 of nieuwer.
