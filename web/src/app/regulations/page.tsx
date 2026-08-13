import { GEOGRAPHY_ORDER, mockFrameworks } from "@/lib/mock-data/regulatory-frameworks";
import { RegionGroup } from "@/components/regulations/RegionGroup";

export default function RegulationsPage() {
  return (
    <div>
      <h1 className="pageTitle">Regulations</h1>
      <p className="pageSub">
        Select the regulatory frameworks that apply to this submission. Selections carry
        through to document generation and the Document Library.
      </p>

      {GEOGRAPHY_ORDER.map((geography) => {
        const frameworks = mockFrameworks.filter((f) => f.geography === geography);
        if (frameworks.length === 0) return null;
        return <RegionGroup key={geography} geography={geography} frameworks={frameworks} />;
      })}
    </div>
  );
}
