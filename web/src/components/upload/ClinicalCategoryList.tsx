import { CATEGORY_LABELS } from "@/lib/upload-categories";
import styles from "./ClinicalCategoryList.module.css";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "clinical-efficacy": "Primary and secondary endpoint results",
  "safety-ae": "Adverse events and safety signals",
  demographics: "Patient population characteristics",
  "baseline-characteristics": "Pre-treatment baseline measures",
  "pk-pd": "Pharmacokinetic / pharmacodynamic data",
  "quality-of-life": "Patient-reported outcome measures",
};

export function ClinicalCategoryList() {
  return (
    <ul className={styles.list}>
      {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
        <li key={id} className={styles.item}>
          <span className={styles.dot} aria-hidden="true" />
          <div>
            <div className={styles.label}>{label}</div>
            <div className={styles.desc}>{CATEGORY_DESCRIPTIONS[id]}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
