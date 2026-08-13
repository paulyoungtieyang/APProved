import { Dropdown } from "@/components/ui/Dropdown";
import {
  THERAPEUTIC_AREAS,
  DOSSIER_MARKETS,
  DOSSIER_LANGUAGES,
  TENDER_TYPES,
} from "@/lib/mock-data/dossier-options";
import styles from "./DossierConfigForm.module.css";

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export function DossierConfigForm({
  therapeuticArea,
  market,
  language,
  tenderType,
  onTherapeuticAreaChange,
  onMarketChange,
  onLanguageChange,
  onTenderTypeChange,
}: {
  therapeuticArea: string;
  market: string;
  language: string;
  tenderType: string;
  onTherapeuticAreaChange: (v: string) => void;
  onMarketChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onTenderTypeChange: (v: string) => void;
}) {
  return (
    <div className={styles.grid}>
      <Dropdown
        label="Therapeutic Area"
        value={therapeuticArea}
        options={toOptions(THERAPEUTIC_AREAS)}
        onChange={onTherapeuticAreaChange}
      />
      <Dropdown
        label="Market"
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
        label="Tender Type"
        value={tenderType}
        options={toOptions(TENDER_TYPES)}
        onChange={onTenderTypeChange}
      />
    </div>
  );
}
