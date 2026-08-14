import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import {
  THERAPEUTIC_AREAS,
  DOSSIER_MARKETS,
  DOSSIER_LANGUAGES,
  OUTPUT_FORMATS,
} from "@/lib/mock-data/dossier-options";
import styles from "./DossierConfigForm.module.css";

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export function DossierConfigForm({
  therapeuticArea,
  market,
  language,
  outputFormat,
  regionalTenderSpec,
  onTherapeuticAreaChange,
  onMarketChange,
  onLanguageChange,
  onOutputFormatChange,
  onRegionalTenderSpecChange,
}: {
  therapeuticArea: string;
  market: string;
  language: string;
  outputFormat: string;
  regionalTenderSpec: string;
  onTherapeuticAreaChange: (v: string) => void;
  onMarketChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onOutputFormatChange: (v: string) => void;
  onRegionalTenderSpecChange: (v: string) => void;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <Dropdown
          label="Therapeutic Area"
          value={therapeuticArea}
          options={toOptions(THERAPEUTIC_AREAS)}
          onChange={onTherapeuticAreaChange}
        />
        <Dropdown
          label="Target Markets"
          value={market}
          options={toOptions(DOSSIER_MARKETS)}
          onChange={onMarketChange}
        />
        <Dropdown
          label="Language"
          value={language}
          options={toOptions(DOSSIER_LANGUAGES)}
          onChange={onLanguageChange}
        />
        <Dropdown
          label="Output Format"
          value={outputFormat}
          options={toOptions(OUTPUT_FORMATS)}
          onChange={onOutputFormatChange}
        />
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Regional Tender Specifications (Optional)</span>
        <div className={styles.uploadRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="Upload past tender documents or enter tender ID..."
            value={regionalTenderSpec}
            onChange={(e) => onRegionalTenderSpecChange(e.target.value)}
          />
          <Button type="button" variant="outline">
            Upload
          </Button>
        </div>
        <span className={styles.hint}>AI will map content to localized public purchasing criteria</span>
      </label>
    </div>
  );
}
