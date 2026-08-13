import { Card } from "./Card";
import styles from "./PlaceholderModule.module.css";

export function PlaceholderModule({
  title,
  blurb = "Coming in Phase 2",
}: {
  title: string;
  blurb?: string;
}) {
  return (
    <Card className={styles.wrap}>
      <div className={styles.icon}>◇</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.blurb}>{blurb}</p>
    </Card>
  );
}
