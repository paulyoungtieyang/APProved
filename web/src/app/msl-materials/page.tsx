"use client";

import { useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MaterialTypeCard } from "@/components/msl-materials/MaterialTypeCard";
import { MaterialConfigForm } from "@/components/msl-materials/MaterialConfigForm";
import { GeneratedMaterialPreview } from "@/components/msl-materials/GeneratedMaterialPreview";
import {
  MATERIAL_TYPES,
  MATERIAL_TONES,
  MATERIAL_AUDIENCES,
  FOCUS_AREAS,
} from "@/lib/mock-data/msl-materials";
import styles from "./page.module.css";

export default function MslMaterialsPage() {
  const { aiSettings } = useAppState();
  const [materialId, setMaterialId] = useState(MATERIAL_TYPES[0].id);
  const [audience, setAudience] = useState(MATERIAL_AUDIENCES[0]);
  const [focusArea, setFocusArea] = useState(FOCUS_AREAS[0]);
  const [tone, setTone] = useState(MATERIAL_TONES[0]);
  const [keyMessages, setKeyMessages] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  const material = MATERIAL_TYPES.find((m) => m.id === materialId)!;

  async function generate() {
    setStatus("generating");
    setError("");
    try {
      const res = await fetch("/api/generate-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          tone,
          audience,
          focusArea,
          keyMessages,
          provider: aiSettings.provider,
          apiKey: aiSettings.provider === "openai" ? aiSettings.openaiApiKey : aiSettings.claudeApiKey,
          promptRules: aiSettings.materialPromptRules,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setMarkdown(data.markdown);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  }

  function selectMaterial(id: string) {
    setMaterialId(id);
    setStatus("idle");
  }

  return (
    <div>
      <h1 className="pageTitle">MSL Materials</h1>
      <p className="pageSub">
        Generate scientific communication materials for Medical Science Liaisons.
      </p>

      <div className={`grid ${styles.materialsGrid}`}>
        {MATERIAL_TYPES.map((m) => (
          <MaterialTypeCard
            key={m.id}
            material={m}
            selected={m.id === materialId}
            onSelect={() => selectMaterial(m.id)}
          />
        ))}
      </div>

      <div className={styles.mainGrid}>
        <Card>
          <h3 className={styles.sectionTitle}>Content Configuration</h3>
          <MaterialConfigForm
            audience={audience}
            focusArea={focusArea}
            tone={tone}
            keyMessages={keyMessages}
            onAudienceChange={setAudience}
            onFocusAreaChange={setFocusArea}
            onToneChange={setTone}
            onKeyMessagesChange={setKeyMessages}
          />
          <div className={styles.generateRow}>
            <Button
              type="button"
              onClick={generate}
              disabled={status === "generating"}
              className={styles.generateBtn}
            >
              {status === "generating" ? "Generating…" : "Generate Material with AI"}
            </Button>
          </div>
          {status === "error" && <p className={styles.errorText}>{error}</p>}
        </Card>

        {status === "done" && (
          <GeneratedMaterialPreview
            material={material}
            tone={tone}
            audience={audience}
            focusArea={focusArea}
            markdown={markdown}
          />
        )}
      </div>
    </div>
  );
}
