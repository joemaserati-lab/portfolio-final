(() => {
  const STORAGE_KEY = 'portfolioLang';
  const FALLBACK_LANG = 'en';
  const MESSAGES = {
    en: {
       title: "Edoardo Rappanello — Graphic Design, Web & Marketing",
       description: "Portfolio of Edoardo Rappanello: graphic design, web design, visual identities and digital marketing across independent and in-house projects.",
      'boot.label': 'Loading portfolio',
      'boot.kicker': '',
      'boot.title': 'LOADING',
      'boot.readyTitle': 'PORTFOLIO READY',
      'boot.status': 'LOADING 3D / TYPE / INTERFACE',
      'boot.enter': 'CLICK TO ENTER',
      'boot.note': 'Touch interaction is enabled automatically on mobile.',
      'boot.fallbackStatus': 'SYSTEM READY / 3D DISABLED',
      'boot.fallbackNote': 'The portfolio is available without the 3D layer.',
      'boot.readyStatus': 'SYSTEM READY',
      'boot.readyNote': 'Touch + ambient motion mode is ready.',
      'boot.readyNoteDesktop': '',
      'hero.aria': 'Portfolio introduction',
      'hero.kicker': 'Welcome to my portfolio',
       'hero.copy': "For over five years, I have worked in graphic design, web and communication, designing and producing websites, advertising campaigns, and materials for print and events.",
      'hero.cta': 'ENTER SELECTED WORK',
       'scroll.home': "Home",
       'scroll.work': "Selected Works",
       'scroll.workMobile': "Works",
       'scroll.about': "About",
       'scroll.resume': "Resume",
       'scroll.contact': "Contact",
      'nav.aria': 'Portfolio sections',
      'nav.projects': 'PROJECTS',
      'nav.projectsSmall': '05 PROJECTS',
      'nav.about': 'ABOUT.TXT',
      'nav.aboutSmall': 'PROFILE',
      'nav.resume': 'RESUME.TXT',
      'nav.resumeSmall': 'CV',
      'nav.contact': 'CONTACT',
      'nav.contactSmall': 'EMAIL / LINKEDIN',
      'lang.label': 'Switch language',
      'privacy.button': 'PRIVACY / COOKIES',
      'privacy.title': 'PRIVACY / COOKIES',
      'privacy.copy': 'This site uses GA4 analytics only after consent. No advertising or profiling cookies are used. Language, privacy and analytics preferences are stored locally on your device.',
      'privacy.accept': 'ACCEPT ANALYTICS',
      'privacy.reject': 'REJECT ANALYTICS',
      'privacy.revoke': 'REVOKE CONSENT',
      'privacy.close': 'CLOSE',
      'privacy.status': 'ANALYTICS: NOT SET',
      'about.role': 'ROLE',
      'about.experience': 'EXPERIENCE',
      'about.focus': 'FOCUS',
      'resume.experience': 'EXPERIENCE',
      'resume.education': 'EDUCATION',
      'resume.capabilities': 'SKILLS',
       'resume.tools': "SOFTWARE & TOOLS",
       'portfolio.contactTitle': "GET IN TOUCH",
       'portfolio.contactCopy': "For projects, collaborations or professional opportunities, feel free to reach out by email or on LinkedIn.",
      'portfolio.portraitAlt': 'Portrait of Edoardo Rappanello',
      'portfolio.selectedWork': 'SELECTED<br>WORK',
      'portfolio.selectedWorkText': 'SELECTED WORK',
       'portfolio.ongoing': 'ONGOING',
      'portfolio.period': '2026-ONGOING',
       'portfolio.selectedCopy': "Five selected projects spanning web design, graphic design and ongoing corporate communication.",
      'portfolio.openProject': 'Open',
      'portfolio.viewProject': 'VIEW PROJECT',
      'window.projects': 'PROJECTS.DIR',
      'window.about': 'ABOUT.TXT',
      'window.contact': 'CONTACT.EXE',
      'window.resume': 'RESUME.TXT',
      'window.work': 'WORK',
      'window.restore': 'Restore',
      'window.maximize': 'Maximize',
      'window.restoreLabel': 'Restore window',
      'window.maximizeLabel': 'Maximize window',
      'window.back': 'Back',
      'window.backLabel': 'Go back',
      'window.close': 'Close',
      'window.closeLabel': 'Close window',
      'case.outputs': 'SELECTED OUTPUTS',
      'case.client': 'CLIENT',
      'case.role': 'ROLE',
      'case.deliverables': 'DELIVERABLES',
      'case.year': 'YEAR',
      'case.visitLive': 'VISIT LIVE SITE ↗',
      'case.notes': 'PROJECT NOTES',
      'case.context': 'CONTEXT',
      'case.direction': 'APPROACH',
      'case.gallery': 'Project media',
      'case.disciplines': 'DISCIPLINES',
      'case.nav': 'Project navigation',
      'case.previous': 'PREVIOUS PROJECT',
      'case.next': 'NEXT PROJECT',
      'idle.aria': 'Portfolio screensaver',
       'idle.title': "IDLE MODE.",
       'idle.copy': "The portfolio stays exactly where you left it.",
       'idle.resume': "MOVE / TAP / PRESS A KEY TO RESUME",
       'seo.about.title': "About — Edoardo Rappanello",
       'seo.about.description': "My background in graphic design, web and communication, from in-house marketing to independent design and development projects.",
       'seo.resume.title': "Resume — Edoardo Rappanello",
       'seo.resume.description': "Work experience, education, creative skills and tools across graphic design, web development, communication and digital marketing.",
       'seo.contact.title': "Contact — Edoardo Rappanello",
       'seo.contact.description': "Get in touch for graphic design, web design, communication projects, collaborations and professional opportunities.",
       'seo.work.title': "Selected Work — Edoardo Rappanello",
       'seo.work.description': "Explore five projects spanning web design, corporate visual identity, advertising, print and digital marketing.",
       'seo.project.tovadu.title': "Tovadù — Web Design & Development | Edoardo Rappanello",
       'seo.project.tovadu.description': "Website design, information architecture, content writing and front-end development for Tovadù, including a custom cursor and page transitions.",
       'seo.project.pholia.title': "Pholià — Visual Design & Three.js | Edoardo Rappanello",
       'seo.project.pholia.description': "Digital identity, web design and Three.js 3D cube for Pholià, with content architecture and front-end development.",
       'seo.project.sapy.title': "Sapy — Website Redesign | Edoardo Rappanello",
       'seo.project.sapy.description': "Redesign of Sapy's website into a clear, accessible multipage experience for teachers and education professionals.",
       'seo.project.colorcopy-large-format.title': "Colorcopy — Graphic Design & SEO | Edoardo Rappanello",
       'seo.project.colorcopy-large-format.description': "In-house graphic design, event communication, catalogues, visual identity and SEO for Colorcopy Large Format.",
       'seo.project.platinum-technologies.title': "Platinum Technologies — Brand Identity | Edoardo Rappanello",
       'seo.project.platinum-technologies.description': "In-house visual identity, editorial advertising, website redesign, SEO and digital marketing for Platinum Technologies.",
      '404.title': '404 — Edoardo Rappanello',
       '404.label': "404 / PAGE NOT FOUND",
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
       '404.copy': "The page you are looking for does not exist. Return to the homepage or explore the projects.",
       '404.home': "RETURN HOME",
       '404.projects': "OPEN PROJECTS.DIR"
    },
    it: {
       title: "Edoardo Rappanello — Graphic Design, Web & Marketing",
       description: "Portfolio di Edoardo Rappanello: graphic design, web design, identità visive e digital marketing tra progetti indipendenti e aziendali.",
      'boot.label': 'Caricamento portfolio',
      'boot.kicker': '',
      'boot.title': 'CARICAMENTO',
      'boot.readyTitle': 'PORTFOLIO PRONTO',
      'boot.status': 'CARICAMENTO 3D / TYPE / INTERFACCIA',
      'boot.enter': 'CLICCA PER ENTRARE',
      'boot.note': 'Su mobile l\'interazione touch è attiva automaticamente.',
      'boot.fallbackStatus': 'SISTEMA PRONTO / 3D DISATTIVATO',
      'boot.fallbackNote': 'Il portfolio è disponibile anche senza il livello 3D.',
      'boot.readyStatus': 'SISTEMA PRONTO',
      'boot.readyNote': 'Modalità touch + movimento ambient pronta.',
      'boot.readyNoteDesktop': '',
      'hero.aria': 'Introduzione al portfolio',
      'hero.kicker': 'Benvenuto nel mio portfolio',
       'hero.copy': "Da oltre cinque anni mi occupo di graphic design, web e comunicazione, progettando e realizzando siti web, campagne pubblicitarie e materiali per la stampa ed eventi.",
      'hero.cta': 'VEDI I LAVORI SELEZIONATI',
       'scroll.home': "Home",
       'scroll.work': "Progetti",
       'scroll.workMobile': "Progetti",
       'scroll.about': "Profilo",
       'scroll.resume': "CV",
       'scroll.contact': "Contatti",
      'nav.aria': 'Sezioni del portfolio',
      'nav.projects': 'PROGETTI',
      'nav.projectsSmall': '05 PROGETTI',
      'nav.about': 'PROFILO.TXT',
      'nav.aboutSmall': 'PROFILO',
      'nav.resume': 'CV.TXT',
      'nav.resumeSmall': 'CV',
      'nav.contact': 'CONTATTI',
      'nav.contactSmall': 'EMAIL / LINKEDIN',
      'lang.label': 'Cambia lingua',
      'privacy.button': 'PRIVACY / COOKIE',
      'privacy.title': 'PRIVACY / COOKIE',
      'privacy.copy': 'Il sito utilizza GA4 Analytics solo dopo il consenso. Non vengono utilizzati cookie pubblicitari o di profilazione. Le preferenze relative a lingua, privacy e analytics vengono salvate localmente sul dispositivo.',
      'privacy.accept': 'ACCETTA ANALYTICS',
      'privacy.reject': 'RIFIUTA ANALYTICS',
      'privacy.revoke': 'REVOCA CONSENSO',
      'privacy.close': 'CHIUDI',
      'privacy.status': 'ANALYTICS: NON IMPOSTATO',
      'about.role': 'RUOLO',
      'about.experience': 'ESPERIENZA',
      'about.focus': 'FOCUS',
      'resume.experience': 'ESPERIENZA',
      'resume.education': 'FORMAZIONE',
      'resume.capabilities': 'COMPETENZE',
       'resume.tools': "SOFTWARE & TOOLS",
       'portfolio.contactTitle': "GET IN TOUCH",
       'portfolio.contactCopy': "Per progetti, collaborazioni o opportunità professionali, puoi scrivermi via email oppure contattarmi su LinkedIn.",
      'portfolio.portraitAlt': 'Ritratto di Edoardo Rappanello',
      'portfolio.selectedWork': 'LAVORI<br>SELEZIONATI',
      'portfolio.selectedWorkText': 'LAVORI SELEZIONATI',
       'portfolio.ongoing': 'IN CORSO',
      'portfolio.period': '2026-IN CORSO',
       'portfolio.selectedCopy': "Cinque progetti selezionati tra web design, graphic design e comunicazione aziendale continuativa.",
      'portfolio.openProject': 'Apri',
      'portfolio.viewProject': 'VEDI PROGETTO',
      'window.projects': 'PROGETTI.DIR',
      'window.about': 'PROFILO.TXT',
      'window.contact': 'CONTATTI.EXE',
      'window.resume': 'CV.TXT',
      'window.work': 'LAVORO',
      'window.restore': 'Ripristina',
      'window.maximize': 'Massimizza',
      'window.restoreLabel': 'Ripristina finestra',
      'window.maximizeLabel': 'Massimizza finestra',
      'window.back': 'Indietro',
      'window.backLabel': 'Torna indietro',
      'window.close': 'Chiudi',
      'window.closeLabel': 'Chiudi finestra',
      'case.outputs': 'OUTPUT SELEZIONATI',
      'case.client': 'CLIENTE',
      'case.role': 'RUOLO',
      'case.deliverables': 'DELIVERABLE',
      'case.year': 'ANNO',
      'case.visitLive': 'VISITA IL SITO ↗',
      'case.notes': 'NOTE DI PROGETTO',
      'case.context': 'CONTESTO',
      'case.direction': 'APPROCCIO',
      'case.gallery': 'Media del progetto',
      'case.disciplines': 'DISCIPLINE',
      'case.nav': 'Navigazione progetti',
      'case.previous': 'PROGETTO PRECEDENTE',
      'case.next': 'PROGETTO SUCCESSIVO',
      'idle.aria': 'Salvaschermo del portfolio',
       'idle.title': "IN PAUSA.",
       'idle.copy': "Il portfolio rimane esattamente dove l'hai lasciato.",
       'idle.resume': "MUOVI / TOCCA / PREMI UN TASTO PER RIPRENDERE",
       'seo.about.title': "Profilo — Edoardo Rappanello",
       'seo.about.description': "Il mio percorso tra graphic design, web e comunicazione: attività di marketing interno, progetti indipendenti, formazione e approccio al design.",
       'seo.resume.title': "CV — Edoardo Rappanello",
       'seo.resume.description': "Esperienze professionali, formazione, competenze e strumenti per graphic design, web development, comunicazione e digital marketing.",
       'seo.contact.title': "Contatti — Edoardo Rappanello",
       'seo.contact.description': "Contattami per progetti di graphic design, web, comunicazione, collaborazioni e opportunità professionali.",
       'seo.work.title': "Progetti selezionati — Edoardo Rappanello",
       'seo.work.description': "Cinque progetti tra web design, identità visiva, advertising, stampa e digital marketing.",
       'seo.project.tovadu.title': "Tovadù — Web Design & Development | Edoardo Rappanello",
       'seo.project.tovadu.description': "Web design, architettura dei contenuti e sviluppo front-end per Tovadù, con custom cursor e transizioni tra pagine.",
       'seo.project.pholia.title': "Pholià — Visual Design & Three.js | Edoardo Rappanello",
       'seo.project.pholia.description': "Identità digitale, web design e cubo 3D sviluppato con Three.js per Pholià, con progettazione dei contenuti e sviluppo front-end.",
       'seo.project.sapy.title': "Sapy — Website Redesign | Edoardo Rappanello",
       'seo.project.sapy.description': "Redesign multipagina del sito Sapy per una comunicazione istituzionale, chiara e intuitiva rivolta agli insegnanti.",
       'seo.project.colorcopy-large-format.title': "Colorcopy — Graphic Design & SEO | Edoardo Rappanello",
       'seo.project.colorcopy-large-format.description': "Graphic design interno, eventi, cataloghi, identità visiva e SEO per Colorcopy Large Format.",
       'seo.project.platinum-technologies.title': "Platinum Technologies — Brand Identity | Edoardo Rappanello",
       'seo.project.platinum-technologies.description': "Brand identity, advertising editoriale, redesign web, SEO e digital marketing per Platinum Technologies.",
      '404.title': '404 — Edoardo Rappanello',
       '404.label': "404 / PAGE NOT FOUND",
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
       '404.copy': "La pagina che cerchi non esiste. Puoi tornare alla homepage oppure esplorare i progetti.",
       '404.home': "TORNA ALLA HOME",
       '404.projects': "APRI PROGETTI.DIR"
    }
  };

  const readStoredLang = () => {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  };
  const writeStoredLang = lang => {
    try { localStorage.setItem(STORAGE_KEY, lang); }
    catch {}
  };
  const detectLang = () => {
    const stored = readStoredLang();
    if (stored === 'it' || stored === 'en') return stored;
    const languages = [navigator.language || navigator.userLanguage || '', ...(navigator.languages || [])]
      .map(lang => String(lang).toLowerCase());
    // Browser language is enough here. Initialising Intl.DateTimeFormat solely
    // to inspect the timezone is disproportionately expensive on throttled mobile CPUs.
    return languages.some(lang => lang.startsWith('it')) ? 'it' : FALLBACK_LANG;
  };

  let currentLang = detectLang();

  function t(key) {
    return MESSAGES[currentLang]?.[key] || MESSAGES.en[key] || key;
  }

  function applyStatic(root = document) {
    document.documentElement.lang = currentLang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
      toggle.textContent = currentLang === 'it' ? 'EN' : 'IT';
      toggle.setAttribute('aria-label', `${toggle.textContent} — ${t('lang.label')}`);
    }
  }

  function setLang(lang, { persist = true } = {}) {
    const next = lang === 'it' ? 'it' : 'en';
    if (next === currentLang) return;
    currentLang = next;
    if (persist) writeStoredLang(currentLang);
    applyStatic();
    window.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { lang: currentLang } }));
  }

  window.PortfolioI18n = {
    t,
    get lang() { return currentLang; },
    setLang,
    toggle: () => setLang(currentLang === 'it' ? 'en' : 'it'),
    applyStatic,
    isTouchDevice: () => matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyStatic(), { once: true });
  else applyStatic();
})();