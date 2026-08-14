"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DossierConfigForm } from "@/components/global-value-dossier/DossierConfigForm";
import { DossierSectionList } from "@/components/global-value-dossier/DossierSectionList";
import { GeneratedDossierPreview } from "@/components/global-value-dossier/GeneratedDossierPreview";
import {
  THERAPEUTIC_AREAS,
  DOSSIER_MARKETS,
  DOSSIER_LANGUAGES,
  TENDER_TYPES,
  DOSSIER_SECTIONS,
} from "@/lib/mock-data/dossier-options";
import styles from "./page.module.css";

export default function GlobalValueDossierPage() {
  const [therapeuticArea, setTherapeuticArea] = useState(THERAPEUTIC_AREAS[0]);
  const [market, setMarket] = useState(DOSSIER_MARKETS[0]);
  const [language, setLanguage] = useState(DOSSIER_LANGUAGES[0]);
  const [tenderType, setTenderType] = useState(TENDER_TYPES[0]);
  const [sectionIds, setSectionIds] = useState<string[]>(DOSSIER_SECTIONS.map((s) => s.id));
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  function toggleSection(id: string) {
    setSectionIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function generate() {
    setStatus("generating");
    setError("");
    try {
      const res = await fetch("/api/generate-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapeuticArea, market, language, tenderType, sectionIds }),
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

  return (
    <div>
      <h1 className="pageTitle">Global Value Dossier</h1>
      <p className="pageSub">
        Configure and generate an AI-drafted value dossier for a specific market and tender.
      </p>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <Card>
            <h3 className={styles.sectionTitle}>Configuration</h3>
            <DossierConfigForm
              therapeuticArea={therapeuticArea}
              market={market}
              language={language}
              tenderType={tenderType}
              onTherapeuticAreaChange={setTherapeuticArea}
              onMarketChange={setMarket}
              onLanguageChange={setLanguage}
              onTenderTypeChange={setTenderType}
            />
          </Card>
          <Card>
            <h3 className={styles.sectionTitle}>Dossier Sections</h3>
            <DossierSectionList selected={sectionIds} onToggle={toggleSection} />
          </Card>
        </div>
        <div className={styles.rightCol}>
          <Button
            type="button"
            onClick={generate}
            disabled={sectionIds.length === 0 || status === "generating"}
          >
            {status === "generating" ? "Generating…" : "Generate Dossier"}
          </Button>

          {status === "error" && <p className={styles.errorText}>{error}</p>}

          {status === "done" && (
            <GeneratedDossierPreview
              therapeuticArea={therapeuticArea}
              market={market}
              language={language}
              tenderType={tenderType}
              markdown={markdown}
            />
          )}
        </div>
      </div>
    </div>
  );
}
