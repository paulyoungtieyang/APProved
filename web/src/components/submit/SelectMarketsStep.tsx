import { DOSSIER_MARKETS } from "@/lib/mock-data/dossier-options";
import styles from "./steps.module.css";
import checklistStyles from "./MultiSelectChecklist.module.css";

export function SelectMarketsStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h3 className={styles.stepTitle}>Select Markets</h3>
      <p className={styles.emptyState}>
        Choose the target markets this submission's Global Value Dossier will cover.
      </p>
      <ul className={checklistStyles.list}>
        {DOSSIER_MARKETS.map((market) => (
          <li key={market}>
            <label className={checklistStyles.row}>
              <input
                type="checkbox"
                checked={selected.includes(market)}
                onChange={() => onToggle(market)}
                className={checklistStyles.checkbox}
              />
              <span>{market}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
