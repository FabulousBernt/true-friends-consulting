/* True Friends — consulting page translations
 *
 * Adds consulting-only keys onto TF_TRANSLATIONS. Site-wide labels
 * (nav, footer, aria, contact, modal, hero.cta,
 * hero.consulting/studio labels, tagline, refCase labels) live in
 * js/translations/common.js. The about section is page-specific —
 * consulting and studio each carry their own copy.
 */
window.TF_ADD_TRANSLATIONS({
  en: {
    meta: {
      titleConsulting: "True Friends — Consulting",
    },
    hero: {
      lede: {
        consulting: "We provide consulting services in testing, ux/ui design, web/software development and cybersecurity.",
      },
    },
    about: {
      label: "About",
      ledeHTML:
        'Here at True Friends, we deliver both a <span class="accent">creative</span> vision and <span class="accent">technical</span> expertise to every project and role we take on.',
      body1:
        "We have a long experience in design, testing and development from numerous projects across both the private and public sectors.",
      body2:
        "Our vision is to be a close and genuine partner, a true friend to you as a customer, helping you build high-quality products and software solutions. To achieve this, we focus on gaining a deep understanding of your business, goals, customers, users, problems and challenges.",
      body3:
        "True Friends rests on a foundation of honesty, creativity, responsibility, and commitment. These pillars are essential for our work and our shared success.",
    },
    team: {
      label: "Consultants",
      cv: "Download cv",
      members: {
        johnny: {
          role: "Tester / UX/UI Designer",
          bio: "I like exploring and investigating software and solving problems for customers. I advocate usability, security and aesthetics.",
          cvHref: "cv/johnny-vigersten-cv-EN.pdf",
        },
      },
    },
    /* The reference cases, as a table in the consultant card. The sector
       and role per case were derived from the case prose and are recorded
       here, one source, so the table and the cases can never disagree.

       Roles read "UX/UI" rather than a middot: it is one discipline, not two,
       and the slash keeps the value inside the column. */
    work: {
      cols: { client: "client", sector: "sector", role: "role" },
      cases: {
        epiroc:      { sector: "Mining",      role: "Test · UX/UI" },
        sectra:      { sector: "Secure comms", role: "Test · UX/UI" },
        bufab:       { sector: "Distribution", role: "Test · UX/UI" },
        avarn:       { sector: "Security",    role: "Test · UX/UI" },
        skeKraft:    { sector: "Energy",      role: "UX/UI" },
        kopparbergs: { sector: "Brewing",     role: "Test · UX/UI" },
      },
    },
  },

  sv: {
    meta: {
      titleConsulting: "True Friends — Konsult",
    },
    hero: {
      lede: {
        consulting: "Vi erbjuder konsulttjänster inom testning, ux/ui-design, webb/mjukvaruutveckling och cybersäkerhet.",
      },
    },
    about: {
      label: "Om oss",
      ledeHTML:
        'Vi på True Friends levererar både en <span class="accent">kreativ</span> vision och <span class="accent">teknisk</span> expertis i varje projekt och roll som vi tar oss an.',
      body1:
        "Vi har lång erfarenhet av design, testning och utveckling från en mängd projekt inom både privat och offentlig sektor.",
      body2:
        "Vår vision är att vara en nära och genuin partner, en true friend för dig som kund och hjälpa dig att skapa högkvalitativa produkter och mjukvarulösningar. För att lyckas med detta fokuserar vi på att skapa en djup förståelse för din verksamhet, dina mål, kunder, användare och de problem och utmaningar ni står inför.",
      body3:
        "True Friends vilar på en grund av ärlighet, kreativitet, ansvarstagande och engagemang. Dessa värdeord är avgörande för vårt arbete och vår gemensamma framgång.",
    },
    team: {
      label: "Konsulter",
      cv: "Ladda ner CV",
      members: {
        johnny: {
          role: "Testare / Designer",
          bio: "Jag tycker om att utforska och undersöka mjukvara samt att lösa problem åt mina kunder. Jag förespråkar användbarhet, säkerhet och estetik.",
          cvHref: "cv/johnny-vigersten-cv-SE.pdf",
        },
      },
    },
    work: {
      cols: { client: "kund", sector: "bransch", role: "roll" },
      cases: {
        epiroc:      { sector: "Gruvutrustning",        role: "Test · UX/UI" },
        sectra:      { sector: "Säker kommunikation", role: "Test · UX/UI" },
        bufab:       { sector: "Distribution",        role: "Test · UX/UI" },
        avarn:       { sector: "Säkerhet",            role: "Test · UX/UI" },
        skeKraft:    { sector: "Energi",              role: "UX/UI" },
        kopparbergs: { sector: "Bryggeri",            role: "Test · UX/UI" },
      },
    },
  },
});
