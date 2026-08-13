"use client";

import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import type { RegulatoryTrack } from "@/lib/state/types";
import styles from "./RegulatoryTrackToggle.module.css";

const OPTIONS: { value: RegulatoryTrack; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "local-affiliate", label: "Local Affiliate" },
];

export function RegulatoryTrackToggle() {
  const { organization } = useAppState();
  const { setRegulatoryTrack } = useAppActions();

  return (
    <div className={styles.wrap} role="tablist" aria-label="Regulatory track">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={organization.regulatoryTrack === opt.value}
          className={`${styles.tab} ${
            organization.regulatoryTrack === opt.value ? styles.active : ""
          }`}
          onClick={() => setRegulatoryTrack(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
