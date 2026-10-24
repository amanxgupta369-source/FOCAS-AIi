import type { DiscoveryOpportunity, DiscoveryCategory } from '../types'

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  'All',
  'Small Businesses',
  'Education',
  'Productivity',
  'Creator Tools',
  'Technology',
  'Everyday Life',
]

export const CURATED_OPPORTUNITIES: DiscoveryOpportunity[] = [
  {
    id: 'opp-perishable-waste',
    title: 'Perishable Food Waste Tracking for Independent Restaurants',
    category: 'Small Businesses',
    tagline: 'Independent kitchens discard 8–15% of perishables weekly due to clunky inventory systems.',
    problem:
      'Independent restaurant owners and head chefs discard 8–15% of purchased perishables every week because inventory software is designed for enterprise corporate chains with dedicated stock clerks and barcode scanners. Independent cooks rely on messy whiteboard tallies and memory during hectic dinner rushes.',
    whoExperiencesIt:
      'Single-location independent restaurants, artisan bakeries, and specialty coffee shops with 3–15 kitchen staff.',
    whyItMatters:
      'Food margins are razor-thin (often 3–7% net profit). Saving even $300/week in spoiled dairy and produce directly doubles bottom-line profitability for a local restaurateur.',
    existingAlternatives:
      'Laminated paper clipboards, whiteboard tally marks, end-of-month accountant spreadsheets, and expensive legacy POS add-ons ($300+/month) that kitchen staff refuse to update.',
    importantUnknowns: [
      'Will exhausted line cooks actually tap a screen or record data during kitchen breakdown?',
      'Is the weekly financial pain felt urgently enough to pay a monthly recurring subscription?',
      'Do suppliers provide digital invoices that can be auto-parsed, or is data entry purely manual?',
    ],
    investigationMethod:
      'Shadow 3 independent kitchen managers during Tuesday night closing inventory. Count how many tally marks are estimated vs actually measured.',
    actionPlan: [
      'Interview 5 independent café or bistro owners about their single largest spoilage item last week.',
      'Test a paper 1-sheet checklist with 2 friendly kitchens to see if staff actually log discarded items.',
      'Calculate the exact dollar loss per week with them on paper to establish pricing leverage.',
      'Ask if they would pay $49/month if it saved at least $200 in their next supplier order.',
    ],
    starterConcept: {
      name: 'FreshPulse Kitchen',
      description: 'A 60-second end-of-night voice and camera logger that tracks spoiled restaurant perishables and warns chefs before over-ordering from suppliers.',
      problem: 'Independent kitchens lose thousands monthly to spoiled perishables because existing software is too complex to update during closing rushes.',
      solution: 'A rugged, voice-enabled tablet logger where cooks speak what was discarded in 60 seconds, syncing automatically with next week’s ordering guide.',
      customer: 'Independent restaurant and café owners with perishable inventory',
      model: 'Monthly subscription ($49–$99/month per location)',
    },
    framework: {
      name: 'The Mom Test: Past Actions vs Opinions',
      principle: 'Never ask "Would you buy a waste tracking app?" Ask "How much food did you throw away last night, and what did you write it down on?"',
      actionPrompt: 'If they cannot show you a notebook or spreadsheet where they tried to track it, they will not use software to track it.',
    },
    realityCheckQuestions: [
      {
        question: 'Is this problem urgent or just an accepted cost of doing business?',
        criticalRisk: 'Chefs may view 10% food waste as unavoidable kitchen friction rather than an active problem to solve.',
      },
      {
        question: 'Who is the real decision maker vs who is the user?',
        criticalRisk: 'The owner pays the bill, but the line cooks must do the logging. If cooks hate the UI, adoption fails within 5 days.',
      },
      {
        question: 'Can this survive without complex POS API integrations?',
        criticalRisk: 'Building custom integrations for 20 different legacy POS systems will stall development for months.',
      },
    ],
    tags: ['Restaurant', 'Food Waste', 'B2B SaaS', 'Inventory', 'Sustainability'],
    isHypothesis: true,
  },
  {
    id: 'opp-nursing-hours',
    title: 'Clinical Placement Hours Verification for Nursing Students',
    category: 'Education',
    tagline: 'Healthcare trainees struggle with lost paper logbooks required for state licensing exams.',
    problem:
      'Nursing, paramedic, and clinical vocational students must record 500+ supervised clinical placement hours across multiple hospitals and clinics. Clinical preceptors sign paper booklets that are frequently misplaced, damaged, or questioned during state board licensing audits.',
    whoExperiencesIt:
      'Vocational nursing students, university nursing faculty, and hospital clinical coordinators.',
    whyItMatters:
      'A lost physical logbook can delay state board examination eligibility by 3–6 months, costing the graduate thousands in delayed nursing wages.',
    existingAlternatives:
      'Physical paper log binders, taking phone photos of physical signature sheets, or complex university LMS software that doesn’t work on mobile hospital rounds.',
    importantUnknowns: [
      'Do state regulatory nursing boards accept digital biometric or timestamped signatures for audits?',
      'Who pays for software: stressed students or bureaucratic university nursing departments with 12-month procurement cycles?',
      'Are mobile devices permitted on hospital wards where student nurses do their rounds?',
    ],
    investigationMethod:
      'Read state nursing board guidelines on digital clinical log compliance, then interview 5 graduating nursing students about their audit submission stress.',
    actionPlan: [
      'Review state regulatory board documentation guidelines for electronic clinical signatures.',
      'Talk to 5 nursing students about how their logs are collected, stored, and submitted today.',
      'Show 2 clinical preceptors a 15-second phone sign-off concept to check if they would sign on shift.',
      'Pitch a pilot to 1 nursing department chair for their next incoming cohort.',
    ],
    starterConcept: {
      name: 'PreceptLog',
      description: 'A mobile-first, GPS-verified preceptor sign-off app for nursing students that exports audit-proof clinical hour portfolios for licensing boards.',
      problem: 'Nursing students risk exam delays due to lost or unverified paper clinical hour logs.',
      solution: 'A 15-second QR-code or PIN sign-off where hospital preceptors verify competencies and hours directly on shift.',
      customer: 'Nursing and allied health students, vocational colleges, and university nursing programs.',
      model: '$25/student per semester or enterprise campus license.',
    },
    framework: {
      name: 'Regulatory Tailwinds & Compliance Lock-in',
      principle: 'Products that satisfy a strict legal compliance requirement have dramatically higher switching costs and willingness to pay.',
      actionPrompt: 'Verify whether the regulatory board has mandated or approved electronic records before writing custom software.',
    },
    realityCheckQuestions: [
      {
        question: 'Can you sell direct to students if the university moves too slowly?',
        criticalRisk: 'If the university refuses to accept student-generated exports, students cannot use the tool independently.',
      },
      {
        question: 'How fast can a preceptor sign off during an emergency ward shift?',
        criticalRisk: 'Preceptors are overburdened nurses. If sign-off takes more than 20 seconds, they will tell students to use paper.',
      },
    ],
    tags: ['Healthcare', 'Education', 'Compliance', 'Mobile', 'Students'],
    isHypothesis: true,
  },
  {
    id: 'opp-async-meeting-prep',
    title: 'Pre-Flight Briefs & Async Context for Remote Engineering Teams',
    category: 'Productivity',
    tagline: 'Distributed teams waste 40% of sync meeting time reviewing context that could have been read beforehand.',
    problem:
      'Distributed product and engineering teams waste the first 25 minutes of technical syncs explaining background architecture context that should have been digested beforehand. Attendees arrive unprepared, resulting in rushed decisions or unproductive follow-up meetings.',
    whoExperiencesIt:
      'Engineering managers, tech leads, and product managers working across 3+ time zones.',
    whyItMatters:
      'An engineering team of 8 costs $150+/hour. Recurring unproductive syncs burn $30k+ annually in lost engineering focus time.',
    existingAlternatives:
      'Notion docs pinned in calendar invites (rarely read), sprawling Slack threads, or recording 15-minute video Looms that team members watch at 2x speed without retaining details.',
    importantUnknowns: [
      'Will engineers actually take 5 minutes to read structured briefs before a calendar event begins?',
      'Can social pressure or auto-rescheduling incentivize pre-meeting preparation without causing friction?',
      'Is this a standalone product, or just a feature Notion or Google Calendar will build?',
    ],
    investigationMethod:
      'Observe 5 team syncs across different teams. Measure how many minutes are spent presenting slides vs actually debating decisions.',
    actionPlan: [
      'Interview 4 remote tech leads about the last meeting that felt like a complete waste of time.',
      'Run a 1-week manual experiment: require a 1-page bulleted doc and a 5-minute silent reading buffer at the start of every meeting.',
      'Survey attendees whether the silent reading buffer improved decision speed.',
      'Build a simple calendar webhook that alerts organizers if pre-flight reading material is missing.',
    ],
    starterConcept: {
      name: 'PreFlight Sync',
      description: 'A calendar-integrated micro-brief tool that collects required reading context and gives meetings a "Readiness Score" before they start.',
      problem: 'Engineering teams burn prime coding hours in sync meetings where nobody did the prerequisite reading.',
      solution: 'Automatic 3-bullet pre-flight digests sent 2 hours before calls with 1-click confirmation so meetings only happen when everyone is prepared.',
      customer: 'Remote engineering managers and distributed software agencies.',
      model: '$8/user/month for team plans.',
    },
    framework: {
      name: 'Behavioral Inertia vs Tooling',
      principle: 'Most meeting problems are cultural, not technological. A software tool must enforce a specific social contract to succeed.',
      actionPrompt: 'Test the cultural ritual manually with Google Docs first. If the team ignores the Google Doc, they will ignore dedicated software.',
    },
    realityCheckQuestions: [
      {
        question: 'Will organizers blame the software when coworkers refuse to prepare?',
        criticalRisk: 'Tool adoption often dies when senior executives refuse to comply with pre-read rules.',
      },
      {
        question: 'Is calendar integration sufficiently defensible against Google Workspace updates?',
        criticalRisk: 'Google or Microsoft could easily add a native "require pre-read" checkbox to calendar invites.',
      },
    ],
    tags: ['Remote Work', 'Productivity', 'Engineering', 'Async', 'Meetings'],
    isHypothesis: true,
  },
  {
    id: 'opp-creator-sponsorships',
    title: 'Sponsor Pitch & Media Kit Deal Rooms for Mid-Tier Creators',
    category: 'Creator Tools',
    tagline: 'Solo creators lose up to 50% of brand deals due to delayed rate cards and manual contract follow-ups.',
    problem:
      'Mid-tier solo creators (10k–100k subscribers on YouTube, podcasts, or newsletters) receive dozens of brand sponsorship inquiries but lose over half the potential revenue because they lack dynamic rate cards, verified audience analytics, and quick contract/invoicing workflows.',
    whoExperiencesIt:
      'Independent podcasters, YouTubers, newsletter writers, and technical tutorial creators.',
    whyItMatters:
      'Sponsorships represent 60–80% of creator income. Losing 2 deals a month costs a solo creator $3,000–$8,000 in direct lost livelihood.',
    existingAlternatives:
      'Static PDF media kits updated once a year, messy email negotiation threads, generic invoices on Wave/PayPal, or enterprise talent agency tools that charge 20% commission.',
    importantUnknowns: [
      'Do brand marketing managers prefer self-serve creator booking rooms, or do they always insist on custom email negotiations?',
      'Will creators pay an upfront software fee ($29/mo) or only a percentage fee of closed sponsorships?',
      'How do you verify authentic creator metrics without relying on easily manipulated screenshots?',
    ],
    investigationMethod:
      'Send email inquiries to 10 creators asking for their sponsorship rate card and available dates. Record how many days it takes them to reply with structured pricing.',
    actionPlan: [
      'Analyze 10 public creator media kits to identify missing data that brand sponsors actually care about.',
      'Interview 3 brand marketing managers who purchase newsletter or YouTube sponsorships.',
      'Manually build a personalized 1-page deal room for 2 friendly creators using Notion or Airtable.',
      'Measure whether the deal room speeds up their time-to-contract by at least 48 hours.',
    ],
    starterConcept: {
      name: 'BrandDock',
      description: 'A 1-link creator sponsor room with real-time verified audience metrics, live calendar availability, and 1-click contract and deposit checkout.',
      problem: 'Solo creators lose thousands in sponsorship revenue because brand deal negotiations drag out over weeks of chaotic back-and-forth emails.',
      solution: 'A branded deal room where sponsors view verified viewership stats, select ad placements, and lock dates with a 50% deposit.',
      customer: 'Independent creators and podcasters generating $20k–$150k annually.',
      model: '$29/month base subscription + 2.5% transaction processing fee.',
    },
    framework: {
      name: 'Direct Monetization Alignment',
      principle: 'When your software directly helps a user collect money faster, pricing friction almost entirely disappears.',
      actionPrompt: 'Frame pricing as: "Collect one extra sponsorship deal, and this tool pays for itself for the entire year."',
    },
    realityCheckQuestions: [
      {
        question: 'Are brand sponsors willing to pay deposits via a web link instead of net-30 bank wires?',
        criticalRisk: 'Corporate accounting departments often refuse credit cards and mandate 30-day invoice payment terms.',
      },
      {
        question: 'What is creator churn when sponsorship deal flow fluctuates seasonally?',
        criticalRisk: 'Creators may cancel subscriptions during Q1 when brand marketing budgets are frozen.',
      },
    ],
    tags: ['Creator Economy', 'Podcasting', 'Sponsorships', 'Fintech', 'Media'],
    isHypothesis: true,
  },
  {
    id: 'opp-env-secret-drift',
    title: 'Secret & Environment Variable Drift Alerts for Seed-Stage Startups',
    category: 'Technology',
    tagline: 'Mismatched environment keys between teammates and staging cause 20%+ of deployment rollbacks.',
    problem:
      'In early-stage engineering teams (3–12 engineers), developers frequently add new environment variables locally without propagating them to teammates or staging environments. This causes broken deployments, silent API failures, and lost engineering debugging hours.',
    whoExperiencesIt:
      'Founding engineers, tech leads, and full-stack developers at seed and Series A tech startups.',
    whyItMatters:
      'A broken deployment during a customer demo or marketing launch can destroy prospective enterprise sales and consumer trust.',
    existingAlternatives:
      'Shared 1Password or Bitwarden vaults, unencrypted `.env` snippets pasted in private Slack channels, and enterprise-grade secret managers (HashiCorp Vault, AWS Secrets Manager) that require heavy infrastructure setup.',
    importantUnknowns: [
      'Are lightweight alternatives like Doppler or Infisical already capturing this exact developer audience?',
      'Will engineers install another CLI tool or does this need to operate entirely inside GitHub Actions and git hooks?',
      'Can you alert on missing keys without ever exposing or transmitting secret values to third-party servers?',
    ],
    investigationMethod:
      'Survey 15 developers in local tech meetups or Reddit r/webdev: ask what caused their last deployment rollback and if `.env` misconfiguration was involved.',
    actionPlan: [
      'Interview 5 startup tech leads about how secrets are onboarded for new hires today.',
      'Build a simple open-source bash/node script that compares `.env.example` keys against `.env.local` without touching values.',
      'Share the script with 3 small teams to see if it catches a drift event during regular development.',
      'Identify what team-collaboration features would convince them to pay $20/month for a hosted dashboard.',
    ],
    starterConcept: {
      name: 'EnvShield',
      description: 'A zero-knowledge CLI and git pre-push hook that flags missing environment variables across team environments without sending secrets to any cloud.',
      problem: 'Early engineering teams waste hours debugging broken builds caused by forgotten `.env` keys.',
      solution: 'A local schema validator that enforces all required environment keys exist before git push, syncing schema definitions securely across git commits.',
      customer: 'Early-stage tech startups and software development agencies.',
      model: 'Free for individual developers; $15/month for teams up to 10 devs.',
    },
    framework: {
      name: 'Zero-Knowledge Security Trust',
      principle: 'Developers will immediately reject any developer tool that requires uploading private API keys to an untrusted server.',
      actionPrompt: 'Design the architecture so the tool only verifies key names (schemas), never touching secret values.',
    },
    realityCheckQuestions: [
      {
        question: 'Is this just a linting problem that a free ESLint or git hook script solves completely?',
        criticalRisk: 'If a 15-line free open source script solves 90% of the pain, willingness to pay for SaaS will be near zero.',
      },
      {
        question: 'How do you handle secrets that differ between production and local development?',
        criticalRisk: 'Too many false positive alerts will cause developers to uninstall the CLI out of annoyance.',
      },
    ],
    tags: ['DevTools', 'Open Source', 'Security', 'Engineering', 'CI/CD'],
    isHypothesis: true,
  },
  {
    id: 'opp-appliance-sharing',
    title: 'Building-Level Tool & Appliance Sharing for Urban Apartment Renters',
    category: 'Everyday Life',
    tagline: 'Urban tenants buy single-use items like drills and carpet cleaners that sit in closets 98% of the year.',
    problem:
      'Residents in dense apartment complexes frequently purchase single-use household equipment (carpet cleaners, drill kits, folding tables, ladders) that sit in cramped closets for 98% of the year, while immediate neighbors in the same building buy identical items.',
    whoExperiencesIt:
      'Urban apartment renters and condo owners in buildings with 40+ units.',
    whyItMatters:
      'Apartment space is at a premium ($3+/sq ft), and buying duplicate heavy tools costs households hundreds of dollars in unnecessary consumer waste.',
    existingAlternatives:
      'Buy-Nothing Facebook groups (unorganized, slow replies), renting from hardware stores (requires transportation and deposit), or knocking on stranger neighbors’ doors (awkward).',
    importantUnknowns: [
      'Who is financially liable when a shared drill or vacuum cleaner breaks or is not returned?',
      'Will property management companies allow a dedicated shared locker or closet in the building lobby/basement?',
      'Is convenience high enough that renters will clean items properly before returning them?',
    ],
    investigationMethod:
      'Print a paper flyer and put it on a community bulletin board in an apartment building: offer 1 shared community tool kit for 2 weeks and track usage via WhatsApp.',
    actionPlan: [
      'Talk to 1 residential building property manager about existing resident complaints and amenities.',
      'Place a pilot tool kit (cordless drill, stepladder, vacuum) in a test building with permission.',
      'Track how many residents borrow an item and how promptly it is returned.',
      'Evaluate whether property managers would subsidize this as a tenant retention amenity ($1/unit/mo).',
    ],
    starterConcept: {
      name: 'LobbyShare',
      description: 'An apartment building amenity app that lets residents reserve and unlock verified community tools and appliances from a secure lobby locker.',
      problem: 'Apartment renters lack storage space and waste money buying duplicate tools they use once a year.',
      solution: 'Building-specific sharing hub with digital reservations, automated return checklists, and property-manager sponsorship.',
      customer: 'Urban property management firms and residential communities.',
      model: '$99/month per building paid as a tenant amenity by property management.',
    },
    framework: {
      name: 'B2B2C Sponsorship Model',
      principle: 'Consumers hate paying micro-subscriptions for neighborhood sharing, but property managers spend thousands on amenities to reduce tenant turnover.',
      actionPrompt: 'Sell the amenity value to the landlord, not the rental fee to the resident.',
    },
    realityCheckQuestions: [
      {
        question: 'Who cleans dirty tools between uses?',
        criticalRisk: 'If items return dirty or broken, the amenity quickly deteriorates and causes tenant complaints.',
      },
      {
        question: 'What is the hardware cost of smart lockers vs the return on investment?',
        criticalRisk: 'Physical lockers require capital expenditure that slows down geographic scaling.',
      },
    ],
    tags: ['Real Estate', 'Community', 'Sustainability', 'Circular Economy', 'Consumer'],
    isHypothesis: true,
  },
  {
    id: 'opp-subcontractor-milestones',
    title: 'Mobile Photo Change Orders & Escrow for Residential Tradespeople',
    category: 'Small Businesses',
    tagline: 'Solo contractors suffer 30–60 day payment delays when job scopes change on-site without written proof.',
    problem:
      'Independent electricians, plumbers, and carpenters regularly suffer 30–90 day payment delays on domestic renovations because changes are agreed verbally on-site without written change orders. Homeowners dispute extra charges at the end of the project when presented with surprising invoices.',
    whoExperiencesIt:
      'Independent residential contractors, solo tradespeople, and domestic renovation homeowners.',
    whyItMatters:
      'Cash flow disputes force 20%+ of small contracting businesses into cash insolvency. Tradespeople lose an average of $3,500/year in disputed scope creep.',
    existingAlternatives:
      'Informal text messages, paper estimate sheets with no binding signatures, and enterprise contractor software (Procore, Buildertrend) that costs $400+/month and is way too complex for solo operators.',
    importantUnknowns: [
      'Will contractors with dirty hands take 30 seconds to snap a photo and generate a change order on their phone?',
      'Will homeowners feel distrustful if a contractor asks for a digital signature before replacing a rusted pipe?',
      'Can payment deposits be collected through Stripe without high merchant dispute rates?',
    ],
    investigationMethod:
      'Shadow a renovation contractor on a job site for half a day. Document every verbal agreement that changes original scope.',
    actionPlan: [
      'Interview 5 tradespeople who had to write off unpaid invoice amounts in the past 12 months.',
      'Create a simple 1-page photo change order SMS link template.',
      'Ask 2 friendly plumbers to text the link to homeowners on their next 3 scope additions.',
      'Measure whether homeowners approve within 15 minutes of receiving the text.',
    ],
    starterConcept: {
      name: 'ScopeSnap',
      description: 'A 30-second mobile photo change order tool where tradespeople snap the hidden issue, tap a price, and text an instant 1-tap approval link to the homeowner.',
      problem: 'Tradespeople lose thousands in unpaid extra work agreed verbally on site.',
      solution: 'Fast SMS-based photo change orders with instant digital approval and optional milestone deposit payment.',
      customer: 'Solo electricians, plumbers, HVAC technicians, and general carpenters.',
      model: '$29/month subscription or $3 per approved change order.',
    },
    framework: {
      name: 'Zero-Friction In-Situ Capture',
      principle: 'If a workflow tool requires sitting at a laptop after an 8-hour physical labor shift, it will never be used. It must work on-site in under 30 seconds.',
      actionPrompt: 'Time the change order creation process with a stopwatch. If it takes longer than 45 seconds, simplify it.',
    },
    realityCheckQuestions: [
      {
        question: 'Will homeowners feel nickeled-and-dimed for minor $50 fixes?',
        criticalRisk: 'Over-formalizing tiny adjustments could damage the contractor-client relationship.',
      },
      {
        question: 'How do you handle elderly homeowners who do not use smartphones or SMS links?',
        criticalRisk: 'Contractors working in older demographics will need a physical or phone confirmation fallback.',
      },
    ],
    tags: ['Trades', 'Construction', 'Fintech', 'Mobile', 'Invoicing'],
    isHypothesis: true,
  },
  {
    id: 'opp-micro-study-cohorts',
    title: 'Accountability Micro-Pods for Online Bootcamp Learners',
    category: 'Education',
    tagline: 'Self-paced tech course completion rates are under 15% due to isolation and lack of daily momentum.',
    problem:
      'Online self-paced programming and data science courses suffer from dismal completion rates (under 15%). Adult learners get stuck alone on minor debugging errors, lose momentum, and quietly quit because large community forums (Discord, Slack) feel noisy and intimidating.',
    whoExperiencesIt:
      'Adult career-switchers, self-taught developers, and remote certification learners.',
    whyItMatters:
      'Learners invest hundreds of dollars and hours in education hoping for career transformation, only to stall in isolation without completing projects required for employment.',
    existingAlternatives:
      'Massive 10,000-member Discord servers where questions get buried, Reddit study boards, expensive 1-on-1 human tutors ($60+/hr), or rigid live bootcamps ($15,000+).',
    importantUnknowns: [
      'Will unpaid peer pods stay active after week 2 without a paid human facilitator or TA?',
      'How do you pair learners fairly so advanced students don’t feel dragged down by beginners?',
      'Do learners have willingness to pay for peer accountability, or do they expect the course provider to supply it?',
    ],
    investigationMethod:
      'Manually organize a 4-person study pod for students currently enrolled in the same popular free online curriculum (e.g. The Odin Project or CS50).',
    actionPlan: [
      'Post on learning forums offering to coordinate free 3-person daily accountability groups.',
      'Host daily 15-minute silent co-working check-ins on Zoom or Google Meet for 10 days.',
      'Track attendance drop-off and ask participants what kept them showing up.',
      'Test if participants would pay $19/month for matched peer pods with automated daily progress prompts.',
    ],
    starterConcept: {
      name: 'PodStudy',
      description: 'An automated matching engine that pairs 3 adult learners at the exact same curriculum milestone for daily 15-minute silent co-working and blocker resolution.',
      problem: 'Self-paced online learners drop out in isolation when they hit early technical roadblocks.',
      solution: 'Micro-cohorts of 3 peers with automated daily progress check-ins and shared streak milestones.',
      customer: 'Self-paced online course learners and career changers.',
      model: '$15/month per active pod membership.',
    },
    framework: {
      name: 'Micro-Community Stickiness',
      principle: 'People feel invisible in a group of 500, but feel personally accountable in a group of 3.',
      actionPrompt: 'Keep pod sizes between 3 and 4 members. Any larger, and bystander apathy immediately sets in.',
    },
    realityCheckQuestions: [
      {
        question: 'What happens when 2 of the 3 members ghost the group in week 2?',
        criticalRisk: 'If pod members quit, the remaining active member feels demoralized and cancels their subscription.',
      },
      {
        question: 'Can you partner directly with popular course creators rather than acquiring students individually?',
        criticalRisk: 'Individual consumer acquisition costs for online learners are often higher than lifetime value.',
      },
    ],
    tags: ['Education', 'EdTech', 'Community', 'Learning', 'Productivity'],
    isHypothesis: true,
  },
]

/**
 * Returns a deterministic daily featured discovery based on the current date.
 * Does not make any external network or AI requests.
 */
export function getDailyDiscovery(date: Date = new Date()): DiscoveryOpportunity {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const index = Math.abs(dayOfYear) % CURATED_OPPORTUNITIES.length
  return CURATED_OPPORTUNITIES[index]
}

/**
 * Filter opportunities by category and search query entirely offline.
 */
export function filterOpportunities({
  category = 'All',
  query = '',
}: {
  category?: DiscoveryCategory
  query?: string
}): DiscoveryOpportunity[] {
  const cleanQ = query.toLowerCase().trim()
  return CURATED_OPPORTUNITIES.filter(item => {
    const matchesCategory = category === 'All' || item.category === category
    if (!matchesCategory) return false

    if (!cleanQ) return true

    const inTitle = item.title.toLowerCase().includes(cleanQ)
    const inTagline = item.tagline.toLowerCase().includes(cleanQ)
    const inProblem = item.problem.toLowerCase().includes(cleanQ)
    const inWho = item.whoExperiencesIt.toLowerCase().includes(cleanQ)
    const inTags = item.tags.some(t => t.toLowerCase().includes(cleanQ))
    const inCategory = item.category.toLowerCase().includes(cleanQ)

    return inTitle || inTagline || inProblem || inWho || inTags || inCategory
  })
}
