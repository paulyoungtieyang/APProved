import Link from "next/link";
import styles from "./QuickActionCard.module.css";

export function QuickActionCard({
  href,
  icon,
  title,
  blurb,
}: {
  href: string;
  icon: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.blurb}>{blurb}</span>
    </Link>
  );
}
