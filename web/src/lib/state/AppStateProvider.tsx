"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { ReactNode } from "react";
import { appReducer } from "./reducer";
import type { AppState, RegulatoryTrack, SourceFile } from "./types";
import { mockOrganization, mockProject } from "../mock-data/organization";
import { mockFrameworks } from "../mock-data/regulatory-frameworks";
import { mockDocuments } from "../mock-data/documents";
import { mockChecklist } from "../mock-data/checklist";
import { mockKpis } from "../mock-data/kpis";
import { mockActivity } from "../mock-data/activity";

const STORAGE_KEY = "approved.appState.v1";

const initialState: AppState = {
  organization: mockOrganization,
  project: mockProject,
  frameworks: mockFrameworks,
  documents: mockDocuments,
  checklist: mockChecklist,
  kpis: mockKpis,
  activity: mockActivity,
  checklistDismissed: false,
};

function loadPersisted(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Shallow-merge over defaults so a schema change during development
    // doesn't produce a broken half-hydrated state.
    return { ...initialState, ...parsed };
  } catch {
    return null;
  }
}

const StateContext = createContext<AppState | null>(null);

interface Actions {
  setRegulatoryTrack(track: RegulatoryTrack): void;
  startUpload(file: Omit<SourceFile, "id" | "status" | "uploadedAt">): void;
  selectFramework(frameworkId: string): void;
  dismissChecklist(): void;
}
const ActionsContext = createContext<Actions | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Always start from the same initialState the server rendered with --
  // reading localStorage here (during the init pass) would make the
  // client's first render diverge from the server's HTML and trigger a
  // hydration mismatch. Instead, hydrate from storage in an effect below,
  // which only ever runs client-side, after hydration is already done.
  const [state, dispatch] = useReducer(appReducer, initialState);
  // A *state* flag, not a ref: refs mutate synchronously and are visible
  // to every effect in the same commit, which would make the persist
  // effect below see "hydrated" before the HYDRATE dispatch has actually
  // produced a re-render -- it would then write the stale pre-hydration
  // `state` right back over whatever was just loaded. A state flag forces
  // a fresh render (and a fresh closure over the hydrated `state`) before
  // the persist effect's dependency array sees it flip to true.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) dispatch({ type: "HYDRATE", state: persisted });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable (private mode, quota) -- state just
      // won't persist across reloads; not worth surfacing to the user.
    }
  }, [state, isHydrated]);

  const actions = useMemo<Actions>(
    () => ({
      setRegulatoryTrack(track) {
        dispatch({ type: "SET_REGULATORY_TRACK", track });
      },
      startUpload(file) {
        const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        dispatch({
          type: "ADD_SOURCE_FILE",
          file: { ...file, id, status: "uploading", uploadedAt: new Date().toISOString() },
        });
        // Simulated processing pipeline -- no real parsing happens here,
        // this is a UI-prototype stand-in per the Phase 1 fidelity decision.
        window.setTimeout(() => {
          dispatch({ type: "ADVANCE_SOURCE_FILE_STATUS", fileId: id, status: "processing" });
        }, 900);
        window.setTimeout(() => {
          dispatch({ type: "ADVANCE_SOURCE_FILE_STATUS", fileId: id, status: "ready" });
        }, 2500);
      },
      selectFramework(frameworkId) {
        dispatch({ type: "TOGGLE_FRAMEWORK", frameworkId });
      },
      dismissChecklist() {
        dispatch({ type: "DISMISS_CHECKLIST" });
      },
    }),
    []
  );

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useAppActions(): Actions {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useAppActions must be used within AppStateProvider");
  return ctx;
}
