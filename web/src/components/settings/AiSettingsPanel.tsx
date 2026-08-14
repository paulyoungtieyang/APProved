"use client";

import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import type { AiProvider } from "@/lib/state/types";
import styles from "./AiSettingsPanel.module.css";

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: "claude", label: "Claude (Anthropic)" },
  { value: "openai", label: "OpenAI" },
];

export function AiSettingsPanel() {
  const { aiSettings } = useAppState();
  const { updateAiSettings } = useAppActions();

  return (
    <div className={styles.wrap}>
      <p className={styles.note}>
        Keys are stored only in this browser and are sent to this app&apos;s own server only
        at generation time — never persisted server-side.
      </p>

      <div className={styles.field}>
        <span className={styles.label}>Generation Provider</span>
        <div className={styles.providerRow} role="radiogroup" aria-label="AI provider">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={aiSettings.provider === p.value}
              className={`${styles.providerBtn} ${
                aiSettings.provider === p.value ? styles.providerBtnActive : ""
              }`}
              onClick={() => updateAiSettings({ provider: p.value })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Claude API Key</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            className={styles.input}
            placeholder="sk-ant-..."
            value={aiSettings.claudeApiKey}
            onChange={(e) => updateAiSettings({ claudeApiKey: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>OpenAI API Key</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            className={styles.input}
            placeholder="sk-..."
            value={aiSettings.openaiApiKey}
            onChange={(e) => updateAiSettings({ openaiApiKey: e.target.value })}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Global Value Dossier — Prompt Rules</span>
        <span className={styles.hint}>
          Expert-authored instructions appended to every dossier generation request — tone,
          required disclaimers, regional conventions, data-sourcing rules, etc.
        </span>
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="e.g. Always cite the payer's most recent HTA decision. Avoid comparative superiority claims without head-to-head data. Use British English for EU markets."
          value={aiSettings.dossierPromptRules}
          onChange={(e) => updateAiSettings({ dossierPromptRules: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>MSL Materials — Prompt Rules</span>
        <span className={styles.hint}>
          Expert-authored instructions appended to every MSL material generation request.
        </span>
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="e.g. Never make claims outside the approved label. Flag any off-label question areas for compliance review instead of answering directly."
          value={aiSettings.materialPromptRules}
          onChange={(e) => updateAiSettings({ materialPromptRules: e.target.value })}
        />
      </label>
    </div>
  );
}
