export type ResourceCategory = "Regulatory" | "Legal" | "Security";

export interface ResourceItem {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  type: "Guide" | "Template" | "Policy" | "Checklist";
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = ["Regulatory", "Legal", "Security"];

export const mockResources: ResourceItem[] = [
  {
    id: "res-1",
    category: "Regulatory",
    title: "EU MDR Annex II/III Technical Documentation Checklist",
    description: "Section-by-section checklist for CE-mark technical documentation completeness.",
    type: "Checklist",
  },
  {
    id: "res-2",
    category: "Regulatory",
    title: "FDA 510(k) Submission Guide",
    description: "Step-by-step walkthrough of the premarket notification pathway.",
    type: "Guide",
  },
  {
    id: "res-3",
    category: "Regulatory",
    title: "Clinical Evaluation Report Template",
    description: "MDCG 2020-13 aligned CER structure with example language.",
    type: "Template",
  },
  {
    id: "res-4",
    category: "Legal",
    title: "Data Processing Agreement Template",
    description: "Standard DPA covering clinical-data handling across jurisdictions.",
    type: "Template",
  },
  {
    id: "res-5",
    category: "Legal",
    title: "Cross-Border Data Transfer Policy",
    description: "Internal policy governing transfer of trial data between markets.",
    type: "Policy",
  },
  {
    id: "res-6",
    category: "Legal",
    title: "Vendor Confidentiality Agreement Guide",
    description: "When and how to execute NDAs with third-party regulatory consultants.",
    type: "Guide",
  },
  {
    id: "res-7",
    category: "Security",
    title: "Data Classification Policy",
    description: "Defines sensitivity tiers for uploaded clinical and commercial data.",
    type: "Policy",
  },
  {
    id: "res-8",
    category: "Security",
    title: "Incident Response Checklist",
    description: "First-72-hours checklist for a suspected data security incident.",
    type: "Checklist",
  },
  {
    id: "res-9",
    category: "Security",
    title: "Access Control Review Guide",
    description: "Quarterly process for auditing role-based access across the platform.",
    type: "Guide",
  },
];
