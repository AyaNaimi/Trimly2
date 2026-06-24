import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import FeatureCard from "./FeatureCard";
import styles from "./FeatureCardsSection.module.css";

/** Props for FeatureCardsSection. */
export interface FeatureCardsSectionProps {
  className?: string;
}

/**
 * FeatureCardsSection — displays the four core feature cards:
 * DÉTECTE, ANALYSE, ALERTE, ECONOMISE.
 * Renamed from Groups.tsx; uses the shared FeatureCard component.
 */
const FeatureCardsSection: FunctionComponent<FeatureCardsSectionProps> = ({
  className = "",
}) => {
  return (
    <Box className={[styles.groups, className].join(" ")}>
      <Box className={styles.groupsColumn4}>
        <FeatureCard
          icon="/Image.svg"
          label="ECONOMISE"
          description="Reduisez vos depenses inutiles et atteignez vos objectifs plus vite."
          className={styles.cardEconomise}
        />
      </Box>

      <img
        className={styles.backgroundIcon}
        loading="lazy"
        alt=""
        src="/Background@2x.png"
      />

      <Box className={styles.groups2}>
        <img
          className={styles.backgroundIcon2}
          loading="lazy"
          alt=""
          src="/Background@2x.png"
        />
        <Box className={styles.groupsColumn1}>
          <FeatureCard
            icon="/Image@2x.png"
            label="ALERTE"
            description="Recevez des notifications avant chaque prelevement pour garder le controle."
            className={styles.cardAlerte}
          />
        </Box>
      </Box>

      <Box className={styles.groups3}>
        <img
          className={styles.backgroundIcon2}
          loading="lazy"
          alt=""
          src="/Background@2x.png"
        />
        <Box className={styles.groupsColumn12}>
          <FeatureCard
            icon="/Image@2x.png"
            label="ANALYSE"
            description="Une vue claire de vos depenses pour comprendre ou va votre argent."
            className={styles.cardAnalyse}
          />
        </Box>
      </Box>

      <Box className={styles.groups4}>
        <FeatureCard
          icon="/Image@2x.png"
          label="DÉTECTE"
          description="Trimly identifie tous vos abonnements, meme ceux que vous avez oublies."
          className={styles.cardDetecte}
        />
      </Box>
    </Box>
  );
};

export default FeatureCardsSection;
