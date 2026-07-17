/** A fragment of paragraph text; underlined fragments render as links. */
export type TermsInline = {
  text: string;
  underlined?: boolean;
};

export type TermsParagraph = string | TermsInline[];

export type TermsBlock =
  | { kind: "paragraphs"; paragraphs: TermsParagraph[] }
  | { kind: "list"; style: "bullet" | "numbered"; items: string[] };

/** An optional full-opacity lead line followed by muted supporting blocks. */
export type TermsChunk = {
  lead?: string;
  blocks: TermsBlock[];
};

export type TermsSubsection = {
  id: string;
  heading: string;
  chunks: TermsChunk[];
};

export type TermsGroup = {
  id: string;
  heading: string;
  subsections: TermsSubsection[];
};

const paragraphs = (...items: TermsParagraph[]): TermsChunk => ({
  blocks: [{ kind: "paragraphs", paragraphs: items }],
});

export const termsHero = {
  title: "Website Terms",
  subtitle:
    "PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THIS SITE",
} as const;

export const termsGroups: TermsGroup[] = [
  {
    id: "the-basics",
    heading: "The basics",
    subsections: [
      {
        id: "whats-in-these-terms",
        heading: "1. What's in these terms?",
        chunks: [
          paragraphs(
            "These terms tell you the rules for using our website www.revolut.com (our site).",
          ),
        ],
      },
      {
        id: "who-we-are",
        heading: "2. Who we are and how to contact us?",
        chunks: [
          paragraphs(
            "Our site is operated by Revolut Ltd (we or us). We are registered in England and Wales under company number 08804411 and have our registered office at 30 South Colonnade, London, E14 5HX.",
            "We are regulated by the Financial Conduct Authority as an Electronic Money Institution under the Electronic Money Regulations 2011 for the issuing of electronic money. We are included in the FCA's registered of electronic money institution firms (Firm Registration Number 900562) which can be found on the FCA website.",
            "To contact us, please contact customer services using the chat function on our site.",
          ),
        ],
      },
    ],
  },
  {
    id: "use-of-the-website",
    heading: "Use of the website",
    subsections: [
      {
        id: "you-accept-these-terms",
        heading: "3. By using our site you accept these terms",
        chunks: [
          paragraphs(
            "By using our site, you confirm that you accept these terms of use and that you agree to comply with them",
            "If you do not agree to these terms, you must not use our site.",
            "We recommend that you print a copy of these terms for future reference.",
          ),
        ],
      },
      {
        id: "other-terms",
        heading: "4. There are other terms that may apply to you",
        chunks: [
          paragraphs(
            "These terms of use refer to the following additional terms, which also apply to your use of our site:",
            [
              { text: "Our " },
              { text: "Privacy Policy", underlined: true },
              {
                text: ", which sets out the terms on which we process any personal data we collect from you, or that you provide to us. By using our site, you consent to such processing and you warrant that all data provided by you is accurate.",
              },
            ],
            [
              { text: "Our " },
              { text: "Cookie Policy", underlined: true },
              {
                text: ", which sets out information about the cookies on our site.",
              },
            ],
          ),
        ],
      },
      {
        id: "changes-to-these-terms",
        heading: "5. We may make changes to these terms",
        chunks: [
          paragraphs(
            "We amend these terms from time to time. Every time you wish to use our site, please check these terms to ensure you understand the terms that apply at that time.",
          ),
        ],
      },
      {
        id: "changes-to-our-site",
        heading: "6. We may make changes to our site",
        chunks: [
          paragraphs(
            "We may update and change our site from time to time to reflect changes to our products, our users' needs and our business priorities. We will try to give you reasonable notice of any major changes.",
            "We may suspend or withdraw our site.",
            "Our site is made available free of charge.",
            "We do not guarantee that our site, or any content on it, will always be available or be uninterrupted. We may suspend or withdraw or restrict the availability of all or any part of our site for business and operational reasons. We will try to give you reasonable notice of any suspension or withdrawal.",
            "You are also responsible for ensuring that all persons who access our site through your internet connection are aware of these terms of use and other applicable terms and conditions, and that they comply with them.",
          ),
        ],
      },
    ],
  },
  {
    id: "your-responsibilities",
    heading: "Your responsibilities",
    subsections: [
      {
        id: "keep-account-details-safe",
        heading: "7. You must keep your account details safe",
        chunks: [
          paragraphs(
            "If you choose, or you are provided with, a user identification code, password or any other piece of information as part of our security procedures, you must treat such information as confidential. You must not disclose it to any third party.",
            "We have the right to disable any user identification code or password, whether chosen by you or allocated by us, at any time, if in our reasonable opinion you have failed to comply with any of the provisions of these terms of use.",
            "If you know or suspect that anyone other than you knows your user identification code or password, you must promptly notify us using the customer chat function on our site.",
          ),
        ],
      },
      {
        id: "how-you-may-use-material",
        heading: "8. How you may use material on our site",
        chunks: [
          paragraphs(
            "We are the owner or the licensee of all intellectual property rights in our site, and in the material published on it. Those works are protected by copyright laws and treaties around the world. All such rights are reserved.",
            "You may print off one copy, and may download extracts, of any page(s) from our site for your personal use and you may draw the attention of others within your organisation to content posted on our site.",
            "You must not modify the paper or digital copies of any materials you have printed off or downloaded in any way, and you must not use any illustrations, photographs, video or audio sequences or any graphics separately from any accompanying text.",
            "Our status (and that of any identified contributors) as the authors of content on our site must always be acknowledged.",
            "You must not use any part of the content on our site for commercial purposes without obtaining a licence to do so from us or our licensors.",
            "If you print off, copy or download any part of our site in breach of these terms of use, your right to use our site will cease immediately and you must, at our option, return or destroy any copies of the materials you have made.",
          ),
        ],
      },
      {
        id: "do-not-rely-on-information",
        heading: "9. Do not rely on information on this site",
        chunks: [
          paragraphs(
            "The content on our site is provided for general information only. It is not intended to amount to advice on which you should rely. You must obtain professional or specialist advice before taking, or refraining from, any action on the basis of the content on our site.",
            "Although we make reasonable efforts to update the information on our site, we make no representations, warranties or guarantees, whether express or implied, that the content on our site is accurate, complete or up to date.",
          ),
        ],
      },
      {
        id: "websites-we-link-to",
        heading: "10. We are not responsible for websites we link to",
        chunks: [
          paragraphs(
            "Where our site contains links to other sites and resources provided by third parties, these links are provided for your information only. Such links should not be interpreted as approval by us of those linked websites or information you may obtain from them.",
            "We have no control over the contents of those sites or resources.",
          ),
        ],
      },
      {
        id: "user-generated-content",
        heading: "11. User-generated content is not approved by us",
        chunks: [
          paragraphs(
            "This website may include information and materials uploaded by other users of the site, including to bulletin boards and chat rooms. This information and these materials have not been verified or approved by us. The views expressed by other users on our site do not represent our views or values.",
            "If you wish to complain about information and materials uploaded by other users please contact us using the customer chat function.",
          ),
        ],
      },
    ],
  },
  {
    id: "our-responsibilities",
    heading: "Our responsibilities",
    subsections: [
      {
        id: "our-responsibility-for-loss",
        heading: "12. Our responsibility for loss or damage suffered by you",
        chunks: [
          {
            lead: "Whether you are a consumer or a business user:",
            blocks: [
              {
                kind: "paragraphs",
                paragraphs: [
                  "We do not exclude or limit in any way our liability to you where it would be unlawful to do so. This includes liability for death or personal injury caused by our negligence or the negligence of our employees, agents or subcontractors and for fraud or fraudulent misrepresentation.",
                  "Different limitations and exclusions of liability will apply to liability arising as a result of the sale of electronic money and other services we provide to you, which will be set out in our Personal and Business Terms (as applicable).",
                ],
              },
            ],
          },
          {
            lead: "If you are a business user:",
            blocks: [
              {
                kind: "list",
                style: "bullet",
                items: [
                  "we exclude all implied conditions, warranties, representations or other terms that may apply to our site or any content on it;",
                  "we will not be liable to you for any loss or damage, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, even if foreseeable, arising under or in connection with:",
                ],
              },
              {
                kind: "list",
                style: "numbered",
                items: [
                  "use of, or inability to use, our site; or",
                  "use of or reliance on any content displayed on our site.",
                ],
              },
              {
                kind: "list",
                style: "bullet",
                items: ["in particular, we will not be liable for:"],
              },
              {
                kind: "list",
                style: "numbered",
                items: [
                  "loss of profits, sales, business, or revenue;",
                  "business interruption;",
                  "loss of anticipated savings;",
                  "loss of business opportunity, goodwill or reputation; or",
                  "any indirect or consequential loss or damage.",
                ],
              },
            ],
          },
          {
            lead: "If you are a consumer user:",
            blocks: [
              {
                kind: "list",
                style: "bullet",
                items: [
                  "please note that we only provide our site for domestic and private use. You agree not to use our site for any commercial or business purposes, and we have no liability to you for any loss of profit, loss of business, business interruption, or loss of business opportunity; and;",
                  "if defective digital content that we have supplied, damages a device or digital content belonging to you and this is caused by our failure to use reasonable care and skill, we will either repair the damage or pay you compensation. However, we will not be liable for damage that you could have avoided by following our advice to apply an update offered to you free of charge or for damage that was caused by you failing to correctly follow installation instructions or to have in place the minimum system requirements advised by us.",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "uploading-content",
        heading: "13. Uploading content to our site",
        chunks: [
          paragraphs(
            "Whenever you make use of a feature that allows you to upload content to our site, or to make contact with other users of our site, you must comply with the content standards set out in these terms.",
            "You warrant that any such contribution does comply with those standards, and you will be liable to us and indemnify us for any breach of that warranty. This means you will be responsible for any loss or damage we suffer as a result of your breach of warranty.",
            "Any content you upload to our site will be considered non-confidential and non-proprietary. You retain all of your ownership rights in your content, but you are required to grant us and other users of our site a limited licence to use, store and copy that content and to distribute and make it available to third parties.",
            "We also have the right to disclose your identity to any third party who is claiming that any content posted or uploaded by you to our site constitutes a violation of their intellectual property rights, or of their right to privacy.",
            "We have the right to remove any posting you make on our site if, in our opinion, your post does not comply with the content standards set out in these terms.",
            "You are solely responsible for securing and backing up your content.",
            "We are not responsible for viruses and you must not introduce them.",
            "We do not guarantee that our site will be secure or free from bugs or viruses.",
            "You are responsible for configuring your information technology, computer programmes and platform to access our site. You should use your own virus protection software.",
            "You must not misuse our site by knowingly introducing viruses, trojans, worms, logic bombs or other material that is malicious or technologically harmful. You must not attempt to gain unauthorised access to our site, the server on which our site is stored or any server, computer or database connected to our site. You must not attack our site via a denial-of-service attack or a distributed denial-of service attack. By breaching this provision, you would commit a criminal offence under the Computer Misuse Act 1990. We will report any such breach to the relevant law enforcement authorities and we will co-operate with those authorities by disclosing your identity to them. In the event of such a breach, your right to use our site will cease immediately.",
          ),
        ],
      },
      {
        id: "rules-about-linking",
        heading: "14. Rules about linking to our site",
        chunks: [
          paragraphs(
            "You may link to our home page, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it.",
            "You must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.",
            "You must not establish a link to our site in any website that is not owned by you.",
            "Our site must not be framed on any other site, nor may you create a link to any part of our site other than the home page.",
            "We reserve the right to withdraw linking permission without notice.",
            "The website in which you are linking must comply in all respects with the content standards set out in these terms.",
            "If you wish to link to or make any use of content on our site other than that set out above, please contact us using the customer chat function on the website.",
          ),
        ],
      },
    ],
  },
  {
    id: "legal-bits-and-pieces",
    heading: "Legal bits and pieces",
    subsections: [
      {
        id: "which-countrys-laws-apply",
        heading: "15. Which country's laws apply to any disputes?",
        chunks: [
          paragraphs(
            "If you are a consumer, please note that these terms of use, their subject matter and their formation, are governed by English law. You and we both agree that the courts of England and Wales will have exclusive jurisdiction except that if you are a resident of Northern Ireland you may also bring proceedings in Northern Ireland, and if you are resident of Scotland, you may also bring proceedings in Scotland.",
            "If you are a business, these terms of use, their subject matter and their formation (and any non-contractual disputes or claims) are governed by English law. We both agree to the exclusive jurisdiction of the courts of England and Wales.",
          ),
        ],
      },
      {
        id: "trade-marks",
        heading: "16. Our trade marks are registered",
        chunks: [
          paragraphs(
            "Utopia is a UK registered trade mark of Utopia Ltd. You are not permitted to use it without our approval, unless they are part of material you are using as permitted under How you may use material on our site.",
          ),
        ],
      },
    ],
  },
];
