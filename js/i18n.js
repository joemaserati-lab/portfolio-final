(() => {
  const STORAGE_KEY = 'portfolioLang';
  const FALLBACK_LANG = 'en';
  const MESSAGES = {
    en: {
      title: 'Edoardo Rappanello — Multidisciplinary Designer',
      description: 'Portfolio of Edoardo Rappanello, a multidisciplinary designer working across design, web and digital marketing.',
      'boot.label': 'Loading portfolio',
      'boot.kicker': 'PORTFOLIO OS',
      'boot.title': 'LOADING',
      'boot.status': 'LOADING HEAD / TYPE / SIGNAL',
      'boot.enter': 'CLICK TO ENTER',
      'boot.note': 'Tilt interaction may request motion sensor access on mobile.',
      'boot.fallbackStatus': 'SYSTEM READY / 3D FALLBACK',
      'boot.fallbackNote': 'Click to enter. The portfolio remains available without the 3D layer.',
      'boot.readyStatus': 'SYSTEM READY',
      'boot.readyNote': 'Click to enter. Mobile tilt permission may be requested.',
      'boot.readyNoteDesktop': 'Click to enter.',
      'boot.readyNoteInsecure': 'Click to enter. Tilt requires HTTPS on mobile.',
      'boot.requestTilt': 'REQUESTING TILT ACCESS',
      'boot.requestTiltNote': 'Use the browser prompt to allow motion sensor interaction.',
      'hero.aria': 'Portfolio introduction',
      'hero.kicker': 'Welcome to my portfolio',
      'hero.copy': 'Multidisciplinary designer working across design, web and digital marketing, turning ideas into visual experiences with both creativity and reason.',
      'hero.cta': 'ENTER SELECTED WORK',
      'nav.aria': 'Portfolio sections',
      'nav.projects': 'PROJECTS',
      'nav.projectsSmall': '05 ITEMS',
      'nav.about': 'ABOUT.TXT',
      'nav.aboutSmall': 'PROFILE',
      'nav.resume': 'RESUME.TXT',
      'nav.resumeSmall': 'CV / PROFILE',
      'nav.archive': 'ARCHIVE',
      'nav.archiveSmall': '2024-2026',
      'nav.contact': 'CONTACT',
      'nav.contactSmall': 'TEXT ME :)',
      'lang.label': 'Switch language',
      'privacy.button': 'PRIVACY / COOKIES',
      'privacy.title': 'PRIVACY / COOKIES',
      'privacy.copy': 'This site can use GA4 analytics only after consent. No marketing cookies or profiling are used. Language, privacy and analytics preferences are stored locally.',
      'privacy.accept': 'ACCEPT ANALYTICS',
      'privacy.close': 'CLOSE',
      'privacy.status': 'LOCAL PREFERENCES ONLY',
      'about.role': 'ROLE',
      'about.experience': 'EXPERIENCE',
      'about.focus': 'FOCUS',
      'resume.experience': 'EXPERIENCE',
      'resume.education': 'EDUCATION',
      'resume.capabilities': 'CAPABILITIES',
      'resume.tools': 'TOOLS',
      'portfolio.contactTitle': "LET'S TALK.",
      'portfolio.contactCopy': 'Selected freelance projects, collaborations and creative opportunities.',
      'portfolio.portraitAlt': 'Portrait of Edoardo Rappanello',
      'portfolio.selectedWork': 'SELECTED<br>WORK',
      'portfolio.selectedWorkText': 'SELECTED WORK',
      'portfolio.period': '2026-ONGOING',
      'portfolio.selectedCopy': 'A selection of digital projects and ongoing corporate work across design, web and marketing.',
      'portfolio.openProject': 'Open',
      'portfolio.viewProject': 'VIEW PROJECT',
      'window.projects': 'PROJECTS.DIR',
      'window.about': 'ABOUT.TXT',
      'window.contact': 'CONTACT.EXE',
      'window.resume': 'RESUME.TXT',
      'window.archive': 'ARCHIVE.DIR',
      'window.work': 'WORK',
      'window.restore': 'Restore',
      'window.maximize': 'Maximize',
      'window.restoreLabel': 'Restore window',
      'window.maximizeLabel': 'Maximize window',
      'case.outputs': 'SELECTED OUTPUTS',
      'case.client': 'CLIENT',
      'case.role': 'ROLE',
      'case.deliverables': 'DELIVERABLES',
      'case.year': 'YEAR',
      'case.notes': 'PROJECT NOTES',
      'case.context': 'CONTEXT',
      'case.direction': 'DIRECTION',
      'case.gallery': 'Project media placeholders',
      'case.disciplines': 'DISCIPLINES',
      'case.nav': 'Project navigation',
      'case.previous': 'PREVIOUS PROJECT',
      'case.next': 'NEXT PROJECT',
      '404.title': '404 — Edoardo Rappanello',
      '404.label': 'Page not found',
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
      '404.copy': 'The requested path is outside the visual system. Return to the portfolio home or open the selected work directory.',
      '404.home': 'RETURN HOME',
      '404.projects': 'OPEN PROJECTS.DIR'
    },
    it: {
      title: 'Edoardo Rappanello — Designer Multidisciplinare',
      description: 'Portfolio di Edoardo Rappanello, designer multidisciplinare tra design, web e digital marketing.',
      'boot.label': 'Caricamento portfolio',
      'boot.kicker': 'PORTFOLIO OS',
      'boot.title': 'CARICAMENTO',
      'boot.status': 'CARICAMENTO HEAD / TYPE / SIGNAL',
      'boot.enter': 'CLICCA PER ENTRARE',
      'boot.note': 'L\'interazione tilt puo richiedere l\'accesso ai sensori di movimento su mobile.',
      'boot.fallbackStatus': 'SISTEMA PRONTO / FALLBACK 3D',
      'boot.fallbackNote': 'Clicca per entrare. Il portfolio resta disponibile anche senza livello 3D.',
      'boot.readyStatus': 'SISTEMA PRONTO',
      'boot.readyNote': 'Clicca per entrare. Su mobile potrebbe essere richiesta l\'autorizzazione al tilt.',
      'boot.readyNoteDesktop': 'Clicca per entrare.',
      'boot.readyNoteInsecure': 'Clicca per entrare. Il tilt su mobile richiede HTTPS.',
      'boot.requestTilt': 'RICHIESTA ACCESSO TILT',
      'boot.requestTiltNote': 'Usa il prompt del browser per abilitare i sensori di movimento.',
      'hero.aria': 'Introduzione al portfolio',
      'hero.kicker': 'Benvenuto nel mio portfolio',
      'hero.copy': 'Lavoro tra design, web e digital marketing per trasformare idee in esperienze visive curate, funzionali e orientate agli obiettivi.',
      'hero.cta': 'VEDI SELECTED WORK',
      'nav.aria': 'Sezioni del portfolio',
      'nav.projects': 'PROJECTS',
      'nav.projectsSmall': '05 ITEMS',
      'nav.about': 'ABOUT.TXT',
      'nav.aboutSmall': 'PROFILO',
      'nav.resume': 'RESUME.TXT',
      'nav.resumeSmall': 'CV / PROFILO',
      'nav.archive': 'ARCHIVE',
      'nav.archiveSmall': '2024-2026',
      'nav.contact': 'CONTACT',
      'nav.contactSmall': 'SCRIVIMI :)',
      'lang.label': 'Cambia lingua',
      'privacy.button': 'PRIVACY / COOKIE',
      'privacy.title': 'PRIVACY / COOKIE',
      'privacy.copy': 'Il sito puo usare GA4 solo dopo consenso. Non uso cookie marketing o profilazione. Lingua, privacy e preferenze analytics vengono salvate localmente.',
      'privacy.accept': 'ACCETTA ANALYTICS',
      'privacy.close': 'CHIUDI',
      'privacy.status': 'SOLO PREFERENZE LOCALI',
      'about.role': 'RUOLO',
      'about.experience': 'ESPERIENZA',
      'about.focus': 'FOCUS',
      'resume.experience': 'ESPERIENZA',
      'resume.education': 'FORMAZIONE',
      'resume.capabilities': 'COMPETENZE',
      'resume.tools': 'STRUMENTI',
      'portfolio.contactTitle': 'LET\'S TALK.',
      'portfolio.contactCopy': 'Progetti freelance selezionati, collaborazioni e opportunita creative.',
      'portfolio.portraitAlt': 'Ritratto di Edoardo Rappanello',
      'portfolio.selectedWork': 'SELECTED<br>WORK',
      'portfolio.selectedWorkText': 'SELECTED WORK',
      'portfolio.period': '2026-ONGOING',
      'portfolio.selectedCopy': 'Una selezione di progetti digitali e lavoro corporate continuativo tra design, web e marketing.',
      'portfolio.openProject': 'Apri',
      'portfolio.viewProject': 'VEDI PROGETTO',
      'window.projects': 'PROJECTS.DIR',
      'window.about': 'ABOUT.TXT',
      'window.contact': 'CONTACT.EXE',
      'window.resume': 'RESUME.TXT',
      'window.archive': 'ARCHIVE.DIR',
      'window.work': 'WORK',
      'window.restore': 'Ripristina',
      'window.maximize': 'Massimizza',
      'window.restoreLabel': 'Ripristina finestra',
      'window.maximizeLabel': 'Massimizza finestra',
      'case.outputs': 'SELECTED OUTPUTS',
      'case.client': 'CLIENTE',
      'case.role': 'RUOLO',
      'case.deliverables': 'DELIVERABLES',
      'case.year': 'ANNO',
      'case.notes': 'NOTE DI PROGETTO',
      'case.context': 'CONTESTO',
      'case.direction': 'DIREZIONE',
      'case.gallery': 'Placeholder media del progetto',
      'case.disciplines': 'DISCIPLINES',
      'case.nav': 'Navigazione progetti',
      'case.previous': 'PROGETTO PRECEDENTE',
      'case.next': 'PROGETTO SUCCESSIVO',
      '404.title': '404 — Edoardo Rappanello',
      '404.label': 'Pagina non trovata',
      '404.kicker': 'PORTFOLIO OS / ROUTE ERROR',
      '404.copy': 'Il percorso richiesto e fuori dal sistema visivo. Torna alla home del portfolio o apri la directory Selected Work.',
      '404.home': 'TORNA ALLA HOME',
      '404.projects': 'APRI PROJECTS.DIR'
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
    const languages = [navigator.language || navigator.userLanguage || '', ...(navigator.languages || [])].map(lang => String(lang).toLowerCase());
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return languages.some(lang => lang.startsWith('it')) || timeZone === 'Europe/Rome' ? 'it' : FALLBACK_LANG;
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyStatic(), { once: true });
  else applyStatic();
})();
