"use client";

import { Card } from "@/components/ui/Card";
import { RegulatoryBodyCard } from "@/components/resources/RegulatoryBodyCard";
import { DownloadableDocRow, mockDownload } from "@/components/resources/DownloadableDocRow";
import { CertificationCard } from "@/components/resources/CertificationCard";
import {
  REGULATORY_BODIES,
  REGULATION_DOCUMENTS,
  CERTIFICATIONS,
  LEGAL_DOCUMENTS,
} from "@/lib/mock-data/resource-center";
import styles from "./page.module.css";

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="pageTitle">Resources</h1>
      <p className="pageSub">Access regulatory documents, certifications, and legal agreements.</p>

      <h2 className={styles.sectionHeading}>Regulatory Bodies</h2>
      <Card className={styles.sectionCard}>
        {REGULATORY_BODIES.map((body) => (
          <RegulatoryBodyCard key={body.id} body={body} />
        ))}
      </Card>

      <h2 className={styles.sectionHeading}>Regulation Documents Library</h2>
      <Card className={styles.sectionCard}>
        {REGULATION_DOCUMENTS.map((doc) => (
          <DownloadableDocRow
            key={doc.id}
            title={doc.title}
            tags={[doc.tag, doc.fileType, doc.size, `Updated ${doc.updated}`]}
            onDownload={() => mockDownload(doc.title)}
          />
        ))}
      </Card>

      <h2 className={styles.sectionHeading}>Privacy &amp; Security Certifications</h2>
      <div className={`grid ${styles.certGrid}`}>
        {CERTIFICATIONS.map((cert) => (
          <CertificationCard key={cert.id} cert={cert} />
        ))}
      </div>
      <Card className={styles.commitmentCard}>
        <div className={styles.commitmentTitle}>Data Protection Commitment</div>
        <p className={styles.commitmentBody}>
          All clinical trial data is encrypted at rest and in transit using AES-256 encryption.
          We maintain strict access controls and audit logs for all data access. Your data is
          never used to train our AI models without explicit consent.
        </p>
      </Card>

      <h2 className={styles.sectionHeading}>Contracts &amp; Legal Documents</h2>
      <Card className={styles.sectionCard}>
        {LEGAL_DOCUMENTS.map((doc) => (
          <DownloadableDocRow
            key={doc.id}
            title={doc.name}
            description={doc.description}
            tags={[doc.category, doc.fileType]}
            onDownload={() => mockDownload(doc.name)}
          />
        ))}
      </Card>
    </div>
  );
}
