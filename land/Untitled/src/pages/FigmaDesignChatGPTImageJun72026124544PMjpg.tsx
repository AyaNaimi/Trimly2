import { FunctionComponent, useState, useEffect, useRef, useCallback } from "react";
import { Button, Box, Typography } from "@mui/material";
import Groups2 from "../components/Groups2";
import Groups1 from "../components/Groups1";
import Groups from "../components/Groups";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./FigmaDesignChatGPTImageJun72026124544PMjpg.module.css";
import "../animations.css";

/* ─── tiny hook: runs IntersectionObserver on a single ref ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const FigmaDesignChatGPTImageJun72026124544PMjpg: FunctionComponent = () => {
  const [demoOpen, setDemoOpen]           = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [scrollProgress, setScrollProgress]  = useState(0);
  const [navScrolled, setNavScrolled]         = useState(false);
  const [showBackTop, setShowBackTop]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const navRef = useRef<HTMLElement>(null);

  /* ── Scroll-based effects ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setNavScrolled(scrolled > 60);
      setShowBackTop(scrolled > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Magnetic button effect ───────────────────────────── */
  const handleMagnet = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.25;
    const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);
  const handleMagnetLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "";
  }, []);

  /* ── Scroll reveal refs ───────────────────────────────── */
  const howItSec     = useReveal(0.08);
  const howItRight   = useReveal(0.1);
  const pourQuiSec   = useReveal(0.08);
  const pricingSec   = useReveal(0.08);
  const ctaSec       = useReveal(0.1);
  const footerSec    = useReveal(0.08);

  /* ── handlers ────────────────────────────────────────── */
  const handleDownloadClick = () => {
    document.getElementById("cta-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const accordionData = [
    {
      title: "CONNECTEZ VOTRE COMPTE GOOGLE",
      desc: "Connectez-vous en un clic avec votre compte Google. trimly. importe automatiquement vos abonnements via vos emails de confirmation.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3"/>
          <path d="M24 14V24L32 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
          <path d="M24 6V10M24 38V42M6 24H10M38 24H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )
    },
    {
      title: "DÉTECTEZ VOS ABONNEMENTS",
      desc: "trimly. identifie automatiquement tous vos abonnements récurrents et vous alerte avant chaque prélèvement.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3"/>
          <path d="M24 14V24L32 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
          <path d="M24 6V10M24 38V42M6 24H10M38 24H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )
    },
    {
      title: "ÉCONOMISEZ CHAQUE MOIS",
      desc: "Réduisez vos dépenses inutiles et atteignez vos objectifs d'épargne plus vite grâce à nos recommandations personnalisées.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L28 16H40L30 24L34 36L24 28L14 36L18 24L8 16H20L24 4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M8 42H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M12 42V38M36 42V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )
    }
  ];

  return (
    <Box className={styles.figmaDesignChatgptImageJ}>

      {/* ── Scroll progress bar ────────────────────────────── */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        ref={navRef as React.RefObject<HTMLDivElement>}
        className={`${styles.navbar} ${navScrolled ? "navbar-scrolled" : ""}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "padding 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className={styles.navLogoContainer}>
          <span className={styles.navLogoText}>trimly.</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#features-section" className={styles.navLink}>Fonctionnalités</a>
          <a href="#features-section" className={styles.navLink}>Comment ça marche</a>
          <a href="#cta-section" className={styles.navLink}>Tarifs</a>
          <a href="#footer-section" className={styles.navLink}>À propos</a>
        </nav>
        {/* Desktop download button */}
        <Button
          className={`${styles.navDownloadBtn} magnetic-btn`}
          disableElevation
          variant="contained"
          onClick={handleDownloadClick}
          onMouseMove={handleMagnet}
          onMouseLeave={handleMagnetLeave}
          sx={{
            textTransform: "none",
            backgroundColor: "var(--color-greenyellow-100)",
            color: "#1b1b1b",
            fontWeight: "700",
            fontSize: "14px",
            borderRadius: "50px",
            padding: "8px 24px",
            fontFamily: "var(--font-inter)",
            transition: "background-color 0.2s ease",
            "&:hover": { backgroundColor: "var(--color-greenyellow-200)" },
          }}
        >
          Télécharger
        </Button>
        {/* Hamburger — mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ""}`}>
        <button
          style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", fontSize: 28, cursor: "pointer", lineHeight: 1 }}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fermer le menu"
        >×</button>
        <a href="#features-section" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
        <a href="#features-section" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
        <a href="#cta-section" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
        <a href="#footer-section" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>À propos</a>
        <Button
          disableElevation variant="contained"
          onClick={() => { handleDownloadClick(); setMobileMenuOpen(false); }}
          sx={{ textTransform: "none", backgroundColor: "var(--color-greenyellow-100)", color: "#1b1b1b", fontWeight: "700", borderRadius: "50px", padding: "12px 32px", fontFamily: "var(--font-inter)" }}
        >Télécharger</Button>
      </div>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>

          {/* Hero Left */}
          <div className={styles.heroLeft}>
            <div className={styles.preHeroBadge}>
              PRENEZ <span className={styles.badgeHighlight}>LE CONTRÔLE</span> DE VOS FINANCES
            </div>

            <Typography
              className={styles.heroTitle}
              variant="inherit"
              variantMapping={{ inherit: "h1" }}
              sx={{
                fontFamily: "var(--font-oswald)",
                fontWeight: "700",
                color: "var(--color-gray-2000)",
                textTransform: "uppercase",
              }}
            >
              REPRENEZ <br />
              LE <span className={styles.titleGreenHighlight}>
                CONTRÔLE<img src="/Image29@2x.png" alt="" className={styles.brushUnderlineImg} />
              </span>.<br />
              ÉCONOMISEZ. <br />
              VIVEZ <span className={styles.titleGreenText}>MIEUX</span>.
            </Typography>

            <div className={styles.heroParagraphRow}>
              <p className={styles.heroParagraph}>
                trimly. est une application qui détecte automatiquement vos abonnements, analyse vos dépenses et vous aide à{" "}
                <span className={styles.textUnderlineHighlight}>
                  économiser
                  <img src="/Image13@2x.png" alt="" className={styles.brushUnderlineSmall} />
                  <img src="/Image14.svg" alt="" className={styles.arrowToPhone} />
                </span>{" "}
                chaque mois sans effort.
              </p>
            </div>

            <div className={styles.heroCtaRow}>
              <Button
                className={`${styles.ctaButtonPrimary} magnetic-btn`}
                endIcon={<img width="14" height="14" alt="" src="/image-21.svg" style={{ filter: "brightness(0.1)", display: "block" }} />}
                disableElevation
                variant="contained"
                onClick={handleDownloadClick}
                onMouseMove={handleMagnet}
                onMouseLeave={handleMagnetLeave}
                sx={{
                  textTransform: "none",
                  backgroundColor: "var(--color-greenyellow-100)",
                  color: "#1b1b1b",
                  fontSize: "15px",
                  fontWeight: "700",
                  borderRadius: "50px",
                  padding: "14px 28px",
                  fontFamily: "var(--font-inter)",
                  "&:hover": { backgroundColor: "var(--color-greenyellow-200)" },
                }}
              >
                Télécharger l'application
              </Button>

              <Button
                className={`${styles.ctaButtonSecondary} magnetic-btn`}
                endIcon={<img width="13" height="13" alt="" src="/image-24.svg" style={{ display: "block" }} />}
                disableElevation
                variant="outlined"
                onClick={() => setDemoOpen(true)}
                onMouseMove={handleMagnet}
                onMouseLeave={handleMagnetLeave}
                sx={{
                  textTransform: "none",
                  borderColor: "#1b1b1b",
                  color: "#1b1b1b",
                  fontSize: "15px",
                  fontWeight: "600",
                  borderRadius: "50px",
                  padding: "14px 28px",
                  fontFamily: "var(--font-inter)",
                  borderWidth: "1.5px",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: "#333",
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderWidth: "1.5px",
                  },
                }}
              >
                Voir la démo
              </Button>
            </div>

            {/* Rating section removed */}
          </div>

          {/* Hero Right */}
          <div className={styles.heroRight}>
            <div className={styles.mockupWrapper}>
              <div className={`${styles.brushStrokeBehind} ${styles.behind1}`}></div>
              <div className={`${styles.brushStrokeBehind} ${styles.behind2}`}></div>
              <div className={`${styles.brushStrokeBehind} ${styles.behind3}`}></div>
              <div className={`${styles.brushStrokeBehind} ${styles.behind4}`}></div>
              <div className={`${styles.brushStrokeBehind} ${styles.behind5}`}></div>

              <img
                src="/WhatsApp%20Image%202026-06-24%20at%2013.45.47-left.png"
                alt="Trimly App"
                className={styles.phoneImage}
              />

              <div className={`${styles.handwrittenAnnotation} ${styles.annotationTopRight}`}>
                <div className={styles.annotationText}>ÉCONOMIES <br /> CHAQUE MOIS</div>
                <img src="/Image19@2x.png" alt="arrow" className={styles.arrowIconTopRight} />
              </div>

              <div className={`${styles.handwrittenAnnotation} ${styles.annotationMidRight}`}>
                <img src="/Image15.svg" alt="scribble" className={styles.scribbleIcon} />
                <div className={styles.annotationText}>DÉPENSES <br /> INUTILES</div>
                <img src="/Image19@2x.png" alt="arrow" className={styles.arrowIconMidRight} />
              </div>

              <div className={`${styles.handwrittenAnnotation} ${styles.annotationBottomRight}`}>
                <div className={styles.annotationText}>ABONNEMENTS <br /> DÉTECTÉS</div>
                <span className={styles.checkmarkIcon}>✔</span>
              </div>

              <img src="/Image30@2x.png" alt="" className={styles.doodleDeco} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────── */}
      <section
        id="features-section"
        className={styles.featuresSection}
      >
        <div className={styles.featuresHeaderContainer}>
          <span className={styles.featuresSectionLabel}>FONCTIONNALITÉS</span>
          <h2 className={styles.featuresTitle}>
            TOUT CE QU'IL VOUS FAUT, <br />
            DANS <span className={styles.featuresTitleHighlight}>
              UNE SEULE APP.<img src="/Image29@2x.png" alt="" className={styles.brushUnderlineFeatures} />
            </span>
          </h2>
          <p className={styles.featuresTitleSub}>
            Détection automatique, alertes intelligentes, économies réelles.
          </p>
        </div>
        <Groups />
      </section>

      {/* ── How It Works Section ───────────────────────────── */}
      <section
        ref={howItSec.ref as React.RefObject<HTMLElement>}
        className={styles.howItWorksSection}
      >
        <div className={styles.redGuideline}></div>

        <div className={styles.howItWorksGrid}>
          {/* Left */}
          <div className={`${styles.howItWorksLeft} reveal-left ${howItSec.visible ? "visible" : ""}`}>
            <div className={styles.howItWorksLabel}>HOW IT WORKS — (01)</div>
            <h2 className={styles.howItWorksTitle}>
              <span className={styles.titleLine}>COMMENT</span>
              <span className={styles.titleLineHighlighted}>ÇA MARCHE</span>
              <span className={styles.titleLine}>EN 3 ÉTAPES</span>
            </h2>
            <p className={styles.howItWorksSubtitle}>
              trimly. simplifie la gestion de vos abonnements en 3 étapes simples.
            </p>

            <div className={styles.graphicsDesignFrame}>
              <div className={styles.figmaFrameBorder}></div>
              <div className={`${styles.figmaFrameHandle} ${styles.handleTL}`}></div>
              <div className={`${styles.figmaFrameHandle} ${styles.handleTR}`}></div>
              <div className={`${styles.figmaFrameHandle} ${styles.handleBL}`}></div>
              <div className={`${styles.figmaFrameHandle} ${styles.handleBR}`}></div>
              <div className={styles.figmaFrameLabel}>Frame: Trimly_Visuals</div>

              <div className={styles.stickersContainer}>
                <div className={`${styles.globeSticker} float-b`}>
                  <svg viewBox="0 0 100 100" className={styles.globeSvg}>
                    <rect x="10" y="25" width="80" height="50" rx="8" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <line x1="10" y1="42" x2="90" y2="42" stroke="currentColor" strokeWidth="3"/>
                    <rect x="18" y="52" width="24" height="6" rx="2" fill="currentColor" opacity="0.3"/>
                    <circle cx="72" cy="56" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>

                <div className={`${styles.greenPillsSticker} float-a`}>
                  <div className={styles.pillConnect}>ABOS</div>
                  <div className={styles.pillTrim}>DÉTECTÉS</div>
                  <div className={styles.pillIntersect}><span>€</span></div>
                </div>

                <div className={`${styles.sparkleSticker} float-c`}>
                  <svg viewBox="0 0 60 60" className={styles.sparkleSvg}>
                    <text x="30" y="42" textAnchor="middle" fill="currentColor" fontSize="36" fontWeight="bold" fontFamily="Oswald, sans-serif">€</text>
                  </svg>
                </div>

                <div className={`${styles.starburstSticker} float-b`}>
                  <svg viewBox="0 0 100 100" className={styles.starburstSvg}>
                    <path d="M50,10 C50,10 55,10 55,10 L58,10 C62,10 65,13 65,17 L65,22 C65,22 70,28 70,35 L70,45 C70,50 67,53 63,55 L60,57 L60,65 C60,67 59,68 57,68 L43,68 C41,68 40,67 40,65 L40,57 L37,55 C33,53 30,50 30,45 L30,35 C30,28 35,22 35,22 L35,17 C35,13 38,10 42,10 L45,10 Z" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <line x1="43" y1="72" x2="57" y2="72" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="46" y1="78" x2="54" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <div className={styles.transactionNotification}>
                <div className={styles.transactionIcon}>💸</div>
                <div className={styles.transactionDetails}>
                  <span className={styles.transactionService}>Netflix</span>
                  <span className={styles.transactionAmount}>-15,99 €</span>
                </div>
                <span className={styles.transactionDate}>Aujourd'hui</span>
              </div>

              <div className={styles.figmaCursor}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path d="M4.5 3V18.5L9.2 13.8L15 21L18.5 18L13 11L19.5 11L4.5 3Z" fill="#1e1e1e" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <span className={styles.figmaCursorUser}>trimly.</span>
              </div>
            </div>
          </div>

          {/* Right: Steps */}
          <div
            ref={howItRight.ref as React.RefObject<HTMLDivElement>}
            className={`${styles.howItWorksRight} reveal-right ${howItRight.visible ? "visible" : ""}`}
          >
            <div className={styles.stepsContainer}>
              {accordionData.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.stepItem} ${activeAccordion === index ? styles.stepItemActive : ""} reveal ${howItRight.visible ? `visible delay-${index + 1}` : ""}`}
                  onClick={() => setActiveAccordion(activeAccordion === index ? -1 : index)}
                >
                  <div className={styles.stepSelectionBorder}></div>
                  <div className={`${styles.stepSelectionHandle} ${styles.stepHandleTL}`}></div>
                  <div className={`${styles.stepSelectionHandle} ${styles.stepHandleTR}`}></div>
                  <div className={`${styles.stepSelectionHandle} ${styles.stepHandleBL}`}></div>
                  <div className={`${styles.stepSelectionHandle} ${styles.stepHandleBR}`}></div>
                  <div className={styles.stepSelectionLabel}>Step_0{index + 1}</div>

                  <div className={styles.stepHeader}>
                    <div className={styles.stepLeft}>
                      <div className={styles.stepIconWrapper}>{item.icon}</div>
                      <div className={styles.stepTextBlock}>
                        <span className={styles.stepNumber}>(0{index + 1})</span>
                        <span className={styles.stepTitle}>{item.title}</span>
                      </div>
                    </div>
                    <div
                      className={styles.stepToggleIcon}
                      style={{
                        transform: activeAccordion === index ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {activeAccordion === index ? "−" : "+"}
                    </div>
                  </div>
                  <div className={`${styles.stepContent} ${activeAccordion === index ? styles.stepContentOpen : ""}`}>
                    <p className={styles.stepDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pour Qui Section ───────────────────────────────── */}
      <section
        ref={pourQuiSec.ref as React.RefObject<HTMLElement>}
        className={styles.pourQuiSection}
      >
        <div className={styles.pourQuiGradient}></div>
        <div className={styles.pourQuiContainer}>
          <div className={`${styles.pourQuiHeader} reveal ${pourQuiSec.visible ? "visible" : ""}`}>
            <div className={styles.pourQuiLabel}>TARGET AUDIENCE</div>
            <h2 className={styles.pourQuiTitle}>
              <span className={styles.pourQuiTitleLine}>POUR</span>
              <span className={styles.pourQuiTitleLineBold}>QUI</span>
              <span className={styles.pourQuiTitleLine}>?</span>
            </h2>
          </div>

          <div className={styles.pourQuiGrid}>
            {[
              { n: "01", icon: "🎓", title: "Étudiants", desc: "Gérez votre budget serré et évitez les prélèvements cachés qui minent votre argent de poche.", delay: "delay-1" },
              { n: "02", icon: "💼", title: "Young Professionals", desc: "Prenez le contrôle de vos finances dès le début de votre carrière et build-up votre épargne.", delay: "delay-2" },
              { n: "03", icon: "👨‍👩‍👧‍👦", title: "Familles", desc: "Suivez les abonnements de toute la famille et identifiez les économies possibles ensemble.", delay: "delay-3" },
            ].map((card) => (
              <div
                key={card.n}
                className={`${styles.pourQuiCard} reveal-scale ${pourQuiSec.visible ? `visible ${card.delay}` : ""}`}
              >
                <div className={styles.pourQuiCardNumber}>{card.n}</div>
                <div className={styles.pourQuiCardContent}>
                  <div className={styles.pourQuiCardIcon}>{card.icon}</div>
                  <h3 className={styles.pourQuiCardTitle}>{card.title}</h3>
                  <p className={styles.pourQuiCardDesc}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Timeline Section ───────────────────────── */}
      <section
        ref={pricingSec.ref as React.RefObject<HTMLElement>}
        className={styles.pricingTimelineSection}
      >
        <div className={styles.timelineBgTypography} aria-hidden="true">0€</div>
        <div className={styles.timelineBgTypography2} aria-hidden="true">TRIAL</div>

        <div className={`${styles.timelineFloatSvg1} float-a`}>
          <svg viewBox="0 0 60 60" width="60" height="60" fill="none" stroke="#c3f11c" strokeWidth="2" opacity="0.15">
            <circle cx="30" cy="30" r="28"/>
            <text x="30" y="38" textAnchor="middle" fill="#c3f11c" fontSize="22" fontWeight="bold" fontFamily="Oswald" stroke="none">€</text>
          </svg>
        </div>
        <div className={`${styles.timelineFloatSvg2} float-b`}>
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="#e8634a" strokeWidth="2" opacity="0.12">
            <rect x="5" y="5" width="70" height="70" rx="12"/>
            <path d="M20 55 L35 35 L48 45 L60 20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className={styles.pricingTimelineContainer}>
          <div className={`${styles.pricingTimelineHeader} reveal ${pricingSec.visible ? "visible" : ""}`}>
            <span className={styles.pricingTimelineLabel}>TARIFS</span>
            <h2 className={styles.pricingTimelineTitle}>
              <span className={styles.pricingTimelineTitleLine}>COMMENT</span>
              <span className={styles.pricingTimelineTitleLineBold}>
                ÇA MARCHE<img src="/Image29@2x.png" alt="" className={styles.brushUnderlineFeatures} />
              </span>
            </h2>
            <p className={styles.pricingTimelineSubtitle}>
              14 jours gratuits. Sans engagement. Résultats dès la première semaine.
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={`${styles.timelineLine} ${pricingSec.visible ? styles.timelineLineActive : ""}`}></div>

            {[
              {
                dot: styles.timelineDotActive,
                day: "Jour 1",
                title: "Essai gratuit",
                desc: "Connectez votre compte Google en 1 clic. trimly. scanne vos emails et détecte automatiquement vos abonnements.",
                tag: "14 jours offerts",
                delay: 100,
                icon: (
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="#7d8a49" strokeWidth="2"/>
                    <circle cx="20" cy="14" r="5" stroke="#1b1b1b" strokeWidth="2"/>
                    <path d="M10 32 C10 26 15 22 20 22 C25 22 30 26 30 32" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                dot: styles.timelineDotActive,
                day: "Jour 7",
                title: "Premiers résultats",
                desc: "Vous recevez un rapport complet : tous vos abonnements, les montants, et les prélèvements à venir.",
                tag: null,
                delay: 250,
                highlight: false,
                icon: (
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="#1b1b1b" strokeWidth="2"/>
                    <path d="M12 20 L18 26 L28 14" stroke="#7d8a49" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                dot: styles.timelineDotPricing,
                day: "Jour 14",
                title: "Décidez",
                desc: "Le trial se termine. Continuez avec le plan Premium à seulement 4,99€/mois, ou arrêtez. Zéro prélèvement caché.",
                tag: "4,99€/mois",
                delay: 400,
                highlight: true,
                icon: (
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                    <circle cx="20" cy="20" r="16" stroke="#7d8a49" strokeWidth="2"/>
                    <text x="20" y="26" textAnchor="middle" fill="#1b1b1b" fontSize="15" fontWeight="bold" fontFamily="Oswald">4,99</text>
                  </svg>
                ),
              },
              {
                dot: styles.timelineDotDone,
                day: "Chaque mois",
                title: "Économisez",
                desc: "Alertes avant chaque prélèvement, recommandations personnalisées, et suivi de vos dépenses en temps réel.",
                tag: null,
                delay: 550,
                highlight: false,
                icon: (
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                    <circle cx="20" cy="20" r="16" stroke="#72842d" strokeWidth="2"/>
                    <path d="M12 20 L18 26 L28 14" stroke="#72842d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`${styles.timelineStep} ${step.highlight ? styles.timelineStepHighlight : ""} ${pricingSec.visible ? styles.timelineStepVisible : ""}`}
                style={{ transitionDelay: pricingSec.visible ? `${step.delay}ms` : "0ms" }}
              >
                <div className={step.dot}></div>
                <div className={styles.timelineStepIcon}>{step.icon}</div>
                <div className={`${styles.timelineContent} ${step.highlight ? styles.timelineContentPricing : ""}`}>
                  <span className={styles.timelineDay}>{step.day}</span>
                  <h3 className={styles.timelineStepTitle}>{step.title}</h3>
                  <p className={styles.timelineStepDesc}>{step.desc}</p>
                  {step.tag && <div className={styles.timelineTag}>{step.tag}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.timelineBottomDecor} reveal ${pricingSec.visible ? "visible delay-5" : ""}`}>
            <div className={styles.timelineBottomText}>TRIMLY</div>
            <div className={styles.timelineBottomDivider}></div>
            <div className={styles.timelineBottomText2}>REPRENEZ LE CONTRÔLE</div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────── */}
      <section
        id="cta-section"
        ref={ctaSec.ref as React.RefObject<HTMLElement>}
        className={`${styles.ctaSectionContainer} reveal ${ctaSec.visible ? "visible" : ""}`}
      >
        <Groups1 visible={ctaSec.visible} />
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        id="footer-section"
        ref={footerSec.ref as React.RefObject<HTMLElement>}
        className={`${styles.footerSectionContainer} reveal ${footerSec.visible ? "visible" : ""}`}
      >
        <Groups2 />
      </footer>

      {/* ── Video Demo Modal ─────────────────────────────────── */}
      {demoOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDemoOpen(false)}
          style={{ animation: "heroParagraphFade 0.3s ease" }}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseButton}
              onClick={() => setDemoOpen(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <div className={styles.videoRatioContainer}>
              <iframe
                className={styles.modalIframe}
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Trimly App Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* ── Back to top ──────────────────────────────────────── */}
      {showBackTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="#1b1b1b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </Box>
  );
};

export default FigmaDesignChatGPTImageJun72026124544PMjpg;
