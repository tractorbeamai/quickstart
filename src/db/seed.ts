import { drizzle } from "drizzle-orm/d1";
import { getPlatformProxy } from "wrangler";

import { candidates, intakeResponses } from "./schema";
import type { AIAnalysis, CandidateStatus, PipelineStage } from "./schema";

// Runs in Node, outside the Worker, so it borrows the local D1 binding from
// Wrangler instead of `cloudflare:workers`. Seeds the same .wrangler/ database
// that `pnpm dev` uses.
const proxy = await getPlatformProxy<Env>();
const db = drizzle(proxy.env.DB);

// Seed data for Taurean Talent Network

interface IntakeResponseData {
  questionKey: string;
  questionText: string;
  response: string;
}

interface MockCandidate {
  email: string;
  firstName: string;
  lastName: string;
  resumeText: string;
  resumeFileName: string;
  aiScore: number;
  aiAnalysis: AIAnalysis;
  qualified: boolean;
  status: CandidateStatus;
  pipelineStage: PipelineStage | null;
  intakeResponses?: IntakeResponseData[];
}

const mockCandidates: MockCandidate[] = [
  // 1. Exceptional candidate - Former PE Operating Partner
  {
    email: "sarah.chen@gmail.com",
    firstName: "Sarah",
    lastName: "Chen",
    resumeText: `
      SARAH CHEN
      Operating Partner | Private Equity Value Creation

      EXPERIENCE

      WARBURG PINCUS | Operating Partner
      2019 - Present
      - Lead operational transformation initiatives across $2B+ portfolio
      - Drove EBITDA margin improvement of 800bps at 3 portfolio companies
      - Oversee value creation playbook implementation across healthcare and tech investments

      BAIN & COMPANY | Partner
      2012 - 2019
      - Led private equity due diligence and post-merger integration practice
      - Advised PE funds on operational improvements worth $500M+ in value creation
      - Built team of 25+ consultants focused on PE portfolio operations

      GENERAL ELECTRIC | VP Operations
      2006 - 2012
      - Led lean transformation across $1.2B manufacturing division
      - Reduced operating costs by 22% through Six Sigma initiatives

      EDUCATION
      Harvard Business School, MBA
      MIT, BS Mechanical Engineering
    `,
    resumeFileName: "sarah_chen_resume.pdf",
    aiScore: 95,
    aiAnalysis: {
      peExposure: 10,
      seniority: 10,
      functionalDepth: 9,
      cultureSignals: 10,
      strengths: [
        "Direct PE operating experience at top-tier fund",
        "Proven track record of EBITDA improvement",
        "MBB consulting pedigree with PE focus",
        "Strong functional leadership in operations",
      ],
      concerns: [],
      reasons: [
        "Current Operating Partner at Warburg Pincus",
        "Direct PE operating experience",
        "Top-tier consulting background (Bain)",
        "MBA from Harvard Business School",
        "15+ years of experience",
      ],
    },
    qualified: true,
    status: "qualified",
    pipelineStage: "in_conversation",
    intakeResponses: [
      {
        questionKey: "current_situation",
        questionText:
          "What's your current role, and what's prompting you to explore new opportunities?",
        response:
          "I'm currently an Operating Partner at Warburg Pincus, where I've been for 5 years. I'm looking for a more hands-on CEO or COO role at a portfolio company where I can drive transformation directly rather than in an advisory capacity.",
      },
      {
        questionKey: "pe_exposure",
        questionText:
          "Have you worked directly with private equity firms before, either at a fund or within a portfolio company?",
        response:
          "Yes, extensively. I've been in the PE ecosystem for over 10 years - first as a Bain partner advising PE funds, then directly at Warburg as an Operating Partner. I've worked with funds ranging from $500M to $5B in AUM.",
      },
      {
        questionKey: "value_creation",
        questionText:
          "When you step into a new organization, how do you typically approach the first 100 days?",
        response:
          "I start with a rapid diagnostic - understanding the P&L levers, talking to customers, and assessing the management team. By day 30, I have a prioritized list of quick wins and longer-term initiatives. The key is balancing near-term EBITDA improvement with investments in growth.",
      },
      {
        questionKey: "functional_expertise",
        questionText: "What would you say is your core functional superpower?",
        response:
          "Operations transformation. I can walk into any manufacturing or service delivery environment and identify inefficiencies quickly. My GE lean background combined with strategic consulting lets me see both the forest and the trees.",
      },
      {
        questionKey: "ideal_role",
        questionText: "Describe your ideal next role.",
        response:
          "CEO or COO of a PE-backed company in the $100-500M revenue range. Ideally a carve-out or turnaround situation where I can apply the full playbook. Healthcare services or industrial tech would be exciting.",
      },
    ],
  },

  // 2. Strong candidate - CFO with PE portfolio experience
  {
    email: "michael.rodriguez@outlook.com",
    firstName: "Michael",
    lastName: "Rodriguez",
    resumeText: `
      MICHAEL RODRIGUEZ, CPA
      Chief Financial Officer

      EXPERIENCE

      ACCEL-KKR PORTFOLIO COMPANY | CFO
      2020 - Present
      - Lead finance function for $180M revenue B2B SaaS company
      - Drove successful refinancing saving $3M annually in interest
      - Built FP&A capabilities supporting 40% revenue growth

      DELOITTE | Senior Manager, Transaction Advisory
      2014 - 2020
      - Led financial due diligence for PE acquisitions totaling $8B+
      - Specialized in technology and software sector
      - Quality of earnings analysis and working capital optimization

      KPMG | Manager, Audit
      2010 - 2014
      - Managed audit engagements for technology companies

      EDUCATION
      Northwestern Kellogg, MBA
      University of Illinois, BS Accounting
      CPA, CFA Charterholder
    `,
    resumeFileName: "michael_rodriguez_cv.pdf",
    aiScore: 87,
    aiAnalysis: {
      peExposure: 9,
      seniority: 8,
      functionalDepth: 9,
      cultureSignals: 8,
      strengths: [
        "Current CFO at PE-backed company",
        "Big 4 transaction advisory background",
        "Strong financial credentials (CPA, CFA)",
        "Deep software sector expertise",
      ],
      concerns: [],
      reasons: [
        "Portfolio company CFO experience",
        "Senior role at Deloitte Transaction Advisory",
        "MBA from Kellogg",
        "12+ years experience",
        "Value creation keywords: due diligence, working capital",
      ],
    },
    qualified: true,
    status: "qualified",
    pipelineStage: "qualified",
    intakeResponses: [
      {
        questionKey: "current_situation",
        questionText:
          "What's your current role, and what's prompting you to explore new opportunities?",
        response:
          "I'm CFO at an Accel-KKR portfolio company. The company is preparing for a sale process next year, so I'm starting to think about my next chapter. Looking for a larger platform or a company earlier in its PE journey.",
      },
      {
        questionKey: "pe_exposure",
        questionText: "Have you worked directly with private equity firms before?",
        response:
          "Yes - both as an advisor at Deloitte where I did QofE work for dozens of PE deals, and now as a portfolio company CFO reporting to PE board members. I'm very comfortable with the PE operating model and reporting cadence.",
      },
    ],
  },

  // 3. Qualified - COO from healthcare services
  {
    email: "jennifer.patel@healthco.com",
    firstName: "Jennifer",
    lastName: "Patel",
    resumeText: `
      JENNIFER PATEL
      Chief Operating Officer

      EXPERIENCE

      REGIONAL HEALTHCARE NETWORK | COO
      2018 - Present
      - Oversee operations for 12-hospital system with $2.1B revenue
      - Led integration of 3 acquired facilities post-merger
      - Implemented operational improvements generating $45M in annual savings

      MCKINSEY & COMPANY | Engagement Manager
      2013 - 2018
      - Healthcare practice focused on provider operations
      - Led turnaround engagements for health systems

      MAYO CLINIC | Operations Manager
      2009 - 2013
      - Managed operations for 200-bed facility

      EDUCATION
      University of Chicago Booth, MBA
      Duke University, BA Economics
    `,
    resumeFileName: "jennifer_patel_resume.docx",
    aiScore: 82,
    aiAnalysis: {
      peExposure: 6,
      seniority: 9,
      functionalDepth: 8,
      cultureSignals: 8,
      strengths: [
        "C-suite experience at scale",
        "McKinsey pedigree",
        "Deep healthcare operations expertise",
        "Track record of post-merger integration",
      ],
      concerns: ["Limited direct PE fund experience"],
      reasons: [
        "COO at major healthcare system",
        "Top-tier consulting (McKinsey)",
        "MBA from Booth",
        "Integration and transformation experience",
      ],
    },
    qualified: true,
    status: "contacted",
    pipelineStage: "outreach_sent",
  },

  // 4. Qualified - VP of Sales, software
  {
    email: "david.kim@salesforce.com",
    firstName: "David",
    lastName: "Kim",
    resumeText: `
      DAVID KIM
      Vice President of Sales

      EXPERIENCE

      ENTERPRISE SOFTWARE COMPANY (PE-BACKED) | VP Sales
      2019 - Present
      - Built sales organization from $20M to $85M ARR
      - Implemented sales playbook and methodology
      - Grew team from 8 to 45 quota-carrying reps

      SALESFORCE | Regional Director
      2014 - 2019
      - Led mid-market sales team exceeding quota 5 consecutive years
      - President's Club member 4x

      ORACLE | Account Executive
      2010 - 2014

      EDUCATION
      UC Berkeley Haas, MBA
      UCLA, BS Business Economics
    `,
    resumeFileName: "david_kim_cv.pdf",
    aiScore: 76,
    aiAnalysis: {
      peExposure: 7,
      seniority: 7,
      functionalDepth: 8,
      cultureSignals: 7,
      strengths: [
        "Proven revenue growth track record",
        "Experience scaling PE-backed company",
        "Strong enterprise software background",
      ],
      concerns: ["Primarily sales-focused, not general management"],
      reasons: [
        "VP at PE-backed company",
        "MBA from Haas",
        "Revenue growth track record",
        "10+ years experience",
      ],
    },
    qualified: true,
    status: "new",
    pipelineStage: "new_submissions",
  },

  // 5. Qualified - CHRO with transformation experience
  {
    email: "amanda.foster@hrleader.com",
    firstName: "Amanda",
    lastName: "Foster",
    resumeText: `
      AMANDA FOSTER
      Chief Human Resources Officer

      EXPERIENCE

      INDUSTRIAL MANUFACTURING CO (VISTA EQUITY) | CHRO
      2020 - Present
      - Led HR transformation for $400M Vista portfolio company
      - Implemented talent management system reducing turnover 35%
      - Designed executive compensation aligned with value creation

      ACCENTURE | Managing Director, Talent & Organization
      2015 - 2020
      - Led HR transformation engagements for Fortune 500 clients
      - Specialized in M&A people integration

      EDUCATION
      Wharton, MBA
      Cornell ILR, BS
    `,
    resumeFileName: "amanda_foster_resume.pdf",
    aiScore: 79,
    aiAnalysis: {
      peExposure: 8,
      seniority: 8,
      functionalDepth: 8,
      cultureSignals: 7,
      strengths: [
        "CHRO at Vista portfolio company",
        "Accenture transformation background",
        "M&A integration expertise",
      ],
      concerns: [],
      reasons: [
        "Portfolio company CHRO",
        "Senior consulting (Accenture)",
        "MBA from Wharton",
        "Transformation and M&A keywords",
      ],
    },
    qualified: true,
    status: "reviewing",
    pipelineStage: "under_review",
  },

  // 6. Qualified - CTO, software
  {
    email: "robert.zhang@techleader.io",
    firstName: "Robert",
    lastName: "Zhang",
    resumeText: `
      ROBERT ZHANG
      Chief Technology Officer

      EXPERIENCE

      GROWTH EQUITY BACKED SAAS | CTO
      2018 - Present
      - Lead technology for $120M ARR vertical SaaS platform
      - Migrated to cloud infrastructure reducing costs 40%
      - Built AI/ML capabilities driving product differentiation

      AMAZON WEB SERVICES | Principal Engineer
      2013 - 2018
      - Led development of enterprise database services

      GOOGLE | Senior Engineer
      2008 - 2013

      EDUCATION
      Stanford, MS Computer Science
      Caltech, BS Computer Science
    `,
    resumeFileName: "robert_zhang_resume.pdf",
    aiScore: 74,
    aiAnalysis: {
      peExposure: 6,
      seniority: 8,
      functionalDepth: 9,
      cultureSignals: 6,
      strengths: [
        "CTO at growth equity backed company",
        "FAANG engineering pedigree",
        "Technical depth with business impact",
      ],
      concerns: ["More technical than operational focus"],
      reasons: [
        "CTO at PE-backed company",
        "Director-level experience",
        "Technology leadership in software",
        "15+ years experience",
      ],
    },
    qualified: true,
    status: "new",
    pipelineStage: "new_submissions",
  },

  // 7. Not Qualified - Too junior
  {
    email: "emily.johnson@startup.co",
    firstName: "Emily",
    lastName: "Johnson",
    resumeText: `
      EMILY JOHNSON
      Senior Analyst

      EXPERIENCE

      TECH STARTUP | Senior Analyst
      2022 - Present
      - Support product development initiatives
      - Create presentations for leadership

      CONSULTING FIRM | Analyst
      2020 - 2022
      - Conducted market research
      - Built financial models

      EDUCATION
      NYU Stern, BS Finance
      Graduated 2020
    `,
    resumeFileName: "emily_johnson_cv.pdf",
    aiScore: 28,
    aiAnalysis: {
      peExposure: 1,
      seniority: 2,
      functionalDepth: 3,
      cultureSignals: 2,
      strengths: ["Finance education"],
      concerns: [
        "Less than 5 years experience",
        "No leadership experience",
        "Entry-level roles only",
      ],
      reasons: ["Insufficient experience level"],
    },
    qualified: false,
    status: "rejected",
    pipelineStage: null,
  },

  // 8. Not Qualified - Wrong industry focus
  {
    email: "james.wilson@nonprofit.org",
    firstName: "James",
    lastName: "Wilson",
    resumeText: `
      JAMES WILSON
      Executive Director

      EXPERIENCE

      COMMUNITY NONPROFIT | Executive Director
      2015 - Present
      - Lead 50-person organization with $8M budget
      - Manage donor relations and fundraising

      GOVERNMENT AGENCY | Program Manager
      2010 - 2015
      - Oversaw public health programs

      EDUCATION
      Georgetown, MPA
      Boston College, BA Political Science
    `,
    resumeFileName: "james_wilson_resume.pdf",
    aiScore: 35,
    aiAnalysis: {
      peExposure: 0,
      seniority: 5,
      functionalDepth: 3,
      cultureSignals: 2,
      strengths: ["Leadership experience", "Budget management"],
      concerns: [
        "No private sector experience",
        "No PE exposure",
        "Different skill set for PE value creation",
      ],
      reasons: ["No qualifying signals"],
    },
    qualified: false,
    status: "rejected",
    pipelineStage: null,
  },

  // 9. Not Qualified - Recent graduate
  {
    email: "alex.martinez@university.edu",
    firstName: "Alex",
    lastName: "Martinez",
    resumeText: `
      ALEX MARTINEZ
      MBA Candidate

      EXPERIENCE

      SUMMER INTERNSHIP | Strategy Intern
      Summer 2024
      - Supported due diligence on 2 transactions

      BANK | Analyst
      2021 - 2023
      - Investment banking analyst
      - M&A transaction support

      EDUCATION
      Columbia Business School, MBA (expected 2025)
      University of Texas, BBA Finance
    `,
    resumeFileName: "alex_martinez_cv.pdf",
    aiScore: 42,
    aiAnalysis: {
      peExposure: 3,
      seniority: 3,
      functionalDepth: 4,
      cultureSignals: 5,
      strengths: ["Strong academic credentials", "IB experience", "Due diligence exposure"],
      concerns: ["Less than 5 years experience", "Still in school", "No management experience"],
      reasons: ["Insufficient experience level"],
    },
    qualified: false,
    status: "rejected",
    pipelineStage: null,
  },

  // 10. Not Qualified - Individual contributor
  {
    email: "lisa.thompson@engineer.com",
    firstName: "Lisa",
    lastName: "Thompson",
    resumeText: `
      LISA THOMPSON
      Senior Software Engineer

      EXPERIENCE

      TECH COMPANY | Senior Engineer
      2018 - Present
      - Individual contributor on product team
      - Backend development in Python

      STARTUP | Software Developer
      2014 - 2018
      - Full stack development

      EDUCATION
      Georgia Tech, MS Computer Science
      Georgia Tech, BS Computer Science
    `,
    resumeFileName: "lisa_thompson_resume.pdf",
    aiScore: 38,
    aiAnalysis: {
      peExposure: 1,
      seniority: 4,
      functionalDepth: 6,
      cultureSignals: 2,
      strengths: ["Technical expertise", "10 years experience"],
      concerns: [
        "Individual contributor role",
        "No leadership or management experience",
        "No PE or business transformation exposure",
      ],
      reasons: ["No leadership experience evident"],
    },
    qualified: false,
    status: "rejected",
    pipelineStage: null,
  },
];

async function seed() {
  console.log("🌱 Seeding Taurean Talent Network database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- intentionally clearing all data for seed
  await db.delete(intakeResponses);
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- intentionally clearing all data for seed
  await db.delete(candidates);

  // Insert candidates
  console.log("Inserting candidates...");
  for (const candidateData of mockCandidates) {
    const { intakeResponses: responses, ...candidate } = candidateData;

    // Insert candidate
    const [insertedCandidate] = await db
      .insert(candidates)
      .values({
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        resumeText: candidate.resumeText,
        resumeFileName: candidate.resumeFileName,
        aiScore: candidate.aiScore,
        aiAnalysis: candidate.aiAnalysis,
        qualified: candidate.qualified,
        status: candidate.status,
        pipelineStage: candidate.pipelineStage ?? undefined,
      })
      .returning();

    console.log(
      `  ✓ ${candidate.firstName} ${candidate.lastName} (Score: ${candidate.aiScore}, ${candidate.qualified ? "Qualified" : "Not Qualified"})`,
    );

    // Insert intake responses if any
    if (responses && responses.length > 0) {
      for (const response of responses) {
        await db.insert(intakeResponses).values({
          candidateId: insertedCandidate.id,
          questionKey: response.questionKey,
          questionText: response.questionText,
          response: response.response,
        });
      }
      console.log(`    └─ ${responses.length} intake responses`);
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   ${mockCandidates.length} candidates created`);
  console.log(`   ${mockCandidates.filter((c) => c.qualified).length} qualified`);
  console.log(`   ${mockCandidates.filter((c) => !c.qualified).length} not qualified`);
}

try {
  await seed();
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exitCode = 1;
} finally {
  await proxy.dispose();
}
