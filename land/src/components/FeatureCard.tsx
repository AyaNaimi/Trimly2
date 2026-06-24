import { FunctionComponent } from "react";
import styles from "./FeatureCard.module.css";

/** Props for a single feature card in the FeatureCardsSection. */
export interface FeatureCardProps {
  /** Path to the icon image. */
  icon: string;
  /** Short uppercase label shown below the icon (e.g. "DÉTECTE"). */
  label: string;
  /** Longer description text shown below the label. */
  description: string;
  /** Optional extra CSS class for layout overrides. */
  className?: string;
}

/**
 * FeatureCard — shared card primitive.
 * Displays an icon, a bold uppercase label, and a short description.
 * Extracted from FeatureCardsSection (4 identical card patterns).
 */
const FeatureCard: FunctionComponent<FeatureCardProps> = ({
  icon,
  label,
  description,
  className = "",
}) => {
  return (
    <div className={[styles.featureCard, className].join(" ")}>
      <div className={styles.iconWrapper}>
        <img className={styles.icon} loading="lazy" alt={label} src={icon} />
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.description}>{description}</div>
    </div>
  );
};

export default FeatureCard;
