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
    { id: "resorts", name: "Resorts", positions: 6, imageKey: "careerTeamResorts" as const },
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

export type WorkSlideVariant = "image" | "text";

export type WorkSlide = {
  id: string;
  title: string;
  imageKey: "careerWorkGuests" | "careerWorkRemote" | "careerWorkLocations" | "careerWorkTeam" | "careerWorkCompensation";
  variant: WorkSlideVariant;
  badge?: string;
  body?: string;
};

export const careerWorkSlides: WorkSlide[] = [
  {
    id: "guests",
    title: "Expectional guests",
    imageKey: "careerWorkGuests",
    variant: "image",
    badge: "everywhere",
  },
  {
    id: "remote",
    title: "Remote and on-site roles",
    imageKey: "careerWorkRemote",
    variant: "text",
    body:
      "Some roles are fully remote. Others are based on-site, in some of the world's most beautiful destinations — from Brazil, Costa Rica and the Dominican Republic to Spain, South Africa and the UAE.",
  },
  {
    id: "locations",
    title: "Rare locations",
    imageKey: "careerWorkLocations",
    variant: "image",
  },
  {
    id: "team",
    title: "A team of professionals",
    imageKey: "careerWorkTeam",
    variant: "image",
  },
  {
    id: "compensation",
    title: "Strong compensation",
    imageKey: "careerWorkCompensation",
    variant: "image",
  },
];

export const careerCta = {
  title: "If this feels like your level",
  description:
    "We're a young, ambitious team with high standards and a hands-on approach.",
  subdescription:
    "We value strong ideas, practical thinking, attention to detail, and people who are ready to take responsibility for their part of the work. If you feel aligned with our standard of hospitality, we invite you to introduce yourself.",
  buttonLabel: "Submit your request",
} as const;
