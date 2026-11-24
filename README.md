# Spēļu kaste v7

Spēle 15 + Koka Bloki kā bezsaistes PWA. Bez būvēšanas soļa: tīrs HTML/CSS/JS, jāliek uz jebkuru **HTTPS** hostingu (service worker `file://` nestrādā).

## Struktūra
| Fails | Kas tas ir |
|---|---|
| `index.html`, `hub.css` | Sākuma ekrāns |
| `spele15.html/.css/.js` | Spēle 15 |
| `koka-bloki.html/.css/.js` | Koka Bloki |
| `shared.css`, `shared.js` | Kopīgais: fonts, dienas/nakts režīms, drošs `localStorage` (`SK`), SW reģistrācija + "Pieejama jauna versija" |
| `sw.js` | Service worker (versija tikai šeit) |
| `manifest.json` | PWA manifests (stabils `id: "./"`, bez `?v=`) |
| `fonts/` | Fredoka (OFL licence), lokāli: `latin` + `latin-ext` (latviešu burti) |
| `icon-*.png/svg` | Ikonas: `any`, `maskable`, **`monochrome`** (tematiskā ikona), `apple-touch-icon.png` |
| `tests/smoke.js` | Automātiskie testi |

## Jaunas versijas izlaišana
1. Izmaini failus.
2. `sw.js` ielaboj **tikai** `const VERSION = '7.0.1'`; ja pievienoji jaunu failu, ieraksti to `ASSETS`.
3. Augšupielādē. Lietotājam parādīsies josla "Pieejama jauna versija — Atjaunināt".

## Testi
```
npm install
npx playwright install chromium
npm test
```
Pārbauda: nav JS kļūdu, nav ārējo pieprasījumu, bezsaistes režīms, fonts, Spēle 15 (tastatūra, uzvara, bojāts saglabājums), Koka Bloki (vilkšana, atjaunošana).

## Tematiskā (monohromā) ikona Android ierīcēs
Android krāso tikai instalētas lietotnes ikonu, kuras manifestā ir `purpose: "monochrome"` ikona — to Chrome iegult lietotnes "WebAPK" pakotnē **instalēšanas brīdī**. Tāpēc:
1. **Izdzēs veco "Spēļu kaste" no sākuma ekrāna** (turēt → Atinstalēt).
2. Atver lapu Chrome → izvēlne ⋮ → **Instalēt lietotni**.
3. Android iestatījumos jābūt ieslēgtām *Tapetes un stils → Tematiskās ikonas*.
(`id` manifestā mainījās no `./?app=spelu-kaste-v6` uz `./`, tāpēc Chrome tāpat uzskatīs to par jaunu lietotni.)

## Kas mainīts pret v6
**Kļūdas:** Koka Bloki avarēja ielādē (`rafPending` TDZ); šūpošanās efektā fons un bloki kustējās pretēji; `touch-action:none` bloķēja ritināšanu tēmu sarakstā.
**PWA:** stabils `id`; fonts lokāli (iepriekš bezsaistē CSS netika kešots); PNG `apple-touch-icon`; jauna, tīra monohromā ikona (iepriekšējai bija tikai 0/255 alfa, bez izlīdzināšanas); SW ar stale-while-revalidate, kešs bez query string, atjaunināšana tikai pēc lietotāja piekrišanas.
**Robustums:** viss `localStorage` caur `SK` (`try/catch` + atmiņas rezerve); saglabātā Spēle 15 tiek validēta; Spēles 15 pauze vairs nepiesārņo vēsturi.
**Spēle:** Spēles 15 taimeris pēc `performance.now()`, tastatūras vadība (bultiņas, Esc), ARIA; Koka Bloku figūru ģenerators garantē vismaz vienu ievietojamu figūru; "Atsaukt" vairs nepaaugstina rekordu; āmura "tīrs laukums +300" izmantošana novērsta; skaņas iestatījums tiek saglabāts.
**Veiktspēja:** Koka bloku "sprite" kešs (gradients vairs netiek veidots katrā kadrā); animācijas neatkarīgas no kadru ātruma (`dt`); `ResizeObserver`; Pointer Events (viens pirksts, `setPointerCapture`).
**Pieejamība:** `prefers-reduced-motion`, fokusa kontūras, paslēpti pārklājumi vairs nav fokusējami.
**Valoda:** "Combo" → "Sērija", vienots "āmurs".
