import { Card } from "@/components/ui/Card";
import type { KpiMetric } from "@/lib/state/types";
import styles from "./KpiCard.module.css";

export function KpiCard({ kpi }: { kpi: KpiMetric }) {
  return (
    <Card className={styles.card}>
      <div className={styles.label}>{kpi.label}</div>
      <div className={styles.value}>
        {kpi.value}
        {kpi.unit ? <span className={styles.unit}> {kpi.unit}</span> : null}
      </div>
      <div className={styles.trend}>{kpi.trendLabel}</div>
    </Card>
  );
}
