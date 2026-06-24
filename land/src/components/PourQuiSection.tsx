import { FunctionComponent } from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "./PourQuiSection.module.css";

export interface PourQuiSectionProps {
  className?: string;
  onDownloadClick?: () => void;
}

const audiences = [
  {
    number: "01",
    icon: "🎓",
    title: "Étudiants",
    subtitle: "Budget serré, zéro surprise",
    description:
      "Vous avez 5 à 10 abonnements que vous n'utilisez plus ? Trimly les détecte et vous alerte avant chaque prélèvement.",
    realExample: "Netflix, Spotify, Canva Pro, Duolingo...",
    color: "#4F46E5",
    bgGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    problem: "18€/mois oubliés en moyenne",
  },
  {
    number: "02",
    icon: "💼",
    title: "Jeunes actifs",
    subtitle: "Maîtrisez vos finances dès le départ",
    description:
      "Entre Netflix, Spotify, gym et livraisons, vos abonnements grignotent votre salaire. Trimly vous montre exactement combien.",
    realExample: "Netflix 15,99€ + Spotify 10,99€ + Amazon Prime 6,99€...",
    color: "#0EA5E9",
    bgGradient: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
    problem: "35€/mois en abonnements inutilisés",
  },
  {
    number: "03",
    icon: "👨‍👩‍👧‍👦",
    title: "Familles",
    subtitle: "Vue d'ensemble sur tous les abonnements",
    description:
      "Entre les abos des parents et des enfants, c'est facile de perdre le fil. Trimly centralise tout et révèle les doublons.",
    realExample: "Netflix Famille, Disney+, YouTube Premium, Nintendo...",
    color: "#F59E0B",
    bgGradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    problem: "55€/mois de doublons dans le foyer",
  },
];

const pricingFeatures = [
  "Détection automatique de vos abonnements",
  "Alertes avant chaque prélèvement",
  "Suivi en temps réel de vos dépenses",
  "Recommandations personnalisées",
  "Annulation assistée en un clic",
  "Rapport mensuel de vos économies",
];

const PourQuiSection: FunctionComponent<PourQuiSectionProps> = ({
  className = "",
  onDownloadClick,
}) => {
  return (
    <Box className={[styles.section, className].join(" ")}>
      <Box className={styles.bgPattern} />

      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerLabel}>TARGET AUDIENCE</Box>
        <Typography
          className={styles.headerTitle}
          variant="inherit"
          variantMapping={{ inherit: "h2" }}
          sx={{
            fontFamily: "var(--font-oswald)",
            fontWeight: "700",
          }}
        >
          POUR
          <span className={styles.headerTitleAccent}> QUI</span>
          <span className={styles.headerTitleQuestion}> ?</span>
        </Typography>
        <Typography
          className={styles.headerSubtitle}
          variant="inherit"
          variantMapping={{ inherit: "p" }}
        >
          Peu importe votre profil, Trimly s'adapte à vous
        </Typography>
      </Box>

      {/* Audience Cards */}
      <Box className={styles.cardsGrid}>
        {audiences.map((audience) => (
          <Box key={audience.number} className={styles.card}>
            <Box
              className={styles.cardAccent}
              style={{ background: audience.bgGradient }}
            />
            <Box className={styles.cardContent}>
              <Box className={styles.cardTop}>
                <Box className={styles.cardNumber}>{audience.number}</Box>
                <Box
                  className={styles.cardIconBox}
                  style={{
                    background: `${audience.color}20`,
                    borderColor: `${audience.color}40`,
                  }}
                >
                  <span className={styles.cardIcon}>{audience.icon}</span>
                </Box>
              </Box>

              <Typography
                className={styles.cardTitle}
                variant="inherit"
                variantMapping={{ inherit: "h3" }}
              >
                {audience.title}
              </Typography>

              <Typography
                className={styles.cardSubtitle}
                variant="inherit"
                variantMapping={{ inherit: "p" }}
              >
                {audience.subtitle}
              </Typography>

              <Typography
                className={styles.cardDescription}
                variant="inherit"
                variantMapping={{ inherit: "p" }}
              >
                {audience.description}
              </Typography>

              <Box
                className={styles.cardProblem}
                style={{
                  background: `${audience.color}12`,
                  borderColor: `${audience.color}25`,
                }}
              >
                <span className={styles.problemIcon}>💸</span>
                <span className={styles.problemText}>{audience.problem}</span>
              </Box>

              <Box className={styles.cardExample}>
                <span className={styles.exampleIcon}>📱</span>
                <span>{audience.realExample}</span>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Pricing Section */}
      <Box className={styles.pricingSection}>
        <Box className={styles.pricingBgDecor} />
        <Box className={styles.pricingHeader}>
          <Box className={styles.pricingBadge}>14 jours gratuits</Box>
          <Typography
            className={styles.pricingTitle}
            variant="inherit"
            variantMapping={{ inherit: "h2" }}
            sx={{
              fontFamily: "var(--font-oswald)",
              fontWeight: "700",
            }}
          >
            UN SEUL
            <span className={styles.pricingTitleAccent}> TARIF</span>
          </Typography>
          <Typography
            className={styles.pricingSubtitle}
            variant="inherit"
            variantMapping={{ inherit: "p" }}
          >
            Simple. Transparent. Sans engagement.
          </Typography>
        </Box>

        <Box className={styles.pricingCard}>
          <Box className={styles.pricingCardGlow} />
          <Box
            className={styles.pricingCardHeader}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Typography
              className={styles.pricingPlanName}
              variant="inherit"
              variantMapping={{ inherit: "h3" }}
            >
              Premium
            </Typography>
            <Box className={styles.pricingPrice}>
              <Typography
                className={styles.priceCurrency}
                variant="inherit"
                variantMapping={{ inherit: "span" }}
              >
                €
              </Typography>
              <Typography
                className={styles.priceAmount}
                variant="inherit"
                variantMapping={{ inherit: "span" }}
              >
                4,99
              </Typography>
              <Typography
                className={styles.pricePeriod}
                variant="inherit"
                variantMapping={{ inherit: "span" }}
              >
                /mois
              </Typography>
            </Box>
            <Typography
              className={styles.pricingTrial}
              variant="inherit"
              variantMapping={{ inherit: "p" }}
            >
              14 jours d'essai gratuit. Sans CB.
            </Typography>
          </Box>

          <Box
            className={styles.pricingFeatures}
            sx={{ position: "relative", zIndex: 1 }}
          >
            {pricingFeatures.map((feature) => (
              <Box key={feature} className={styles.pricingFeature}>
                <span className={styles.featureCheck}>✓</span>
                <span>{feature}</span>
              </Box>
            ))}
          </Box>

          <Button
            className={styles.pricingButton}
            disableElevation
            variant="contained"
            aria-label="Commencer l'essai gratuit"
            onClick={onDownloadClick}
            sx={{
              textTransform: "none",
              fontFamily: "var(--font-oswald)",
              fontWeight: "600",
              fontSize: "var(--fs-15)",
              borderRadius: "var(--br-4)",
              background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4338CA 0%, #0891B2 100%)",
              },
              position: "relative",
              zIndex: 1,
            }}
          >
            Commencer l'essai gratuit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PourQuiSection;
