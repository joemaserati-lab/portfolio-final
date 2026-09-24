export const profile = {
  name: 'Edoardo Rappanello',
  defaultTitle: 'Edoardo Rappanello — Multidisciplinary Designer',
  defaultDescription: 'Portfolio of Edoardo Rappanello. Graphic design, web and digital marketing across independent projects and ongoing communication work.',
  defaultImage: 'assets/images/profilephoto.webp'
};

export const sections = {
  about: {
    path: 'about/',
    title: 'About — Edoardo Rappanello',
    description: 'Background, approach and focus of Edoardo Rappanello across graphic design, web and digital marketing.'
  },
  resume: {
    path: 'resume/',
    title: 'Resume — Edoardo Rappanello',
    description: 'Experience, education, skills and tools used by Edoardo Rappanello across graphic design, web and digital marketing.'
  },
  contact: {
    path: 'contact/',
    title: 'Contact — Edoardo Rappanello',
    description: 'Contact Edoardo Rappanello for freelance work, collaborations or questions about graphic design, web and digital marketing projects.'
  },
  work: {
    path: 'work/',
    title: 'Selected Work — Edoardo Rappanello',
    description: 'Selected web, graphic design and digital communication projects by Edoardo Rappanello.'
  }
};

export const projects = [
  {
    slug: 'tovadu',
    title: 'Tovadù — Edoardo Rappanello',
    name: 'TOVADÙ',
    description: 'A B2B website for a consulting company working on digital transformation and business technology.',
    image: 'assets/images/Tovadu.webp'
  },
  {
    slug: 'pholia',
    title: 'Pholià — Edoardo Rappanello',
    name: 'PHOLIÀ',
    description: 'A website for a company working across innovation, strategy and intangible assets.',
    image: 'assets/images/Pholia.webp'
  },
  {
    slug: 'sapy',
    title: 'Sapy — Edoardo Rappanello',
    name: 'SAPY',
    description: 'A digital project built around the use of artificial intelligence in education.',
    image: 'assets/images/Sapy.webp'
  },
  {
    slug: 'platinum-technologies',
    title: 'Platinum Technologies — Edoardo Rappanello',
    name: 'PLATINUM TECHNOLOGIES',
    description: 'Ongoing communication work for a company operating in industrial large-format printing.',
    image: 'assets/images/PlatinumTechnologies.webp'
  },
  {
    slug: 'colorcopy-large-format',
    title: 'Colorcopy Large Format — Edoardo Rappanello',
    name: 'COLORCOPY LARGE FORMAT',
    description: 'Ongoing visual and digital communication for a company selling professional printing technologies from different manufacturers.',
    image: 'assets/images/ColorcopyLargeFormat.webp'
  }
];

export const allIndexablePaths = [
  '',
  ...Object.values(sections).map(section => section.path),
  ...projects.map(project => `work/${project.slug}/`)
];
