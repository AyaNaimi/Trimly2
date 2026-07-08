import { FunctionComponent } from "react";
import { Box, Typography } from "@mui/material";
import styles from "./TermsOfService.module.css";

const TermsOfService: FunctionComponent = () => {
  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>trimly.</a>
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>Conditions Générales d'Utilisation</h1>
        <p className={styles.lastUpdated}>Dernière mise à jour : 8 juillet 2026</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptation des conditions</h2>
          <p className={styles.paragraph}>
            En téléchargeant, installant ou utilisant l'application Trimly (« l'Application »),
            vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (« CGU »).
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Description du service</h2>
          <p className={styles.paragraph}>
            Trimly est une application de gestion d'abonnements qui permet aux utilisateurs de :
          </p>
          <ul className={styles.list}>
            <li>Connecter leur compte Google pour analyser leurs emails de confirmation d'abonnement</li>
            <li>Détecter automatiquement leurs abonnements récurrents</li>
            <li>Recevoir des alertes avant chaque prélèvement</li>
            <li>Obtenir des recommandations personnalisées pour réduire leurs dépenses</li>
            <li>Suivre leurs dépenses d'abonnement en temps réel</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Éligibilité</h2>
          <p className={styles.paragraph}>
            Pour utiliser Trimly, vous devez :
          </p>
          <ul className={styles.list}>
            <li>Être âgé d'au moins 16 ans</li>
            <li>Disposer d'un compte Google actif</li>
            <li>Fournir des informations exactes lors de la création de votre compte</li>
            <li>Ne pas utiliser l'Application à des fins illégales ou non autorisées</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Compte utilisateur</h2>
          <p className={styles.paragraph}>
            Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            Trimly utilise OAuth 2.0 pour l'authentification via Google ; nous ne stockons jamais
            votre mot de passe Google. Vous vous engagez à nous informer immédiatement de toute
            utilisation non autorisée de votre compte.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Abonnement et paiement</h2>
          <p className={styles.paragraph}>
            Trimly propose un essai gratuit de 14 jours. À l'issue de cette période,
            un abonnement Premium est requis pour continuer à utiliser le service.
          </p>
          <ul className={styles.list}>
            <li><strong>Essai gratuit :</strong> 14 jours, aucune information de paiement requise</li>
            <li><strong>Premium :</strong> 4,99 € par mois, facturé mensuellement</li>
            <li><strong>Résiliation :</strong> Vous pouvez résilier à tout moment depuis les paramètres de votre compte. L'annulation prend effet à la fin de la période de facturation en cours.</li>
            <li><strong>Remboursement :</strong> Aucun remboursement n'est accordé pour les périodes partielles d'utilisation.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Utilisation des données Google</h2>
          <p className={styles.paragraph}>
            Trimly utilise l'API Gmail de Google pour analyser vos emails de confirmation
            d'abonnement. Notre utilisation des données Google est strictement limitée à :
          </p>
          <ul className={styles.list}>
            <li>La détection des emails de confirmation d'abonnement</li>
            <li>L'extraction des informations nécessaires (nom du service, montant, fréquence)</li>
            <li>La génération de rapports de dépenses personnalisés</li>
          </ul>
          <p className={styles.paragraph}>
            Nous ne lisons pas vos emails personnels, nous ne partageons pas vos données
            avec des tiers, et nous ne utilisons pas vos données pour d'autres finalités.
            Trimly a fait l'objet d'un audit de sécurité par Google pour garantir la conformité
            avec sa politique relative aux données des utilisateurs.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Propriété intellectuelle</h2>
          <p className={styles.paragraph}>
            L'Application, son code source, son design, ses logos, et tout contenu original
            sont la propriété exclusive de Trimly. Vous ne pouvez pas reproduire, modifier,
            distribuer ou créer des œuvres dérivées sans autorisation écrite préalable.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Limitation de responsabilité</h2>
          <p className={styles.paragraph}>
            Trimly fournit le service « en l'état » sans garantie expresse ou implicite.
            Nous ne garantissons pas que l'Application fonctionnera sans interruption ou
            sans erreur. Trimly n'est pas responsable des décisions financières prises
            par l'utilisateur sur la base des informations fournies par l'Application.
            Les économies potentielles mentionnées sont des estimations et non des garanties.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Résiliation</h2>
          <p className={styles.paragraph}>
            Trimly se réserve le droit de suspendre ou résilier votre accès à l'Application
            en cas de violation des présentes CGU, d'utilisation frauduleuse, ou si la loi
            l'exige. Vous pouvez résilier votre compte à tout moment depuis les paramètres.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Modifications des CGU</h2>
          <p className={styles.paragraph}>
            Nous pouvons modifier ces CGU à tout moment. Les modifications prennent effet
            30 jours après leur publication. Vous serez informé par email en cas de
            modification substantielle. L'utilisation continue de l'Application après
            l'entrée en vigueur des modifications constitue votre acceptation des nouvelles CGU.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Contact</h2>
          <p className={styles.paragraph}>
            Pour toute question concernant ces CGU, contactez-nous à :
            <br />
            Email : <a href="mailto:ayanaimi.trimly@gmail.com" className={styles.link}>ayanaimi.trimly@gmail.com</a>
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <a href="/" className={styles.footerLink}>Retour à l'accueil</a>
          <span className={styles.footerSeparator}>•</span>
          <a href="/privacy" className={styles.footerLink}>Politique de confidentialité</a>
          <span className={styles.footerSeparator}>•</span>
          <span className={styles.footerCopy}>&copy; 2026 Trimly. Tous droits réservés.</span>
        </div>
      </footer>
    </Box>
  );
};

export default TermsOfService;
