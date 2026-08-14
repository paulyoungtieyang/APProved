export const THERAPEUTIC_AREAS = [
  "Cardiometabolic",
  "Oncology",
  "Immunology",
  "Neurology",
  "Diagnostics & Monitoring",
];

export const DOSSIER_MARKETS = [
  "Global (All Regions)",
  "United States",
  "European Union",
  "Japan",
  "China",
  "Australia",
  "Canada",
];

export const DOSSIER_LANGUAGES = ["English", "French", "German", "Japanese", "Chinese"];

export const TENDER_TYPES = [
  "Public Tender",
  "Hospital Formulary",
  "National HTA Submission",
  "Private Payer",
];

export const OUTPUT_FORMATS = ["PDF", "Word (DOCX)", "PowerPoint (PPTX)"];

export interface DossierSection {
  id: string;
  label: string;
  description: string;
}

export const DOSSIER_SECTIONS: DossierSection[] = [
  { id: "executive-summary", label: "Executive Summary", description: "High-level overview of clinical value proposition" },
  { id: "disease-epidemiology", label: "Disease & Epidemiology", description: "Disease burden, prevalence, and unmet medical needs" },
  { id: "clinical-efficacy", label: "Clinical Efficacy Data", description: "Phase 3 trial results, endpoints, and statistical analysis" },
  { id: "safety-tolerability", label: "Safety & Tolerability", description: "Adverse events, safety profile, and risk-benefit analysis" },
  { id: "pharmacoeconomic-analysis", label: "Pharmacoeconomic Analysis", description: "Cost-effectiveness, budget impact, and economic value" },
  { id: "quality-of-life", label: "Quality of Life Outcomes", description: "Patient-reported outcomes and quality of life assessments" },
  { id: "comparative-effectiveness", label: "Comparative Effectiveness", description: "Comparison with current standard of care and competitors" },
  { id: "target-population", label: "Target Population", description: "Patient population, inclusion criteria, and treatment eligibility" },
];
