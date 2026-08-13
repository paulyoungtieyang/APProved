import { Card } from "@/components/ui/Card";
import { PermissionMatrix } from "@/components/settings/PermissionMatrix";
import { ComplianceFrameworkNotice } from "@/components/settings/ComplianceFrameworkNotice";
import styles from "./page.module.css";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="pageTitle">Settings</h1>
      <p className="pageSub">
        Manage roles and permissions across your organization.
      </p>

      <div className={styles.stack}>
        <ComplianceFrameworkNotice />
        <Card>
          <h3 className={styles.sectionTitle}>Role Permissions</h3>
          <PermissionMatrix />
        </Card>
      </div>
    </div>
  );
}
