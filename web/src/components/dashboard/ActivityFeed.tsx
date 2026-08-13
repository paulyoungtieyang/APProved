"use client";

import { useAppState } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import { ActivityRow } from "./ActivityRow";
import styles from "./ActivityFeed.module.css";

export function ActivityFeed() {
  const { activity } = useAppState();

  return (
    <Card>
      <h3 className={styles.title}>Recent Activity</h3>
      <div className={styles.list}>
        {activity.map((entry) => (
          <ActivityRow key={entry.id} entry={entry} />
        ))}
      </div>
    </Card>
  );
}
