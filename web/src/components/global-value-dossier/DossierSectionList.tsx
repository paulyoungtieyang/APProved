import { DOSSIER_SECTIONS } from "@/lib/mock-data/dossier-options";
import styles from "./DossierSectionList.module.css";

export function DossierSectionList({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className={styles.list}>
      {DOSSIER_SECTIONS.map((section) => {
        const checked = selected.includes(section.id);
        return (
          <li key={section.id}>
            <label className={styles.row}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(section.id)}
                className={styles.checkbox}
              />
              <span>
                <span className={styles.label}>{section.label}</span>
                <span className={styles.desc}>{section.description}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
