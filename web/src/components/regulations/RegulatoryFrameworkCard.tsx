"use client";

import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import type { RegulatoryFramework } from "@/lib/state/types";
import styles from "./RegulatoryFrameworkCard.module.css";

export function RegulatoryFrameworkCard({ framework }: { framework: RegulatoryFramework }) {
  const { project } = useAppState();
  const { selectFramework } = useAppActions();
  const selected = project.selectedFrameworkIds.includes(framework.id);

  return (
    <Card
      as="section"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.authority}>{framework.authority}</div>
          <div className={styles.region}>{framework.region}</div>
        </div>
        <button
          type="button"
          className={`${styles.toggle} ${selected ? styles.toggleOn : ""}`}
          aria-pressed={selected}
          onClick={() => selectFramework(framework.id)}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
      <p className={styles.description}>{framework.description}</p>
      <ul className={styles.requirements}>
        {framework.requirements.map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>
    </Card>
  );
}
