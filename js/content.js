(() => {
  window.PORTFOLIO_DATA = {
    profile: {
      name: 'EDOARDO RAPPANELLO',
      role: 'GRAPHIC DESIGNER / CREATIVE DESIGNER',
      location: 'MILAN, IT',
      email: 'edoardo.rappanello@gmail.com',
      linkedin: 'https://www.linkedin.com/in/edoardorappanello/',
      intro: 'I design identities, digital experiences and visual systems across brand, interface and motion.',
      focus: ['IDENTITY', 'DIGITAL', 'MOTION']
    },

    resume: {
      title: 'RESUME',
      intro: 'Selected experience, capabilities and tools. Replace these placeholders with the final CV content when ready.',
      experience: [
        {
          period: '2024—NOW',
          role: 'GRAPHIC DESIGNER',
          company: 'STUDIO / COMPANY PLACEHOLDER',
          location: 'MILAN, IT',
          description: 'Brand systems, digital art direction, campaigns and interactive experiences.'
        },
        {
          period: '2022—2024',
          role: 'JUNIOR / MID DESIGNER',
          company: 'COMPANY PLACEHOLDER',
          location: 'ITALY',
          description: 'Visual identity, editorial design, digital content and production support.'
        }
      ],
      education: [
        { period: '2022', course: 'DESIGN EDUCATION PLACEHOLDER', school: 'SCHOOL / UNIVERSITY' }
      ],
      capabilities: ['ART DIRECTION','BRAND IDENTITY','GRAPHIC DESIGN','WEB DESIGN','MOTION','TYPOGRAPHY'],
      tools: ['FIGMA','ADOBE CC','AFTER EFFECTS','BLENDER / 3D','HTML / CSS / JS']
    },

    projects: [
      {
        id:'01', slug:'neon-archive', title:'Neon Archive', type:'Brand Identity', year:'2026', client:'Placeholder Client',
        role:'Art Direction / Design', deliverables:'Identity / Campaign / Motion',
        intro:'A modular identity system developed for a contemporary cultural platform across digital, campaign and motion applications.',
        context:'The project needed a visual language that could remain recognizable while changing continuously across editorial and promotional formats.',
        direction:'The system is built around a restrained typographic framework, modular compositions and a repeatable motion logic.',
        tags:['ART DIRECTION','BRANDING','TYPOGRAPHY','MOTION'],
        media:[
          {type:'hero',label:'HERO IMAGE / VIDEO PLACEHOLDER'},
          {type:'landscape',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'wide',label:'MOTION / IMAGE PLACEHOLDER'}
        ]
      },
      {
        id:'02', slug:'form-system', title:'Form / System', type:'Digital Experience', year:'2026', client:'Placeholder Client',
        role:'Design / Creative Development', deliverables:'Website / UI / Motion',
        intro:'An editorial digital experience exploring asymmetric grids, kinetic typography and responsive transitions.',
        context:'The challenge was to give long-form content a clear hierarchy without reducing the site to a conventional editorial template.',
        direction:'Navigation, typography and motion share the same grid so transitions reinforce the information structure instead of decorating it.',
        tags:['WEB DESIGN','CREATIVE CODING','UI','MOTION'],
        media:[
          {type:'hero',label:'HERO IMAGE / VIDEO PLACEHOLDER'},
          {type:'landscape',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'wide',label:'MOTION / IMAGE PLACEHOLDER'}
        ]
      },
      {
        id:'03', slug:'mono-object', title:'Mono Object', type:'Campaign', year:'2025', client:'Placeholder Client',
        role:'Art Direction / Graphic Design', deliverables:'Campaign / Social / Print',
        intro:'A product campaign built around controlled monochrome photography and a repeatable graphic system.',
        context:'The campaign had to work across large-format key visuals and fast social adaptations without losing consistency.',
        direction:'A compact set of crops, typographic interruptions and layout rules creates variation while keeping the campaign immediately identifiable.',
        tags:['CAMPAIGN','PHOTOGRAPHY','LAYOUT','SOCIAL'],
        media:[
          {type:'hero',label:'HERO IMAGE / VIDEO PLACEHOLDER'},
          {type:'landscape',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'wide',label:'MOTION / IMAGE PLACEHOLDER'}
        ]
      },
      {
        id:'04', slug:'signal-loss', title:'Signal Loss', type:'Poster Series', year:'2025', client:'Self Initiated',
        role:'Graphic Design', deliverables:'Poster / Print / Digital',
        intro:'An experimental poster series based on transmission errors, industrial interfaces and distorted typography.',
        context:'The series explores how far a visual system can be degraded before information stops being readable.',
        direction:'Repeated typographic structures are interrupted with signal artifacts and controlled distortion, keeping the hierarchy intact beneath the noise.',
        tags:['POSTER','TYPOGRAPHY','EXPERIMENT','PRINT'],
        media:[
          {type:'hero',label:'HERO IMAGE / VIDEO PLACEHOLDER'},
          {type:'landscape',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'portrait',label:'IMAGE PLACEHOLDER'},
          {type:'wide',label:'MOTION / IMAGE PLACEHOLDER'}
        ]
      }
    ],

    archive: [
      {year:'2024', title:'Editorial Fragments', type:'EDITORIAL'},
      {year:'2024', title:'Objects / 001', type:'3D STUDY'}
    ]
  };
})();
