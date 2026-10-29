# Tipografia del portfolio

La configurazione è in `src/data/typography.mjs`; i ruoli tipografici e le dimensioni si trovano in `public/css/typography.css` (ultimo modulo della cascata). Entrambe le viste Astro, inclusa la 404, leggono la stessa configurazione.

## Prova attuale — `doto-mono` (attiva)

- **Doto 700**: H1 della home, titoli di sezione, nomi dei case study e grande titolo 404. Titoli della directory e del loader in Doto 700; etichette, navigazione, CTA e metadati restano in Doto 500/600. La differenza di peso e scala costruisce l'impatto visivo senza aggiungere un terzo font.
- **Geist Mono 400/500/600**: paragrafi, introduzioni, informazioni professionali, sottotitoli descrittivi e testi dei case study, CV e privacy. Nessun asse pixel e nessuna modifica al testo.
- **Design preservato**: identiche palette, dimensioni minime, navigazione, funzionalità CRT/Three.js e struttura responsive. L'ampiezza massima dei testi lunghi è 58ch.

## Opzione A precedente — `pixel-editorial`

- **Geist Pixel Square**: H1 della home, titoli di sezione, titoli dei progetti nella directory e nei case study, sottotitoli editoriali e titoli del CV. Google Fonts contiene cinque texture nella famiglia `Geist Pixel`: Square si seleziona impostando `font-variation-settings: "ELSH" 1`. L'asse è assegnato ai ruoli di titolo e non al body.
- **Geist (Sans)**: paragrafi, introduzioni, lead, dati testuali, descrizioni dei case study, CV, privacy e collegamenti informativi di grandezza body.
- **Doto**: piccole etichette, numerazioni, controllo lingua, navigazione e CTA a dimensione UI, titlebar, terminale, metadati e didascalie. Non viene usato per i titoli editoriali e non viene usato nei paragrafi.

Scala condivisa per modalità: `--type-display`, `--type-heading`, `--type-project-title`, `--type-subhead`, `--type-body-lg`, `--type-body`, `--type-ui`, `--type-caption`. Restano la griglia esistente, la palette, gli effetti CRT e il fit mobile. Il testo descrittivo resta su una misura massima di circa 62ch e il body non scende sotto 16px.

Nota: Geist Pixel è progettato soprattutto per il display. Sui sottotitoli piccoli (20–22px) il dettaglio Square potrebbe essere meno evidente; verificare l'effetto a dimensioni reali prima di introdurre ulteriori modifiche.

## Rollback in un solo punto

Cambiare il valore seguente nel file `src/data/typography.mjs`:

```js
export const typographyMode = 'doto-mono';
```

Modalità precedenti ancora disponibili, senza cambiare CSS o template:

- `'pixel-editorial'`: Geist Pixel Square titoli + Geist Sans paragrafi + Doto UI (precedente versione pubblicata).
- `'digital'`: Doto display/interfaccia + Geist Pixel Square paragrafi.
- `'balanced'`: Redaction 50 display + Inter paragrafi + Doto UI.
- `'original'`: Redaction 50 display + Doto paragrafi/interfaccia.

Dopo la modifica occorre ricompilare e pubblicare il sito. Il sistema seleziona soltanto i webfont necessari alla modalità attiva; i file Redaction locali rimangono per le modalità precedenti.

## Controlli

`tests/typography-regression.mjs` verifica 320×568, 390×844, 667×375 e 1440×900, sulle pagine home, directory, profilo, CV, contatti, singolo progetto e 404. Controlla dimensioni minime, font-family per ruolo, peso Doto 700, asse Square dove previsto, caricamento dei webfont, overflow e distanze della CTA. I controlli IT/EN, la regressione dell'interfaccia e Lighthouse rimangono parte della CI. Le valutazioni estetiche e la resa su dispositivo reale richiedono una revisione visiva separata.
