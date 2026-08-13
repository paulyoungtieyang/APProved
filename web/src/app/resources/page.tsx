"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ResourceCategoryTabs } from "@/components/resources/ResourceCategoryTabs";
import { ResourceRow } from "@/components/resources/ResourceRow";
import { mockResources, type ResourceCategory } from "@/lib/mock-data/resources";

export default function ResourcesPage() {
  const [category, setCategory] = useState<ResourceCategory>("Regulatory");
  const filtered = mockResources.filter((r) => r.category === category);

  return (
    <div>
      <h1 className="pageTitle">Resources</h1>
      <p className="pageSub">Regulatory, legal, and security resource centers.</p>

      <ResourceCategoryTabs active={category} onChange={setCategory} />

      <Card>
        {filtered.map((item) => (
          <ResourceRow key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
}
