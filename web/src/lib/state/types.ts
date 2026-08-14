// Shared app state shape. UI-prototype only -- nothing here calls a real
// backend; this models what a real Organization/Project/Document schema
// would look like so Phase 2 modules can plug into the same shape later.

export type RegulatoryTrack = "global" | "local-affiliate";

export type UserRole =
  | "Administrator"
  | "Medical Writer"
  | "Medical Science Liaison"
  | "Compliance Officer";

export interface Organization {
  id: string;
  name: string;
  currentUser: { name: string; role: UserRole };
  regulatoryTrack: RegulatoryTrack;
}

export type SourceFileStatus = "uploading" | "processing" | "ready" | "error";

export type SourceFileCategory =
  | "clinical-efficacy"
  | "safety-ae"
  | "demographics"
  | "baseline-characteristics"
  | "pk-pd"
  | "quality-of-life";

export interface SourceFile {
  id: string;
  name: string;
  format: "CSV" | "XLSX" | "PDF" | "DOCX";
  sizeBytes: number;
  category: SourceFileCategory;
  status: SourceFileStatus;
  uploadedAt: string; // ISO
}

export interface RegulatoryFramework {
  id: string; // 'fda' | 'health-canada' | 'ema' | 'pmda' | 'nmpa' | 'tga'
  authority: string;
  geography: "North America" | "Europe" | "Asia" | "Oceania";
  region: string;
  description: string;
  requirements: string[];
}

export interface Project {
  id: string;
  deviceName: string;
  sourceFiles: SourceFile[];
  selectedFrameworkIds: string[];
}

export type DocumentStatus = "In Progress" | "Pending Review" | "Completed" | "Final";

export interface LibraryDocument {
  id: string;
  title: string;
  type: string;
  market: string;
  language: string;
  status: DocumentStatus;
  updatedAt: string; // ISO
  sizeBytes: number;
  localizationGroupId?: string; // links EN/FR/DE variants of one document
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export interface KpiMetric {
  id: "documents-generated" | "active-submissions" | "time-saved";
  label: string;
  value: number;
  unit?: string;
  trendLabel: string;
}

export interface ActivityEntry {
  id: string;
  label: string;
  status: "Completed" | "In Progress";
  timestamp: string; // ISO
}

export type AiProvider = "claude" | "openai";

export interface AiSettings {
  provider: AiProvider;
  claudeApiKey: string;
  openaiApiKey: string;
  dossierPromptRules: string;
  materialPromptRules: string;
}

export interface AppState {
  organization: Organization;
  project: Project;
  frameworks: RegulatoryFramework[];
  documents: LibraryDocument[];
  checklist: ChecklistItem[];
  kpis: KpiMetric[];
  activity: ActivityEntry[];
  checklistDismissed: boolean;
  aiSettings: AiSettings;
}
