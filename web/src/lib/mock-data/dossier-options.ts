export const THERAPEUTIC_AREAS = [
  "Cardiometabolic",
  "Oncology",
  "Immunology",
  "Neurology",
  "Diagnostics & Monitoring",
];

export const DOSSIER_MARKETS = [
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

export interface DossierSection {
  id: string;
  label: string;
  description: string;
}

export const DOSSIER_SECTIONS: DossierSection[] = [
  { id: "executive-summary", label: "Executive Summary", description: "High-level product and value narrative" },
  { id: "disease-burden", label: "Disease Burden & Epidemiology", description: "Prevalence, incidence, and unmet need" },
  { id: "product-overview", label: "Product Overview", description: "Indication, mechanism, and intended use" },
  { id: "clinical-evidence", label: "Clinical Evidence Summary", description: "Pivotal trial results and endpoints" },
  { id: "economic-impact", label: "Economic / Budget Impact Model", description: "Cost offsets and budget impact projections" },
  { id: "comparative-effectiveness", label: "Comparative Effectiveness", description: "Head-to-head and indirect comparisons" },
  { id: "patient-outcomes", label: "Patient-Reported Outcomes", description: "Quality-of-life and PRO instrument data" },
  { id: "payer-hta", label: "Payer / HTA Considerations", description: "Prior HTA decisions and payer positioning" },
];
