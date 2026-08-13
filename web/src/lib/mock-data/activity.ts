import type { ActivityEntry } from "../state/types";

// Seed history -- predates anything the user does in this session, so
// live-logged entries (from Upload / Regulations) always appear above
// these once dispatched.
export const mockActivity: ActivityEntry[] = [
  {
    id: "act-seed-3",
    label: "Global Dossier Draft — In Progress",
    status: "In Progress",
    timestamp: "2026-08-10T14:32:00.000Z",
  },
  {
    id: "act-seed-2",
    label: "FDA Regulations Selected — Completed",
    status: "Completed",
    timestamp: "2026-08-09T11:05:00.000Z",
  },
  {
    id: "act-seed-1",
    label: "Phase 3 Data Upload — Completed",
    status: "Completed",
    timestamp: "2026-08-08T09:47:00.000Z",
  },
];
