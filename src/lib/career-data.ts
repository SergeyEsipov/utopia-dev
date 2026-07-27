export const careerHero = {
  eyebrow: "Open positions",
  title: "Careers at Utopia",
  description:
    "Utopia is an ultra-luxury hospitality and lifestyle brand bringing together exceptional properties and experiences around the world.",
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
    department: "Project Management",
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

/**
 * Figma 24.07 `154:8443` / `154:5577` / `154:3654`. The heading is singular
 * ("Our team") and the description is one paragraph whose opening sentence is
 * ink and whose remainder is muted — hence `description` + `subdescription`
 * render as two spans of a single `<p>`, not two paragraphs.
 *
 * `featured` is the Hospitality card: a tall 318×425 tile beside the 2×2 grid
 * on desktop, a full-width 160-tall band above the grid on tablet/mobile. The
 * two layouts carry different photographs by design.
 */
export const careerTeams = {
  heading: "Our team",
  description: "Every Utopia property is brought to life in-house.",
  subdescription:
    "Our team is involved at every stage, from concept and architecture through to construction, interiors, landscape, guest experience and day-to-day operations.",
  featured: {
    id: "hospitality",
    name: "Hospitality",
    positions: 6,
    imageKey: "careerTeamHospitality" as const,
    wideImageKey: "careerTeamHospitalityWide" as const,
  },
  items: [
    { id: "design", name: "Design development", positions: 6, imageKey: "careerTeamDesignDev" as const },
    { id: "legal", name: "Legal", positions: 6, imageKey: "careerTeamLegalDesk" as const },
    { id: "finance", name: "Finance", positions: 6, imageKey: "careerTeamFinanceDesk" as const },
    { id: "operations", name: "Operations", positions: 6, imageKey: "careerTeamOperationsSuite" as const },
  ],
} as const;

/** Figma 24.07 `154:8552` / `154:5639` / `154:3714`. */
export const careerValues = {
  hero: {
    title: "5 values",
    description:
      "Ultra-luxury hospitality is built by exceptional people operating in an exceptional culture.",
  },
  items: [
    {
      id: "never-settle",
      title: "Never settle",
      description:
        "We hold ourselves to the highest standards in everything we do, from guest experience to the smallest operational detail. We’ll never settle for anything less than the very best.",
      imageKey: "careerValueNeverSettle" as const,
    },
    {
      id: "dream-team",
      title: "Dream Team",
      description:
        "We build teams of people who are among the best at what they do. Talent matters, but so do integrity, discipline, a commitment to delivering an outstanding guest experience - and the ability to bring out the best in others.",
      imageKey: "careerValueDreamTeam" as const,
    },
    {
      id: "think-deeper",
      title: "Think Deeper",
      description:
        "We look beyond the obvious to understand what each guest, property and situation really needs. Great hospitality comes from attention to detail, expert judgement, and problems solved before anyone notices.",
      imageKey: "careerValueThinkDeeper" as const,
    },
    {
      id: "get-it-done",
      title: "Get It Done",
      description:
        "We take ownership from start to finish. Whatever the challenge, wherever we find it, we see it through.",
      imageKey: "careerValueGetItDone" as const,
    },
    {
      id: "always-delight",
      title: "Always Delight",
      description:
        "We create experiences that stay with people long after they've left. We see every moment as an opportunity to surprise, delight and go beyond expectations.",
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

/**
 * Figma 24.07 `154:8592`. The desktop frame renames four of the five cards;
 * the mobile frame `154:3771` still carries the older wording (including the
 * "Expectional guests" typo), so the desktop naming leads.
 */
export const careerWorkHeading =
  "Work defined by extraordinary places and exceptional standards";

export const careerWorkSlides: WorkSlide[] = [
  {
    /* No badge: `154:8595` carries only the title. The mobile frame still
       draws an "everywhere" pill, but that is the older wording — the same
       frame keeps the "Expectional guests" typo the desktop one fixed. */
    id: "guests",
    title: "Exceptional guests",
    layout: "overlay",
    imageKey: "careerWorkGuests",
  },
  {
    id: "remote",
    title: "Remote and on-site roles",
    layout: "text",
    body:
      "Some roles are fully remote. Others are based on-site in some of the world's most beautiful destinations, from Brazil, Costa Rica and the Dominican Republic to Spain, South Africa and the UAE.",
  },
  {
    id: "locations",
    title: "Extraordinary locations",
    layout: "overlay",
    imageKey: "careerWorkLocations",
  },
  {
    id: "team",
    title: "Exceptional colleagues",
    layout: "overlay",
    imageKey: "careerWorkTeam",
  },
  {
    id: "compensation",
    title: "Competitive package",
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

/**
 * Figma 24.07 `154:8620`. One paragraph in which the middle clause is ink and
 * the rest is muted, so the copy is carried as a lead/highlight/tail triple.
 */
/* Apostrophes are copied exactly as `154:8623` sets them — the frame mixes a
   straight quote in "We're"/"we'd" with a curly one in "you’re". */
export const careerCta = {
  title: "Join Utopia",
  descriptionLead:
    "We're building a team of people who take pride in doing exceptional work. We value ",
  descriptionHighlight: "practical judgement, independent thinking",
  descriptionTail:
    " and people who take ownership. If you’re driven by the same standards that we are, we'd love to hear from you.",
  buttonLabel: "Start your application",
} as const;
