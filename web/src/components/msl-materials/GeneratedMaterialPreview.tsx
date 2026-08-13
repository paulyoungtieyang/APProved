import { Card } from "@/components/ui/Card";
import type { MaterialType } from "@/lib/mock-data/msl-materials";
import styles from "./GeneratedMaterialPreview.module.css";

export function GeneratedMaterialPreview({
  material,
  tone,
  audience,
  brandVoice,
}: {
  material: MaterialType;
  tone: string;
  audience: string;
  brandVoice: string;
}) {
  return (
    <Card className={styles.card}>
      <div className={styles.badge}>Draft generated</div>
      <h3 className={styles.title}>{material.label}</h3>
      <p className={styles.subline}>
        {tone} · {audience} · {brandVoice}
      </p>
      <p className={styles.note}>
        This is a mock preview for prototyping purposes — no material was actually generated.
      </p>
    </Card>
  );
}
