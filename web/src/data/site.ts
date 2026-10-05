/**
 * Single source of truth for landing-page copy.
 *
 * SOURCES
 *  - Institution names, accreditations and the "at a glance" figures come from the
 *    official HR Conclave 2026 deck (`hr_conclave_2026_final.pptx`), slides 2, 4, 6,
 *    7, 8 and 13.
 *  - Counsellor details come from the official visiting card (`venugopal visiting card
 *    ngi.pdf`).
 *  - Everything is still worth re-checking each admission cycle — see the notes on
 *    individual fields.
 *
 * VERIFIED vs NOT
 *  `institutions` lists all six units from the "Wings of Nagarjuna" slide. Only NCET
 *  and Nagarjuna Degree College have programme detail attached, because only those
 *  two could be corroborated from public sources. The other four carry name only —
 *  add detail as it is confirmed; the grid handles missing fields.
 */

export const site = {
  name: "Nagarjuna Group of Institutions",
  shortName: "NGI",
  tagline: "Admissions 2026–27",
  description:
    "Admissions to the Nagarjuna Group of Institutions — NAAC A+ accredited, autonomous under VTU, and consistently placed across Bengaluru.",
  logo: "/ngi-logo.png",
  helpline: "+91 99491 66771",
  email: "admissionsap@ncetmail.com",
} as const;

export type Institution = {
  slug: string;
  name: string;
  shortName: string;
  location?: string;
  about?: string;
  programmes?: string[];
  website?: string;
  featured?: boolean;
};

export const institutions: Institution[] = [
  {
    slug: "ncet",
    name: "Nagarjuna College of Engineering & Technology",
    shortName: "NCET",
    location: "Devanahalli, Bengaluru",
    about:
      "The group's flagship engineering and technology institution — autonomous under VTU until 2031–32, NAAC A+ (Cycle II), with NBA accreditation for CSE and ECE.",
    programmes: [
      "B.E. Computer Science & Engineering",
      "B.E. CSE (AI & ML)",
      "B.E. CSE (Data Science)",
      "B.E. CSE (Cyber Security)",
      "B.E. Information Science & Engineering",
      "B.E. Electronics & Communication",
      "B.E. Civil Engineering",
      "BCA",
      "MBA",
      "MCA",
    ],
    website: "https://www.ncet.co.in",
    featured: true,
  },
  {
    slug: "nagarjuna-degree-college",
    name: "Nagarjuna Degree College",
    shortName: "NDC",
    location: "Yelahanka, Bengaluru",
    about:
      "A long-standing undergraduate college offering science, commerce and arts degrees with a focus on accessible, career-oriented higher education.",
    programmes: ["B.Sc.", "B.Com", "B.A.", "B.Sc. Computer Science"],
    website: "https://www.nagarjunadegreecollege.co.in",
  },
  {
    slug: "ngi",
    name: "Nagarjuna Group of Institutions",
    shortName: "NGI",
    about:
      "The apex body uniting all six Nagarjuna institutions, governed by the Nagarjuna Education Society, Yelahanka, Bengaluru.",
  },
  {
    slug: "novus-vidyaniketan",
    name: "Nagarjuna Novus Vidyaniketan",
    shortName: "Novus",
  },
  {
    slug: "nagarjuna-cms",
    name: "Nagarjuna College of Management Studies",
    shortName: "NCMS",
  },
  {
    slug: "nagarjuna-pre-university",
    name: "Nagarjuna Pre-University College",
    shortName: "Pre-University",
  },
];

/** "NCET at a Glance", academic year 2025–26 (deck slide 6). */
export type Stat = {
  value: number;
  suffix?: string;
  label: string;
  hint?: string;
};

export const stats: Stat[] = [
  { value: 25, label: "Years of operation", hint: "Established 2001" },
  { value: 11, label: "Programmes offered", hint: "UG and PG" },
  { value: 1152, label: "Sanctioned seats", hint: "Academic year 2025–26" },
  { value: 159, label: "Faculty members", hint: "48 hold doctorates" },
];

/** 10+ accreditations and certifications (deck slides 7 and 13). */
export const accreditations: string[] = [
  "NAAC A+ (Cycle II)",
  "NBA Accredited — CSE & ECE",
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 22000",
  "UGC Recognised",
  "NIRF Ranked",
  "MoE Innovation Council (IIC)",
  "Autonomous under VTU to 2031–32",
  "AICTE Approved · IDEA Lab",
];

export type Program = {
  code: string;
  name: string;
  duration: string;
  level: "UG" | "PG";
  tags: string[];
  careers: string;
  institution: string;
};

export const programs: Program[] = [
  {
    code: "B.E / CSE",
    name: "Computer Science & Engineering",
    duration: "4 Years",
    level: "UG",
    tags: ["Power BI", "GitHub", "Full-Stack"],
    careers: "Software Engineer · Developer · System Analyst",
    institution: "NCET",
  },
  {
    code: "B.E / CSE (AI & ML)",
    name: "Artificial Intelligence & Machine Learning",
    duration: "4 Years",
    level: "UG",
    tags: ["Deep Learning", "Cloud", "DevOps"],
    careers: "AIML Engineer · NLP Engineer · DL Specialist",
    institution: "NCET",
  },
  {
    code: "B.E / CSE (DS)",
    name: "Data Science",
    duration: "4 Years",
    level: "UG",
    tags: ["Statistics", "Analytics", "Machine Learning"],
    careers: "Data Scientist · Big Data Analyst · Data Engineer",
    institution: "NCET",
  },
  {
    code: "B.E / CSE (CS)",
    name: "Cyber Security",
    duration: "4 Years",
    level: "UG",
    tags: ["IoT", "Blockchain", "Ethical Hacking"],
    careers: "InfoSec Officer · Security Architect · Cyber Investigator",
    institution: "NCET",
  },
  {
    code: "B.E / ISE",
    name: "Information Science & Engineering",
    duration: "4 Years",
    level: "UG",
    tags: ["Database Systems", "Cloud", "Analytics"],
    careers: "Database Admin · Solutions Architect · IT Lead",
    institution: "NCET",
  },
  {
    code: "B.E / ECE",
    name: "Electronics & Communication",
    duration: "4 Years",
    level: "UG",
    tags: ["5G", "VLSI", "Embedded Systems"],
    careers: "SoC Designer · RF Engineer · Embedded Developer",
    institution: "NCET",
  },
  {
    code: "BCA",
    name: "Bachelor of Computer Applications",
    duration: "3 Years",
    level: "UG",
    tags: ["Python", "ASP.NET", "Software Testing"],
    careers: "Web Developer · Hardware Engineer · IT Architect",
    institution: "NCET",
  },
  {
    code: "MBA / MCA",
    name: "Postgraduate Management & Computer Applications",
    duration: "2 Years",
    level: "PG",
    tags: ["Management", "Specialisation", "Industry Projects"],
    careers: "Business Analyst · Tech Lead · Enterprise Architect",
    institution: "NCET",
  },
];

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Submit Enquiry",
    description:
      "Fill the short application form with your inter-college details and exam number. It takes under two minutes.",
  },
  {
    step: "02",
    title: "Counsellor Call",
    description:
      "Our regional admission counsellor contacts you to confirm eligibility, programme fit and campus visit timings.",
  },
  {
    step: "03",
    title: "Document Verification",
    description:
      "Share your mark sheets and entrance exam scorecard for verification against AICTE and university norms.",
  },
  {
    step: "04",
    title: "Seat Allotment",
    description:
      "Receive your offer letter and confirm the seat by paying the token amount through the official portal.",
  },
  {
    step: "05",
    title: "Enrol & Orient",
    description:
      "Complete formalities, receive your student ID, and join the induction and campus orientation programme.",
  },
];

/** Campus and learning ecosystem highlights (deck slide 8). */
export const campusHighlights = [
  {
    title: "Library & Information Centre",
    detail: "45,106 volumes · 19,203 e-books · 6,746 e-journals",
  },
  {
    title: "Digital teaching",
    detail: "A laptop for every first-year student · 1 Gbps campus Wi-Fi",
  },
  {
    title: "Innovation spaces",
    detail: "AICTE IDEA Lab · Creative Learning Centre · language lab",
  },
  {
    title: "Student welfare",
    detail: "Health centre · sport · transport · rooftop solar",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "How do I apply for admission?",
    answer:
      "Fill the application form on this page with your inter-college details and entrance exam number. Our regional counsellor will call you within one working day to guide you through the remaining steps.",
  },
  {
    question: "What are the minimum eligibility criteria?",
    answer:
      "Candidates must meet the eligibility norms set by AICTE and the affiliating university for each programme — typically a pass in the qualifying examination with the required aggregate.",
  },
  {
    question: "Can I get direct admission?",
    answer:
      "Direct admission is offered after comprehensive record verification and a mandatory student interview to ensure candidate suitability.",
  },
  {
    question: "Which documents are required?",
    answer:
      "Keep your Class X and XII mark sheets, transfer certificate, migration certificate, entrance exam scorecard (KCET / JEE Main / CET) and government-issued photo ID ready.",
  },
  {
    question: "Do you offer hostel facilities?",
    answer:
      "Yes. Separate hostels for boys and girls are available on campus with modern amenities, 24/7 security and hygienic dining.",
  },
  {
    question: "Which institutions are part of the group?",
    answer:
      "The Nagarjuna Group of Institutions unites six units — Nagarjuna College of Engineering & Technology, Nagarjuna Novus Vidyaniketan, Nagarjuna Degree College, Nagarjuna College of Management Studies, Nagarjuna Pre-University College and the group body itself, all governed by the Nagarjuna Education Society, Yelahanka, Bengaluru.",
  },
];

/**
 * Fallback shown if the counsellor API is unreachable, so the page never
 * renders a contact block with no way to reach a human. Kept in sync with
 * api/src/seed.js.
 */
export const fallbackCounselor = {
  name: "Venugopal Reddy N",
  designation: "Director – Admissions",
  region: "Andhra Pradesh",
  phones: ["9949166771", "9985165771"],
  email: "admissionsap@ncetmail.com",
  officeAddress:
    "#105-B, 1st Floor, Sai Vasanth Complex, N.G. Birla Compound, Kurnool – 518002",
} as const;
