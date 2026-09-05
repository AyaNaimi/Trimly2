import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import styles from "./Groups2.module.css";

export type Groups2Type = {
  className?: string;
};

const Groups2: FunctionComponent<Groups2Type> = ({ className = "" }) => {
  return (
    <Box className={[styles.footerContent, className].join(" ")}>
      {/* Left: Brand + Contact */}
      <div className={styles.footerBrandCol}>
        <div className={styles.logoRow}>
          <span className={styles.logoText}>trimly.</span>
        </div>
        <p className={styles.footerTagline}>Prenez le contrôle de vos finances.</p>
        <div className={styles.footerContact}>
          <a href="mailto:ayanaimi.trimly@gmail.com" className={styles.contactLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="#666" strokeWidth="2"/>
              <path d="M2 4L12 13L22 4" stroke="#666" strokeWidth="2"/>
            </svg>
ayanaimi.trimly@gmail.com          </a>
        </div>
      </div>

      {/* Center: Links */}
      <div className={styles.footerLinksCol}>
        <a href="#features-section" className={styles.footerLink}>Fonctionnalités</a>
        <a href="#features-section" className={styles.footerLink}>Comment ça marche</a>
        <a href="#cta-section" className={styles.footerLink}>Télécharger</a>
        <a href="/Trimly2/terms" className={styles.footerLink}>Conditions d'utilisation</a>
        <a href="/Trimly2/privacy" className={styles.footerLink}>Politique de confidentialité</a>
      </div>

      {/* Right: Social media icons */}
      <div className={styles.footerSocialCol}>
        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
          aria-label="Instagram"
          title="Instagram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#1b1b1b" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="#1b1b1b" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="#1b1b1b"/>
          </svg>
        </a>

        {/* TikTok */}
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
          aria-label="TikTok"
          title="TikTok"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 1C11.7 2.8 12.8 4 14.5 4.3V7C13.3 7 12.3 6.7 11.5 6.2V12C11.5 14.8 9.3 17 6.5 17C3.7 17 1.5 14.8 1.5 12C1.5 9.2 3.7 7 6.5 7C6.8 7 7.1 7 7.5 7.1V10.1C7.2 10 6.8 9.9 6.5 9.9C5.4 9.9 4.5 10.8 4.5 12C4.5 13.2 5.4 14 6.5 14C7.6 14 8.5 13.2 8.5 12V1H11.5Z" fill="#1b1b1b"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.socialLink} ${styles.linkedinLink}`}
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <span className={styles.linkedinText}>in</span>
        </a>
      </div>
    </Box>
  );
};

export default Groups2;
