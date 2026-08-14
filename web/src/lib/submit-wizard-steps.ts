export interface WizardStep {
  id: string;
  label: string;
  subtitle: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "upload-data", label: "Upload Data", subtitle: "Phase 3 clinical data" },
  { id: "select-markets", label: "Select Markets", subtitle: "GVD target markets" },
  { id: "select-languages", label: "Select Languages", subtitle: "Scientific content languages" },
  { id: "ai-instructions", label: "AI Instructions", subtitle: "Generation parameters" },
  { id: "review-submit", label: "Review & Submit", subtitle: "Final review" },
];
