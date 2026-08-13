"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HELP_CONTENT, DEFAULT_HELP } from "@/lib/help-content";
import styles from "./HelpButton.module.css";

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const content = HELP_CONTENT[pathname] ?? DEFAULT_HELP;

  return (
    <>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Help">
          <div className={styles.panelHead}>
            <span>{content.title}</span>
            <button
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          <p className={styles.panelBody}>{content.body}</p>
        </div>
      )}
      <button
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Help"
        aria-expanded={open}
      >
        ?
      </button>
    </>
  );
}
