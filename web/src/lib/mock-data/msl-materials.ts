export interface MaterialType {
  id: string;
  label: string;
  icon: string;
  description: string;
  estGenerationTime: string;
}

export const MATERIAL_TYPES: MaterialType[] = [
  {
    id: "scientific-slide-deck",
    label: "Scientific Slide Deck",
    icon: "▭",
    description: "Comprehensive presentation with clinical data and key messages",
    estGenerationTime: "5-7 min",
  },
  {
    id: "medical-summary-document",
    label: "Medical Summary Document",
    icon: "▤",
    description: "Concise summary of efficacy, safety, and clinical value",
    estGenerationTime: "3-5 min",
  },
  {
    id: "scientific-faq",
    label: "Scientific FAQ",
    icon: "?",
    description: "Frequently asked questions with evidence-based responses",
    estGenerationTime: "4-6 min",
  },
  {
    id: "email-response-templates",
    label: "Email Response Templates",
    icon: "✉",
    description: "Pre-written responses to common medical inquiries",
    estGenerationTime: "2-3 min",
  },
];

export const MATERIAL_TONES = ["Scientific", "Balanced", "Accessible"];

export const MATERIAL_AUDIENCES = [
  "HCP — Specialist",
  "HCP — General Practice",
  "Payer / HTA",
  "Internal Sales Team",
];

export const FOCUS_AREAS = [
  "Efficacy & Clinical Outcomes",
  "Safety & Tolerability",
  "Mechanism of Action",
  "Patient Selection & Eligibility",
  "Competitive Positioning",
];
