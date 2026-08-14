"use client";

import { useState } from "react";
import { DOSSIER_SECTIONS } from "@/lib/mock-data/dossier-options";
import styles from "./DossierSectionList.module.css";

export function DossierSectionList({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className={styles.list}>
      {DOSSIER_SECTIONS.map((section) => {
        const checked = selected.includes(section.id);
        const expanded = expandedId === section.id;
        return (
          <li key={section.id}>
            <div className={styles.row}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(section.id)}
                className={styles.checkbox}
                id={`section-${section.id}`}
              />
              <label htmlFor={`section-${section.id}`} className={styles.labelWrap}>
                <span className={styles.label}>{section.label}</span>
                <span className={styles.desc}>{section.description}</span>
              </label>
              <button
                type="button"
                className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
                aria-label={expanded ? "Collapse section detail" : "Expand section detail"}
                aria-expanded={expanded}
                onClick={() => setExpandedId(expanded ? null : section.id)}
              >
                ⌄
              </button>
            </div>
            {expanded && (
              <div className={styles.detail}>
                This section will be drafted using representative, AI-generated content based on
                your configuration above — {section.description.toLowerCase()}.
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
