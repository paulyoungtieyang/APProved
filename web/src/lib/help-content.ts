// Contextual copy for the floating help button, keyed by pathname prefix.
export const HELP_CONTENT: Record<string, { title: string; body: string }> = {
  "/dashboard": {
    title: "Dashboard",
    body: "Your command center. Switch between Global and Local Affiliate focus, track setup progress, and jump into any module from Quick Actions.",
  },
  "/upload": {
    title: "Upload Phase 3 Data",
    body: "Upload pivotal-trial data (CSV, XLSX, PDF, or DOCX, up to 100 MB per file). It's processed in a closed-loop environment and never used to train models.",
  },
  "/regulations": {
    title: "Regulations",
    body: "Select the regulatory frameworks that apply to your submission. Selections carry through to document generation and the Document Library.",
  },
  "/document-library": {
    title: "Document Library",
    body: "Every generated document, organized by market, type, and language. Filter to find what you need, then preview or download.",
  },
  "/settings": {
    title: "Settings",
    body: "Manage roles and permissions. Field-facing roles can't modify approved medical or scientific text — changes go through Compliance Officer review.",
  },
  "/policy-news": {
    title: "Policy News",
    body: "Regulatory and policy updates from the authorities relevant to your markets. Filter by region to focus on what affects your submissions.",
  },
  "/global-value-dossier": {
    title: "Global Value Dossier",
    body: "Configure a therapeutic area, market, language, and tender type, choose which sections to include, then generate a draft value dossier.",
  },
  "/msl-materials": {
    title: "MSL Materials",
    body: "Choose a material type, set tone, audience, and brand voice, then generate a draft for Medical Science Liaison field use.",
  },
  "/resources": {
    title: "Resources",
    body: "Regulatory, legal, and security reference material, organized into three resource centers.",
  },
  "/submit": {
    title: "Submit",
    body: "A five-step wizard that walks a project from details through compliance checks to final submission.",
  },
};

export const DEFAULT_HELP = {
  title: "Coming in Phase 2",
  body: "This module's full workflow is being built next. The navigation is here now so the rest of the app is easy to explore.",
};
