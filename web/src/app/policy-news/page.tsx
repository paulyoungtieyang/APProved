"use client";

import { useState } from "react";
import { NewsCard } from "@/components/policy-news/NewsCard";
import { mockPolicyNews, NEWS_AUTHORITIES } from "@/lib/mock-data/policy-news";
import styles from "./page.module.css";

export default function PolicyNewsPage() {
  const [authority, setAuthority] = useState("All");

  const filtered =
    authority === "All" ? mockPolicyNews : mockPolicyNews.filter((n) => n.authority === authority);

  return (
    <div>
      <h1 className="pageTitle">Policy &amp; Regulatory News</h1>
      <p className="pageSub">Stay updated with the latest regulatory developments and policy changes.</p>

      <div className={styles.tabRow} role="tablist" aria-label="Filter by authority">
        {["All", ...NEWS_AUTHORITIES].map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={authority === a}
            className={`${styles.tab} ${authority === a ? styles.tabActive : ""}`}
            onClick={() => setAuthority(a)}
          >
            {a}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No news items for this authority yet.</p>
        ) : (
          filtered.map((item) => <NewsCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
