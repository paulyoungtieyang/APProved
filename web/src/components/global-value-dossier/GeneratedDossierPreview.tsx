import { Card } from "@/components/ui/Card";
import { DOSSIER_SECTIONS } from "@/lib/mock-data/dossier-options";
import styles from "./GeneratedDossierPreview.module.css";

export function GeneratedDossierPreview({
  therapeuticArea,
  market,
  language,
  tenderType,
  sectionIds,
}: {
  therapeuticArea: string;
  market: string;
  language: string;
  tenderType: string;
  sectionIds: string[];
}) {
  const sections = DOSSIER_SECTIONS.filter((s) => sectionIds.includes(s.id));

  return (
    <Card className={styles.card}>
      <div className={styles.badge}>Draft generated</div>
      <h3 className={styles.title}>
        {therapeuticArea} Global Value Dossier — {market}
      </h3>
      <p className={styles.subline}>
        {language} · {tenderType}
      </p>
      <ul className={styles.sectionList}>
        {sections.map((s) => (
          <li key={s.id}>{s.label}</li>
        ))}
      </ul>
      <p className={styles.note}>
        This is a mock preview for prototyping purposes — no document was actually generated.
      </p>
    </Card>
  );
}
