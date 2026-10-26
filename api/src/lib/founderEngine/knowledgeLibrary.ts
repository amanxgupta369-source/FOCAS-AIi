/**
 * FOCAS Founder Knowledge Library
 *
 * A versioned, structured repository of battle-tested founder frameworks
 * from first-principles methodology (The Mom Test, Lean Startup, Customer Development,
 * High-Growth Handbook, Zero to One).
 *
 * Each framework is explicitly structured with:
 * - Unique identifier
 * - Area / Domain
 * - Purpose
 * - Required inputs
 * - Decision rules
 * - Known limitations
 * - Real-world application examples
 * - Provenance / Source
 * - Version
 */

export interface KnowledgeFramework {
  id: string
  area:
    | 'customer_discovery'
    | 'problem_validation'
    | 'market_hypotheses'
    | 'competitor_analysis'
    | 'product_feasibility'
    | 'pricing_business_models'
    | 'distribution_acquisition'
    | 'product_market_fit'
    | 'experiment_design'
    | 'financial_fundamentals'
    | 'technical_operational_risk'
  title: string
  purpose: string
  requiredInputs: string[]
  decisionRules: string[]
  limitations: string[]
  examples: string[]
  source: string
  version: string
}

export const FOUNDER_KNOWLEDGE_LIBRARY: KnowledgeFramework[] = [
  // 1. Customer Discovery
  {
    id: 'FW-CUST-001',
    area: 'customer_discovery',
    title: "The Mom Test Customer Interview Protocol",
    purpose: 'Validate actual past customer behavior rather than hypothetical future intentions.',
    requiredInputs: ['targetCustomer', 'suspectedProblem', 'currentWorkaround'],
    decisionRules: [
      'Never ask if a customer "would like" or "would pay for" an idea; people lie to be polite.',
      'Ask about the last time the problem occurred, what was specifically done, and how much time/money was spent.',
      'If the user has not actively sought a workaround in the last 6 months, the pain is low-priority.',
    ],
    limitations: [
      'Cannot reveal latent demand for genuinely novel behavioral paradigm shifts.',
      'Susceptible to user recall bias on historical costs.',
    ],
    examples: [
      'Instead of "Would you pay for a meal-planning app?", ask "How did you plan dinner yesterday and what went wrong?"',
    ],
    source: 'Rob Fitzpatrick (The Mom Test, 2013)',
    version: '1.0.0',
  },
  {
    id: 'FW-CUST-002',
    area: 'customer_discovery',
    title: 'Beachhead Segment Concentration',
    purpose: 'Isolate a narrow, underserved customer niche where the startup can establish dominant share before expanding.',
    requiredInputs: ['broadCustomer', 'narrowSegment', 'geographyOrContext'],
    decisionRules: [
      'If the target customer is defined as "everyone" or "all small businesses", segment viability fails.',
      'A valid beachhead has homogeneous pain, shared references for word-of-mouth, and accessible distribution channels.',
    ],
    limitations: [
      'Niches that are too small may not sustain venture scale without sequential adjacency expansion.',
    ],
    examples: [
      'Facebook starting exclusively with Harvard undergraduates before opening to other universities.',
    ],
    source: 'Bill Aulet (Disciplined Entrepreneurship, 2013)',
    version: '1.0.0',
  },

  // 2. Problem Validation
  {
    id: 'FW-PROB-001',
    area: 'problem_validation',
    title: 'Hair-on-Fire vs Nice-to-Have Acid Test',
    purpose: 'Distinguish existential operational or economic pain from convenient optimizations.',
    requiredInputs: ['problemDescription', 'frequency', 'consequenceOfDoingNothing'],
    decisionRules: [
      'High severity requires either direct revenue loss, compliance penalty, or severe emotional distress.',
      'Infrequent problems (< once per quarter) struggle with user retention unless individual transaction value is very high.',
      'If customers can easily live without fixing the problem today, sales cycles will exceed founder runway.',
    ],
    limitations: [
      'Some high-frequency entertainment or novelty consumer products bypass economic pain frameworks.',
    ],
    examples: [
      'Payroll tax compliance software (existential fine) vs daily motivation wallpaper app (nice to have).',
    ],
    source: 'Michael Seibel (Y Combinator Startup School, 2019)',
    version: '1.0.0',
  },

  // 3. Market Hypotheses
  {
    id: 'FW-MKT-001',
    area: 'market_hypotheses',
    title: 'Bottom-Up Market Sizing Heuristic',
    purpose: 'Estimate addressable market without relying on generic top-down industry research reports.',
    requiredInputs: ['targetCustomerCount', 'realisticAnnualContractValue'],
    decisionRules: [
      'Never calculate market size as "If we get 1% of a $50B market".',
      'Calculate Addressable Revenue = (Number of identifiable potential buyers) × (Annual price they can justify).',
      'If TAM < $10M, business must be built as a high-margin micro-business rather than venture-backed startup.',
    ],
    limitations: [
      'Assumes stable price elasticity and static market boundary.',
    ],
    examples: [
      '25,000 independent coffee roasters in US × $1,200/year software = $30M total addressable niche.',
    ],
    source: 'Steve Blank (The Four Steps to the Epiphany, 2005)',
    version: '1.0.0',
  },

  // 4. Competitor Analysis
  {
    id: 'FW-COMP-001',
    area: 'competitor_analysis',
    title: 'Status-Quo & Manual Workaround Dominance',
    purpose: 'Identify the true competitor: customer inertia, spreadsheets, and doing nothing.',
    requiredInputs: ['claimedCompetitors', 'currentWorkarounds'],
    decisionRules: [
      'If a founder claims "we have no competitors", they are confusing direct software clones with actual alternatives.',
      'Spreadsheets (Excel / Google Sheets), email, manual paper notes, and "doing nothing" are competitors in 80%+ of B2B ideas.',
      'Switching costs include retraining staff and migration friction, requiring a 10x improvement on at least one core metric.',
    ],
    limitations: [
      'In newly legalized or newly created markets, workarounds may be completely absent.',
    ],
    examples: [
      'A project management tool does not just compete with Asana; it competes with a WhatsApp group and a whiteboard.',
    ],
    source: 'Peter Thiel (Zero to One, 2014)',
    version: '1.0.0',
  },

  // 5. Product Feasibility
  {
    id: 'FW-FEAS-001',
    area: 'product_feasibility',
    title: 'MVP Scope & Minimum Viable Test',
    purpose: 'Strip non-essential features and isolate the single hypothesis that must hold for the product to matter.',
    requiredInputs: ['proposedFeatures', 'coreValueProposition', 'technicalBudget'],
    decisionRules: [
      'An MVP should test the highest-risk assumption with the minimum code possible.',
      'Any feature not directly addressing the primary problem must be postponed to post-validation.',
      'If initial build requires > 3 months of solo development, re-scope into a manual or concierge pilot.',
    ],
    limitations: [
      'High-reliability environments (healthcare diagnostics, aircraft firmware) cannot deploy low-fidelity MVPs.',
    ],
    examples: [
      'AngelList starting as a curated email newsletter before building an investor platform.',
    ],
    source: 'Eric Ries (The Lean Startup, 2011)',
    version: '1.0.0',
  },

  // 6. Pricing & Business Models
  {
    id: 'FW-PRIC-001',
    area: 'pricing_business_models',
    title: 'Value-Metric & Willingness-to-Pay Mapping',
    purpose: 'Align pricing structure with the metric where customer derives perceived economic or operational value.',
    requiredInputs: ['businessModel', 'whoPays', 'valueDelivered'],
    decisionRules: [
      'Charge based on how the customer creates or saves value (per user, per transaction, per gigabyte, per lead).',
      'Free tiers without a clear upsell trigger or enterprise barrier create high support drag without conversion.',
      'B2B software priced under $50/month cannot support paid sales reps; it must rely on self-serve onboarding.',
    ],
    limitations: [
      'Complex enterprise procurement contracts often demand fixed-bracket seat pricing.',
    ],
    examples: [
      'Stripe pricing per successful payment rather than a flat monthly fee.',
    ],
    source: 'Patrick Campbell (ProfitWell Pricing Framework, 2018)',
    version: '1.0.0',
  },

  // 7. Distribution & Acquisition
  {
    id: 'FW-DIST-001',
    area: 'distribution_acquisition',
    title: 'Channel-Product Fit & The Law of Bullseye Distribution',
    purpose: 'Identify a repeatable, scalable channel to acquire customers sustainably before building features.',
    requiredInputs: ['targetCustomer', 'pricingTier', 'acquisitionHypothesis'],
    decisionRules: [
      'Poor distribution—not poor product—is the #1 cause of failure in early-stage startups.',
      'Low LTV (< $500) requires organic search, viral loops, or high-intent UGC.',
      'High LTV (> $10,000) permits outbound founder-led enterprise sales and account-based marketing.',
      'Do not test 10 channels at once; pick 1 primary channel and run rigorous tests until exhausted.',
    ],
    limitations: [
      'Channels undergo saturation over time; early cost advantages diminish as competitors enter.',
    ],
    examples: [
      'Dropbox using two-sided referral storage incentives to drive viral growth.',
    ],
    source: 'Gabriel Weinberg & Justin Mares (Traction, 2014)',
    version: '1.0.0',
  },

  // 8. Product-Market Fit
  {
    id: 'FW-PMF-001',
    area: 'product_market_fit',
    title: 'Sean Ellis 40% Disappointment Benchmark',
    purpose: 'Measure whether customer attachment has reached sustainable product-market fit threshold.',
    requiredInputs: ['activeUserFeedback', 'retentionRate'],
    decisionRules: [
      'Survey existing users: "How would you feel if you could no longer use this product tomorrow?"',
      'If >= 40% answer "very disappointed", product-market fit is achievable with existing core value proposition.',
      'If < 40%, marketing spend will churn users through a leaky bucket; return to core problem validation.',
    ],
    limitations: [
      'Applies only after a functional prototype has real users; cannot be used prior to launch.',
    ],
    examples: [
      'Superhuman achieving 58% "very disappointed" response rate before public product launch.',
    ],
    source: 'Sean Ellis (Startup Growth Engines, 2014)',
    version: '1.0.0',
  },

  // 9. Experiment Design
  {
    id: 'FW-EXP-001',
    area: 'experiment_design',
    title: 'The Pre-Commitment & Deposit Test',
    purpose: 'Obtain real skin-in-the-game commitment before writing production software.',
    requiredInputs: ['targetAudience', 'offerDescription', 'pricePoint'],
    decisionRules: [
      'Compliments are useless; cash, signed contracts, or irreversible time investments constitute evidence.',
      'A valid pre-sale experiment requires a clear delivery date, specific scope, and refundable deposit.',
      'If 0 out of 20 contacted target buyers will put down a deposit, software features will not fix the issue.',
    ],
    limitations: [
      'B2B regulated industries may restrict prepayment without vendor accreditation.',
    ],
    examples: [
      'Buffer founder Joel Gascoigne creating a 2-page pricing site with a Stripe checkout before building the app.',
    ],
    source: 'Alberto Savoia (The Right It: Pretotyping, 2019)',
    version: '1.0.0',
  },

  // 10. Financial Fundamentals
  {
    id: 'FW-FIN-001',
    area: 'financial_fundamentals',
    title: 'Gross Margin & Default Alive Runway Analysis',
    purpose: 'Assess economic viability and cash survival without continuous outside financing.',
    requiredInputs: ['estimatedRevenuePerUnit', 'directCostOfGoodsSold', 'monthlyFixedBurn'],
    decisionRules: [
      'Software businesses should target 75%+ gross margins to fund research and acquisition.',
      'If direct unit costs exceed unit revenue, scaling will accelerate bankruptcy.',
      'Calculate Default Alive: Will current cash and revenue growth reach profitability before runway ends?',
    ],
    limitations: [
      'Capital-intensive deeptech or hardware models operate under different multi-year financing dynamics.',
    ],
    examples: [
      'SaaS with $100/mo subscription costing $15 in cloud hosting = 85% gross margin (healthy).',
    ],
    source: 'Paul Graham (Default Alive or Default Dead?, 2015)',
    version: '1.0.0',
  },

  // 11. Technical & Operational Risk
  {
    id: 'FW-RISK-001',
    area: 'technical_operational_risk',
    title: 'Platform Dependency & Single-Point-of-Failure Risk',
    purpose: 'Audit vulnerabilities arising from APIs, platform policy shifts, or key partner dependencies.',
    requiredInputs: ['technicalDependencies', 'dataSources', 'distributionPlatforms'],
    decisionRules: [
      'If your entire product is a thin wrapper over a single external platform API, platform risk is critical.',
      'Platform policy shifts (e.g., Apple App Store rules, Twitter/X API restrictions) can eliminate business overnight.',
      'Create defensibility through proprietary customer workflows, unique data assets, or network effects.',
    ],
    limitations: [
      'Early-stage companies must leverage existing platforms for distribution despite inherent risk.',
    ],
    examples: [
      'Twitter client ecosystem collapse when API access fees and restrictions were introduced.',
    ],
    source: 'Ben Thompson (Stratechery - Aggregation Theory, 2015)',
    version: '1.0.0',
  },
]

export function getFrameworksByArea(area: KnowledgeFramework['area']): KnowledgeFramework[] {
  return FOUNDER_KNOWLEDGE_LIBRARY.filter(f => f.area === area)
}

export function getFrameworkById(id: string): KnowledgeFramework | undefined {
  return FOUNDER_KNOWLEDGE_LIBRARY.find(f => f.id === id)
}
