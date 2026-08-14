import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { MATERIAL_TONES, MATERIAL_AUDIENCES, FOCUS_AREAS } from "@/lib/mock-data/msl-materials";
import styles from "./MaterialConfigForm.module.css";

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export function MaterialConfigForm({
  audience,
  focusArea,
  tone,
  keyMessages,
  onAudienceChange,
  onFocusAreaChange,
  onToneChange,
  onKeyMessagesChange,
}: {
  audience: string;
  focusArea: string;
  tone: string;
  keyMessages: string;
  onAudienceChange: (v: string) => void;
  onFocusAreaChange: (v: string) => void;
  onToneChange: (v: string) => void;
  onKeyMessagesChange: (v: string) => void;
}) {
  return (
    <div className={styles.wrap}>
      <Dropdown
        label="Target Audience"
        value={audience}
        options={toOptions(MATERIAL_AUDIENCES)}
        onChange={onAudienceChange}
      />
      <Dropdown
        label="Focus Area"
        value={focusArea}
        options={toOptions(FOCUS_AREAS)}
        onChange={onFocusAreaChange}
      />

      <div className={styles.field}>
        <span className={styles.label}>Tone</span>
        <div className={styles.toneRow} role="radiogroup" aria-label="Tone">
          {MATERIAL_TONES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tone === t}
              className={`${styles.toneBtn} ${tone === t ? styles.toneBtnActive : ""}`}
              onClick={() => onToneChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Key Messages (Optional)</span>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Enter specific key messages or talking points to emphasize..."
          value={keyMessages}
          onChange={(e) => onKeyMessagesChange(e.target.value)}
        />
      </label>

      <div className={styles.brandSection}>
        <h4 className={styles.brandTitle}>Brand Guidelines</h4>
        <label className={styles.field}>
          <span className={styles.label}>Corporate Presentation Template (.potx)</span>
          <div className={styles.uploadRow}>
            <input type="text" className={styles.input} placeholder="No file selected" readOnly />
            <Button type="button" variant="outline">
              Upload
            </Button>
          </div>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Brand Guidelines Document (PDF)</span>
          <div className={styles.uploadRow}>
            <input type="text" className={styles.input} placeholder="No file selected" readOnly />
            <Button type="button" variant="outline">
              Upload
            </Button>
          </div>
        </label>
        <span className={styles.hint}>Uploaded brand assets ensure generated materials are immediately field-ready</span>
      </div>
    </div>
  );
}
