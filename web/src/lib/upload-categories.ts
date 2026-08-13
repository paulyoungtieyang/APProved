import type { SourceFileCategory } from "./state/types";

export const CATEGORY_LABELS: Record<SourceFileCategory, string> = {
  "clinical-efficacy": "Clinical Efficacy",
  "safety-ae": "Safety / Adverse Events",
  demographics: "Demographics",
  "baseline-characteristics": "Baseline Characteristics",
  "pk-pd": "PK / PD",
  "quality-of-life": "Quality of Life",
};
