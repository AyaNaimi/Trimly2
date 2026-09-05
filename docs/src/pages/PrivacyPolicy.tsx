import { FunctionComponent } from "react";
import { Box } from "@mui/material";
import styles from "./PrivacyPolicy.module.css";

const PrivacyPolicy: FunctionComponent = () => {
  return (
    <Box className={styles.page}>
      <header className={styles.header}>
          <a href="/Trimly2/" className={styles.logo}>trimly.</a>
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>Politique de Confidentialité</h1>
        <p className={styles.lastUpdated}>Dernière mise à jour : 8 juillet 2026</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.paragraph}>
            Trimly (« nous », « notre », « l'Application ») s'engage à protéger la vie privée
            de ses utilisateurs. Cette Politique de Confidentialité explique comment nous
            collectons, utilisons, stockons et protégeons vos informations lorsque vous
            utilisez notre application de gestion d'abonnements.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Données que nous collectons</h2>

          <h3 className={styles.subsectionTitle}>2.1 Données fournies par l'utilisateur</h3>
          <ul className={styles.list}>
            <li>Adresse email (via la connexion Google OAuth)</li>
            <li>Nom et photo de profil Google (si vous autorisez le partage)</li>
            <li>Préférences de notification et paramètres de l'application</li>
          </ul>

          <h3 className={styles.subsectionTitle}>2.2 Données collectées automatiquement</h3>
          <ul className={styles.list}>
            <li>Informations sur les abonnements détectés dans vos emails (nom du service, montant, fréquence, date de début)</li>
            <li>Données d'utilisation de l'Application (pages visitées, fonctionnalités utilisées)</li>
            <li>Informations techniques (type d'appareil, système d'exploitation, version de l'application)</li>
            <li>Adresse IP et données de journalisation anonymisées</li>
          </ul>

          <h3 className={styles.subsectionTitle}>2.3 Données Google</h3>
          <p className={styles.paragraph}>
            Avec votre autorisation explicte via OAuth 2.0, Trimly accède à votre boîte de
            réception Gmail uniquement pour identifier les emails de confirmation
            d'abonnement. Nous ne lisons pas vos emails personnels, nous n'accédons pas
            à vos emails non liés aux abonnements, et nous ne partageons aucune donnée
            Google avec des tiers. Notre utilisation de l'API Gmail est conforme à la
            Politique relative aux données des utilisateurs des services API Google.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Finalités du traitement</h2>
          <p className={styles.paragraph}>Nous utilisons vos données pour :</p>
          <ul className={styles.list}>
            <li>Fournir et améliorer le service de détection et de gestion d'abonnements</li>
            <li>Vous envoyer des alertes avant chaque prélèvement</li>
            <li>Générer des rapports personnalisés sur vos dépenses</li>
            <li>Vous recommander des économies potentielles</li>
            <li>Assurer la sécurité de votre compte et prévenir la fraude</li>
            <li>Envoyer des communications liées au service (factures, notifications de renouvellement)</li>
            <li>Respecter nos obligations légales et réglementaires</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Base légale du traitement</h2>
          <p className={styles.paragraph}>
            Nous traitons vos données personnelles sur les bases légales suivantes :
          </p>
          <ul className={styles.list}>
            <li><strong>Consentement :</strong> Pour l'accès à vos emails Gmail et l'envoi de notifications</li>
            <li><strong>Exécution du contrat :</strong> Pour fournir le service de gestion d'abonnements auquel vous avez souscrit</li>
            <li><strong>Intérêt légitime :</strong> Pour améliorer notre service et assurer sa sécurité</li>
            <li><strong>Obligation légale :</strong> Pour respecter la législation applicable</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Partage des données</h2>
          <p className={styles.paragraph}>
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos
            données uniquement dans les cas suivants :
          </p>
          <ul className={styles.list}>
            <li><strong>Prestataires de services :</strong> Hébergement (OVHcloud, France), traitement des paiments (Stripe) — ces prestataires sont liés par des clauses de confidentialité strictes</li>
            <li><strong>Obligations légales :</strong> Si la loi nous y oblige ou en réponse à une demande judiciaire valide</li>
            <li><strong>Consentement :</strong> Avec votre autorisation explicte</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Conservation des données</h2>
          <p className={styles.paragraph}>
            Nous conservons vos données personnelles aussi longtemps que votre compte est
            actif, et jusqu'à 90 jours après la résiliation de votre compte pour permettre
            une réactivation éventuelle. Passé ce délai, vos données sont définitivement
            supprimées ou anonymisées. Les données de journalisation sont conservées
            pendant 12 mois maximum.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Sécurité des données</h2>
          <p className={styles.paragraph}>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
            appropriées pour protéger vos données :
          </p>
          <ul className={styles.list}>
            <li>Chiffrement TLS 1.3 pour toutes les communications</li>
            <li>Chiffrement au repos des données stockées (AES-256)</li>
            <li>Authentification OAuth 2.0 pour l'accès aux données Google</li>
            <li>Audits de sécurité réguliers</li>
            <li>Accès restreint aux données basé sur le principe du moindre privilège</li>
            <li>Hébergement des données dans l'Union Européenne (France)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Vos droits</h2>
          <p className={styles.paragraph}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous
            disposez des droits suivants :
          </p>
          <ul className={styles.list}>
            <li><strong>Droit d'accès :</strong> Obtenir une copie des données que nous détenons sur vous</li>
            <li><strong>Droit de rectification :</strong> Corriger des informations inexactes</li>
            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données (droit à l'oubli)</li>
            <li><strong>Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
            <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
            <li><strong>Droit de retirer votre consentement :</strong> À tout moment, sans affecter la licéité du traitement antérieur</li>
          </ul>
          <p className={styles.paragraph}>
            Pour exercer vos droits, contactez-nous à <a href="mailto:ayanaimi.trimly@gmail.com" className={styles.link}>ayanaimi.trimly@gmail.com</a>.
            Nous répondons à toutes les demandes dans un délai de 30 jours. Vous avez
            également le droit d'introduire une réclamation auprès de la CNIL.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Transferts internationaux</h2>
          <p className={styles.paragraph}>
            Vos données sont hébergées et traitées exclusivement au sein de l'Union
            Européenne (France). En cas de recours à des prestataires situés hors de l'EEE,
            nous nous assurons que des garanties appropriées existent (Clauses Contractuelles
            Types de la Commission Européenne).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Cookies et traceurs</h2>
          <p className={styles.paragraph}>
            Trimly utilise uniquement des cookies strictement nécessaires au fonctionnement
            de l'Application (cookies de session d'authentification). Nous n'utilisons pas
            de cookies publicitaires ou de traçage tiers. Les données analytiques sont
            collectées de manière anonyme et agrégée.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Modifications de la politique</h2>
          <p className={styles.paragraph}>
            Nous pouvons mettre à jour cette Politique de Confidentialité pour refléter
            des changements dans nos pratiques ou la législation. Les modifications
            importantes vous seront communiquées par email au moins 30 jours avant leur
            entrée en vigueur.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>12. Contact et DPO</h2>
          <p className={styles.paragraph}>
            Pour toute question relative à la protection de vos données, contactez notre
            Délégué à la Protection des Données (DPO) :
          </p>
          <ul className={styles.list}>
            <li>Email : <a href="mailto:ayanaimi.trimly@gmail.com" className={styles.link}>ayanaimi.trimly@gmail.com</a></li>
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <a href="/Trimly2/" className={styles.footerLink}>Retour à l'accueil</a>
          <span className={styles.footerSeparator}>•</span>
          <a href="/Trimly2/terms" className={styles.footerLink}>Conditions d'utilisation</a>
          <span className={styles.footerSeparator}>•</span>
          <span className={styles.footerCopy}>&copy; 2026 Trimly. Tous droits réservés.</span>
        </div>
      </footer>
    </Box>
  );
};

export default PrivacyPolicy;
