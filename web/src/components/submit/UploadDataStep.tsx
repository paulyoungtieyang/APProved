"use client";

import { useRef } from "react";
import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import styles from "./steps.module.css";
import uploadStyles from "./UploadDataStep.module.css";

function inferFormat(fileName: string): "CSV" | "XLSX" | "PDF" | "DOCX" {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") return "XLSX";
  if (ext === "pdf") return "PDF";
  if (ext === "docx" || ext === "doc") return "DOCX";
  return "CSV";
}

export function UploadDataStep() {
  const { project } = useAppState();
  const { startUpload } = useAppActions();
  const inputRef = useRef<HTMLInputElement>(null);

  function ingest(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      startUpload({
        name: file.name,
        format: inferFormat(file.name),
        sizeBytes: file.size,
        category: "clinical-efficacy",
      });
    });
  }

  return (
    <div>
      <h3 className={styles.stepTitle}>Upload Phase 3 Clinical Data</h3>
      <p className={styles.emptyState}>
        Upload your clinical trial data files that will be used to generate regulatory documents.
      </p>

      <div
        className={uploadStyles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          ingest(e.dataTransfer.files);
        }}
      >
        <p className={uploadStyles.dzText}>Drop files here or click to browse</p>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={uploadStyles.hiddenInput}
          onChange={(e) => ingest(e.target.files)}
        />
        <p className={uploadStyles.dzHint}>Supports: CSV, XLSX, PDF, DOCX</p>
      </div>

      {project.sourceFiles.length > 0 && (
        <ul className={styles.list}>
          {project.sourceFiles.map((f) => (
            <li key={f.id} className={styles.listRow}>
              <span>{f.name}</span>
              <StatusPill status={f.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
