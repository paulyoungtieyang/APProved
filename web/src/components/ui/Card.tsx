import type { ReactNode, CSSProperties } from "react";
import styles from "./Card.module.css";

export function Card({
  children,
  className = "",
  style,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section";
}) {
  return (
    <As className={`${styles.card} ${className}`} style={style}>
      {children}
    </As>
  );
}
