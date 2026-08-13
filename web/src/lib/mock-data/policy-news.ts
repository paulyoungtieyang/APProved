export type PolicyNewsTag = "Guidance" | "Update" | "Deadline" | "Consultation";

export interface PolicyNewsItem {
  id: string;
  title: string;
  authority: string;
  region: string;
  date: string; // ISO
  tag: PolicyNewsTag;
  summary: string;
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
  },
  {
    id: "news-6",
    title: "TGA Announces Fee Schedule Changes for ARTG Applications",
    authority: "TGA",
    region: "Oceania",
    date: "2026-07-18T00:00:00.000Z",
    tag: "Update",
    summary: "Application and annual charges increase 4.2% effective the next fiscal year.",
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
  },
];
