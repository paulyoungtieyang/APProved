export type PolicyNewsTag = "Guidance" | "Update" | "Deadline" | "Consultation";

export const NEWS_AUTHORITIES = ["FDA", "EMA", "NMPA", "Health Canada", "TGA", "PMDA", "ICH"];

export interface PolicyNewsItem {
  id: string;
  title: string;
  authority: string;
  region: string;
  date: string; // ISO
  tag: PolicyNewsTag;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  topics: string[];
}

export const mockPolicyNews: PolicyNewsItem[] = [
  {
    id: "news-1",
    title: "EMA Updates Guidance on Post-Market Clinical Follow-up for Class III Devices",
    authority: "EMA",
    region: "Europe",
    date: "2026-08-09T00:00:00.000Z",
    tag: "Guidance",
    summary:
      "Revised PMCF plan template clarifies data-collection expectations for high-risk implantable devices under MDR.",
    sourceLabel: "EMA Europa",
    sourceUrl: "https://www.ema.europa.eu",
    topics: ["Medical Devices", "Post-Market Surveillance"],
  },
  {
    id: "news-2",
    title: "FDA Opens Comment Period on Software as a Medical Device (SaMD) Risk Categorization",
    authority: "FDA",
    region: "North America",
    date: "2026-08-06T00:00:00.000Z",
    tag: "Consultation",
    summary:
      "60-day public comment window on proposed revisions to SaMD risk-category boundaries; comments due October 5.",
    sourceLabel: "FDA.gov",
    sourceUrl: "https://www.fda.gov",
    topics: ["Digital Health", "SaMD"],
  },
  {
    id: "news-3",
    title: "PMDA Extends Transition Deadline for Legacy Device Registrations",
    authority: "PMDA",
    region: "Asia",
    date: "2026-08-02T00:00:00.000Z",
    tag: "Deadline",
    summary:
      "Devices registered under the pre-2023 framework now have until March 2027 to complete re-registration.",
    sourceLabel: "PMDA.go.jp",
    sourceUrl: "https://www.pmda.go.jp/english",
    topics: ["Registration", "Transition Period"],
  },
  {
    id: "news-4",
    title: "Health Canada Publishes Updated Product Monograph Formatting Requirements",
    authority: "Health Canada",
    region: "North America",
    date: "2026-07-29T00:00:00.000Z",
    tag: "Update",
    summary:
      "New template applies to all monographs submitted after September 1; existing approvals are not affected.",
    sourceLabel: "Canada.ca",
    sourceUrl: "https://www.canada.ca/en/health-canada.html",
    topics: ["Labeling", "Product Monograph"],
  },
  {
    id: "news-5",
    title: "NMPA Issues Draft Guidance on Real-World Evidence for Registration Renewal",
    authority: "NMPA",
    region: "Asia",
    date: "2026-07-24T00:00:00.000Z",
    tag: "Guidance",
    summary:
      "Draft outlines acceptable RWE data sources and statistical methods for supporting renewal applications.",
    sourceLabel: "NMPA.gov.cn",
    sourceUrl: "https://www.nmpa.gov.cn",
    topics: ["Real-World Evidence", "Renewal"],
  },
  {
    id: "news-6",
    title: "TGA Announces Fee Schedule Changes for ARTG Applications",
    authority: "TGA",
    region: "Oceania",
    date: "2026-07-18T00:00:00.000Z",
    tag: "Update",
    summary: "Application and annual charges increase 4.2% effective the next fiscal year.",
    sourceLabel: "TGA.gov.au",
    sourceUrl: "https://www.tga.gov.au",
    topics: ["Fees", "ARTG"],
  },
  {
    id: "news-7",
    title: "EMA Consultation on Pharmacovigilance System Master File Simplification",
    authority: "EMA",
    region: "Europe",
    date: "2026-07-12T00:00:00.000Z",
    tag: "Consultation",
    summary:
      "Proposal would reduce PSMF documentation burden for low-risk device categories; feedback due end of August.",
    sourceLabel: "EMA Europa",
    sourceUrl: "https://www.ema.europa.eu",
    topics: ["Pharmacovigilance", "PSMF"],
  },
  {
    id: "news-8",
    title: "FDA Finalizes Guidance on Cybersecurity in Premarket Submissions",
    authority: "FDA",
    region: "North America",
    date: "2026-07-05T00:00:00.000Z",
    tag: "Guidance",
    summary:
      "Final guidance requires a software bill of materials (SBOM) for all connected devices submitted after January.",
    sourceLabel: "FDA.gov",
    sourceUrl: "https://www.fda.gov",
    topics: ["Cybersecurity", "Premarket", "SBOM"],
  },
  {
    id: "news-9",
    title: "ICH Finalizes E6(R3) Good Clinical Practice Guideline",
    authority: "ICH",
    region: "Global",
    date: "2026-06-28T00:00:00.000Z",
    tag: "Update",
    summary:
      "Revised GCP guideline modernizes risk-based quality management expectations across ICH member regions.",
    sourceLabel: "ICH.org",
    sourceUrl: "https://www.ich.org",
    topics: ["GCP", "Quality Management"],
  },
  {
    id: "news-10",
    title: "ICH Opens Consultation on M4 Common Technical Document Update",
    authority: "ICH",
    region: "Global",
    date: "2026-06-15T00:00:00.000Z",
    tag: "Consultation",
    summary:
      "Proposed revisions to the CTD structure aim to harmonize electronic submission formats across regions.",
    sourceLabel: "ICH.org",
    sourceUrl: "https://www.ich.org",
    topics: ["CTD", "eCTD", "Harmonization"],
  },
];
