# Tipografia del portfolio

La configurazione è in `src/data/typography.mjs`; i ruoli tipografici e le dimensioni si trovano in `public/css/typography.css` (ultimo modulo della cascata). Entrambe le viste Astro, inclusa la 404, leggono la stessa configurazione.

## Prova attuale — `doto-mono` (attiva)

- **Doto 700**: H1 della home, titoli di sezione, nomi dei case study e grande titolo 404. Titoli della directory e del loader in Doto 700; etichette, navigazione, CTA e metadati restano in Doto 500/600. La differenza di peso e scala costruisce l'impatto visivo senza aggiungere un terzo font.
- **JetBrains Mono 400**: paragrafi, introduzioni, informazioni professionali, testi descrittivi e testi dei case study, CV e privacy. Su desktop i testi di lettura usano 16 px e le introduzioni 17 px; su smartphone i minimi restano invariati.
- **Design preservato**: identiche palette, dimensioni minime, navigazione, funzionalità CRT/Three.js e struttura responsive. L'ampiezza massima dei testi lunghi è 58ch.

## Segni Doto rossi — sistema approvato

Il sistema usa quattro glifi tipografici in Doto: `.` come firma dei titoli, `•` prima dell'anno o di `IN CORSO` nei progetti e dei periodi nel CV, `[ ]` per incorniciare l'intera CTA della homepage, il caricamento e le località delle esperienze, `<>` negli altri collegamenti dove previsto. I progetti non mostrano più il vecchio indice `[02] • 2026`. L'etichetta attiva dei lavori su smartphone è `Works`, con testi della navigazione successiva allo scroll rossi. Il titolo `PARLIAMONE` perde il punto originale e mantiene il solo punto rosso generato dal CSS. **Questi glifi sono sempre rossi `#FF2D3A`, anche durante hover e focus**; il verde menta `#80FFCC` rimane riservato agli stati interattivi e alla testa 3D. La punteggiatura ordinaria di testi, email e URL non viene recolorata. Non sono aggiunte librerie di icone né animazioni.

`public/css/monochrome-theme.css` contiene esclusivamente il token e le regole colore dei segni; `public/css/typography.css` ne controlla la famiglia Doto, il peso e l'ingombro; `src/layouts/PortfolioShell.astro` ospita il punto della firma nella hero; `public/js/portfolio.js` costruisce gli indici e i metadati delle schede. I titoli dinamici e le CTA usano pseudo-elementi, così la traduzione IT/EN e i testi accessibili restano invariati. `tests/typography-regression.mjs` verifica il rosso dei glifi e la CTA.

## Opzione A precedente — `pixel-editorial`

- **Geist Pixel Square**: H1 della home, titoli di sezione, titoli dei progetti nella directory e nei case study, sottotitoli editoriali e titoli del CV. Google Fonts contiene cinque texture nella famiglia `Geist Pixel`: Square si seleziona impostando `font-variation-settings: "ELSH" 1`. L'asse è assegnato ai ruoli di titolo e non al body.
- **Geist (Sans)**: paragrafi, introduzioni, lead, dati testuali, descrizioni dei case study, CV, privacy e collegamenti informativi di grandezza body.
- **Doto**: piccole etichette, numerazioni, controllo lingua, navigazione e CTA a dimensione UI, titlebar, terminale, metadati e didascalie. Non viene usato per i titoli editoriali e non viene usato nei paragrafi.

Scala condivisa per modalità: `--type-display`, `--type-heading`, `--type-project-title`, `--type-subhead`, `--type-body-lg`, `--type-body`, `--type-ui`, `--type-caption`. Restano la griglia esistente, la palette, gli effetti CRT e il fit mobile. Il testo descrittivo resta su una misura massima di circa 62ch e il body non scende sotto 16px.

Nota: Geist Pixel è progettato soprattutto per il display. Sui sottotitoli piccoli (20–22px) il dettaglio Square potrebbe essere meno evidente; verificare l'effetto a dimensioni reali prima di introdurre ulteriori modifiche.

## Ruoli professionali e ritmo delle sezioni

Nella modalità `doto-mono`, **Doto** viene utilizzato anche per titoli dei ruoli professionali, nomi delle aziende, ruolo del profilo, responsabilità nei case study e nome del cliente. **JetBrains Mono** resta dedicato ai paragrafi, alle descrizioni dei progetti e ai testi informativi. Tutti i titoli, inclusi quelli informativi, usano Doto nella modalità attiva. Le etichette dell'interfaccia conservano Doto nei pesi già approvati.

La distribuzione dello whitespace riguarda Profilo, Lavori selezionati, CV, Contatti e tutti i case study, con misure e padding più generosi sui desktop e più compatti sui dispositivi mobili. I valori sono centralizzati in `public/css/portfolio-scroll.css`. La pulizia di testi ed elementi sarà affrontata separatamente, senza modifiche in questa fase.

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

## Scala semantica completa

Valori mobile → desktop; nessuna modifica ai testi, alla griglia o alle altre modalità.

| Ruolo | Token | Dimensione | Leading | Peso | Tracking |
| --- | --- | --- | --- | --- | --- |
| H1 | `--type-h1` | 44–68px | 1 / 1.18 | 700 | -.02em |
| H2 | `--type-h2` | 32–40px | 1 / 1.18 | 700 | -.02em |
| H3 | `--type-h3` | 20–22px | 1.3 | 600 | 0 |
| H4 | `--type-h4` | 18–20px | 1.18 | 700 | -.02em |
| H5 | `--type-h5` | 16–17px | 1.18 | 700 | -.02em |
| Lead | `--type-lead` | 17–19px | 1.5 | 400 | 0 |
| Paragrafo | `--type-body` | 16–17px | 1.6 | 400 | 0 |
| Small/caption | `--type-small` | 13px | 1.4 | 400 | 0 |
| Label/metadati | `--type-label` | 13px | 1.4 | 500 | .04em |
| Button | `--type-button` | 14px | 1.3 | 500 | .015em |

Heading, ruoli professionali e interfaccia: Doto. Lead, paragrafi e didascalie: JetBrains Mono. I selettori dei componenti mantengono le eccezioni ottiche esistenti: hero 44–68px, titoli del reader 32–40px, titoli progetto nella directory 23–26px, ruoli CV 20–22px (anche come H4), privacy 20–22px. Il titolo 404 conserva la scala scenografica dedicata. In landscape breve il display mantiene il fit precedente; il testo di lettura resta almeno 16px.

Gli `span` senza classe ereditano il contesto. Per nuovi contenuti usare `.type-lead`, `.type-body`, `.type-small`, `.type-caption`, `.type-label`, `.type-meta`, `.type-button` secondo il ruolo, mai una regola globale `span`. Non usare un livello heading per ottenere solo una dimensione. H4 e H5 sono disponibili senza introdurre titoli o testi artificiali. Nel CV interattivo: H2 titolo, H3 gruppi, H4 ruoli. Il reader conserva H1 pagina, H2 gruppi, H3 ruoli.

### Accessibilità e verifica

I test controllano scala H1–H5 strettamente decrescente, famiglia per ruolo, ereditarietà degli span, livelli CV consecutivi, heading non vuoti, minimo 16px per la lettura, overflow e separazione CTA/navigazione. La suite viene eseguita anche in italiano. I test boot verificano prima/seconda visita, reduced motion, progressbar, durata minima e fallback. Lighthouse in CI produce report di accessibilità; non equivale a una verifica completa con screen reader.

Rollback del solo intervento: revertire il commit della scala semantica. Il cambio `typographyMode` continua a selezionare le identità precedenti; dimensioni e semantica restano condivise. Nessuna pubblicazione viene effettuata dalla branch di design.
