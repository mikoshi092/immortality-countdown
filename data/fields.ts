// PLACEHOLDER DATA — Preview build only.
// Scores are provisional illustrative values for this prototype. No
// official Technology Readiness methodology has been implemented or
// audited yet — do not treat these numbers as validated scores.
//
// Single source of truth for the "Eight Fields of Progress" taxonomy,
// including the long-form content shown on each field's /fields/[slug]
// page. Four fields carry provisional illustrative scores; the other
// four are a provisional field taxonomy only — named and scoped, but
// with no score assigned yet. Do not invent scores, studies, trials,
// companies, or citations for any field.

export type FieldStatus = "provisional" | "pending";

export type FieldProgress = {
  slug: string;
  name: string;
  // 0–100, PROVISIONAL — not an official/audited score. null while
  // status is "pending" (no score has been assigned yet).
  score: number | null;
  status: FieldStatus;
  // One-line summary used in lists, cards, and previews.
  description: string;
  // Displayed as "The Gist".
  plainEnglish: string;
  // Displayed as "Why It Matters for LEV".
  whyItMatters: string;
  // Displayed as "Signals We Track".
  whatWeTrack: string[];
  // Displayed as "What Does Not Move the Assessment".
  whatDoesNotCount: string[];
  // Displayed as "Key Hurdles".
  bottlenecks: string[];
  // Displayed as "Current Provisional Assessment".
  scoringNote: string;
  // Displayed as "Reality Check".
  limitations: string;
};

export const fieldProgress: FieldProgress[] = [
  {
    slug: "rejuvenation-regeneration",
    name: "Rejuvenation & Regeneration",
    score: 40,
    status: "provisional",
    description:
      "Repairing age-related cellular and tissue damage through senescence-targeting therapies, cellular reprogramming, and regenerative medicine.",
    plainEnglish:
      "This field asks whether aging cells and damaged tissues can be made to function more like younger ones. Two major approaches are removing senescent cells—often nicknamed “zombie cells”—that no longer work properly but remain active, and partially reprogramming older cells to restore more youthful patterns of function without erasing their identity.",
    whyItMatters:
      "Aging involves multiple forms of cellular damage, dysfunction, and loss of biological resilience. If medicine can safely clear, repair, reprogram, or replace damaged cells and tissues, it may slow—or partially reverse—some forms of age-related decline.\n\nThat would directly support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Senescent-cell clearance:** Research and treatments designed to remove dysfunctional senescent cells.",
      "**Partial cellular reprogramming:** Approaches that aim to restore youthful cell function without causing cells to lose their identity.",
      "**Tissue regeneration:** Progress in repairing or rebuilding damaged tissues and organs.",
      "**Translation to humans:** Replicated results moving from cell cultures and animal models toward credible human trials.",
    ],
    whatDoesNotCount: [
      "An isolated cell-culture result with no independent replication or follow-up.",
      "Animal findings presented without a credible path toward human relevance.",
      "Company announcements or marketing claims that provide no underlying study data.",
      "Improvements in a single biomarker without evidence of meaningful functional benefit.",
    ],
    bottlenecks: [
      "**Safety:** Reprogramming cells too aggressively may cause loss of cell identity or uncontrolled growth, including cancer.",
      "**Replication:** Promising results must be reproduced by independent research groups.",
      "**The species gap:** Results in mice and other animal models frequently fail to translate to humans.",
      "**Clinical timelines:** Trials measuring age-related decline require meaningful endpoints, sufficient follow-up, and often many years of observation.",
    ],
    scoringNote:
      "The dashboard currently displays a provisional score of **40 / 100** for Rejuvenation & Regeneration.\n\nThis number is an illustrative working baseline for the public beta. It is not the output of a validated, published, or independently audited scoring model. The score will be recalculated once the formal methodology has been completed.",
    limitations:
      "This assessment does not predict when—or whether—a specific rejuvenation therapy will reach patients. It is a provisional reading of the field’s overall research momentum, translational progress, and remaining barriers.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "biomarkers-diagnostics",
    name: "Biomarkers & Diagnostics",
    score: 44,
    status: "provisional",
    description:
      "Aging clocks, biomarker panels, and diagnostics for measuring biological age.",
    plainEnglish:
      "This field is about measurement: building tests that estimate how biologically old a body is, as distinct from chronological age—the number of years a person has lived. The same tools are used to track whether an intervention is actually slowing that process.",
    whyItMatters:
      "Without reliable ways to measure biological aging, it is hard to know whether any other intervention—a drug, a therapy, a lifestyle change—is actually working. Better biomarkers can let trials run faster and with more confidence, which indirectly speeds progress across every other field.\n\nThat measurement capacity would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Aging clocks:** Research on epigenetic and other biological clocks that estimate biological age.",
      "**Biomarker panels:** Blood- and tissue-based panels used to measure aging-related change.",
      "**Outcome validation:** Large cohort studies testing whether these measures correspond to real health outcomes.",
      "**Trial endpoints:** Adoption of biomarkers as endpoints in clinical trials.",
    ],
    whatDoesNotCount: [
      "A biomarker that correlates with age in one small study but has never been replicated.",
      "A commercial biological-age test with no published validation.",
      "A biomarker with no shown connection to real functional health outcomes.",
    ],
    bottlenecks: [
      "**Consensus:** There is still no agreement on which biomarkers actually predict health outcomes.",
      "**Access:** Cost and accessibility still limit testing at scale.",
      "**Standardization:** Measures are not yet standardized across laboratories and populations.",
      "**Regulation:** Regulatory acceptance of biomarkers as clinical trial endpoints remains limited.",
    ],
    scoringNote:
      "The dashboard currently displays a provisional score of **44 / 100** for Biomarkers & Diagnostics.\n\nThis number is an illustrative working baseline for the public beta. It is not the output of a validated, published, or independently audited scoring model. The score will be recalculated once the formal methodology has been completed.",
    limitations:
      "This assessment does not show that aging itself is being reversed. A higher score here reflects more confidence in measurement tools, not proof of a therapeutic effect.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "geroscience-drugs-trials",
    name: "Geroscience Drugs & Trials",
    score: 33,
    status: "provisional",
    description:
      "Small-molecule and drug interventions targeting aging pathways, and their clinical trials.",
    plainEnglish:
      "This field tracks drugs and compounds designed to act on the biological pathways involved in aging itself, rather than treating one disease at a time. It also tracks how far those candidates have progressed through testing in people.",
    whyItMatters:
      "If a drug can safely act on one or more aging pathways in humans, it could delay the onset of multiple age-related conditions at once instead of treating them separately. Clinical trial progress is one of the clearest signals of whether these ideas hold up outside the laboratory.\n\nProgress of this kind would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Human trials:** Clinical trials of compounds designed to act on aging-related pathways.",
      "**Trial progression:** Movement through trial phases, including reported functional or biomarker endpoints.",
      "**Drug repurposing:** Studies that test existing drugs against aging-related pathways.",
      "**Regulatory milestones:** Steps toward treating aging itself as a recognized target, rather than a single disease.",
    ],
    whatDoesNotCount: [
      "Preclinical or animal-only results presented as if they were human findings.",
      "Anecdotal reports from individual users.",
      "Trial announcements that provide no reported results.",
    ],
    bottlenecks: [
      "**Regulation:** Most regulators do not yet recognize aging itself as an approvable treatment target.",
      "**Trial duration:** Observing aging-related endpoints often requires long studies.",
      "**Funding:** Large, long-term human trials remain expensive and difficult to finance.",
      "**Signal versus noise:** Distinguishing a drug’s effect from natural variation between people remains difficult.",
    ],
    scoringNote:
      "The dashboard currently displays a provisional score of **33 / 100** for Geroscience Drugs & Trials.\n\nThis number is an illustrative working baseline for the public beta. It is not the output of a validated, published, or independently audited scoring model. The score will be recalculated once the formal methodology has been completed.",
    limitations:
      "This assessment does not predict whether any specific geroscience drug will be approved or prove effective in the real world. Trial progress is a signal of visible momentum, not a guarantee of success.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "gene-therapy-delivery",
    name: "Gene Therapy & Delivery",
    score: 36,
    status: "provisional",
    description:
      "Gene editing, gene therapy, and delivery vector technologies for longevity applications.",
    plainEnglish:
      "This field covers tools for editing or supplementing genes inside the body, along with the delivery systems needed to get those genetic instructions into the right cells safely. Those systems include viral vectors: modified viruses used to carry genetic material into cells.",
    whyItMatters:
      "Some age-related damage may eventually be addressed at the genetic level, either by correcting harmful changes or adding protective genetic instructions. Delivery technology is often the limiting step, because a therapy is only as useful as its ability to reach the right cells.\n\nProgress here would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Aging-related gene therapies:** Gene editing and gene therapy research aimed at aging-related targets.",
      "**Delivery vectors:** Advances in viral and non-viral systems for targeting specific tissues.",
      "**Safety and targeting:** Preclinical and clinical results on safety and targeting specificity.",
      "**Manufacturing:** Progress in producing gene-therapy platforms at greater scale.",
    ],
    whatDoesNotCount: [
      "Delivery improvements shown only in cell culture, with no animal or human data.",
      "Gene therapy news unrelated to aging or longevity applications.",
      "Claims of a cure that provide no described evidence.",
    ],
    bottlenecks: [
      "**Safety:** Off-target effects and the long-term safety of gene edits remain major concerns.",
      "**Manufacturing:** Delivery vectors are still costly and difficult to produce at scale.",
      "**Immune response:** The immune system may react to delivery vectors, especially with repeat dosing.",
      "**Regulation:** Pathways for genetic interventions aimed at aging, rather than a single disease, are still limited.",
    ],
    scoringNote:
      "The dashboard currently displays a provisional score of **36 / 100** for Gene Therapy & Delivery.\n\nThis number is an illustrative working baseline for the public beta. It is not the output of a validated, published, or independently audited scoring model. The score will be recalculated once the formal methodology has been completed.",
    limitations:
      "This assessment does not show that a working longevity gene therapy already exists. Progress in delivery and editing is a provisional signal of technical momentum, not proof of a finished treatment.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "ai-drug-discovery",
    name: "AI Drug Discovery",
    score: null,
    status: "pending",
    description:
      "AI-assisted target identification, molecular design, prediction, and trial optimization.",
    plainEnglish:
      "This field covers the use of machine learning and other AI models to help find new drug targets, design candidate molecules, predict how those candidates may behave, and make clinical trials run more efficiently.",
    whyItMatters:
      "Every other field here depends partly on how quickly new therapeutic candidates can be found and tested. AI tools that speed target identification or trial design could compress timelines across geroscience, gene therapy, and rejuvenation research alike.\n\nThat kind of acceleration would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**AI-designed candidates:** Molecules designed with AI that enter preclinical or clinical testing.",
      "**Prediction benchmarks:** Published measures of prediction accuracy, such as binding affinity or toxicity.",
      "**Trial workflows:** AI tools adopted in real trial design or patient-matching.",
      "**Independent validation:** Checks of AI-generated predictions against laboratory or clinical results.",
    ],
    whatDoesNotCount: [
      "A benchmark improvement with no laboratory or clinical follow-up.",
      "General AI capability announcements unrelated to longevity or drug discovery.",
      "Marketing claims about AI that describe no method or result.",
    ],
    bottlenecks: [
      "**The lab gap:** Benchmark performance often does not translate into real-world laboratory success.",
      "**Training data:** High-quality data specific to aging biology remains limited.",
      "**Validation cost:** Confirming AI predictions still requires slow, expensive laboratory and clinical work.",
    ],
    scoringNote:
      "The dashboard currently displays **Score pending** for AI Drug Discovery.\n\nThis field is part of the site’s provisional eight-field taxonomy, but the scoring criteria have not been finalized. Pending status means the assessment method is still incomplete. It does not mean that no research is happening, and it should not be read as a score of zero.",
    limitations:
      "This page does not estimate when AI will produce a longevity therapy, and the pending status should not be read as a score. It reflects incomplete assessment criteria, not an absence of work in the field.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "organ-replacement-biofabrication",
    name: "Organ Replacement & Biofabrication",
    score: null,
    status: "pending",
    description:
      "Engineered tissues, organoids, bioprinting, transplantation, and replacement of failing organs.",
    plainEnglish:
      "This field is about building or growing replacement body parts for cases where an organ is too damaged to repair. The work ranges from lab-grown tissues and organoids—simplified, miniature versions of organs grown from cells—to 3D-bioprinted structures.",
    whyItMatters:
      "Some age-related organ decline may ultimately be addressed by replacement rather than repair. Progress here could extend healthy lifespan in cases where regeneration or drugs on their own are not enough.\n\nThat would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Engineered tissue:** Research on grown or constructed tissues and organoids.",
      "**Bioprinting:** Progress in printing techniques and materials for biological structures.",
      "**Transplantation results:** Preclinical and clinical transplantation using engineered tissue.",
      "**Manufacturing:** Scale-up progress for lab-grown tissue.",
    ],
    whatDoesNotCount: [
      "Small-scale tissue samples with no functional or transplantation testing.",
      "Concept renderings or prototypes with no described biological result.",
      "Organ-transplant news unrelated to engineered or bioprinted tissue.",
    ],
    bottlenecks: [
      "**Vascularization:** Larger engineered tissues still need a working blood supply.",
      "**Immune rejection:** Engineered or donor tissue may be rejected by the immune system.",
      "**Manufacturing:** Consistency and cost remain difficult at scale.",
      "**Regulation:** Implantable engineered tissue faces long regulatory pathways.",
    ],
    scoringNote:
      "The dashboard currently displays **Score pending** for Organ Replacement & Biofabrication.\n\nThis field is part of the site’s provisional eight-field taxonomy, but the scoring criteria have not been finalized. Pending status means the assessment method is still incomplete. It does not mean that no research is happening, and it should not be read as a score of zero.",
    limitations:
      "This assessment does not predict when replacement organs or biofabricated tissue will become a routine clinical option. Pending status reflects an incomplete scoring method, not a judgment that the field lacks progress.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "immune-engineering-cancer-control",
    name: "Immune Engineering & Cancer Control",
    score: null,
    status: "pending",
    description:
      "Immune rejuvenation, chronic inflammation control, cancer prevention, and immune-based therapies.",
    plainEnglish:
      "This field covers efforts to keep the immune system working well into old age, including reducing the chronic, low-grade inflammation associated with aging. It also covers work to prevent or control cancer, which becomes far more common as immune function weakens.",
    whyItMatters:
      "A weakened, poorly regulated immune system is linked to many age-related diseases, including cancer. Keeping the immune system functional is likely necessary for other longevity approaches to succeed, because their benefits could otherwise be undermined by immune decline.\n\nThat would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Immune rejuvenation:** Research aimed at restoring or maintaining immune function with age.",
      "**Inflammation control:** Approaches targeting the chronic, low-grade inflammation associated with aging.",
      "**Cancer prevention:** Prevention and early-detection research tied to immune function.",
      "**Immune-based therapies:** Treatments that use the immune system against aging-related disease.",
    ],
    whatDoesNotCount: [
      "General cancer-treatment news unrelated to aging or immune function.",
      "Isolated laboratory findings with no discussion of relevance to aging.",
      "Supplement or lifestyle claims without described clinical evidence.",
    ],
    bottlenecks: [
      "**Complexity:** The immune system is interconnected, which makes targeted intervention difficult.",
      "**Balance:** Reducing inflammation must be weighed against maintaining immune strength.",
      "**Long-term safety:** Durable safety data for immune-modulating therapies remain limited.",
      "**Individual variation:** The immune system ages differently from person to person.",
    ],
    scoringNote:
      "The dashboard currently displays **Score pending** for Immune Engineering & Cancer Control.\n\nThis field is part of the site’s provisional eight-field taxonomy, but the scoring criteria have not been finalized. Pending status means the assessment method is still incomplete. It does not mean that no research is happening, and it should not be read as a score of zero.",
    limitations:
      "This assessment does not predict whether immune engineering will prevent age-related disease or control cancer. Pending status reflects an incomplete scoring method, not a judgment that the field lacks progress.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
  {
    slug: "enabling-technology-automation",
    name: "Enabling Technology & Automation",
    score: null,
    status: "pending",
    description:
      "Laboratory automation, robotics, high-throughput screening, computing, and scalable biomanufacturing.",
    plainEnglish:
      "This field covers the tools and infrastructure behind the other seven: laboratory robots, automated high-throughput screening—testing many samples or conditions quickly—computing power, and manufacturing systems that let research happen faster and at larger scale.",
    whyItMatters:
      "Progress in every other field is ultimately limited by how quickly experiments can be run and how affordably therapies can be manufactured. Faster, cheaper, more automated infrastructure can compress timelines across the whole countdown, even without any single scientific breakthrough.\n\nThat kind of capacity would support the broader goal of Longevity Escape Velocity: reaching a point where advances across multiple medical fields extend healthy lifespan faster than time passes.",
    whatWeTrack: [
      "**Lab automation:** Adoption of laboratory automation and robotics in longevity-relevant research.",
      "**High-throughput screening:** Platform capabilities for testing many samples or conditions quickly.",
      "**Computing:** Computing infrastructure applied to biological research.",
      "**Biomanufacturing:** Scalable manufacturing progress for biologics, cell therapies, or engineered tissue.",
    ],
    whatDoesNotCount: [
      "General-purpose automation or computing news with no described life-sciences application.",
      "Product announcements with no reported performance data.",
      "Efficiency claims from a single, unverified pilot report.",
    ],
    bottlenecks: [
      "**Cost:** Automation and manufacturing infrastructure require high upfront investment.",
      "**Integration:** Automated systems are often difficult to fit into existing laboratory workflows.",
      "**Expertise:** Building and operating these systems requires specialized talent.",
      "**Standardization:** Platforms and laboratories still lack common standards.",
    ],
    scoringNote:
      "The dashboard currently displays **Score pending** for Enabling Technology & Automation.\n\nThis field is part of the site’s provisional eight-field taxonomy, but the scoring criteria have not been finalized. Pending status means the assessment method is still incomplete. It does not mean that no research is happening, and it should not be read as a score of zero.",
    limitations:
      "This assessment does not predict how quickly infrastructure will compress research or manufacturing timelines. Pending status reflects an incomplete scoring method, not a judgment that the field lacks progress.\n\nIt should be treated as an evolving signal, not a clinical forecast or guaranteed roadmap.",
  },
];
