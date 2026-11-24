// Bootstrap 6 is alleen nog een ES-module en zet geen `window.bootstrap` meer neer.
// Dit bestand importeert de bundel (met Floating UI) en maakt de componenten beschikbaar als
// `bootstrap.Dialog`, `bootstrap.Tab`, `bootstrap.Tooltip`, enzovoort, zodat de pagina's en
// scripts die erop leunen ongewijzigd kunnen blijven. Laden met <script type="module">.
//
// De bundel is groot en laadt een moment later dan gewone scripts. Code die Bootstrap meteen bij het
// laden van de pagina nodig heeft, wacht daarom op de gebeurtenis "bootstrap-klaar" op window:
//   window.bootstrap ? start() : addEventListener('bootstrap-klaar', start, { once: true });
import * as bootstrap from '../vendor/bootstrap-6.0.0-alpha.2/js/bootstrap.bundle.min.js';

window.bootstrap = bootstrap;
window.dispatchEvent(new Event('bootstrap-klaar'));
