import type { RegulatoryFramework } from "@/lib/state/types";
import { RegulatoryFrameworkCard } from "./RegulatoryFrameworkCard";
import styles from "./RegionGroup.module.css";

export function RegionGroup({
  geography,
  frameworks,
}: {
  geography: string;
  frameworks: RegulatoryFramework[];
}) {
  return (
    <section className={styles.wrap}>
      <h2 className={styles.heading}>{geography}</h2>
      <div className={`grid ${styles.grid}`}>
        {frameworks.map((f) => (
          <RegulatoryFrameworkCard key={f.id} framework={f} />
        ))}
      </div>
    </section>
  );
}
