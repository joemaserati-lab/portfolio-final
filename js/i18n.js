(() => {
  const STORAGE_KEY = 'portfolioLang';
  const FALLBACK_LANG = 'en';
  const MESSAGES = {
    en: {
      title: 'Edoardo Rappanello — Multidisciplinary Designer',
      description: 'Portfolio of Edoardo Rappanello. Graphic design, web and digital marketing across independent projects and ongoing communication work.',
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
      'hero.copy': 'I work across graphic design, web and digital marketing, with a focus on how each project works in context.',
      'hero.cta': 'ENTER SELECTED WORK',
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
      'resume.tools': 'TOOLS',
      'portfolio.contactTitle': "LET'S TALK.",
      'portfolio.contactCopy': 'For freelance work, collaborations or questions about a project, email me or find me on LinkedIn.',
      'portfolio.portraitAlt': 'Portrait of Edoardo Rappanello',
      'portfolio.selectedWork': 'SELECTED<br>WORK',
      'portfolio.selectedWorkText': 'SELECTED WORK',
      'portfolio.period': '2026-ONGOING',
      'portfolio.selectedCopy': 'Five projects covering independent websites and ongoing communication work.',
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
      '404.title': '404 — Edoardo Rappanello',
      '404.label': 'Page not found',
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
      '404.copy': 'The requested page does not exist. Return to the portfolio or open the project directory.',
      '404.home': 'RETURN HOME',
      '404.projects': 'OPEN PROJECTS.DIR'
    },
    it: {
      title: 'Edoardo Rappanello — Designer multidisciplinare',
      description: 'Portfolio di Edoardo Rappanello. Graphic design, web e digital marketing tra progetti indipendenti e comunicazione aziendale continuativa.',
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
      'hero.copy': 'Lavoro tra graphic design, web e digital marketing, con attenzione a come ogni progetto funziona nel proprio contesto.',
      'hero.cta': 'VEDI I LAVORI SELEZIONATI',
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
      'resume.tools': 'STRUMENTI',
      'portfolio.contactTitle': 'PARLIAMONE.',
      'portfolio.contactCopy': 'Per progetti freelance, collaborazioni o domande su uno dei lavori presenti nel portfolio puoi scrivermi via email o trovarmi su LinkedIn.',
      'portfolio.portraitAlt': 'Ritratto di Edoardo Rappanello',
      'portfolio.selectedWork': 'LAVORI<br>SELEZIONATI',
      'portfolio.selectedWorkText': 'LAVORI SELEZIONATI',
      'portfolio.period': '2026-IN CORSO',
      'portfolio.selectedCopy': 'Cinque progetti tra siti web indipendenti e attività di comunicazione continuativa.',
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
      '404.title': '404 — Edoardo Rappanello',
      '404.label': 'Pagina non trovata',
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
      '404.copy': 'La pagina richiesta non esiste. Torna al portfolio oppure apri la directory dei progetti.',
      '404.home': 'TORNA ALLA HOME',
      '404.projects': 'APRI PROGETTI.DIR'
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
    document.title = document.body?.classList.contains('not-found-body') ? t('404.title') : t('title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t('title'));
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t('description'));
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', t('title'));
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', t('description'));
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
      toggle.textContent = currentLang === 'it' ? 'EN' : 'IT';
      toggle.setAttribute('aria-label', t('lang.label'));
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

  window.addEventListener('portfolio:booted', () => {
    const bootTitle = document.querySelector('#boot-gate h2');
    if (!bootTitle) return;
    bootTitle.removeAttribute('data-i18n-html');
    bootTitle.textContent = t('boot.readyTitle');
  }, { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyStatic(), { once: true });
  else applyStatic();
})();