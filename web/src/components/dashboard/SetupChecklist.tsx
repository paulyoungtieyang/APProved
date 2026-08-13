"use client";

import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import { ChecklistItemRow } from "./ChecklistItemRow";
import styles from "./SetupChecklist.module.css";

export function SetupChecklist() {
  const { checklist, checklistDismissed } = useAppState();
  const { dismissChecklist } = useAppActions();

  if (checklistDismissed) return null;

  const doneCount = checklist.filter((i) => i.done).length;

  return (
    <Card>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Setup Checklist</h3>
          <p className={styles.progress}>
            {doneCount} of {checklist.length} complete
          </p>
        </div>
        <button type="button" className={styles.dismiss} onClick={dismissChecklist}>
          Dismiss
        </button>
      </div>
      <div className={styles.list}>
        {checklist.map((item) => (
          <ChecklistItemRow key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}
