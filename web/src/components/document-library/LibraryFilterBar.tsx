import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";
import styles from "./LibraryFilterBar.module.css";

function toOptions(values: string[]): DropdownOption[] {
  return [{ label: "All", value: "all" }, ...values.map((v) => ({ label: v, value: v }))];
}

export function LibraryFilterBar({
  markets,
  types,
  languages,
  market,
  type,
  language,
  onMarketChange,
  onTypeChange,
  onLanguageChange,
}: {
  markets: string[];
  types: string[];
  languages: string[];
  market: string;
  type: string;
  language: string;
  onMarketChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
}) {
  return (
    <div className={styles.bar}>
      <Dropdown label="Market" value={market} options={toOptions(markets)} onChange={onMarketChange} />
      <Dropdown label="Document Type" value={type} options={toOptions(types)} onChange={onTypeChange} />
      <Dropdown
        label="Language"
        value={language}
        options={toOptions(languages)}
        onChange={onLanguageChange}
      />
    </div>
  );
}
