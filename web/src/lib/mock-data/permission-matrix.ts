import type { UserRole } from "../state/types";

export const PERMISSION_DIMENSIONS = [
  "Upload Clinical Data",
  "Edit Documents",
  "Approve Documents",
  "View All Documents",
  "Export Documents",
  "Manage Brand Guidelines",
  "Modify Medical/Scientific Text Blocks",
] as const;

export type PermissionDimension = (typeof PERMISSION_DIMENSIONS)[number];

export const ROLES: UserRole[] = [
  "Administrator",
  "Medical Writer",
  "Medical Science Liaison",
  "Compliance Officer",
];

// Administrator: everything. Medical Writer: drafts/edits/exports but
// can't approve or touch brand guidelines. MSL: read-only across the
// board -- explicitly cannot modify approved medical/scientific text
// (see ComplianceFrameworkNotice). Compliance Officer: approval + export
// + text-block authority, but doesn't upload/edit/brand.
export const permissionMatrix: Record<UserRole, Record<PermissionDimension, boolean>> = {
  Administrator: {
    "Upload Clinical Data": true,
    "Edit Documents": true,
    "Approve Documents": true,
    "View All Documents": true,
    "Export Documents": true,
    "Manage Brand Guidelines": true,
    "Modify Medical/Scientific Text Blocks": true,
  },
  "Medical Writer": {
    "Upload Clinical Data": true,
    "Edit Documents": true,
    "Approve Documents": false,
    "View All Documents": true,
    "Export Documents": true,
    "Manage Brand Guidelines": false,
    "Modify Medical/Scientific Text Blocks": true,
  },
  "Medical Science Liaison": {
    "Upload Clinical Data": false,
    "Edit Documents": false,
    "Approve Documents": false,
    "View All Documents": true,
    "Export Documents": false,
    "Manage Brand Guidelines": false,
    "Modify Medical/Scientific Text Blocks": false,
  },
  "Compliance Officer": {
    "Upload Clinical Data": false,
    "Edit Documents": false,
    "Approve Documents": true,
    "View All Documents": true,
    "Export Documents": true,
    "Manage Brand Guidelines": false,
    "Modify Medical/Scientific Text Blocks": true,
  },
};
