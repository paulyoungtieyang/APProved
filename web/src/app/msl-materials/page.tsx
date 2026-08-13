"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MaterialTypeCard } from "@/components/msl-materials/MaterialTypeCard";
import { MaterialConfigForm } from "@/components/msl-materials/MaterialConfigForm";
import { GeneratedMaterialPreview } from "@/components/msl-materials/GeneratedMaterialPreview";
import {
  MATERIAL_TYPES,
  MATERIAL_TONES,
  MATERIAL_AUDIENCES,
  BRAND_VOICES,
} from "@/lib/mock-data/msl-materials";
import styles from "./page.module.css";

export default function MslMaterialsPage() {
  const [materialId, setMaterialId] = useState(MATERIAL_TYPES[0].id);
  const [tone, setTone] = useState(MATERIAL_TONES[0]);
  const [audience, setAudience] = useState(MATERIAL_AUDIENCES[0]);
  const [brandVoice, setBrandVoice] = useState(BRAND_VOICES[0]);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  const material = MATERIAL_TYPES.find((m) => m.id === materialId)!;

  function generate() {
    setStatus("generating");
    window.setTimeout(() => setStatus("done"), 1200);
  }

  function selectMaterial(id: string) {
    setMaterialId(id);
    setStatus("idle");
  }

  return (
    <div>
      <h1 className="pageTitle">MSL Materials</h1>
      <p className="pageSub">
        Generate scientific materials for Medical Science Liaison field use.
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
          <h3 className={styles.sectionTitle}>Configuration</h3>
          <MaterialConfigForm
            tone={tone}
            audience={audience}
            brandVoice={brandVoice}
            onToneChange={setTone}
            onAudienceChange={setAudience}
            onBrandVoiceChange={setBrandVoice}
          />
          <div className={styles.generateRow}>
            <Button type="button" onClick={generate} disabled={status === "generating"}>
              {status === "generating" ? "Generating…" : `Generate ${material.label}`}
            </Button>
          </div>
        </Card>

        {status === "done" && (
          <GeneratedMaterialPreview
            material={material}
            tone={tone}
            audience={audience}
            brandVoice={brandVoice}
          />
        )}
      </div>
    </div>
  );
}
