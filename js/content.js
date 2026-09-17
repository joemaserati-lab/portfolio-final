(() => {
  const EN = {
    profile: {
      name: 'EDOARDO RAPPANELLO',
      role: 'GRAPHIC DESIGNER & DIGITAL MARKETING SPECIALIST',
      experience: '4+ YEARS',
      email: 'edoardo.rappanello@gmail.com',
      linkedin: 'https://www.linkedin.com/in/edoardorappanello/',
      intro: [
        'My background combines design, communication and marketing. I studied Marketing and Communication before graduating with honours in Web Design & Artistic Communication for Business at the Academy of Fine Arts in Brescia.',
        'Since 2022, I have worked with companies in the professional large-format printing industry. My role covers graphic design, corporate communication, websites, digital campaigns, analytics and online visibility.',
        'Most projects move across more than one channel. A product launch can involve a web page, advertising, email, social content, printed material and event communication. Working across those stages made me interested in what happens to design after the mockup, when it has to function inside an actual company.',
        'Alongside my main role, I work on independent web projects, from interface design and content structure to front-end implementation.',
        'I use AI tools when they are useful for production, prototyping or development. They are part of the process, not the direction.'
      ],
      focus: ['GRAPHIC DESIGN', 'WEB', 'DIGITAL MARKETING']
    },

    resume: {
      title: 'RESUME',
      intro: 'Selected experience, education and tools used across graphic design, web and digital marketing.',
      experience: [
        {
          period: '2023-NOW',
          role: 'GRAPHIC DESIGNER & DIGITAL MARKETING SPECIALIST',
          company: 'COLORCOPY LARGE FORMAT / PLATINUM TECHNOLOGIES',
          location: 'ITALY',
          description: [
            'Graphic design and digital communication for companies operating in professional large-format printing.',
            'My work includes websites, product launches, advertising, editorial content, newsletters, social communication, printed material, trade-show graphics, SEO and analytics.'
          ]
        },
        {
          period: '2026',
          role: 'FREELANCE WEB DESIGN & DEVELOPMENT',
          company: 'PHOLIÀ / TOVADÙ / SAPY',
          location: 'ITALY',
          description: 'Design and development of independent websites, covering information structure, interface design and front-end implementation.'
        },
        {
          period: '2022',
          role: 'GRAPHIC DESIGNER',
          company: 'SWS PRINTING',
          location: 'BRESCIA, ITALY',
          description: 'Graphic design and production for print and visual communication.'
        },
        {
          period: '2021',
          role: 'UI DESIGNER - INTERNSHIP',
          company: 'BBS SOFTWARE',
          location: 'BRESCIA, ITALY',
          description: 'Interface design and visual support for software products.'
        },
        {
          period: '2018',
          role: 'GRAPHIC DESIGNER - INTERNSHIP',
          company: 'COVERSTORE',
          location: 'BRESCIA, ITALY',
          description: 'Graphic design and production support.'
        },
        {
          period: '2018',
          role: 'GRAPHIC DESIGNER & SOCIAL MEDIA - INTERNSHIP',
          company: 'BRANDITY LAB',
          location: 'BRESCIA, ITALY',
          description: 'Graphic design and social content production.'
        }
      ],
      education: [
        {
          period: '2019-2022',
          course: 'WEB DESIGN & ARTISTIC COMMUNICATION FOR BUSINESS',
          school: 'ACADEMY OF FINE ARTS - BRESCIA, ITALY',
          description: '110/110 CUM LAUDE. Studies focused on web design, visual communication and digital media. Final thesis on blockchain, NFTs and their effect on the internet.'
        },
        {
          period: '2016-2018',
          course: 'MARKETING & COMMUNICATION',
          school: 'ITS MACHINA LONATI',
          description: 'Marketing, communication and business fundamentals.'
        }
      ],
      capabilities: ['GRAPHIC & VISUAL DESIGN','WEB DESIGN','DIGITAL MARKETING','DIGITAL ADVERTISING','CORPORATE COMMUNICATION','SEO','ANALYTICS','3D VISUALIZATION','AI-ASSISTED PRODUCTION'],
      tools: ['ADOBE CREATIVE CLOUD','WORDPRESS / ELEMENTOR','HTML / CSS / JAVASCRIPT','GOOGLE ADS','META ADS','GOOGLE ANALYTICS 4','GOOGLE SEARCH CONSOLE','3D DESIGN TOOLS','GENERATIVE AI TOOLS']
    },

    projects: [
      {
        id:'01', slug:'tovadu', title:'TOVADÙ', displayTitle:'TOVADÙ', type:'Digital Experience', year:'2026', client:'Tovadù',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A B2B website for a consulting company working on digital transformation and business technology.',
        context:'Tovadù deals with services that become technical very quickly. The website had to explain what the company does without forcing visitors to understand its internal terminology first.',
        direction:'I structured the content around the problems a potential client is likely to recognise before introducing services and technical expertise. The interface follows the same logic: information is divided into clear levels so users can understand the offer before moving into detail.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','B2B COMMUNICATION'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'INFORMATION ARCHITECTURE'},
          {type:'portrait',label:'DIGITAL DESIGN'},
          {type:'portrait',label:'B2B COMMUNICATION'},
          {type:'wide',label:'FRONT-END IMPLEMENTATION'}
        ]
      },
      {
        id:'02', slug:'pholia', title:'PHOLIÀ', displayTitle:'PHOLIÀ', type:'Digital Experience', year:'2026', client:'Pholià',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A website for a company working across innovation, strategy and intangible assets.',
        context:'Pholià brings together subjects that normally belong to different professional areas. The website therefore had to explain each one separately without making the company look like a collection of unrelated services.',
        direction:'I designed the site around a modular content structure. Each area has enough space to develop its own subject while remaining part of the same visual and navigational system. The hierarchy introduces the company first and lets users move into more specialised content when needed.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','VISUAL SYSTEMS'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'MODULAR CONTENT'},
          {type:'portrait',label:'VISUAL SYSTEMS'},
          {type:'portrait',label:'DIGITAL IDENTITY'},
          {type:'wide',label:'FRONT-END IMPLEMENTATION'}
        ]
      },
      {
        id:'03', slug:'sapy', title:'SAPY', displayTitle:'SAPY', type:'Digital Experience', year:'2026', client:'Sapy',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A digital project built around the use of artificial intelligence in education.',
        context:'Sapy introduces AI as a tool for teachers. The website needed to explain what the product does before asking users to understand the technology behind it.',
        direction:'I separated product information, editorial content and the broader project into distinct parts of the site. The interface keeps the technology visible without making it the subject of every page. The priority is understanding what users can actually do with the platform.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','AI / EDTECH'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'AI / EDTECH'},
          {type:'portrait',label:'PRODUCT INFORMATION'},
          {type:'portrait',label:'EDITORIAL CONTENT'},
          {type:'wide',label:'FRONT-END IMPLEMENTATION'}
        ]
      },
      {
        id:'04', slug:'platinum-technologies', title:'PLATINUM TECHNOLOGIES', displayTitle:'PLATINUM\nTECHNOLOGIES', type:'Corporate Communication', year:'ONGOING', client:'Platinum Technologies',
        role:'Graphic Design / Digital Marketing / Web Management', deliverables:'Corporate Design / Web / Campaigns / Editorial / Events',
        intro:'Ongoing communication work for a company operating in industrial large-format printing.',
        context:'Platinum Technologies communicates machines, applications and technical subjects to different audiences. The same product can appear in a technical article, a campaign, a trade-show graphic, a landing page or a sales presentation. Each format needs a different amount of information while still belonging to the same brand.',
        direction:'My work covers several parts of that system: graphic design, websites, advertising, editorial content and event communication. The objective is practical consistency. Product information, visual identity and commercial priorities have to remain recognisable when the format changes.',
        tags:['GRAPHIC DESIGN','DIGITAL MARKETING','WEB MANAGEMENT','EDITORIAL DESIGN','ADVERTISING','EVENT COMMUNICATION','SEO & ANALYTICS'],
        outputs:[
          {title:'CORPORATE COMMUNICATION',description:'Brochures, presentations, advertising and materials used across corporate and commercial communication.'},
          {title:'PLATINUM INSIDE',description:'An editorial format covering products, applications, case studies and technical subjects.'},
          {title:'WEB',description:'Product pages, landing pages and editorial content for the corporate website.'},
          {title:'CAMPAIGNS',description:'Creative material and landing experiences for paid media and direct communication.'},
          {title:'EVENTS',description:'Digital, printed and physical communication for trade shows, open houses and technical events.'}
        ],
        media:[
          {type:'hero',label:'CORPORATE DESIGN / WEB / CAMPAIGNS'},
          {type:'landscape',label:'EDITORIAL SYSTEM'},
          {type:'portrait',label:'EVENT COMMUNICATION'},
          {type:'portrait',label:'DIGITAL CAMPAIGNS'},
          {type:'wide',label:'ONGOING COMMUNICATION'}
        ]
      },
      {
        id:'05', slug:'colorcopy-large-format', title:'COLORCOPY LARGE FORMAT', displayTitle:'COLORCOPY\nLARGE FORMAT', type:'Corporate Communication', year:'ONGOING', client:'Colorcopy Large Format',
        role:'Graphic Design / Digital Marketing / Web Management', deliverables:'Graphic Design / Web / Advertising / Social / Print / Events',
        intro:'Ongoing visual and digital communication for a company selling professional printing technologies from different manufacturers.',
        context:'Colorcopy manages a broad range of products, brands and customer profiles. Communication changes constantly between product launches, commercial campaigns, events and technical content. The challenge is keeping the company recognisable without forcing every manufacturer or technology into the same visual format.',
        direction:'I work across the different channels used by the company: website, advertising, email, social communication, printed material and events. Each output responds to a specific commercial need, while typography, structure and recurring visual elements keep the communication connected.',
        tags:['GRAPHIC DESIGN','WEB DESIGN','WEB MANAGEMENT','DIGITAL MARKETING','ADVERTISING','SOCIAL CONTENT','PRINT DESIGN','EVENT COMMUNICATION','SEO & ANALYTICS'],
        outputs:[
          {title:'PRODUCT COMMUNICATION',description:'Brochures, catalogues and promotional material for different products and manufacturers.'},
          {title:'WEB',description:'Product pages, landing pages and content designed for information and lead generation.'},
          {title:'ADVERTISING',description:'Creative material for paid social and search campaigns.'},
          {title:'SOCIAL / CONTENT',description:'Visual and editorial content for product launches, events and ongoing company communication.'},
          {title:'EMAIL MARKETING',description:'Newsletters and direct campaigns for products, events and commercial initiatives.'},
          {title:'EVENTS',description:'Digital and printed material for trade shows, open houses and customer events.'}
        ],
        media:[
          {type:'hero',label:'GRAPHIC DESIGN / WEB / ADVERTISING'},
          {type:'landscape',label:'PRODUCT COMMUNICATION'},
          {type:'portrait',label:'SOCIAL / CONTENT'},
          {type:'portrait',label:'EMAIL MARKETING'},
          {type:'wide',label:'ONGOING COMMUNICATION'}
        ]
      }
    ],

    archive: {
      title: 'ARCHIVE',
      eyebrow: 'SELF-INITIATED WORK / STUDIES / EXPERIMENTS',
      description: 'Independent work, visual studies and experiments that do not belong in the main project selection.',
      status: ['CURRENTLY BEING ORGANISED.']
    }
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const IT = clone(EN);

  Object.assign(IT.profile, {
    role: 'GRAPHIC DESIGNER & DIGITAL MARKETING SPECIALIST',
    intro: [
      'Il mio percorso unisce design, comunicazione e marketing. Ho studiato Marketing e Comunicazione prima di laurearmi con lode in Web Design e Comunicazione Artistica per l\'Impresa all\'Accademia di Belle Arti di Brescia.',
      'Dal 2022 lavoro con aziende che operano nella stampa professionale di grande formato. Mi occupo di graphic design, comunicazione corporate, siti web, campagne digitali, analytics e visibilità online.',
      'La maggior parte dei progetti coinvolge più di un canale. Il lancio di un prodotto può richiedere una pagina web, advertising, email, contenuti social, materiali stampati e comunicazione per eventi. Lavorare su più fasi dello stesso progetto mi ha portato a interessarmi soprattutto a ciò che succede al design quando esce dal mockup e deve funzionare dentro un\'azienda reale.',
      'Parallelamente lavoro su progetti web indipendenti, dalla progettazione dell\'interfaccia e della struttura dei contenuti fino all\'implementazione front-end.',
      'Utilizzo strumenti AI quando sono utili per produzione, prototipazione o sviluppo. Fanno parte del processo, non della direzione del progetto.'
    ],
    focus: ['GRAPHIC DESIGN', 'WEB', 'DIGITAL MARKETING']
  });

  Object.assign(IT.resume, {
    title: 'CV',
    intro: 'Esperienza, formazione e strumenti utilizzati tra graphic design, web e digital marketing.',
    capabilities: ['GRAPHIC & VISUAL DESIGN','WEB DESIGN','DIGITAL MARKETING','DIGITAL ADVERTISING','COMUNICAZIONE CORPORATE','SEO','ANALYTICS','VISUALIZZAZIONE 3D','PRODUZIONE AI-ASSISTED'],
    tools: ['ADOBE CREATIVE CLOUD','WORDPRESS / ELEMENTOR','HTML / CSS / JAVASCRIPT','GOOGLE ADS','META ADS','GOOGLE ANALYTICS 4','GOOGLE SEARCH CONSOLE','STRUMENTI DI DESIGN 3D','STRUMENTI DI AI GENERATIVA']
  });

  IT.resume.experience[0].location = 'ITALIA';
  IT.resume.experience[0].description = [
    'Graphic design e comunicazione digitale per aziende che operano nella stampa professionale di grande formato.',
    'Il mio lavoro comprende siti web, lanci prodotto, advertising, contenuti editoriali, newsletter, social, materiali stampati, comunicazione fieristica, SEO e analytics.'
  ];
  IT.resume.experience[1].role = 'FREELANCE WEB DESIGN & DEVELOPMENT';
  IT.resume.experience[1].location = 'ITALIA';
  IT.resume.experience[1].description = 'Design e sviluppo di siti web indipendenti, dalla struttura dei contenuti alla progettazione dell\'interfaccia e all\'implementazione front-end.';
  IT.resume.experience[2].location = 'BRESCIA, ITALIA';
  IT.resume.experience[2].description = 'Graphic design e produzione per stampa e comunicazione visiva.';
  IT.resume.experience[3].role = 'UI DESIGNER - STAGE';
  IT.resume.experience[3].location = 'BRESCIA, ITALIA';
  IT.resume.experience[3].description = 'Progettazione di interfacce e supporto visuale per prodotti software.';
  IT.resume.experience[4].role = 'GRAPHIC DESIGNER - STAGE';
  IT.resume.experience[4].location = 'BRESCIA, ITALIA';
  IT.resume.experience[4].description = 'Graphic design e supporto alla produzione.';
  IT.resume.experience[5].role = 'GRAPHIC DESIGNER & SOCIAL MEDIA - STAGE';
  IT.resume.experience[5].location = 'BRESCIA, ITALIA';
  IT.resume.experience[5].description = 'Graphic design e produzione di contenuti social.';
  IT.resume.education[0].course = 'WEB DESIGN E COMUNICAZIONE ARTISTICA PER L\'IMPRESA';
  IT.resume.education[0].school = 'ACCADEMIA DI BELLE ARTI - BRESCIA';
  IT.resume.education[0].description = '110/110 E LODE. Percorso dedicato a web design, comunicazione visiva e media digitali. Tesi finale su blockchain, NFT e il loro impatto su Internet.';
  IT.resume.education[1].course = 'MARKETING & COMUNICAZIONE';
  IT.resume.education[1].description = 'Fondamenti di marketing, comunicazione e gestione d\'impresa.';

  const projectCopy = {
    tovadu: {
      type:'Esperienza Digitale',
      role:'Web Design / Sviluppo',
      deliverables:'Sito web / UX / UI / Sviluppo',
      intro:'Un sito B2B per una società di consulenza che lavora su trasformazione digitale e tecnologie per le imprese.',
      context:'I servizi di Tovadù diventano rapidamente tecnici. Il sito doveva spiegare cosa fa l\'azienda senza chiedere all\'utente di conoscere prima la terminologia utilizzata internamente.',
      direction:'Ho strutturato i contenuti partendo dai problemi che un potenziale cliente può riconoscere, introducendo servizi e competenze tecniche solo in un secondo momento. L\'interfaccia segue la stessa logica: le informazioni sono organizzate su più livelli per permettere di comprendere l\'offerta prima di entrare nel dettaglio.',
      tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','COMUNICAZIONE B2B'],
      media:[
        {type:'hero',label:'SITO WEB / UX / UI / SVILUPPO'},
        {type:'landscape',label:'ARCHITETTURA INFORMATIVA'},
        {type:'portrait',label:'DIGITAL DESIGN'},
        {type:'portrait',label:'COMUNICAZIONE B2B'},
        {type:'wide',label:'IMPLEMENTAZIONE FRONT-END'}
      ]
    },
    pholia: {
      type:'Esperienza Digitale',
      role:'Web Design / Sviluppo',
      deliverables:'Sito web / UX / UI / Sviluppo',
      intro:'Un sito per una realtà che opera tra innovazione, strategia e asset intangibili.',
      context:'Pholià riunisce temi che normalmente appartengono ad aree professionali diverse. Il sito doveva quindi spiegare ogni ambito senza trasformare l\'azienda in una semplice raccolta di servizi scollegati.',
      direction:'Ho costruito il sito su una struttura modulare. Ogni area dispone dello spazio necessario per sviluppare il proprio tema, restando però all\'interno dello stesso sistema visivo e di navigazione. La gerarchia presenta prima l\'azienda e permette poi di approfondire i contenuti più specialistici.',
      tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','SISTEMI VISIVI'],
      media:[
        {type:'hero',label:'SITO WEB / UX / UI / SVILUPPO'},
        {type:'landscape',label:'CONTENUTI MODULARI'},
        {type:'portrait',label:'SISTEMI VISIVI'},
        {type:'portrait',label:'IDENTITÀ DIGITALE'},
        {type:'wide',label:'IMPLEMENTAZIONE FRONT-END'}
      ]
    },
    sapy: {
      type:'Esperienza Digitale',
      role:'Web Design / Sviluppo',
      deliverables:'Sito web / UX / UI / Sviluppo',
      intro:'Un progetto digitale dedicato all\'utilizzo dell\'intelligenza artificiale nella didattica.',
      context:'Sapy propone l\'AI come strumento di supporto per gli insegnanti. Il sito doveva spiegare prima cosa permette di fare il prodotto e solo successivamente la tecnologia che lo rende possibile.',
      direction:'Ho separato informazioni sul prodotto, contenuti editoriali e visione generale del progetto in aree distinte. L\'AI rimane visibile, ma non diventa il soggetto di ogni pagina. La priorità è far capire cosa può fare concretamente l\'utente con la piattaforma.',
      tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','AI / EDTECH'],
      media:[
        {type:'hero',label:'SITO WEB / UX / UI / SVILUPPO'},
        {type:'landscape',label:'AI / EDTECH'},
        {type:'portrait',label:'INFORMAZIONI DI PRODOTTO'},
        {type:'portrait',label:'CONTENUTI EDITORIALI'},
        {type:'wide',label:'IMPLEMENTAZIONE FRONT-END'}
      ]
    },
    'platinum-technologies': {
      type:'Comunicazione Corporate',
      year:'IN CORSO',
      role:'Graphic Design / Digital Marketing / Web Management',
      deliverables:'Corporate Design / Web / Campagne / Editorial / Eventi',
      intro:'Attività continuativa di comunicazione per un\'azienda che opera nella stampa industriale di grande formato.',
      context:'Platinum Technologies comunica macchine, applicazioni e contenuti tecnici a pubblici differenti. Lo stesso prodotto può comparire in un articolo tecnico, una campagna, una grafica fieristica, una landing page o una presentazione commerciale. Ogni formato richiede un diverso livello di approfondimento, mantenendo però una riconoscibilità comune.',
      direction:'Il mio lavoro comprende diverse parti di questo sistema: graphic design, web, advertising, contenuti editoriali e comunicazione per eventi. L\'obiettivo è mantenere una coerenza concreta tra informazioni di prodotto, identità visiva ed esigenze commerciali anche quando cambia il formato.',
      tags:['GRAPHIC DESIGN','DIGITAL MARKETING','WEB MANAGEMENT','EDITORIAL DESIGN','ADVERTISING','COMUNICAZIONE EVENTI','SEO & ANALYTICS'],
      outputs:[
        {title:'COMUNICAZIONE CORPORATE',description:'Brochure, presentazioni, advertising e materiali utilizzati nella comunicazione corporate e commerciale.'},
        {title:'PLATINUM INSIDE',description:'Formato editoriale dedicato a prodotti, applicazioni, case history e contenuti tecnici.'},
        {title:'WEB',description:'Pagine prodotto, landing page e contenuti editoriali per il sito corporate.'},
        {title:'CAMPAGNE',description:'Creatività e landing dedicate ad attività paid e comunicazione diretta.'},
        {title:'EVENTI',description:'Materiali digitali, stampati e fisici per fiere, open house ed eventi tecnici.'}
      ],
      media:[
        {type:'hero',label:'CORPORATE DESIGN / WEB / CAMPAGNE'},
        {type:'landscape',label:'SISTEMA EDITORIALE'},
        {type:'portrait',label:'COMUNICAZIONE EVENTI'},
        {type:'portrait',label:'CAMPAGNE DIGITALI'},
        {type:'wide',label:'COMUNICAZIONE CONTINUATIVA'}
      ]
    },
    'colorcopy-large-format': {
      type:'Comunicazione Corporate',
      year:'IN CORSO',
      role:'Graphic Design / Digital Marketing / Web Management',
      deliverables:'Graphic Design / Web / Advertising / Social / Stampa / Eventi',
      intro:'Attività continuativa di comunicazione visiva e digitale per un\'azienda che commercializza tecnologie di stampa professionale di diversi produttori.',
      context:'Colorcopy gestisce un catalogo ampio, composto da tecnologie, marchi e tipologie di cliente differenti. La comunicazione cambia continuamente tra lanci prodotto, attività commerciali, eventi e contenuti tecnici. Il problema è mantenere riconoscibile Colorcopy senza obbligare ogni marchio o tecnologia a utilizzare lo stesso linguaggio visivo.',
      direction:'Lavoro sui diversi canali utilizzati dall\'azienda: sito web, advertising, email, social, materiale stampato ed eventi. Ogni output risponde a una necessità commerciale specifica, mentre tipografia, struttura e alcuni elementi visuali ricorrenti mantengono collegata la comunicazione.',
      tags:['GRAPHIC DESIGN','WEB DESIGN','WEB MANAGEMENT','DIGITAL MARKETING','ADVERTISING','CONTENUTI SOCIAL','PRINT DESIGN','COMUNICAZIONE EVENTI','SEO & ANALYTICS'],
      outputs:[
        {title:'COMUNICAZIONE PRODOTTO',description:'Brochure, cataloghi e materiali promozionali per prodotti e marchi differenti.'},
        {title:'WEB',description:'Pagine prodotto, landing page e contenuti destinati all\'informazione e alla lead generation.'},
        {title:'ADVERTISING',description:'Creatività per campagne paid social e search.'},
        {title:'SOCIAL / CONTENT',description:'Contenuti visuali ed editoriali per lanci prodotto, eventi e comunicazione continuativa.'},
        {title:'EMAIL MARKETING',description:'Newsletter e DEM dedicate a prodotti, eventi e iniziative commerciali.'},
        {title:'EVENTI',description:'Materiali digitali e stampati per fiere, open house ed eventi rivolti ai clienti.'}
      ],
      media:[
        {type:'hero',label:'GRAPHIC DESIGN / WEB / ADVERTISING'},
        {type:'landscape',label:'COMUNICAZIONE PRODOTTO'},
        {type:'portrait',label:'SOCIAL / CONTENT'},
        {type:'portrait',label:'EMAIL MARKETING'},
        {type:'wide',label:'COMUNICAZIONE CONTINUATIVA'}
      ]
    }
  };
  IT.projects.forEach(project => Object.assign(project, projectCopy[project.slug] || {}));

  Object.assign(IT.archive, {
    title: 'ARCHIVIO',
    eyebrow: 'PROGETTI PERSONALI / STUDI / ESPERIMENTI',
    description: 'Progetti indipendenti, studi visuali ed esperimenti che non fanno parte della selezione principale.',
    status: ['ARCHIVIO IN PREPARAZIONE.']
  });

  const dictionaries = { en: EN, it: IT };
  function syncData() {
    const lang = window.PortfolioI18n?.lang === 'it' ? 'it' : 'en';
    window.PORTFOLIO_DATA = clone(dictionaries[lang]);
  }
  syncData();
  addEventListener('portfolio:langchange', syncData);
})();