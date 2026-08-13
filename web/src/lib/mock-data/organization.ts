import type { Organization, Project } from "../state/types";

export const mockOrganization: Organization = {
  id: "org-1",
  name: "Veridian Diagnostics",
  currentUser: { name: "Alex Morgan", role: "Administrator" },
  regulatoryTrack: "global",
};

export const mockProject: Project = {
  id: "proj-1",
  deviceName: "GlucoSense CGM",
  sourceFiles: [],
  selectedFrameworkIds: [],
};
