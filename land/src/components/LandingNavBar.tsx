import { FunctionComponent } from "react";
import { Button, Typography } from "@mui/material";
import styles from "./LandingNavBar.module.css";

/** Props for LandingNavBar — all optional so it renders as a pure presentational component. */
export interface LandingNavBarProps {
  /** Called when the 'Télécharger' button is clicked. */
  onDownloadClick?: () => void;
  className?: string;
}

/**
 * LandingNavBar — top navigation bar for the Trimly landing page.
 * Contains the Trimly logo, nav links, and a download CTA button.
 * Extracted from LandingPage to keep that file under 300 lines.
 */
const LandingNavBar: FunctionComponent<LandingNavBarProps> = ({
  onDownloadClick,
  className = "",
}) => {
  return (
    <nav
      className={[styles.navBar, className].join(" ")}
      aria-label="Navigation principale"
    >
      <Typography
        className={styles.logo}
        variant="inherit"
        variantMapping={{ inherit: "span" }}
        sx={{ fontWeight: "700", fontSize: "var(--fs-20)" }}
      >
        Trimly
      </Typography>

      <ul className={styles.navLinks} role="list">
        <li>
          <button className={styles.navLink}>Fonctionnalites</button>
        </li>
        <li>
          <button className={styles.navLink}>Comment ca marche</button>
        </li>
        <li>
          <button className={styles.navLink}>Tarifs</button>
        </li>
        <li>
          <button className={styles.navLink}>A propos</button>
        </li>
      </ul>

      <Button
        className={styles.downloadButton}
        disableElevation
        variant="text"
        aria-label="Télécharger l'application Trimly"
        onClick={onDownloadClick}
        sx={{
          textTransform: "none",
          color: "var(--color-brand-olive)",
          fontSize: "var(--fs-11)",
          borderRadius: "0px",
          width: 108,
          height: 38,
        }}
      >
        Télécharger
      </Button>
    </nav>
  );
};

export default LandingNavBar;
