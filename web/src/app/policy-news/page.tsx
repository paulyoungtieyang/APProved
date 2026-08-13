"use client";

import { useMemo, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { NewsCard } from "@/components/policy-news/NewsCard";
import { mockPolicyNews } from "@/lib/mock-data/policy-news";
import styles from "./page.module.css";

export default function PolicyNewsPage() {
  const [region, setRegion] = useState("all");

  const regions = useMemo(
    () => Array.from(new Set(mockPolicyNews.map((n) => n.region))).sort(),
    []
  );

  const filtered =
    region === "all" ? mockPolicyNews : mockPolicyNews.filter((n) => n.region === region);

  return (
    <div>
      <h1 className="pageTitle">Policy News</h1>
      <p className="pageSub">
        Regulatory and policy updates relevant to your markets.
      </p>

      <div className={styles.filterBar}>
        <Dropdown
          label="Region"
          value={region}
          options={[{ label: "All", value: "all" }, ...regions.map((r) => ({ label: r, value: r }))]}
          onChange={setRegion}
        />
      </div>

      <div className={styles.list}>
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
