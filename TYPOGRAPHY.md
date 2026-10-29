# Sistema tipografico del portfolio

La fonte CSS è `public/css/typography.css`. La modalità attiva è definita una sola volta in `src/data/typography.mjs` e viene applicata sia alle pagine Astro sia alla pagina 404. Il modulo tipografico rimane l'ultimo CSS caricato, in sviluppo e nel bundle di produzione.

## Modalità e rollback

- **`digital` (pubblicata):** Doto per display, H1/H2, titoli e sottotitoli, directory progetti, UI, CTA e metadati. Geist Pixel **Square** per i paragrafi, le introduzioni, i dettagli dei case study, il CV e la privacy.
- **`balanced` (versione precedente):** Redaction 50 per i display e i titoli dei singoli progetti, Doto per l'interfaccia, Inter per i contenuti descrittivi.
- **`original` (prima versione):** Redaction 50 per i display; Doto per il resto dell'interfaccia e della lettura.

Per cambiare versione modificare solo:
```js
export const typographyMode = 'digital';
```
sostituendo `'digital'` con `'balanced'` oppure `'original'`. Pubblicare nuovamente. Non eliminare i font già registrati: servono per il rollback.

## Geist Pixel Square

Geist Pixel su Google Fonts è una singola famiglia variabile, la cui texture dipende dall'asse personalizzato `ELSH`. La variante **Square** corrisponde a `"ELSH" 1`. La configurazione è applicata centralmente tramite `--font-reading-settings` alle aree di lettura: non sono in uso altre texture.

È originariamente un carattere display; l'applicazione ai paragrafi è una scelta estetica sperimentale, da verificare soprattutto per CV e case study su smartphone. Fallback: `Courier New` / monospace in caso di assenza del webfont. Il caricamento resta `display=swap`.

## Scala e gerarchie

| Ruolo | Token | Configurazione |
|---|---|---|
| Hero principale | `--type-display` | 44–80 px, 32–44 px su landscape basso; Doto 600 |
| H2 di sezione | `--type-heading` | 32–40 px; Doto 600 |
| Titoli case study | `--type-heading` | 32–40 px; Doto 600 |
| Titoli card e sottotitoli | `--type-subhead`, `--type-project-title` | Doto 500–700 in base al ruolo |
| Introduzioni e lead | `--type-body-lg` | Geist Pixel Square 18–20 px, 18 px su mobile |
| Paragrafi | `--type-body` | Geist Pixel Square 17–19 px, 17 px su mobile |
| Navigazione e CTA | `--type-ui` | Doto 14 px |
| Caption e metadati | `--type-caption` | Doto 13 px |
| Terminale e loader | `--type-ui`, `--type-boot` | Doto |

Paragrafi con leading 1.6 e misura fino a 55ch nella modalità digitale. Tracciamento del display digitale 0, evitando un effetto di dispersione dei punti. La palette resta definita unicamente da `monochrome-theme.css`; nessuna modifica a CRT o layout è legata alla modalità.

## Test

`node tests/typography-regression.mjs` controlla la famiglia di carattere per ciascun ruolo, la texture Square, i minimi dimensionali, overflow e CTA su 320×568, 390×844, 667×375 e 1440×900 (IT/EN). Verificare anche l'effettivo rendering webfont e la lettura sul dispositivo reale: il solo font-family calcolato non prova che il webfont sia stato scaricato.
