"use client";

import { useRef, useState } from "react";
import { useAppState, useAppActions } from "@/lib/state/AppStateProvider";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import type { SourceFileCategory } from "@/lib/state/types";
import { CATEGORY_LABELS } from "@/lib/upload-categories";
import styles from "./UploadDropzone.module.css";

function inferFormat(fileName: string): "CSV" | "XLSX" | "PDF" | "DOCX" {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") return "XLSX";
  if (ext === "pdf") return "PDF";
  if (ext === "docx" || ext === "doc") return "DOCX";
  return "CSV";
}

export function UploadDropzone() {
  const { project } = useAppState();
  const { startUpload } = useAppActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<SourceFileCategory>("clinical-efficacy");
  const [isDragging, setIsDragging] = useState(false);

  function ingest(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      startUpload({
        name: file.name,
        format: inferFormat(file.name),
        sizeBytes: file.size,
        category,
      });
    });
  }

  return (
    <div>
      <label className={styles.categoryLabel}>
        Data category for this upload
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value as SourceFileCategory)}
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          ingest(e.dataTransfer.files);
        }}
      >
        <p className={styles.dzText}>Drag and drop files here, or</p>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => ingest(e.target.files)}
        />
        <p className={styles.dzHint}>CSV, XLSX, PDF, or DOCX — up to 100 MB per file</p>
      </div>

      {project.sourceFiles.length > 0 && (
        <ul className={styles.fileList}>
          {project.sourceFiles.map((file) => (
            <li key={file.id} className={styles.fileRow}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMeta}>
                <span className={styles.fileCategory}>{CATEGORY_LABELS[file.category]}</span>
                <StatusPill status={file.status} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
