import type { RegulatoryFramework } from "../state/types";

export const mockFrameworks: RegulatoryFramework[] = [
  {
    id: "fda",
    authority: "FDA",
    geography: "North America",
    region: "United States",
    description:
      "U.S. Food and Drug Administration submission requirements for regulated products.",
    requirements: [
      "Common Technical Document / CTD format",
      "Module 2: Common Technical Document Summaries",
      "Module 3: Quality / CMC",
      "Module 4: Nonclinical Study Reports",
      "Module 5: Clinical Study Reports",
    ],
  },
  {
    id: "health-canada",
    authority: "Health Canada",
    geography: "North America",
    region: "Canada",
    description: "Health Canada submission requirements for market authorization.",
    requirements: [
      "eCTD format",
      "Product Monograph",
      "Risk Management Plan",
      "Clinical and non-clinical summaries",
    ],
  },
  {
    id: "ema",
    authority: "EMA",
    geography: "Europe",
    region: "European Union",
    description: "European Medicines Agency centralized submission requirements.",
    requirements: [
      "eCTD submission format",
      "EPAR",
      "Risk Management Plan / RMP",
      "Pharmacovigilance System Master File / PSMF",
    ],
  },
  {
    id: "pmda",
    authority: "PMDA",
    geography: "Asia",
    region: "Japan",
    description: "Pharmaceuticals and Medical Devices Agency submission requirements.",
    requirements: [
      "CTD with Japanese-language components",
      "JGCP compliance documentation",
      "Japanese package-insert format",
      "Interview form",
    ],
  },
  {
    id: "nmpa",
    authority: "NMPA",
    geography: "Asia",
    region: "China",
    description: "National Medical Products Administration submission requirements.",
    requirements: [
      "eCTD with Chinese language",
      "Clinical trial data from Chinese population",
      "Manufacturing-site inspection",
      "Chinese drug instruction manual",
    ],
  },
  {
    id: "tga",
    authority: "TGA",
    geography: "Oceania",
    region: "Australia",
    description: "Therapeutic Goods Administration submission requirements.",
    requirements: [
      "Australian Register of Therapeutic Goods / ARTG",
      "eCTD format",
      "Product Information / PI",
      "Consumer Medicine Information / CMI",
    ],
  },
];

export const GEOGRAPHY_ORDER: RegulatoryFramework["geography"][] = [
  "North America",
  "Europe",
  "Asia",
  "Oceania",
];
