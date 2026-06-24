import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import FooterSection from "../components/FooterSection";
import CtaSection from "../components/CtaSection";
import FeatureCardsSection from "../components/FeatureCardsSection";
import PourQuiSection from "../components/PourQuiSection";
import LandingNavBar from "../components/LandingNavBar";
import HeroSection from "../components/HeroSection";
import styles from "./LandingPage.module.css";

/**
 * LandingPage — main entry screen for the Trimly marketing site.
 * Assembles HeroSection, FeatureCardsSection, CtaSection, and FooterSection.
 */
const LandingPage: FunctionComponent = () => {
  const handleDownloadClick = () => {
    console.log("Download app clicked");
  };

  const handleDemoClick = () => {
    console.log("Demo clicked");
  };

  return (
    <Box className={styles.figmaDesignChatgptImageJ}>
      <footer className={styles.root}>
        <section className={styles.frame}>
          {/* Section components */}
          <FooterSection />
          <CtaSection
            onAppStoreClick={handleDownloadClick}
            onGooglePlayClick={handleDownloadClick}
          />
          <FeatureCardsSection />
          <PourQuiSection onDownloadClick={handleDownloadClick} />

          {/* Background decoration images */}
          <img className={styles.imageIcon} loading="lazy" alt="Décoration fond" src="/Image.svg" />
          <img className={styles.imageIcon2} loading="lazy" alt="" src="/Image.svg" />
          <img className={styles.imageIcon3} loading="lazy" alt="" src="/Image.svg" />
          <img className={styles.imageIcon4} alt="" src="/Image.svg" />
          <img className={styles.imageIcon5} alt="" src="/Image.svg" />
          <img className={styles.imageIcon6} loading="lazy" alt="Illustration application Trimly" src="/Image@2x.png" />
          <img className={styles.imageIcon7} loading="lazy" alt="" src="/Image@2x.png" />
          <img className={styles.imageIcon8} alt="" src="/Image.svg" />
          <img className={styles.imageIcon9} alt="" src="/Image.svg" />
          <img className={styles.imageIcon10} alt="" src="/Image.svg" />
          <img className={styles.imageIcon11} alt="" src="/Image.svg" />
          <img className={styles.imageIcon12} loading="lazy" alt="" src="/Image@2x.png" />
          <img className={styles.backgroundIcon} loading="lazy" alt="" src="/Background.svg" />
          <img className={styles.imageIcon13} loading="lazy" alt="" src="/Image@2x.png" />
          <img className={styles.imageIcon14} loading="lazy" alt="" src="/Image.svg" />
          <img className={styles.imageIcon15} loading="lazy" alt="" src="/Image@2x.png" />
          <img className={styles.imageIcon16} loading="lazy" alt="" src="/Image.svg" />
          <img className={styles.imageIcon17} alt="" src="/Image.svg" />
          <img className={styles.imageIcon18} alt="" src="/Image.svg" />
          <img className={styles.imageIcon19} alt="" src="/Image.svg" />
          <img className={styles.imageIcon20} loading="lazy" alt="" src="/Image@2x.png" />
          <img className={styles.backgroundIcon2} loading="lazy" alt="" src="/Background@2x.png" />
          <img className={styles.imageIcon21} alt="" src="/Image.svg" />
          <img className={styles.imageIcon22} alt="" src="/Image.svg" />
          <img className={styles.imageIcon23} alt="" src="/Image.svg" />
          <img className={styles.imageIcon24} alt="" src="/Image.svg" />
          <img className={styles.imageIcon25} alt="" src="/Image.svg" />

          {/* Nav bar — uses button4 class slot for absolute positioning in design */}
          <LandingNavBar
            className={styles.button4}
            onDownloadClick={handleDownloadClick}
          />

          {/* Hero text, CTAs, financial summary — receives page styles for exact positioning */}
          <HeroSection
            pageStyles={styles}
            onDownloadClick={handleDownloadClick}
            onDemoClick={handleDemoClick}
          />
        </section>
      </footer>
    </Box>
  );
};

export default LandingPage;
