import { RESOURCE_CATEGORIES, type ResourceCategory } from "@/lib/mock-data/resources";
import styles from "./ResourceCategoryTabs.module.css";

export function ResourceCategoryTabs({
  active,
  onChange,
}: {
  active: ResourceCategory;
  onChange: (category: ResourceCategory) => void;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Resource category">
      {RESOURCE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          className={`${styles.tab} ${active === cat ? styles.active : ""}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
