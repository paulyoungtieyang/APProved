export interface RegulatoryBody {
  id: string;
  name: string;
  fullName: string;
  region: string;
  websiteUrl: string;
  guidanceUrl: string;
}

export const REGULATORY_BODIES: RegulatoryBody[] = [
  {
    id: "fda",
    name: "U.S. FDA",
    fullName: "Food and Drug Administration",
    region: "United States",
    websiteUrl: "https://www.fda.gov",
    guidanceUrl: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents",
  },
  {
    id: "ema",
    name: "EMA",
    fullName: "European Medicines Agency",
    region: "European Union",
    websiteUrl: "https://www.ema.europa.eu",
    guidanceUrl: "https://www.ema.europa.eu/en/human-regulatory-overview/research-development/scientific-guidelines",
  },
  {
    id: "pmda",
    name: "PMDA",
    fullName: "Pharmaceuticals and Medical Devices Agency",
    region: "Japan",
    websiteUrl: "https://www.pmda.go.jp/english",
    guidanceUrl: "https://www.pmda.go.jp/english/review-services/reviews/0002.html",
  },
  {
    id: "nmpa",
    name: "NMPA",
    fullName: "National Medical Products Administration",
    region: "China",
    websiteUrl: "https://www.nmpa.gov.cn",
    guidanceUrl: "https://www.nmpa.gov.cn/directory/web/nmpa/",
  },
  {
    id: "health-canada",
    name: "Health Canada",
    fullName: "Health Canada — Therapeutic Products Directorate",
    region: "Canada",
    websiteUrl: "https://www.canada.ca/en/health-canada.html",
    guidanceUrl: "https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents.html",
  },
  {
    id: "tga",
    name: "TGA",
    fullName: "Therapeutic Goods Administration",
    region: "Australia",
    websiteUrl: "https://www.tga.gov.au",
    guidanceUrl: "https://www.tga.gov.au/resources",
  },
];

export interface RegulationDocument {
  id: string;
  title: string;
  tag: string;
  fileType: string;
  size: string;
  updated: string;
}

export const REGULATION_DOCUMENTS: RegulationDocument[] = [
  { id: "ich-e6r3", title: "ICH E6(R3) - Good Clinical Practice", tag: "ICH Guidelines", fileType: "PDF", size: "2.4 MB", updated: "March 2026" },
  { id: "ich-m4", title: "ICH M4 - Common Technical Document", tag: "ICH Guidelines", fileType: "PDF", size: "1.8 MB", updated: "February 2026" },
  { id: "fda-endpoints", title: "FDA Guidance - Clinical Trial Endpoints", tag: "FDA", fileType: "PDF", size: "890 KB", updated: "January 2026" },
  { id: "ema-clinical-eval", title: "EMA Guideline - Clinical Evaluation", tag: "EMA", fileType: "PDF", size: "1.2 MB", updated: "December 2025" },
  { id: "ectd-v4", title: "eCTD Submission Standards v4.0", tag: "Technical", fileType: "PDF", size: "3.1 MB", updated: "November 2025" },
  { id: "fda-rwe", title: "FDA Real-World Evidence Framework", tag: "FDA", fileType: "PDF", size: "1.5 MB", updated: "April 2026" },
];

export interface Certification {
  id: string;
  name: string;
  description: string;
  status: string;
  validUntil: string;
  icon: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    description: "System and Organization Controls for security, availability, and confidentiality",
    status: "Certified",
    validUntil: "December 2026",
    icon: "🛡",
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    description: "Information Security Management System certification",
    status: "Certified",
    validUntil: "October 2026",
    icon: "🔒",
  },
  {
    id: "hipaa",
    name: "HIPAA Compliant",
    description: "Health Insurance Portability and Accountability Act compliance",
    status: "Compliant",
    validUntil: "Ongoing",
    icon: "✓",
  },
  {
    id: "gdpr",
    name: "GDPR Compliant",
    description: "General Data Protection Regulation compliance for EU data",
    status: "Compliant",
    validUntil: "Ongoing",
    icon: "✓",
  },
];

export interface LegalDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: string;
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  { id: "msa", name: "Master Service Agreement (MSA)", description: "Standard service agreement for APProved platform usage", category: "Contract", fileType: "PDF" },
  { id: "nda", name: "Non-Disclosure Agreement (NDA)", description: "Mutual confidentiality agreement for sensitive data protection", category: "Legal", fileType: "PDF" },
  { id: "dpa", name: "Data Processing Agreement (DPA)", description: "GDPR-compliant data processing terms", category: "Legal", fileType: "PDF" },
  { id: "sla", name: "Service Level Agreement (SLA)", description: "Platform uptime and performance guarantees", category: "Contract", fileType: "PDF" },
  { id: "invoice-template", name: "Invoice Template", description: "Standard invoice format for billing", category: "Financial", fileType: "XLSX" },
  { id: "sow", name: "Statement of Work (SOW)", description: "Project-specific scope and deliverables template", category: "Contract", fileType: "DOCX" },
];
