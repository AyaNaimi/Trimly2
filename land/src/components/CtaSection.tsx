import { FunctionComponent } from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "./CtaSection.module.css";

/** Props for CtaSection. */
export interface CtaSectionProps {
  className?: string;
  /** Called when the App Store button is clicked. */
  onAppStoreClick?: () => void;
  /** Called when the Google Play button is clicked. */
  onGooglePlayClick?: () => void;
}

/**
 * CtaSection — "Prêt à économiser?" call-to-action section.
 * Contains store download buttons and social proof copy.
 * Renamed from Groups1.tsx.
 */
const CtaSection: FunctionComponent<CtaSectionProps> = ({
  className = "",
  onAppStoreClick,
  onGooglePlayClick,
}) => {
  return (
    <Box className={[styles.groups, className].join(" ")}>
      <Box className={styles.groups2}>
        <Box className={styles.groups3}>
          <Box className={styles.dividersRow}>
            <Box className={styles.dividersRow2}>
              <Box className={styles.image}>
                <img
                  className={styles.imageIcon}
                  loading="lazy"
                  alt="Abonnement 1"
                  src="/Image@2x.png"
                />
              </Box>
              <img
                className={styles.imageIcon2}
                loading="lazy"
                alt="Abonnement 2"
                src="/Image@2x.png"
              />
              <Box className={styles.image2}>
                <img
                  className={styles.imageIcon3}
                  loading="lazy"
                  alt="Abonnement 3"
                  src="/Image@2x.png"
                />
              </Box>
              <img
                className={styles.imageIcon4}
                alt="Abonnement 4"
                src="/Image@2x.png"
              />
            </Box>
          </Box>

          <Box className={styles.ctaSectionRow1}>
            <Box className={styles.groups4}>
              <Typography
                className={styles.prtEconomiser}
                variant="inherit"
                variantMapping={{ inherit: "h2" }}
                sx={{ fontWeight: "600", lineHeight: "35.1px" }}
              >
                PRÊT À
                <br />
                ECONOMISER?
              </Typography>
            </Box>

            <Box className={styles.background}>
              <img
                className={styles.backgroundIcon}
                alt=""
                src="/Background@2x.png"
              />
            </Box>

            <Box className={styles.ctaDescription}>
              <div className={styles.rejoignezDesMi}>
                Rejoignez des milliers d&apos;utilisateurs
              </div>
              <Box className={styles.ctaTextLine2}>
                <div className={styles.quiOntDej}>qui ont déjà</div>
                <Box className={styles.button}>
                  <Box className={styles.frame}>
                    <div className={styles.quiOntDej}>repris le controle</div>
                  </Box>
                </Box>
              </Box>
              <div className={styles.deLeursFinance}>
                de leurs finances avec Trimly
              </div>
            </Box>

            <Box className={styles.image3}>
              <img
                className={styles.imageIcon5}
                loading="lazy"
                alt="Illustration Trimly app"
                src="/Image@2x.png"
              />
            </Box>

            <Box className={styles.groups5}>
              <Box className={styles.groups6}>
                {/* App Store button */}
                <Box className={styles.button2}>
                  <Button
                    className={styles.background2}
                    disableElevation
                    variant="contained"
                    aria-label="Télécharger sur l'App Store"
                    onClick={onAppStoreClick}
                    sx={{
                      background: "var(--color-appstore-bg)",
                      border: "var(--color-appstore-border) solid 1px",
                      borderRadius: "var(--br-4) var(--br-4) 0px var(--br-3)",
                      "&:hover": { background: "var(--color-appstore-bg)" },
                      width: 163,
                      height: 50,
                    }}
                  />
                  <Box className={styles.groups7}>
                    <img
                      className={styles.imageIcon6}
                      alt="Logo Apple"
                      src="/Image.svg"
                    />
                    <Box className={styles.groupsColumn1}>
                      <div className={styles.telechargerDans}>
                        Telecharger dans
                      </div>
                      <Typography
                        className={styles.iappStore}
                        variant="inherit"
                        variantMapping={{ inherit: "h3" }}
                        sx={{ fontWeight: "400", fontSize: "var(--fs-19)" }}
                      >
                        l&apos;App Store
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Google Play button */}
                <Box className={styles.groups8}>
                  <button
                    className={styles.button3}
                    aria-label="Télécharger sur Google Play"
                    onClick={onGooglePlayClick}
                  >
                    <Box className={styles.frame2}>
                      <img
                        className={styles.imageIcon7}
                        alt="Logo Google Play"
                        src="/Image.svg"
                      />
                      <Box className={styles.frameColumn1}>
                        <div className={styles.disponibleSur}>
                          DISPONIBLE SUR
                        </div>
                        <div className={styles.googlePlay}>Google Play</div>
                      </Box>
                    </Box>
                  </button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <img
        className={styles.imageIcon8}
        alt=""
        src="/Image.svg"
      />
    </Box>
  );
};

export default CtaSection;
