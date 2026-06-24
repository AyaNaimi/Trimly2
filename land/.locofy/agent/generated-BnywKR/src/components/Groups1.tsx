import { FunctionComponent } from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "./Groups1.module.css";

export type Groups1Type = {
  className?: string;
};

const Groups1: FunctionComponent<Groups1Type> = ({ className = "" }) => {
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
                  alt=""
                  src="/Image@2x.png"
                />
              </Box>
              <img
                className={styles.imageIcon2}
                loading="lazy"
                alt=""
                src="/Image@2x.png"
              />
              <Box className={styles.image2}>
                <img
                  className={styles.imageIcon3}
                  loading="lazy"
                  alt=""
                  src="/Image@2x.png"
                />
              </Box>
              <img className={styles.imageIcon4} alt="" src="/Image@2x.png" />
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
                PRÉTÀ
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
                Rejoignez des milliers d'utilisateurs
              </div>
              <Box className={styles.ctaTextLine2}>
                <div className={styles.quiOntDej}>qui ont dejà</div>
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
                alt=""
                src="/Image@2x.png"
              />
            </Box>
            <Box className={styles.groups5}>
              <Box className={styles.groups6}>
                <Box className={styles.button2}>
                  <Button
                    className={styles.background2}
                    disableElevation
                    variant="contained"
                    sx={{
                      background: "#020302",
                      border: "#868686 solid 1px",
                      borderRadius: "4px 4px 0px 3px",
                      "&:hover": { background: "#020302" },
                      width: 163,
                      height: 50,
                    }}
                  />
                  <Box className={styles.groups7}>
                    <img
                      className={styles.imageIcon6}
                      alt=""
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
                        I'App Store
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box className={styles.groups8}>
                  <button className={styles.button3}>
                    <Box className={styles.frame2}>
                      <img
                        className={styles.imageIcon7}
                        alt=""
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
      <img className={styles.imageIcon8} alt="" src="/Image.svg" />
    </Box>
  );
};

export default Groups1;
