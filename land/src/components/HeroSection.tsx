import { FunctionComponent } from "react";
import { Button, Box, Typography } from "@mui/material";

/** Props for HeroSection — receives page-level CSS module styles for pixel-perfect positioning. */
export interface HeroSectionProps {
  /** The CSS module styles object from LandingPage.module.css, passed down for pixel-perfect class application. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageStyles: Record<string, string>;
  onDownloadClick?: () => void;
  onDemoClick?: () => void;
}

/**
 * HeroSection — all hero text, labels, financial summary widget, and CTA buttons.
 * Extracted from LandingPage to keep that file under 300 lines.
 * Receives `pageStyles` from the parent so absolute-position CSS classes are applied correctly.
 */
const HeroSection: FunctionComponent<HeroSectionProps> = ({
  pageStyles: s,
  onDownloadClick,
  onDemoClick,
}) => {
  return (
    <>
      {/* Hero headline */}
      <Typography
        className={s.toutCeQuil}
        variant="inherit"
        variantMapping={{ inherit: "h1" }}
        sx={{
          fontFamily: "var(--font-road-rage)",
          fontWeight: "400",
          fontSize: "var(--fs-43)",
          lineHeight: "43.1px",
        }}
      >
        TOUT CE QU&apos;IL VOUS FAUT,
        <br />
        DANS UNE SEULE APP
      </Typography>

      <div className={s.surIapp}>4,8/5 sur l&apos;App Store</div>

      {/* Subscription detection badge */}
      <Typography
        className={s.abonnementsDte}
        variantMapping={{ inherit: "h2" }}
        sx={{
          fontFamily: "var(--font-caveat-brush)",
          fontWeight: "400",
          fontSize: "var(--fs-25)",
          lineHeight: "26.3px",
        }}
      >
        ABONNEMENTS
        <br />
        DÉTECTÉS
      </Typography>

      {/* Subscription list items */}
      <div className={s.imois}>12.99 €/mois</div>
      <div className={s.chaqueMoisSans}>chaque mois sans effort.</div>
      <div className={s.canva}>Canva</div>
      <div className={s.analyseVosDepe}>analyse vos depenses et vous aide a</div>
      <div className={s.imois2}>6,99€/mois</div>
      <div className={s.amazonPrime}>Amazon Prime</div>
      <div className={s.trimlyDetecteA}>Trimly detecte automatiquement vos abonnements,</div>
      <div className={s.mols}>10,99 €/mois</div>
      <div className={s.spotify}>Spotify</div>
      <div className={s.mois}>15,99€/mois</div>
      <div className={s.netflix}>Netflix</div>

      {/* Hero tagline */}
      <div className={s.dpensesInutile}>
        DÉPENSES
        <br />
        INUTILES
      </div>
      <div className={s.vouFout}>Vous font</div>

      <Typography
        className={s.mieux}
        variant="inherit"
        variantMapping={{ inherit: "h2" }}
        sx={{
          fontFamily: "var(--font-oswald)",
          fontWeight: "700",
          fontSize: "var(--fs-61)",
          lineHeight: "91px",
        }}
      >
        MIEUX
      </Typography>

      <Typography
        className={s.vivez}
        variant="inherit"
        variantMapping={{ inherit: "h1" }}
        sx={{
          fontFamily: "var(--font-oswald)",
          fontWeight: "700",
          fontSize: "var(--fs-68)",
          lineHeight: "67px",
        }}
      >
        VIVEZ
      </Typography>

      {/* Financial summary widget */}
      <div className={s.div}>320,00€</div>
      <div className={s.abonnements}>Abonnements</div>

      <Typography
        className={s.economisez}
        variant="inherit"
        variantMapping={{ inherit: "h2" }}
        sx={{
          fontFamily: "var(--font-oswald)",
          fontWeight: "700",
          fontSize: "var(--fs-64)",
          lineHeight: "95px",
        }}
      >
        ECONOMISEZ.
      </Typography>

      <Typography
        className={s.nw}
        variant="inherit"
        variantMapping={{ inherit: "h1" }}
        sx={{
          fontFamily: "var(--font-waiting-for-the-sunrise)",
          fontWeight: "400",
          fontSize: "var(--fs-64)",
        }}
      >
        NW
      </Typography>

      <div className={s.div2}>1240,00€</div>
      <div className={s.depenses}>Depenses</div>
      <div className={s.resumeDuMois}>Resume du mois</div>
      <div className={s.vsLeMois}>vs le mois dernier</div>

      <Typography
        className={s.le}
        variant="inherit"
        variantMapping={{ inherit: "h2" }}
        sx={{ fontWeight: "600", fontSize: "var(--fs-55)" }}
      >
        LE
      </Typography>

      <div className={s.div3}>+12.5%</div>

      <Typography
        className={s.h3}
        variant="inherit"
        variantMapping={{ inherit: "h3" }}
        sx={{ fontWeight: "700", fontSize: "var(--fs-21)" }}
      >
        1560,50€
      </Typography>

      <div className={s.soldeTotal}>Solde total</div>

      <Typography
        className={s.trimly}
        variant="inherit"
        variantMapping={{ inherit: "b" }}
        sx={{ fontSize: "var(--fs-12)", fontWeight: "700" }}
      >
        Trimly
      </Typography>

      <div className={s.economiesChaque}>
        ECONOMIES
        <br />
        CHAQUEMOIS
      </div>

      <Typography
        className={s.t}
        variantMapping={{ inherit: "h3" }}
        sx={{ fontFamily: "inherit", fontWeight: "600", fontSize: "var(--fs-22)" }}
      >
        T
      </Typography>

      <div className={s.div4}>9:41</div>

      {/* Main hero tagline — REPRENEZ / CONTRÔLE */}
      <Typography
        className={s.contrle}
        variant="inherit"
        variantMapping={{ inherit: "h2" }}
        sx={{
          fontFamily: "var(--font-oswald)",
          fontWeight: "700",
          fontSize: "var(--fs-67)",
        }}
      >
        CONTRÔLE
      </Typography>

      <Typography
        className={s.reprenez}
        variant="inherit"
        variantMapping={{ inherit: "h2" }}
        sx={{
          fontFamily: "var(--font-oswald)",
          fontWeight: "700",
          fontSize: "var(--fs-65)",
          lineHeight: "96px",
        }}
      >
        REPRENEZ
      </Typography>

      <div className={s.vosFinances}>VOS FINANCES</div>
      <div className={s.leContrleDe}>LE CONTRÔLE DE</div>
      <div className={s.prenez}>PRENEZ</div>

      {/* Nav link labels */}
      <div className={s.aPropos}>A propos</div>
      <div className={s.tarifs}>Tarifs</div>
      <div className={s.commentCaMarch}>Comment ca marche</div>
      <div className={s.fonctionnalites}>Fonctionnalites</div>

      {/* Trimly brand in nav area */}
      <Typography
        className={s.trimly2}
        variant="inherit"
        variantMapping={{ inherit: "h3" }}
        sx={{ fontWeight: "700", fontSize: "var(--fs-20)" }}
      >
        Trimly
      </Typography>

      {/* Download CTA button */}
      <Button
        className={s.button}
        endIcon={<img width="12px" height="13px" alt="" src="/image-21.svg" />}
        disableElevation
        variant="text"
        aria-label="Télécharger l'application Trimly"
        onClick={onDownloadClick}
        sx={{
          textTransform: "none",
          color: "var(--color-brand-green)",
          fontSize: "var(--fs-12)",
          borderRadius: "0px",
          width: 217,
          height: 53,
        }}
      >
        Télécharger l&apos;application
      </Button>

      {/* Demo button */}
      <Button
        className={s.button2}
        endIcon={<img width="11px" height="13px" alt="" src="/image-24.svg" />}
        disableElevation
        variant="text"
        aria-label="Voir la démo de Trimly"
        onClick={onDemoClick}
        sx={{
          textTransform: "none",
          color: "var(--color-text-muted)",
          fontSize: "var(--fs-12)",
          borderRadius: "0px",
          width: 140,
          height: 52,
        }}
      >
        Voir la demo
      </Button>

      {/* Economiser tag badge */}
      <Box className={s.button3}>
        <Box className={s.frame2}>
          <div className={s.economiser}>economiser</div>
        </Box>
      </Box>
    </>
  );
};

export default HeroSection;
