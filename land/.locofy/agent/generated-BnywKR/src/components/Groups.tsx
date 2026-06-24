import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import styles from "./Groups.module.css";

export type GroupsType = {
  className?: string;
};

const Groups: FunctionComponent<GroupsType> = ({ className = "" }) => {
  return (
    <Box className={[styles.groups, className].join(" ")}>
      <Box className={styles.groupsColumn4}>
        <Box className={styles.frame}>
          <Box className={styles.frame2}>
            <img className={styles.imageIcon} alt="" src="/Image.svg" />
          </Box>
        </Box>
        <div className={styles.economise}>ECONOMISE</div>
        <div className={styles.reduisezVosDep}>
          Reduisez vos depenses
          <br />
          inutiles et atteignez vos
          <br />
          objectifs plus vite.
        </div>
      </Box>
      <img
        className={styles.backgroundIcon}
        loading="lazy"
        alt=""
        src="/Background@2x.png"
      />
      <Box className={styles.groups2}>
        <img
          className={styles.backgroundIcon2}
          loading="lazy"
          alt=""
          src="/Background@2x.png"
        />
        <Box className={styles.groupsColumn1}>
          <Box className={styles.image}>
            <img
              className={styles.imageIcon2}
              loading="lazy"
              alt=""
              src="/Image@2x.png"
            />
          </Box>
          <div className={styles.alerte}>ALERTE</div>
          <div className={styles.recevezDesNoti}>
            Recevez des notifications
            <br />
            avant chaque prelevement
            <br />
            pour garder le controle.
          </div>
        </Box>
      </Box>
      <Box className={styles.groups3}>
        <img
          className={styles.backgroundIcon2}
          loading="lazy"
          alt=""
          src="/Background@2x.png"
        />
        <Box className={styles.groupsColumn12}>
          <Box className={styles.image2}>
            <img
              className={styles.imageIcon3}
              loading="lazy"
              alt=""
              src="/Image@2x.png"
            />
          </Box>
          <div className={styles.analyse}>ANALYSE</div>
          <div className={styles.uneVueClaire}>
            Une vue claire de vos depenses
            <br />
            pour comprendre ou va
            <br />
            votre argent.
          </div>
        </Box>
      </Box>
      <Box className={styles.groups4}>
        <img
          className={styles.imageIcon4}
          loading="lazy"
          alt=""
          src="/Image@2x.png"
        />
        <div className={styles.dtecte}>DÉTECTE</div>
        <Box className={styles.trimlyIdentifie}>
          <div className={styles.trimlyIdentifie2}>
            Trimly identifie tous vos
            <br />
            abonnements, meme ceux
            <br />
            que vous avez oublies.
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default Groups;
