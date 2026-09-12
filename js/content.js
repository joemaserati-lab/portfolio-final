(() => {
  window.PORTFOLIO_DATA = {
    profile: {
      name: 'EDOARDO RAPPANELLO',
      role: 'MULTIDISCIPLINARY DESIGNER',
      experience: '4+ YEARS',
      email: 'edoardo.rappanello@gmail.com',
      linkedin: 'https://www.linkedin.com/in/edoardorappanello/',
      intro: [
        'My background sits at the intersection of design, communication and marketing. I studied Marketing and Communication before graduating with honours in Web Design & Artistic Communication for Business at the Academy of Fine Arts.',
        'Over the past four years, I\'ve worked as a graphic designer and digital marketing specialist for companies operating in the large-format digital printing industry. My role has grown across different areas: from graphic design and corporate communication to website management, digital campaigns, analytics and online visibility.',
        'Today, I work with Adobe Creative Suite and digital marketing tools alongside advanced AI workflows for image and video generation, prototyping and vibe coding. I\'m interested in using technology as part of the creative process, without separating visual quality from purpose, usability and business objectives.'
      ],
      focus: ['DESIGN', 'WEB', 'DIGITAL MARKETING']
    },

    resume: {
      title: 'RESUME',
      intro: 'Selected experience, education, capabilities and tools across design, web and digital marketing.',
      experience: [
        {
          period: '2023-NOW',
          role: 'GRAPHIC DESIGNER & DIGITAL MARKETING SPECIALIST',
          company: 'COLORCOPY LARGE FORMAT / PLATINUM TECHNOLOGIES',
          location: 'ITALY',
          description: [
            'Visual communication across print and digital, website management and development, advertising campaigns, SEO, analytics and corporate communication.',
            'Projects include websites, brochures, catalogues, advertising, social content, trade-show communication, 3D exhibition layouts and AI-assisted creative workflows.'
          ]
        },
        {
          period: 'CORPORATE',
          role: 'WEB DESIGN & DEVELOPMENT',
          company: 'PHOLIA.IT / TOVADU.COM / SAPY.IT',
          location: 'ITALY',
          description: 'Design and development of digital experiences from visual concept to implementation, combining interface design, front-end workflows and modern AI-assisted development.'
        },
        {
          period: '2022',
          role: 'GRAPHIC DESIGNER',
          company: 'SWS PRINTING',
          location: 'BRESCIA, IT',
          description: 'Graphic design and production for print and visual communication.'
        },
        {
          period: '2021',
          role: 'UI DESIGNER - INTERNSHIP',
          company: 'BBS SOFTWARE',
          location: 'BRESCIA, IT',
          description: 'Interface design and digital product support.'
        },
        {
          period: '2018',
          role: 'GRAPHIC DESIGNER - INTERNSHIP',
          company: 'COVERSTORE',
          location: 'BRESCIA, IT',
          description: 'Graphic design and production support.'
        },
        {
          period: '2018',
          role: 'GRAPHIC DESIGNER & SOCIAL MEDIA - INTERNSHIP',
          company: 'BRANDITY LAB',
          location: 'BRESCIA, IT',
          description: 'Graphic design, digital content and social media communication.'
        }
      ],
      education: [
        {
          period: '2019-2022',
          course: 'WEB DESIGN & ARTISTIC COMMUNICATION FOR BUSINESS',
          school: 'ACADEMY OF FINE ARTS - BRESCIA, IT',
          description: '110/110 CUM LAUDE. Focus on web design, visual communication and digital media. Final thesis on blockchain and NFTs and their impact on the internet.'
        },
        {
          period: '2016-2018',
          course: 'MARKETING & COMMUNICATION',
          school: 'ITS MACHINA LONATI',
          description: 'Marketing, communication and business fundamentals.'
        }
      ],
      capabilities: ['GRAPHIC & VISUAL DESIGN','WEB DESIGN','DIGITAL MARKETING','DIGITAL ADVERTISING','CORPORATE COMMUNICATION','SEO','ANALYTICS','3D VISUALIZATION','AI-ASSISTED CREATIVE WORKFLOWS'],
      tools: ['ADOBE CREATIVE CLOUD','WORDPRESS / ELEMENTOR','HTML / CSS / JAVASCRIPT','GOOGLE ADS','META ADS','GOOGLE ANALYTICS 4','GOOGLE SEARCH CONSOLE','3D DESIGN TOOLS','AI IMAGE & VIDEO GENERATION','AI-ASSISTED DEVELOPMENT / VIBE CODING']
    },

    projects: [
      {
        id:'01', slug:'tovadu', title:'TOVADÙ', displayTitle:'TOVADÙ', type:'Digital Experience', year:'2026', client:'Tovadù',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A B2B website designed to make a complex digital consulting offer clearer, more accessible and easier to navigate.',
        context:'Tovadu works with companies approaching digital transformation and business technology projects. The website needed to communicate technical expertise and a structured consulting approach without making the experience feel overly complex or distant.',
        direction:'The project was developed around a clear information hierarchy, balancing technical content with a more direct and contemporary visual language. The goal was to guide users from the business problem to the services and expertise behind the company, keeping the experience simple, structured and credible.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','B2B COMMUNICATION'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'INFORMATION ARCHITECTURE'},
          {type:'portrait',label:'DIGITAL DESIGN'},
          {type:'portrait',label:'B2B COMMUNICATION'},
          {type:'wide',label:'FRONT-END WORKFLOW'}
        ]
      },
      {
        id:'02', slug:'pholia', title:'PHOLIÀ', displayTitle:'PHOLIÀ', type:'Digital Experience', year:'2026', client:'Pholià',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A digital presence designed to translate an innovative and multidisciplinary business model into a clear and contemporary web experience.',
        context:'Pholia operates in a space where innovation, strategy and intangible assets come together. The challenge was to present a complex offer to different audiences while keeping the website understandable, distinctive and far from the conventions of a traditional corporate site.',
        direction:'The experience was built around modular content, strong visual hierarchy and a flexible digital identity. Information is progressively structured to make complex topics easier to explore while maintaining a contemporary and recognizable visual language.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','VISUAL SYSTEMS'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'MODULAR CONTENT'},
          {type:'portrait',label:'VISUAL SYSTEMS'},
          {type:'portrait',label:'DIGITAL IDENTITY'},
          {type:'wide',label:'CONTEMPORARY WEB EXPERIENCE'}
        ]
      },
      {
        id:'03', slug:'sapy', title:'SAPY', displayTitle:'SAPY', type:'Digital Experience', year:'2026', client:'Sapy',
        role:'Web Design / Development', deliverables:'Website / UX / UI / Development',
        intro:'A digital platform designed to introduce artificial intelligence to education through a clear, accessible and human-centered experience.',
        context:'Sapy explores the use of artificial intelligence as a tool to support teachers and educational activities. The project needed to communicate an emerging technology while keeping the experience approachable and building trust around a subject that can easily become technical or abstract.',
        direction:'The website was structured around simplicity, clarity and accessibility. Product information, editorial content and the broader vision behind the project are separated into a clear information architecture, allowing the technology to remain understandable without oversimplifying it.',
        tags:['WEB DESIGN','UI / UX','DIGITAL DESIGN','WEB DEVELOPMENT','AI / EDTECH'],
        media:[
          {type:'hero',label:'WEBSITE / UX / UI / DEVELOPMENT'},
          {type:'landscape',label:'AI / EDTECH'},
          {type:'portrait',label:'ACCESSIBLE EXPERIENCE'},
          {type:'portrait',label:'PRODUCT INFORMATION'},
          {type:'wide',label:'HUMAN-CENTERED PLATFORM'}
        ]
      },
      {
        id:'04', slug:'platinum-technologies', title:'PLATINUM TECHNOLOGIES', displayTitle:'PLATINUM\nTECHNOLOGIES', type:'Corporate Communication', year:'ONGOING', client:'Platinum Technologies',
        role:'Graphic Design / Digital Marketing / Web Management', deliverables:'Corporate Design / Web / Campaigns / Editorial / Events',
        intro:'An ongoing communication system developed across graphic design, web, digital marketing, editorial content and industry events.',
        context:'Platinum Technologies operates in the professional large-format digital printing market, where communication needs to combine technical information, brand positioning and commercial objectives. Products, technologies, events, editorial content and marketing campaigns all need to remain part of the same recognizable brand while addressing different audiences and purposes.',
        direction:'My work covers different stages of the communication process: from visual design and corporate materials to website management, digital campaigns, editorial content and event communication. The objective is to maintain a consistent visual language while adapting each output to its specific channel, audience and business goal. The result is not a single project, but an evolving communication system built across multiple touchpoints.',
        tags:['GRAPHIC DESIGN','DIGITAL MARKETING','WEB MANAGEMENT','EDITORIAL DESIGN','CAMPAIGN DESIGN','EVENT COMMUNICATION','SOCIAL CONTENT','SEO & ANALYTICS'],
        outputs:[
          {title:'CORPORATE COMMUNICATION',description:'Visual materials supporting the corporate identity across presentations, brochures, advertising and commercial communication.'},
          {title:'EDITORIAL / PLATINUM INSIDE',description:'An editorial format developed to bring together product news, applications, case studies, market topics and technical content within a consistent visual and digital system.'},
          {title:'WEB',description:'Ongoing management and development of digital content, landing pages, product pages and editorial experiences across the corporate website.'},
          {title:'CAMPAIGNS',description:'Digital campaigns developed across social advertising, search, email marketing and dedicated landing experiences.'},
          {title:'EVENTS',description:'Visual communication and materials for trade shows, open houses and industry events, including digital assets, printed materials and 3D exhibition layouts.'}
        ],
        media:[
          {type:'hero',label:'CORPORATE DESIGN / WEB / CAMPAIGNS'},
          {type:'landscape',label:'EDITORIAL SYSTEM'},
          {type:'portrait',label:'EVENT COMMUNICATION'},
          {type:'portrait',label:'SEO & ANALYTICS'},
          {type:'wide',label:'ONGOING COMMUNICATION SYSTEM'}
        ]
      },
      {
        id:'05', slug:'colorcopy-large-format', title:'COLORCOPY LARGE FORMAT', displayTitle:'COLORCOPY\nLARGE FORMAT', type:'Corporate Communication', year:'ONGOING', client:'Colorcopy Large Format',
        role:'Graphic Design / Digital Marketing / Web Management', deliverables:'Graphic Design / Web / Advertising / Social / Print / Events',
        intro:'A multidisciplinary communication ecosystem developed across graphic design, web, advertising and digital marketing.',
        context:'Colorcopy Large Format operates across multiple brands, technologies and product categories within the professional printing market. Communication therefore needs to manage a broad portfolio, different customer profiles and frequent commercial activities without losing clarity or visual consistency.',
        direction:'My role combines graphic design, website management and digital marketing across the company\'s communication ecosystem. Product launches, advertising, web content, social communication, newsletters and event materials are developed as parts of the same system, while adapting the message and visual approach to different commercial objectives. This multidisciplinary workflow makes it possible to connect visual communication with the channels used to distribute, promote and measure it.',
        tags:['GRAPHIC DESIGN','WEB DESIGN','WEB MANAGEMENT','DIGITAL MARKETING','ADVERTISING','SOCIAL CONTENT','PRINT DESIGN','EVENT COMMUNICATION','SEO & ANALYTICS'],
        outputs:[
          {title:'PRODUCT COMMUNICATION',description:'Visual assets, brochures, catalogues and promotional materials developed for products and technologies across different brands.'},
          {title:'WEB',description:'Website management, product pages, landing pages and digital content designed to support both information and lead generation.'},
          {title:'ADVERTISING',description:'Campaign assets developed for paid social and search activities, connecting creative execution with specific marketing objectives.'},
          {title:'SOCIAL / CONTENT',description:'Visual and editorial content designed for ongoing communication, product launches, events and corporate activities.'},
          {title:'EMAIL MARKETING',description:'Newsletters and direct email campaigns developed around products, events and commercial initiatives.'},
          {title:'EVENTS',description:'Communication materials for trade shows, open houses and customer events across digital, printed and physical applications.'}
        ],
        media:[
          {type:'hero',label:'GRAPHIC DESIGN / WEB / ADVERTISING'},
          {type:'landscape',label:'PRODUCT COMMUNICATION'},
          {type:'portrait',label:'SOCIAL / CONTENT'},
          {type:'portrait',label:'EMAIL MARKETING'},
          {type:'wide',label:'MULTIDISCIPLINARY ECOSYSTEM'}
        ]
      }
    ],

    archive: {
      title: 'ARCHIVE',
      eyebrow: 'SELF-INITIATED WORK / CONCEPTS / EXPERIMENTS',
      description: 'A space for independent projects, visual studies and ideas developed outside client work.',
      status: ['CURRENTLY IN PROGRESS.', 'NEW WORK WILL BE ADDED SOON.']
    }
  };
})();
