import type { KpiMetric } from "../state/types";

export const mockKpis: KpiMetric[] = [
  {
    id: "documents-generated",
    label: "Documents Generated",
    value: 24,
    trendLabel: "+18% vs. previous month",
  },
  {
    id: "active-submissions",
    label: "Active Submissions",
    value: 3,
    trendLabel: "pending review",
  },
  {
    id: "time-saved",
    label: "Time Saved",
    value: 156,
    unit: "hrs",
    trendLabel: "this quarter",
  },
];
