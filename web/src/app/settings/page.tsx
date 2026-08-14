import { Card } from "@/components/ui/Card";
import { PermissionMatrix } from "@/components/settings/PermissionMatrix";
import { ComplianceFrameworkNotice } from "@/components/settings/ComplianceFrameworkNotice";
import { AiSettingsPanel } from "@/components/settings/AiSettingsPanel";
import styles from "./page.module.css";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="pageTitle">Settings</h1>
      <p className="pageSub">
        Manage roles, permissions, and AI generation configuration across your organization.
      </p>

      <div className={styles.stack}>
        <ComplianceFrameworkNotice />
        <Card>
          <h3 className={styles.sectionTitle}>Role Permissions</h3>
          <PermissionMatrix />
        </Card>
        <Card>
          <h3 className={styles.sectionTitle}>AI Generation</h3>
          <AiSettingsPanel />
        </Card>
      </div>
    </div>
  );
}
