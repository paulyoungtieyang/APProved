import type { MaterialType } from "@/lib/mock-data/msl-materials";
import styles from "./MaterialTypeCard.module.css";

export function MaterialTypeCard({
  material,
  selected,
  onSelect,
}: {
  material: MaterialType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      aria-pressed={selected}
    >
      <span className={styles.icon} aria-hidden="true">
        {material.icon}
      </span>
      <span className={styles.label}>{material.label}</span>
      <span className={styles.desc}>{material.description}</span>
      <span className={styles.time}>Est. generation time: {material.estGenerationTime}</span>
    </button>
  );
}
