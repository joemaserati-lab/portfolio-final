export const profile = {
  name: 'Edoardo Rappanello',
  defaultTitle: 'Edoardo Rappanello — Graphic Design, Web & Marketing',
  defaultDescription: 'Portfolio of Edoardo Rappanello: graphic design, web design, visual identities and digital marketing across independent and in-house projects.',
  defaultImage: 'assets/images/profilephoto.webp'
};

export const sections = {
  about: {
    path: 'about/',
    title: 'About — Edoardo Rappanello',
    description: 'My background in graphic design, web and communication, from in-house marketing to independent design and development projects.'
  },
  resume: {
    path: 'resume/',
    title: 'Resume — Edoardo Rappanello',
    description: 'Work experience, education, creative skills and tools across graphic design, web development, communication and digital marketing.'
  },
  contact: {
    path: 'contact/',
    title: 'Contact — Edoardo Rappanello',
    description: 'Get in touch for graphic design, web design, communication projects, collaborations and professional opportunities.'
  },
  work: {
    path: 'work/',
    title: 'Selected Work — Edoardo Rappanello',
    description: 'Explore five projects spanning web design, corporate visual identity, advertising, print and digital marketing.'
  }
};

export const projects = [
  {
    slug: 'tovadu',
    title: 'Tovadù — Web Design & Development | Edoardo Rappanello',
    name: 'TOVADÙ',
    description: 'Website design, information architecture, content writing and front-end development for Tovadù, including a custom cursor and page transitions.',
    image: 'assets/images/Tovadu.webp'
  },
  {
    slug: 'pholia',
    title: 'Pholià — Visual Design & Three.js | Edoardo Rappanello',
    name: 'PHOLIÀ',
    description: 'Digital identity, web design and Three.js 3D cube for Pholià, with content architecture and front-end development.',
    image: 'assets/images/Pholia.webp'
  },
  {
    slug: 'sapy',
    title: 'Sapy — Website Redesign | Edoardo Rappanello',
    name: 'SAPY',
    description: "Redesign of Sapy\'s website into a clear, easy-to-navigate multipage site for teachers and education professionals.",
    image: 'assets/images/Sapy.webp'
  },
  {
    slug: 'platinum-technologies',
    title: 'Platinum Technologies — Brand Identity | Edoardo Rappanello',
    name: 'PLATINUM TECHNOLOGIES',
    description: 'In-house visual identity, editorial advertising, website redesign, SEO and digital marketing for Platinum Technologies.',
    image: 'assets/images/PlatinumTechnologies.webp'
  },
  {
    slug: 'colorcopy-large-format',
    title: 'Colorcopy — Graphic Design & SEO | Edoardo Rappanello',
    name: 'COLORCOPY LARGE FORMAT',
    description: 'In-house graphic design, event communication, catalogues, visual identity and SEO for Colorcopy Large Format.',
    image: 'assets/images/ColorcopyLargeFormat.webp'
  }
];

export const allIndexablePaths = [
  '',
  ...Object.values(sections).map(section => section.path),
  ...projects.map(project => `work/${project.slug}/`)
];
