import { FunctionComponent } from "react";
import { Typography, Box } from "@mui/material";
import styles from "./Groups2.module.css";

export type Groups2Type = {
  className?: string;
};

const Groups2: FunctionComponent<Groups2Type> = ({ className = "" }) => {
  return (
    <Box className={[styles.groups, className].join(" ")}>
      <Box className={styles.groups2}>
        <Box className={styles.groupsColumn0}>
          <Box className={styles.groupsColumn02}>
            <Box className={styles.groupsColumn0Row0}>
              <img className={styles.imageIcon} alt="" src="/Image.svg" />
              <Box className={styles.trimly}>
                <Typography
                  className={styles.trimly2}
                  variant="inherit"
                  variantMapping={{ inherit: "b" }}
                  sx={{ fontWeight: "700" }}
                >
                  Trimly
                </Typography>
              </Box>
            </Box>
            <div className={styles.prenezLeContro}>
              Prenez le controle de vos finances.
            </div>
          </Box>
        </Box>
        <Box className={styles.image}>
          <img className={styles.imageIcon2} alt="" src="/Image.svg" />
        </Box>
        <img
          className={styles.imageIcon3}
          loading="lazy"
          alt=""
          src="/Image.svg"
        />
        <Box className={styles.button}>
          <Box className={styles.button2}>
            <Box className={styles.frame}>
              <Typography
                className={styles.in}
                variant="inherit"
                variantMapping={{ inherit: "b" }}
                sx={{ lineHeight: "var(--lh-16)", fontWeight: "700" }}
              >
                in
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Groups2;
