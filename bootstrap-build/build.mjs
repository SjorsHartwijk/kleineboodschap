// Zet de Bootstrap-bestanden van de site klaar vanuit het npm-pakket (ongewijzigd):
//   node_modules/bootstrap/dist/css/bootstrap.min.css   -> assets/vendor/bootstrap-<versie>/css/
//   node_modules/bootstrap/dist/js/bootstrap.bundle.min.js -> assets/vendor/bootstrap-<versie>/js/
// Gebruik: npm install && npm run bootstrap:build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(hier, '..');
const pakket = path.join(root, 'node_modules/bootstrap');
const versie = JSON.parse(fs.readFileSync(path.join(pakket, 'package.json'), 'utf8')).version;
const doel = path.join(root, 'assets/vendor', `bootstrap-${versie}`);

fs.mkdirSync(path.join(doel, 'css'), { recursive: true });
fs.mkdirSync(path.join(doel, 'js'), { recursive: true });
fs.copyFileSync(path.join(pakket, 'dist/css/bootstrap.min.css'), path.join(doel, 'css/bootstrap.min.css'));
fs.copyFileSync(path.join(pakket, 'dist/js/bootstrap.bundle.min.js'), path.join(doel, 'js/bootstrap.bundle.min.js'));
console.log(`Bootstrap ${versie} klaargezet in ${path.relative(root, doel)}`);
