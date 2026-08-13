import { useAppState } from "@/lib/state/AppStateProvider";
import styles from "./steps.module.css";

export function ProjectDetailsStep() {
  const { project, organization } = useAppState();

  return (
    <div>
      <h3 className={styles.stepTitle}>Project Details</h3>
      <dl className={styles.factList}>
        <div className={styles.fact}>
          <dt>Device / Product</dt>
          <dd>{project.deviceName}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Organization</dt>
          <dd>{organization.name}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Regulatory Track</dt>
          <dd>{organization.regulatoryTrack === "global" ? "Global" : "Local Affiliate"}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Prepared By</dt>
          <dd>
            {organization.currentUser.name} ({organization.currentUser.role})
          </dd>
        </div>
      </dl>
    </div>
  );
}
