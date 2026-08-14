import { DOSSIER_LANGUAGES } from "@/lib/mock-data/dossier-options";
import styles from "./steps.module.css";
import checklistStyles from "./MultiSelectChecklist.module.css";

export function SelectLanguagesStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h3 className={styles.stepTitle}>Select Languages</h3>
      <p className={styles.emptyState}>
        Choose the languages the generated scientific content should be produced in.
      </p>
      <ul className={checklistStyles.list}>
        {DOSSIER_LANGUAGES.map((language) => (
          <li key={language}>
            <label className={checklistStyles.row}>
              <input
                type="checkbox"
                checked={selected.includes(language)}
                onChange={() => onToggle(language)}
                className={checklistStyles.checkbox}
              />
              <span>{language}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
