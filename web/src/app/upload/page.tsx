import { Card } from "@/components/ui/Card";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { FormatBadgeRow } from "@/components/upload/FormatBadgeRow";
import { ClinicalCategoryList } from "@/components/upload/ClinicalCategoryList";
import { SecurityGuaranteePanel } from "@/components/upload/SecurityGuaranteePanel";
import styles from "./page.module.css";

export default function UploadPage() {
  return (
    <div>
      <h1 className="pageTitle">Upload Phase 3 Data</h1>
      <p className="pageSub">
        Upload pivotal-trial clinical data to ground document generation for this project.
      </p>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <Card>
            <FormatBadgeRow />
            <div className={styles.spacer} />
            <UploadDropzone />
          </Card>
        </div>
        <div className={styles.rightCol}>
          <Card>
            <h3 className={styles.sectionTitle}>Clinical Data Categories</h3>
            <ClinicalCategoryList />
          </Card>
          <SecurityGuaranteePanel />
        </div>
      </div>
    </div>
  );
}
