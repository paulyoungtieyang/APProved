import { Dropdown } from "@/components/ui/Dropdown";
import { MATERIAL_TONES, MATERIAL_AUDIENCES, BRAND_VOICES } from "@/lib/mock-data/msl-materials";
import styles from "./MaterialConfigForm.module.css";

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export function MaterialConfigForm({
  tone,
  audience,
  brandVoice,
  onToneChange,
  onAudienceChange,
  onBrandVoiceChange,
}: {
  tone: string;
  audience: string;
  brandVoice: string;
  onToneChange: (v: string) => void;
  onAudienceChange: (v: string) => void;
  onBrandVoiceChange: (v: string) => void;
}) {
  return (
    <div className={styles.grid}>
      <Dropdown label="Tone" value={tone} options={toOptions(MATERIAL_TONES)} onChange={onToneChange} />
      <Dropdown
        label="Audience"
        value={audience}
        options={toOptions(MATERIAL_AUDIENCES)}
        onChange={onAudienceChange}
      />
      <Dropdown
        label="Brand Voice"
        value={brandVoice}
        options={toOptions(BRAND_VOICES)}
        onChange={onBrandVoiceChange}
      />
    </div>
  );
}
