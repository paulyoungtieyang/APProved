import type {
  AppState,
  RegulatoryTrack,
  SourceFile,
  SourceFileStatus,
  ActivityEntry,
} from "./types";

export type Action =
  | { type: "SET_REGULATORY_TRACK"; track: RegulatoryTrack }
  | { type: "ADD_SOURCE_FILE"; file: SourceFile }
  | { type: "ADVANCE_SOURCE_FILE_STATUS"; fileId: string; status: SourceFileStatus }
  | { type: "TOGGLE_FRAMEWORK"; frameworkId: string }
  | { type: "DISMISS_CHECKLIST" }
  | { type: "COMPLETE_CHECKLIST_ITEM"; itemId: string }
  | { type: "LOG_ACTIVITY"; entry: ActivityEntry }
  | { type: "HYDRATE"; state: AppState };

function logActivity(state: AppState, label: string): AppState["activity"] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    status: "Completed",
    timestamp: new Date().toISOString(),
  };
  return [entry, ...state.activity];
}

function completeChecklistItem(state: AppState, itemId: string): AppState["checklist"] {
  return state.checklist.map((item) =>
    item.id === itemId ? { ...item, done: true } : item
  );
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_REGULATORY_TRACK":
      return {
        ...state,
        organization: { ...state.organization, regulatoryTrack: action.track },
      };

    case "ADD_SOURCE_FILE":
      return {
        ...state,
        project: {
          ...state.project,
          sourceFiles: [...state.project.sourceFiles, action.file],
        },
      };

    case "ADVANCE_SOURCE_FILE_STATUS": {
      const sourceFiles = state.project.sourceFiles.map((f) =>
        f.id === action.fileId ? { ...f, status: action.status } : f
      );
      let next: AppState = {
        ...state,
        project: { ...state.project, sourceFiles },
      };
      if (action.status === "ready") {
        next = {
          ...next,
          checklist: completeChecklistItem(next, "upload-phase-3-clinical-data"),
          activity: logActivity(next, "Phase 3 Data Upload — Completed"),
        };
      }
      return next;
    }

    case "TOGGLE_FRAMEWORK": {
      const already = state.project.selectedFrameworkIds.includes(action.frameworkId);
      const selectedFrameworkIds = already
        ? state.project.selectedFrameworkIds.filter((id) => id !== action.frameworkId)
        : [...state.project.selectedFrameworkIds, action.frameworkId];

      let next: AppState = {
        ...state,
        project: { ...state.project, selectedFrameworkIds },
      };

      if (!already) {
        const framework = state.frameworks.find((f) => f.id === action.frameworkId);
        const label = framework
          ? `${framework.authority} Regulations Selected — Completed`
          : "Regulatory Framework Selected — Completed";
        next = {
          ...next,
          checklist: completeChecklistItem(next, "select-regulatory-frameworks"),
          activity: logActivity(next, label),
        };
      }
      return next;
    }

    case "DISMISS_CHECKLIST":
      return { ...state, checklistDismissed: true };

    case "COMPLETE_CHECKLIST_ITEM":
      return { ...state, checklist: completeChecklistItem(state, action.itemId) };

    case "LOG_ACTIVITY":
      return { ...state, activity: [action.entry, ...state.activity] };

    case "HYDRATE":
      return action.state;

    default:
      return state;
  }
}
