import { RegulatoryTrackToggle } from "@/components/dashboard/RegulatoryTrackToggle";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { mockKpis } from "@/lib/mock-data/kpis";
import styles from "./page.module.css";

const QUICK_ACTIONS = [
  {
    href: "/upload",
    icon: "⇧",
    title: "Upload Phase 3 Data",
    blurb: "Add pivotal-trial data to your project",
  },
  {
    href: "/regulations",
    icon: "⚖",
    title: "Select Regulations",
    blurb: "Choose the frameworks that apply",
  },
  {
    href: "/document-library",
    icon: "▤",
    title: "Document Library",
    blurb: "Browse every generated document",
  },
  {
    href: "/settings",
    icon: "⚙",
    title: "Team & Permissions",
    blurb: "Manage roles and access",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="pageTitle">Dashboard</h1>
      <p className="pageSub">
        Your command center for regulatory submissions across markets.
      </p>

      <RegulatoryTrackToggle />

      <div className={`grid ${styles.kpiGrid}`}>
        {mockKpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <SetupChecklist />
          <div className={`grid ${styles.actionsGrid}`}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>
        <div className={styles.rightCol}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
