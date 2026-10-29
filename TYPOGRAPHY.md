# Regola tipografica del portfolio

Fonte unica per i ruoli e le misure: `public/css/typography.css`. Modalità selezionabile in `src/data/typography.mjs` impostando `typographyMode` su `'balanced'` oppure `'original'`. Il valore è condiviso dal layout Astro e dalla 404. Questo documento descrive la regola implementata. Tutti i moduli strutturali precedenti mantengono il loro ordine; il modulo tipografico viene applicato dopo di essi in sviluppo e nel bundle di produzione. La 404 usa lo stesso file con cache legata alla versione.

## Famiglie e pesi

- Redaction 50, normale 400: titolo di apertura, titoli editoriali di sezione, grande 404; in modalità `balanced` anche titolo del singolo case study. Fallback: Georgia e serif di sistema.
- Doto 400/500/600/700: navigazione, azioni, etichette, interfaccia CRT, lista progetti, loader, terminale e metadati. Fallback locale `Doto Fallback`, quindi Courier New e monospace di sistema.
- Inter 400/500/600: paragrafi, introduzioni, CV, dettagli dei progetti, privacy e sottotitoli informativi nella modalità `balanced`. Fallback: Helvetica Neue, Arial e sans-serif di sistema.
- `original` ripristina Doto per i testi informativi, i sottotitoli e il titolo del case study; tutte le altre misure e componenti restano invariati.
- Il contrasto si costruisce soprattutto con dimensione, interlinea, distanza e colore. Redaction case-title usa 400 reale, senza peso sintetico.

## Scala per ruolo

| Ruolo | Token | Dimensione | Interlinea | Impiego |
|---|---|---|---|---|
| Display | `--type-display` | 48–112 px desktop; 44–72 mobile; 32–44 landscape corto | 1 | Nome nella home |
| Titolo progetto | `--type-heading` nel case study | 32–40 px; 32 mobile | 1,18 | Redaction in `balanced`, Doto in `original` |
| Titolo sezione | `--type-heading` | 30–48 px | 1 | Profilo, CV, directory |
| Sottotitolo | `--type-subhead` | 20–26 px | 1,12 | Ruoli CV, output, titoli card, precedente/successivo |
| Introduzione | `--type-body-lg` | 18–20 px | 1,5 | Intro casi, home e CV; home landscape usa il corpo 16–18 |
| Lettura | `--type-body` | 16–18 px | 1,6 | Paragrafi, fatti progetto, privacy, 404, lettura statica |
| Controllo | `--type-ui` | 12–14 px | 1,3 | Navigazione, lingua, CTA, chrome, footer |
| Metadato | `--type-caption` | 11–12 px | 1,3 | Date, etichette, didascalie, discipline, status |
| Titolo loader | `--type-boot` | 28–48 px; 24–36 landscape corto | 1,12 | Titolo del gate di avvio |
| Terminale | `--type-ui` | 12–14 px | 1,5 | Output e prompt, senza riduzione per altezza |

Le dimensioni sono fluide all’interno dei limiti indicati, non scatti fra due valori. Gli alias storici `--type-reading`, `--type-lead`, `--type-small` ecc. puntano alla stessa scala; non definiscono gerarchie concorrenti. I metadati piccoli non possono essere usati per paragrafi professionali o istruzioni lunghe.

## Spaziatura, misura e colore

- Corpo Inter o Doto: tracking 0. Introduzioni: tracking 0. Metadati: tracking 0,04 em. Controlli: 0,015 em. Redaction display: −0,025 em.
- Testi lunghi: misura massima 62 caratteri; le colonne possono essere più corte. Non allungare il corpo per riempire tutta la larghezza disponibile.
- Titoli e contenuto principale: bianco `#F5F5F5`; descrizioni secondarie ed etichette: grigio `#B9B9B9`, secondo `monochrome-theme.css`. Mint resta un segnale di stato/focus, non un colore tipografico aggiuntivo per ogni livello.
- Maiuscolo limitato alle etichette e ai nomi già previsti dall’identità. I paragrafi restano in forma discorsiva. Non introdurre testo tutto maiuscolo per supplire a una gerarchia debole.

## Responsive e fitting

Il corpo non si riduce sotto 16 px, i controlli sotto 12 px e le didascalie sotto 11 px. L’altezza del viewport può contrarre solo display e titolo loader; per il testo si modifica la composizione o si lascia scorrere il contenuto.

Le parole lunghe nei titoli possono essere adattate dal fitting esistente: minimo 24 px per titoli, 16 px per sottotitoli/dati e 11 px per metadati. La home può adattare il nome fino a 32 px. Questi minimi sono token del medesimo file, letti da `fixes.js`; non numeri autonomi nel runtime. Il fitting non si applica ai paragrafi.

La 404 usa la scala generale per testo, azioni e metadati; il numero 404 è un display illustrativo dedicato (80–200 px). Il glifo DVD usa 100–158 px. Le icone costruite con caratteri, le pseudo-icone di chiusura e le dimensioni zero che nascondono il testo di un glifo sono geometria: non livelli di lettura.

## Regola per nuovi componenti

1. Assegnare una funzione fra i ruoli della tabella.
2. Usare il token corrispondente, senza nuove dimensioni in pixel o scale locali nei breakpoint.
3. Tenere famiglia, peso, leading e tracking nel modulo tipografico; mettere padding, griglie e dimensioni delle icone nel modulo strutturale.
4. Non aggiungere `!important` per ottenere un ruolo tipografico.
5. Verificare la leggibilità a 320×568 e 667×375, la CTA rispetto alla navigazione, le parole lunghe, IT/EN e il fallback senza JavaScript.

## Verifica

`node tests/typography-regression.mjs` verifica home, directory, Profilo, CV, Contatti, caso e 404 a 320×568, 390×844, 667×375 e 1440×900. Controlla minimi di lettura, interfaccia e caption, ruoli tipografici per entrambe le modalità, overflow e separazione CTA/navigazione. Le altre suite controllano avvio, media originali, focus, History API e parità fra CSS sorgente e bundle.
