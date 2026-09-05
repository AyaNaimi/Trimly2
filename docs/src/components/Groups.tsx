import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import styles from "./Groups.module.css";
import "../animations.css";

export type GroupsType = {
  className?: string;
};

const features = [
  {
    src: "/Trimly2/Image22@2x.png",
    alt: "Détecte",
    label: "DÉTECTE",
    desc: "Trimly identifie tous vos abonnements, même ceux que vous avez oubliés.",
  },
  {
    src: "/Trimly2/Image18@2x.png",
    alt: "Analyse",
    label: "ANALYSE",
    desc: "Une vue claire de vos dépenses pour comprendre où va votre argent.",
  },
  {
    src: "/Trimly2/Image32@2x.png",
    alt: "Alerte",
    label: "ALERTE",
    desc: "Recevez des notifications avant chaque prélèvement pour garder le contrôle.",
  },
  {
    src: "/Trimly2/Frame1@3x.png",
    alt: "Économise",
    label: "ÉCONOMISE",
    desc: "Réduisez vos dépenses inutiles et atteignez vos objectifs plus vite.",
    extraClass: "economiseIcon",
  },
];

const Groups: FunctionComponent<GroupsType> = ({ className = "" }) => {
  return (
    <Box className={[styles.groupsGrid, className].join(" ")}>
      {features.map((f, i) => (
        <Box
          key={f.label}
          className={styles.featureColumn}
          data-num={`0${i + 1}`}
        >
          <div className={styles.iconContainer}>
            <img
              className={`${styles.featureIcon}${f.extraClass ? " " + styles[f.extraClass as keyof typeof styles] : ""}`}
              loading="lazy"
              alt={f.alt}
              src={f.src}
              style={{ transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </div>
          <h3 className={styles.featureLabel}>{f.label}</h3>
          <p className={styles.featureDesc}>{f.desc}</p>
          <div className={styles.dividerLine}></div>
        </Box>
      ))}
    </Box>
  );
};

export default Groups;
