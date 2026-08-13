export interface MaterialType {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const MATERIAL_TYPES: MaterialType[] = [
  {
    id: "slide-deck",
    label: "Slide Deck",
    icon: "▭",
    description: "Presentation-ready scientific overview for field discussions",
  },
  {
    id: "faq-document",
    label: "FAQ Document",
    icon: "?",
    description: "Anticipated questions and approved responses",
  },
  {
    id: "objection-handling",
    label: "Objection-Handling Guide",
    icon: "⇄",
    description: "Common pushback scenarios with evidence-backed responses",
  },
  {
    id: "competitive-landscape",
    label: "Competitive Landscape Summary",
    icon: "◫",
    description: "Positioning versus comparator products and standards of care",
  },
];

export const MATERIAL_TONES = ["Clinical / Technical", "Conversational", "Executive Summary"];

export const MATERIAL_AUDIENCES = [
  "HCP — Specialist",
  "HCP — General Practice",
  "Payer / HTA",
  "Internal Sales Team",
];

export const BRAND_VOICES = [
  "Standard APProved Voice",
  "Client Custom Voice A",
  "Client Custom Voice B",
];
