"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { Card } from "@/components/ui/Card";
import { LibraryFilterBar } from "@/components/document-library/LibraryFilterBar";
import { ResultsCountLine } from "@/components/document-library/ResultsCountLine";
import { DocumentRow } from "@/components/document-library/DocumentRow";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export default function DocumentLibraryPage() {
  const { documents } = useAppState();
  const [market, setMarket] = useState("all");
  const [type, setType] = useState("all");
  const [language, setLanguage] = useState("all");

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
          filtered.map((doc) => <DocumentRow key={doc.id} document={doc} />)
        )}
      </Card>
    </div>
  );
}
