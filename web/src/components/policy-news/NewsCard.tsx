import { Card } from "@/components/ui/Card";
import { NewsTagBadge } from "./NewsTagBadge";
import type { PolicyNewsItem } from "@/lib/mock-data/policy-news";
import styles from "./NewsCard.module.css";

const MAX_VISIBLE_TOPICS = 2;

export function NewsCard({ item }: { item: PolicyNewsItem }) {
  const date = new Date(item.date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const visibleTopics = item.topics.slice(0, MAX_VISIBLE_TOPICS);
  const overflowCount = item.topics.length - visibleTopics.length;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <NewsTagBadge tag={item.tag} />
          <span className={styles.source}>{item.sourceLabel}</span>
        </div>
        <span className={styles.meta}>
          {item.authority} · {date}
        </span>
      </div>
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.summary}>{item.summary}</p>
      <div className={styles.footer}>
        <div className={styles.topics}>
          {visibleTopics.map((topic) => (
            <span key={topic} className={styles.topicTag}>
              {topic}
            </span>
          ))}
          {overflowCount > 0 && <span className={styles.topicTag}>+{overflowCount}</span>}
        </div>
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
          Read More ↗
        </a>
      </div>
    </Card>
  );
}
