export const careerHero = {
  eyebrow: "80+ open positions",
  title: "Careers at Utopia",
  description:
    "Utopia is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences.",
  learnMoreLabel: "Learn more",
} as const;

export const careerDepartments = [
  { name: "Design Development", count: 12 },
  { name: "Operations", count: 2 },
  { name: "Legal", count: 20 },
  { name: "Finance", count: 4 },
  { name: "Technical", count: 12 },
  { name: "Procurement", count: 5 },
  { name: "Project Management", count: 20 },
  { name: "Construction", count: 15 },
  { name: "Resorts", count: 12 },
] as const;

export type CareerRole = {
  id: string;
  title: string;
  department: string;
  office: string;
  remote: string;
};

export const careerFeaturedRoles: CareerRole[] = [
  {
    id: "growth-partnership-manager",
    title: "Growth Partnership Manager",
    department: "Project Magagement",
    office: "Tokyo",
    remote: "Japan",
  },
  {
    id: "vacancy-2",
    title: "Vacancy 2",
    department: "departement",
    office: "City",
    remote: "Countries",
  },
  {
    id: "vacancy-3",
    title: "Vacancy 3",
    department: "departement",
    office: "City",
    remote: "Countries",
  },
  {
    id: "vacancy-4",
    title: "Vacancy 4",
    department: "departement",
    office: "City",
    remote: "Countries",
  },
  {
    id: "vacancy-5",
    title: "Vacancy 5",
    department: "departement",
    office: "City",
    remote: "Countries",
  },
];

export const careerTeams = {
  heading: "Our teams",
  description:
    "Utopia designs and builds its properties in-house.",
  subdescription:
    "Our team works across the full journey: from concept and architecture to construction, interiors, landscape, guest experience, and long-term operation.",
  items: [
    { id: "design", name: "Design developement", positions: 6, imageKey: "careerTeamDesign" as const },
    { id: "operations", name: "Operations", positions: 6, imageKey: "careerTeamOperations" as const },
    { id: "resorts", name: "Hospitality", positions: 6, imageKey: "careerTeamResorts" as const },
    { id: "legal", name: "Legal", positions: 6, imageKey: "careerTeamLegal" as const },
    { id: "technical", name: "Technical", positions: 6, imageKey: "careerTeamTechnical" as const },
    { id: "finance", name: "Finance", positions: 6, imageKey: "careerTeamFinance" as const },
  ],
} as const;

export const careerValues = {
  hero: {
    title: "5 values",
    description:
      "Ultra-luxury hospitality is shaped by exceptional individuals working within a thriving, high performance culture.",
  },
  items: [
    {
      id: "never-settle",
      title: "Never settle",
      description:
        "We hold ourselves to the highest standards in everything we do — from guest experience to the smallest operational detail. Good enough is not enough when every stay is expected to feel exceptional.",
      imageKey: "careerValueNeverSettle" as const,
    },
    {
      id: "dream-team",
      title: "Dream Team",
      description:
        "We build teams of people who are excellent at what they do, deeply responsible, and fully committed to the guest experience. Talent matters, but so do trust, discipline, and the ability to work together with clarity and respect.",
      imageKey: "careerValueDreamTeam" as const,
    },
    {
      id: "think-deeper",
      title: "Think Deeper",
      description:
        "We look beyond the obvious to understand what each guest, property, and situation truly needs. Great hospitality comes from attention, intuition, and the ability to solve problems before they become visible.",
      imageKey: "careerValueThinkDeeper" as const,
    },
    {
      id: "get-it-done",
      title: "Get It Done",
      description:
        "We take ownership from start to finish. Whether it's a guest request, an operational task, or an unexpected challenge, we act with focus, urgency, and care.",
      imageKey: "careerValueGetItDone" as const,
    },
    {
      id: "deliver-wow",
      title: "Deliver WOW",
      description:
        "We create moments that feel effortless, thoughtful, and memorable. From service to atmosphere, every detail should leave guests with the sense that they are in the right hands.",
      imageKey: "careerValueDeliverWow" as const,
    },
  ],
} as const;

export type WorkSlideLayout = "text" | "overlay";

export type WorkSlide = {
  id: string;
  title: string;
  layout: WorkSlideLayout;
  imageKey?: "careerWorkGuests" | "careerWorkLocations" | "careerWorkTeam" | "careerWorkCompensation";
  badge?: string;
  body?: string;
};

export const careerWorkSlides: WorkSlide[] = [
  {
    id: "guests",
    title: "Expectional guests",
    layout: "overlay",
    imageKey: "careerWorkGuests",
    badge: "everywhere",
  },
  {
    id: "remote",
    title: "Remote and on-site roles",
    layout: "text",
    body:
      "Some roles are fully remote. Others are based on-site, in some of the world's most beautiful destinations — from Brazil, Costa Rica and the Dominican Republic to Spain, South Africa and the UAE.",
  },
  {
    id: "locations",
    title: "Rare locations",
    layout: "overlay",
    imageKey: "careerWorkLocations",
  },
  {
    id: "team",
    title: "A team of professionals",
    layout: "overlay",
    imageKey: "careerWorkTeam",
  },
  {
    id: "compensation",
    title: "Strong compensation",
    layout: "overlay",
    imageKey: "careerWorkCompensation",
  },
];

export type JobOpeningItem = {
  title: string;
  description: string;
};

export type JobOpeningSection = {
  id: string;
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly JobOpeningItem[];
  bullets?: readonly string[];
};

export const jobOpeningContent: {
  intro: string;
  applyLabel: string;
  termsLabel: string;
  sections: readonly JobOpeningSection[];
} = {
  intro:
    "Curate a visual world of Utopia and lead projects from raw concepts to polished execution.",
  applyLabel: "Apply for this role",
  termsLabel: "Terms of applying",
  sections: [
    {
      id: "about-role",
      heading: "About the role",
      paragraphs: [
        "Design at Utopia is never about passive decoration; it is about translating raw elements, contemporary architecture, and physical vitality into a striking visual language. Our audience has come to expect a rare level of understated elegance, and it is up to our creative team to keep pushing those aesthetic boundaries higher.",
        "We are looking for a Brand & Visual Designer to join our Creative Studio and craft compelling, high-impact visuals that convey the spirit of our destinations and active lifestyle culture. You will work closely with our Brand Strategy team and 3D/CGI Artists to produce arresting, cinematic assets for our digital and media channels.",
        "Ready to redefine the frontier of active luxury? Let’s connect.",
      ],
    },
    {
      id: "about-utopia",
      heading: "About Utopia",
      paragraphs: [
        "Utopia is an ultra-luxury hospitality and lifestyle brand creating a global ecosystem of properties and experiences. We develop private villa retreats in beautiful locations around the world, each with high-end service. Utopia also offers a wider ecosystem of leisure experiences and services available both to those staying on property and to external visitors.",
      ],
    },
    {
      id: "doing",
      heading: "What you’ll be doing",
      items: [
        {
          title: "Crafting Motion & Static Narrative",
          description:
            "Delivering distinct static and motion design elements for our premium digital platforms, editorial campaigns, and exclusive member touchpoints.",
        },
        {
          title: "Capturing the Elemental Pulse",
          description:
            "Collaborating with the Brand Strategy team to distill the visceral energy of our wild outposts (surf, wind, and high-performance recovery) into elegant digital campaigns.",
        },
        {
          title: "Visual Storytelling",
          description:
            "Curating immaculate moodboards, concept treatments, and storyboards to seamlessly communicate avant-garde ideas to the creative circle.",
        },
        {
          title: "Creative Ownership",
          description:
            "Taking complete ownership of design narratives, leading projects from raw embryonic concepts to absolute, polished execution.",
        },
        {
          title: "Refining the Identity",
          description:
            "Elevating our visual framework and maintaining pristine aesthetic discipline across all brand touchpoints.",
        },
        {
          title: "Navigating Momentum",
          description:
            "Working fluidly across multiple creative deadlines in a fast-paced, high-standard environment.",
        },
      ],
    },
    {
      id: "need",
      heading: "What you'll Need",
      bullets: [
        "2+ years of professional experience as a visual, brand, and/or motion designer, preferably within luxury, architectural, fashion, or high-performance lifestyle spaces.",
        "Proven experience creating sophisticated, high-converting visual assets for premium digital spaces (Instagram, YouTube, and high-end editorial displays).",
        "Strong conceptual thinking, an innate understanding of contemporary layout, and typography skills.",
        "Deep expertise with Adobe Creative Cloud applications.",
        "The ability to develop elegant, cohesive design templates while preserving a brand look.",
      ],
    },
    {
      id: "nice",
      heading: "Nice to have",
      bullets: [
        "Familiarity with 3D modeling, spatial rendering, or animation (Cinema 4D, Blender) to bring architecture and landscape to life.",
        "Knowledge of high-impact physical and digital formats (Digital OOH, large-scale print lookbooks, and immersive web layouts).",
        "Expertise in After Effects and Figma.",
      ],
    },
  ],
};

export const careerTeamUp = {
  title: "Team up with experts",
  description:
    "We bring together diverse, slightly rebellious, and fiercely talented minds from around the world.",
  caption: {
    title: "Design developement",
    description: "Shaping spaces with clarity, restraint, and a deep sense of place.",
  },
  photos: [
    { id: "tea-room", imageKey: "jobTeamUpTeaRoom" as const, variant: "large" as const },
    { id: "chess", imageKey: "jobTeamUpChess" as const, variant: "small" as const },
    { id: "tablet", imageKey: "jobTeamUpTablet" as const, variant: "small" as const },
  ],
} as const;

export const careerCta = {
  title: "If this feels like your level",
  description:
    "We're a young, ambitious team with high standards and a hands-on approach.",
  subdescription:
    "We value strong ideas, practical thinking, attention to detail, and people who are ready to take responsibility for their part of the work. If you feel aligned with our standard of hospitality, we invite you to introduce yourself.",
  buttonLabel: "Submit your request",
} as const;
