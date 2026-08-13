export interface WizardStep {
  id: string;
  label: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "project-details", label: "Project Details" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "compliance-check", label: "Compliance Check" },
  { id: "submit", label: "Submit" },
];
