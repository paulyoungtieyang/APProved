"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { LibraryFilterBar } from "@/components/document-library/LibraryFilterBar";
import { ResultsCountLine } from "@/components/document-library/ResultsCountLine";
import { DocumentRow } from "@/components/document-library/DocumentRow";
import type { LibraryDocument } from "@/lib/state/types";
import styles from "./page.module.css";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export default function DocumentLibraryPage() {
  const { documents } = useAppState();
  const [market, setMarket] = useState("all");
  const [type, setType] = useState("all");
  const [language, setLanguage] = useState("all");
  const [previewDoc, setPreviewDoc] = useState<LibraryDocument | null>(null);

  const markets = useMemo(() => uniqueSorted(documents.map((d) => d.market)), [documents]);
  const types = useMemo(() => uniqueSorted(documents.map((d) => d.type)), [documents]);
  const languages = useMemo(() => uniqueSorted(documents.map((d) => d.language)), [documents]);

  const filtered = documents.filter(
    (d) =>
      (market === "all" || d.market === market) &&
      (type === "all" || d.type === type) &&
      (language === "all" || d.language === language)
  );

  return (
    <div>
      <h1 className="pageTitle">Document Library</h1>
      <p className="pageSub">
        Every generated document, organized by market, type, and language.
      </p>

      <LibraryFilterBar
        markets={markets}
        types={types}
        languages={languages}
        market={market}
        type={type}
        language={language}
        onMarketChange={setMarket}
        onTypeChange={setType}
        onLanguageChange={setLanguage}
      />

      <ResultsCountLine shown={filtered.length} total={documents.length} />

      <Card>
        {filtered.length === 0 ? (
          <p>No documents match the current filters.</p>
        ) : (
          filtered.map((doc) => (
            <DocumentRow key={doc.id} document={doc} onPreview={setPreviewDoc} />
          ))
        )}
      </Card>

      {previewDoc && (
        <Modal title={previewDoc.title} onClose={() => setPreviewDoc(null)}>
          <p className={styles.previewMeta}>
            {previewDoc.type} · {previewDoc.market} · {previewDoc.language} · {previewDoc.status}
          </p>
          <p className={styles.previewBody}>
            This is a placeholder preview for a prototype library entry — no real generated
            document is stored behind it. In production this would render the actual document
            content or an embedded viewer.
          </p>
        </Modal>
      )}
    </div>
  );
}
