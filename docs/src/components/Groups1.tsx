import { FunctionComponent } from "react";
import { Box, Typography } from "@mui/material";
import styles from "./Groups1.module.css";
import "../animations.css";

export type Groups1Type = {
  className?: string;
  visible?: boolean;
};

const Groups1: FunctionComponent<Groups1Type> = ({ className = "", visible = false }) => {
  return (
    <Box className={[styles.ctaContent, className].join(" ")}>
      <div className={styles.ctaGrid}>
        {/* Left: headline */}
        <div className={`${styles.ctaHeadlineBlock} reveal-left ${visible ? "visible" : ""}`}>
          <Typography
            className={styles.prtEconomiser}
            variant="inherit"
            variantMapping={{ inherit: "h2" }}
          >
            PRÊT À<br />
            ÉCONOMISER ?
          </Typography>
          <div className={styles.brushStrokeUnderline}></div>
        </div>

        {/* Center: description */}
        <div className={`${styles.ctaTextContainer} reveal ${visible ? "visible delay-2" : ""}`}>
          <p className={styles.ctaText}>
            Rejoignez des milliers d'utilisateurs qui ont déjà{" "}
            <span className={styles.ctaHighlight}>repris le contrôle</span> de leurs finances avec Trimly.
          </p>
          <div className={styles.arrowContainer}>
            <img src="/Image24.svg" alt="→" className={styles.ctaArrowIcon} />
          </div>
        </div>

        {/* Right: store buttons */}
        <div className={`${styles.ctaButtonsContainer} reveal-right ${visible ? "visible delay-3" : ""}`}>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.storeButton} store-btn-hover`}
            aria-label="Télécharger sur l'App Store"
          >
            <img src="/Image23.svg" alt="Apple" className={styles.storeLogo} />
            <div className={styles.storeTextCol}>
              <span className={styles.storeSub}>Télécharger dans</span>
              <span className={styles.storeMain}>l'App Store</span>
            </div>
          </a>

          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.storeButton} store-btn-hover`}
            aria-label="Disponible sur Google Play"
          >
            <img src="/Image16.svg" alt="Google Play" className={styles.storeLogo} />
            <div className={styles.storeTextCol}>
              <span className={styles.storeSub}>DISPONIBLE SUR</span>
              <span className={styles.storeMain}>Google Play</span>
            </div>
          </a>
        </div>
      </div>
    </Box>
  );
};

export default Groups1;
