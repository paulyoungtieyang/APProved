import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  const variantClass = variant === "primary" ? styles.primary : styles.outline;
  return <button className={`${styles.btn} ${variantClass} ${className}`} {...rest} />;
}
