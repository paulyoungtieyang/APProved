import type { ChecklistItem } from "../state/types";

export const mockChecklist: ChecklistItem[] = [
  {
    id: "identify-device-classification",
    label: "Identify Device Classification",
    done: false,
    href: "/regulations",
  },
  {
    id: "upload-phase-3-clinical-data",
    label: "Upload Phase 3 Clinical Data",
    done: false,
    href: "/upload",
  },
  {
    id: "select-regulatory-frameworks",
    label: "Select Regulatory Frameworks",
    done: false,
    href: "/regulations",
  },
  {
    id: "configure-brand-guidelines",
    label: "Configure Brand Guidelines",
    done: false,
    href: "/msl-materials",
  },
  {
    id: "set-up-team-permissions",
    label: "Set Up Team Permissions",
    done: false,
    href: "/settings",
  },
];
