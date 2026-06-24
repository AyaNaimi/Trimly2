const fs = require('fs');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle,
    PageBreak,
    Header,
    Footer,
    PageNumber
} = require('docx');

// Helper to create body paragraphs with premium Calibri typography
function createParagraph(text, options = {}) {
    return new Paragraph({
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: options.spacing || { before: 140, after: 140, line: 300 }, // 1.25 line spacing
        children: [
            new TextRun({
                text: text,
                font: "Calibri",
                size: options.size || 22, // 11 pt
                color: options.color || "232221", // Charcoal Black
                bold: options.bold || false,
                italic: options.italic || false,
            })
        ]
    });
}

// Helper to create professionally indented bullet points
function createBulletPoint(boldPrefix, text, options = {}) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 100, line: 260 },
        indent: { left: 480, hanging: 240 },
        children: [
            new TextRun({
                text: "•\t",
                font: "Calibri",
                size: 22,
                color: "A34839", // Rust Red bullet
                bold: true
            }),
            new TextRun({
                text: boldPrefix,
                font: "Calibri",
                size: 22,
                color: "232221",
                bold: true
            }),
            new TextRun({
                text: text,
                font: "Calibri",
                size: 22,
                color: "232221"
            })
        ]
    });
}

// Helper to create Heading 1 (Section titles) with a divider line
function createHeading1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        keepWithNext: true,
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 12, color: "A34839" } // Solid Rust Red divider line
        },
        children: [
            new TextRun({
                text: text,
                font: "Calibri Light",
                size: 36, // 18 pt
                color: "A34839", // Rust Red
                bold: true,
            })
        ]
    });
}

// Helper to create Heading 2 (Sub-sections)
function createHeading2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 140 },
        keepWithNext: true,
        children: [
            new TextRun({
                text: text,
                font: "Calibri Light",
                size: 26, // 13 pt
                color: "232221", // Charcoal
                bold: true,
            })
        ]
    });
}

// Helper to create Heading 3
function createHeading3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 220, after: 110 },
        keepWithNext: true,
        children: [
            new TextRun({
                text: text,
                font: "Calibri Light",
                size: 22, // 11 pt
                color: "5B6E7A", // Slate Blue
                bold: true,
            })
        ]
    });
}

// Helper to create a premium left-bordered Callout Box
function createCalloutBox(text) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                spacing: { before: 120, after: 120, line: 260 },
                                children: [
                                    new TextRun({
                                        text: text,
                                        font: "Calibri",
                                        size: 21,
                                        italic: true,
                                        color: "232221"
                                    })
                                ]
                            })
                        ],
                        shading: { fill: "F7F5F0" },
                        borders: {
                            left: { style: BorderStyle.THICK, size: 30, color: "A34839" },
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE }
                        },
                        margins: { top: 200, bottom: 200, left: 240, right: 200 }
                    })
                ]
            })
        ]
    });
}

// Helper to create structured cells in centred tables
function createTableCell(text, options = {}) {
    return new TableCell({
        children: [
            new Paragraph({
                alignment: options.alignment || AlignmentType.LEFT,
                spacing: { before: 100, after: 100 },
                children: [
                    new TextRun({
                        text: text,
                        font: "Calibri",
                        size: options.size || 20, // 10 pt
                        bold: options.bold || false,
                        color: options.color || "232221",
                    })
                ]
            })
        ],
        shading: options.fill ? { fill: options.fill } : undefined,
        borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
        },
        margins: { top: 140, bottom: 140, left: 180, right: 180 }
    });
}

// Helper to create table headers
function createTableHeaderCell(text, options = {}) {
    return createTableCell(text, {
        bold: true,
        color: "FFFFFF",
        fill: "5B6E7A", // Slate Blue header
        alignment: options.alignment || AlignmentType.CENTER,
        size: options.size || 20
    });
}

// Document configuration
const doc = new Document({
    sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch
                        bottom: 1440,
                        left: 1440,
                        right: 1440
                    }
                }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            spacing: { after: 200 },
                            children: [
                                new TextRun({
                                    text: "TRIMLY ✦ BUSINESS PLAN PIE (OFPPT)",
                                    font: "Calibri",
                                    size: 16,
                                    color: "5B6E7A"
                                })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "Page ",
                                    font: "Calibri",
                                    size: 18,
                                    color: "5B6E7A"
                                }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    font: "Calibri",
                                    size: 18,
                                    color: "5B6E7A",
                                    bold: true
                                }),
                                new TextRun({
                                    text: " sur ",
                                    font: "Calibri",
                                    size: 18,
                                    color: "5B6E7A"
                                }),
                                new TextRun({
                                    children: [PageNumber.TOTAL_PAGES],
                                    font: "Calibri",
                                    size: 18,
                                    color: "5B6E7A"
                                })
                            ]
                        })
                    ]
                })
            },
            children: [
                // ================= PAGE 1 : COVER PAGE (PAGE DE GARDE) =================
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "OFFICE DE LA FORMATION PROFESSIONNELLE ET DE LA PROMOTION DU TRAVAIL",
                            font: "Calibri",
                            size: 18,
                            color: "5B6E7A",
                            bold: true,
                        })
                    ],
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "PROJET D'INNOVATION ENTREPRENEURIAT (PIE)",
                            font: "Calibri",
                            size: 22,
                            color: "232221",
                            bold: true,
                        })
                    ],
                    spacing: { after: 1400 }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "BUSINESS PLAN",
                            font: "Calibri Light",
                            size: 56,
                            color: "A34839", // Rust Red
                            bold: true,
                        })
                    ],
                    spacing: { after: 120 }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "TRIMLY",
                            font: "Calibri Light",
                            size: 72,
                            color: "232221",
                            bold: true,
                        })
                    ],
                    spacing: { after: 120 }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "L'Art d'Élaguer l'Inutile & Préserver l'Essentiel",
                            font: "Calibri",
                            size: 26,
                            color: "5B6E7A",
                            italic: true,
                        })
                    ],
                    spacing: { after: 2200 }
                }),
                
                // Decorative Solid Colored accent band
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [],
                                    shading: { fill: "A34839" }, // Solid Rust Red band
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE }
                                    },
                                    height: { value: 60, rule: "exact" } // Thin line
                                })
                            ]
                        })
                    ]
                }),
                new Paragraph({ spacing: { before: 400 } }),

                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({ text: "Présenté par : ", bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: "Aya Naimi", font: "Calibri", size: 22 })
                    ],
                    spacing: { after: 80 }
                }),
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({ text: "Filière : ", bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: "Développement Digital / Option Génie Logiciel", font: "Calibri", size: 22 })
                    ],
                    spacing: { after: 80 }
                }),
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({ text: "Encadrant de projet : ", bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: "Jury d'Évaluation de l'OFPPT", font: "Calibri", size: 22 })
                    ],
                    spacing: { after: 1200 }
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "Année Académique : 2025 - 2026",
                            font: "Calibri",
                            size: 18,
                            color: "5B6E7A",
                            bold: true,
                        })
                    ]
                }),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 2 : SOMMAIRE =================
                createHeading1("Sommaire"),
                new Paragraph({ spacing: { before: 200 } }),
                
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "1. Résumé Exécutif / Executive Summary", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(75) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "3", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "2. Problème & Opportunité / Problem & Opportunity", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(63) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "4", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "3. Solution & Produit (MVP) / Solution & Product", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(65) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "5", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "4. Étude de Marché / Market Study", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(84) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "7", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "5. Stratégie Marketing & Commerciale / Marketing & Sales", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(54) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "9", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "6. Modèle Économique & Plan Financier / Financials", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(62) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "11", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "7. Plan Opérationnel / Operations", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(85) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "13", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "8. Équipe / Team", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(107) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "14", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "9. Feuille de Route & Risques / Roadmap & Risks", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(68) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "15", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({ text: "10. Annexes / Appendices", font: "Calibri", size: 22, bold: true }),
                        new TextRun({ text: " " + ".".repeat(96) + " ", font: "Calibri", size: 22, color: "5B6E7A" }),
                        new TextRun({ text: "16", font: "Calibri", size: 22, bold: true, color: "A34839" })
                    ]
                }),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 3 : RÉSUMÉ EXÉCUTIF =================
                createHeading1("1. Résumé Exécutif"),
                createParagraph("Trimly est une application mobile complète de finances personnelles articulée autour de deux modules complémentaires. Le premier est un module de budgeting personnel (suivi des revenus et dépenses, catégorisation intelligente par IA, enveloppes budgétaires 50/30/20 et objectifs d'épargne). Le second est un module de gestion et résiliation des abonnements (détection automatique par scan IA des boîtes mail, alertes de renouvellement et résiliation en 1-clic par lettre recommandée physique via l'API Maileva). Bâtie en React Native/Expo SDK 54 et Supabase, Trimly ne nécessite aucun accès bancaire et fonctionne en mode local-first."),
                
                new Paragraph({ spacing: { before: 120 } }),
                createCalloutBox("« Notre vision : redonner aux foyers la maîtrise absolue de leur budget mensuel — chaque euro dépensé a une raison d'être, chaque abonnement inutile est détecté et éliminé, automatiquement. »"),
                new Paragraph({ spacing: { before: 120 } }),

                createHeading2("Fiche Synthétique du Projet"),
                createBulletPoint("Qui et quoi : ", "Trimly est un assistant financier personnel intelligent. Il combine un outil de budgeting complet (suivi revenus/dépenses, catégories, objectifs) avec un agrégateur d'abonnements piloté par IA (scan mail OAuth, alertes, résiliation LRAR automatique)."),
                createBulletPoint("Le problème résolu : ", "(1) Les renouvellements automatiques non désirés et abonnements zombies représentant 120 € à 300 € (1 200 à 3 000 DH) de pertes annuelles. (2) L'absence d'un outil de gestion budgétaire simple, respectueux de la vie privée et ne nécessitant pas de connexion bancaire."),
                createBulletPoint("La proposition de valeur duale : ", "Un budget personnel temps réel avec catégorisation IA + une résiliation officielle LRAR en 1-clic, dans une seule application unifiée, sans jamais communiquer ses identifiants bancaires."),
                createBulletPoint("Le modèle économique : ", "Freemium avec Trimly Pro à 4,99 € / 50 DH par mois ou 49,99 € / 500 DH par an (budget illimité, scan mail IA, alertes et exports PDF), plus une facturation LRAR à l'acte à 7,99 € / 80 DH (marge unitaire de 2,49 € / 25 DH)."),
                createBulletPoint("Traction & MVP : ", "Le prototype MVP sous React Native/Expo et Supabase est prêt avec les deux modules. Notre landing page a déjà enregistré un taux de conversion de 12% sur les inscriptions d'accès anticipé."),
                createBulletPoint("La demande : ", "Un financement d'amorçage de 150 000 DH afin de couvrir les frais de validation technique Google OAuth CASA Tier 2 et d'initier nos campagnes de marketing d'acquisition."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 4 : PROBLEME & OPPORTUNITE =================
                createHeading1("2. Problème et Opportunité"),
                createParagraph("La transition des modes de consommation vers le modèle récurrent de l'abonnement s'est accélérée. Aujourd'hui, les consommateurs possèdent des abonnements dans tous les aspects de leur vie (divertissement, stockage, sport, services professionnels), ce qui introduit une fragmentation massive de leurs charges financières."),

                createHeading2("Le Phénomène de la Fatigue de l'Abonnement"),
                createParagraph("Le marché de l'abonnement connaît une croissance soutenue de 18% par an. Le foyer européen moyen gère entre 5 et 10 abonnements simultanés, représentant une dépense cumulée mensuelle de 60 € (600 DH) à 120 € (1 200 DH). Cette dispersion conduit à une asymétrie d'attention : le consommateur oublie la somme de ses engagements au fil de l'année. Les prélèvements automatiques continuent de courir sans validation, alimentant les « abonnements zombies » (services payés mais inutilisés)."),

                createHeading2("Résultats de notre Validation Terrain"),
                createParagraph("Pour quantifier ce problème, nous avons mené une enquête auprès de 50 consommateurs cibles (actifs urbains de 20-40 ans et étudiants) :"),
                createBulletPoint("Manquement de résiliation d'essais : ", "84% des répondants ont admis avoir déjà manqué l'échéance de résiliation d'un essai gratuit et avoir été facturés de mois d'abonnements supplémentaires non désirés."),
                createBulletPoint("Présence de services zombies : ", "68% des participants possèdent au moins un abonnement actif qu'ils n'ont pas utilisé au cours des trois derniers mois."),
                createBulletPoint("Friction de désabonnement : ", "92% d'entre eux qualifient les démarches de désinscription de complexes, lentes ou opaques (ex. salles de sport, abonnements presse nécessitant un courrier recommandé)."),

                createHeading2("L'Opportunité Commerciale"),
                createParagraph("L'inactivité commerciale et les reconductions non désirées coûtent entre 120 € (1 200 DH) et 300 € (3 000 DH) par an par consommateur. En pleine période d'inflation, les foyers recherchent des solutions concrètes pour optimiser leur budget. Trimly répond à cette demande grâce à une technologie d'extraction IA automatique des factures d'e-mails, évitant ainsi le recours à des connexions bancaires intrusives qui freinent l'adoption par les utilisateurs par crainte pour leur sécurité."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 5 : SOLUTION & PRODUIT =================
                createHeading1("3. Solution et Produit (MVP)"),
                createParagraph("Trimly se positionne comme un assistant financier personnel complet, respectueux de la vie privée. Il combine deux modules puissants dans une seule application : un module de budgeting (suivi revenus/dépenses, catégorisation IA, objectifs d'épargne) et un module de gestion des abonnements (scan mail automatique, alertes, résiliation LRAR physique en 1 clic). Aucun accès bancaire n'est requis."),

                createHeading2("Module 1 — Budgeting Personnel Complet"),
                createParagraph("Le cœur de Trimly est un outil de pilotage financier quotidien :"),
                createBulletPoint("Suivi des revenus & dépenses : ", "L'utilisateur enregistre ses revenus (salaires, freelance, revenus passifs) et ses dépenses (manuelle ou import CSV). L'IA catégorise automatiquement chaque transaction (Alimentation, Transport, Loisirs, Santé, Logement…)."),
                createBulletPoint("Enveloppes budgétaires 50/30/20 : ", "Système d'enveloppes inspiré de la règle financière 50/30/20 : 50% Besoins, 30% Envies, 20% Épargne. Des alertes push sont émises dès qu'un seuil est atteint."),
                createBulletPoint("Objectifs d'épargne : ", "L'utilisateur crée des objectifs financiers (Voyage, Fonds d'urgence, Achat) avec montant cible et date butoir. L'IA calcule la contribution mensuelle nécessaire et recommande des résiliations d'abonnements pour accélérer l'atteinte de l'objectif."),
                createBulletPoint("Tableaux de bord & rapports : ", "Graphiques circulaires et barres mensuelles (Victory Native). Rapport PDF mensuel automatique incluant solde, flux par catégorie et économies réalisées grâce aux résiliations."),

                createHeading2("Module 2 — Gestion & Résiliation des Abonnements"),
                createParagraph("Le module de gestion des abonnements repose sur trois briques logicielles :"),
                createBulletPoint("1. Extraction automatique par IA (Email Scanner) : ", "L'utilisateur connecte son compte de messagerie en lecture seule (scopes gmail.readonly). Le modèle Llama 3 (sur Groq Cloud) analyse les e-mails de facturation pour extraire le marchand, le prix, la date d'échéance et la périodicité. Les données sont ajoutées automatiquement au portefeuille d'abonnements et intégrées dans le budget global."),
                createBulletPoint("2. Surveillance active & Notifications : ", "Trimly génère des rappels locaux (Expo Notifications) 3 jours, 2 jours et le jour même du prélèvement. Pour les essais gratuits, une alerte est programmée 48h avant la fin."),
                createBulletPoint("3. Résiliation en 1-clic (LRAR) : ", "L'application génère une lettre recommandée avec accusé de réception (LRAR) conforme à la réglementation. Le workflow n8n transmet le PDF à l'API Maileva (La Poste) qui imprime, met sous pli et expédie physiquement le recommandé papier."),

                createHeading2("La Synergie Unique Budget ↔ Abonnements"),
                createCalloutBox("L'avantage compétitif de Trimly réside dans la connexion directe entre les deux modules : les dépenses d'abonnements sont automatiquement comptabilisées dans les enveloppes budgétaires, permettant à l'IA de générer des insights uniques tels que : « Vos abonnements représentent 34% de votre budget Loisirs. En résiliant Gym (450 DH/mois) et Duolingo Plus (30 DH/mois), vous atteignez votre objectif Voyage 3 mois plus tôt. »"),

                createHeading2("Architecture Logicielle du MVP"),
                createBulletPoint("Interface mobile : ", "Bâtie en React Native 0.81 et Expo SDK 54, offrant une fluidité native sur iOS et Android."),
                createBulletPoint("Backend serverless : ", "Supabase (PostgreSQL) avec Row-Level Security (RLS) pour isoler hermétiquement les données de chaque utilisateur."),
                createBulletPoint("Mode local-first (Invité) : ", "Les utilisateurs soucieux de la confidentialité peuvent utiliser le module budgeting complet sans créer de compte. Toutes les données sont stockées localement via AsyncStorage."),
                createBulletPoint("Stockage des clés : ", "Les jetons OAuth de messagerie sont chiffrés dans le trousseau sécurisé de l'appareil (iOS Keychain / Android KeyStore)."),

                createHeading2("Feuille de Route Produit"),
                createBulletPoint("Connecteur Outlook & import CSV bancaire : ", "Intégration Microsoft Graph API + import de relevés bancaires CSV pour alimenter automatiquement le module budgeting."),
                createBulletPoint("OCR de factures physiques : ", "Module de numérisation de factures et reçus papier par prise de photo pour enrichir le suivi des dépenses."),
                createBulletPoint("Moteur d'affiliation alternatives : ", "Recommandation in-app d'offres de substitution moins chères (forfaits mobiles, internet, énergie) générant des commissions."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 7 : ÉTUDE DE MARCHÉ =================
                createHeading1("4. Étude de Marché"),
                createParagraph("L'étude de marché de Trimly s'appuie sur l'analyse de son persona de référence, le dimensionnement de son marché potentiel (TAM/SAM/SOM) et son positionnement face aux acteurs financiers existants."),

                createHeading2("Le Persona Client Cible : Alex, le Multi-abonné"),
                createParagraph("Alex, 28 ans, designer indépendant, vit en zone urbaine. Il cumule Spotify (10,99 € / 110 DH), Netflix (15,99 € / 160 DH), ChatGPT Pro (24,00 € / 240 DH), Adobe CC (62,99 € / 630 DH), NordVPN (9,99 € / 100 DH), iCloud (2,99 € / 30 DH) et un abonnement à sa salle de sport (49,99 € / 500 DH). Total mensuel : 171,94 € / 1 720 DH d'abonnements. Alex a conscience qu'il perd de l'argent sur son VPN et sa salle de sport mais la lourdeur des démarches administratives l'amène à repousser la résiliation. Il refuse d'utiliser les applications de budget traditionnelles qui exigent ses identifiants bancaires par crainte du piratage."),

                createHeading2("Dimensionnement du Marché (TAM / SAM / SOM)"),
                createBulletPoint("TAM (Total Addressable Market) : ", "250 millions d'utilisateurs de smartphones gérant leurs finances en Europe."),
                createBulletPoint("SAM (Serviceable Addressable Market) : ", "35 millions d'utilisateurs Gen Z / Millennials multi-abonnés (disposant de plus de 5 abonnements actifs) en France et pays limitrophes."),
                createBulletPoint("SOM (Serviceable Obtainable Market) : ", "1,5 million d'utilisateurs actifs payants visés en 3 ans, représentant 5% de notre SAM."),

                createHeading2("Analyse Comparative de la Concurrence"),
                createParagraph("Voici notre positionnement par rapport aux solutions existantes sur le marché :"),
                new Paragraph({ spacing: { before: 120, after: 120 } }),

                // COMPETITORS TABLE WITH HIGHLIGHTED COLUMN & CENTRED ALIGNMENT
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    rows: [
                        new TableRow({
                            children: [
                                createTableHeaderCell("Critères de comparaison"),
                                createTableHeaderCell("Trimly (Notre Solution)"),
                                createTableHeaderCell("Bankin' / Linxo"),
                                createTableHeaderCell("Bobby / Subby"),
                                createTableHeaderCell("Lettres en ligne")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Détection automatique", { bold: true }),
                                createTableCell("Oui (IA scan mail)", { fill: "ECE5D8", bold: true }),
                                createTableCell("Oui (Synchro bancaire)"),
                                createTableCell("Non (Saisie manuelle)"),
                                createTableCell("Non")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Sécurité d'accès", { bold: true }),
                                createTableCell("Excellente (Pas de banque)", { fill: "ECE5D8", bold: true, color: "A34839" }),
                                createTableCell("Réticences (Banque obligatoire)"),
                                createTableCell("Excellente (Local-first)"),
                                createTableCell("Bonne (Portail web)")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Résiliation LRAR intégrée", { bold: true }),
                                createTableCell("Oui (Physique en 1-clic)", { fill: "ECE5D8", bold: true, color: "A34839" }),
                                createTableCell("Non (Aucun envoi)"),
                                createTableCell("Non (Saisie simple)"),
                                createTableCell("Oui (Service en ligne)")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Version hors-ligne", { bold: true }),
                                createTableCell("Oui (Mode Invité)", { fill: "ECE5D8", bold: true }),
                                createTableCell("Non (Cloud requis)"),
                                createTableCell("Oui (Local uniquement)"),
                                createTableCell("Non (Site web)")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Tarif moyen constaté", { bold: true }),
                                createTableCell("Freemium (4,99 € / 50 DH /mois)", { fill: "ECE5D8", bold: true }),
                                createTableCell("Freemium (~5,00 € / 50 DH /mois)"),
                                createTableCell("Gratuit / Achat unique"),
                                createTableCell("À l'acte (7,90 € - 12 € / 80 - 120 DH)")
                            ]
                        })
                    ]
                }),
                new Paragraph({ spacing: { before: 120 } }),

                createHeading2("Positionnement Stratégique"),
                createParagraph("Trimly se démarque par sa proposition de valeur unique : il résout le problème de la résiliation postal (ce que les banques et agrégateurs classiques ignorent à cause de la complexité logistique) tout en conservant une approche d'importation sans connexion bancaire, éliminant ainsi le frein principal lié à la sécurité."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 9 : STRATÉGIE MARKETING =================
                createHeading1("5. Stratégie Marketing et Commerciale"),
                createParagraph("Notre objectif commercial est d'acquérir de manière rentable des utilisateurs qualifiés en maintenant un coût d'acquisition client (CAC) bas grâce à des leviers organiques, SEO et viraux."),

                createHeading2("Structure Tarifaire"),
                createBulletPoint("Version Gratuite (Freemium) : ", "Accès au module budgeting limité (5 catégories, saisie manuelle des dépenses) et à la saisie de 5 abonnements au maximum. Alertes locales basiques. Pas de synchronisation cloud, ni de scan IA, ni d'export PDF."),
                createBulletPoint("Abonnement Trimly Pro : ", "Période d'essai gratuite de 14 jours (sans carte requise). Formule mensuelle à 4,99 € / 50 DH et formule annuelle à 49,99 € / 500 DH (~4,16 € / 42 DH par mois). Donne accès aux fonctionnalités complètes : budget illimité avec catégories personnalisées, objectifs d'épargne, tableaux de bord et rapports PDF mensuels, scan mail IA illimité, alertes intelligentes et synchronisation cloud Supabase."),
                createBulletPoint("Résiliation LRAR postale à l'acte : ", "Facturée 7,99 € / 80 DH par pli recommandé officiel envoyé (coût brut Maileva ~5,50 € / 55 DH, marge unitaire de 2,49 € / 25 DH)."),

                createHeading2("Canaux d'Acquisition Client"),
                createBulletPoint("1. ASO & Référencement Organique (SEO) : ", "Optimisation des fiches d'App Store autour des requêtes de désabonnement et de gestion de budget. Rédaction d'articles SEO ciblés sur les guides de désabonnement de marchands spécifiques (ex. « comment résilier ma salle de sport »)."),
                createBulletPoint("2. Micro-influenceurs Finance & Épargne : ", "Partenariats avec des créateurs sur TikTok et Instagram axés sur le minimalisme financier, l'épargne et les astuces de budget."),
                createBulletPoint("3. Boucle Virale de Parrainage : ", "Chaque abonné annuel Trimly Pro parrainant un nouvel utilisateur annuel reçoit 1 mois Pro gratuit, et son filleul bénéficie de la même offre."),

                createHeading2("Validation Landing Page & Inscriptions"),
                createParagraph("Notre landing page a été déployée en conditions réelles avec des visuels de l'application et un formulaire de pré-inscription. En 2 semaines, elle a collecté 60 e-mails qualifiés pour 500 visites uniques, affichant un taux de conversion de 12%, ce qui démontre le fort intérêt des consommateurs."),

                createHeading2("Stratégie pour les 100 Premiers Clients"),
                createParagraph("Les 60 inscrits sur notre liste d'attente recevront des invitations prioritaires avec 3 mois de Trimly Pro gratuits en échange de retours d'utilisation. Le produit sera soumis sur Product Hunt et relayé au sein des réseaux étudiants et de l'écosystème OFPPT pour amorcer la base utilisateur."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 11 : PLAN FINANCIER =================
                createHeading1("6. Modèle Économique & Plan Financier"),
                createParagraph("Les prévisions financières de Trimly confirment la rentabilité du projet. Nos coûts de fonctionnement variables (Supabase et les requêtes Groq API) étant extrêmement légers, l'activité dégage d'importantes marges."),

                createHeading2("Structure des Coûts variables (COGS) par Utilisateur"),
                createBulletPoint("Coût API d'extraction IA (Groq Cloud) : ", "0,01 € / 0,10 DH par scan complet (modèle Llama 3 70B). Pour 12 scans mensuels par an, le coût est de 0,12 € / 1,20 DH par an par utilisateur."),
                createBulletPoint("Coût infrastructure cloud (Supabase) : ", "0,05 € / 0,50 DH par utilisateur actif par an (calculé sur le forfait Supabase Pro à 25 $/mois réparti sur 100 000 utilisateurs actifs)."),
                createBulletPoint("Coût de notification push : ", "0,00 DH (inclus dans l'écosystème Expo/Google Firebase)."),
                createBulletPoint("Total des coûts variables (COGS) par utilisateur Pro/An : ", "0,17 € / 1,70 DH par an."),

                createHeading2("Analyse de la Marge sur l'Abonnement Pro Annuel"),
                createParagraph("Sur une vente de formule Trimly Pro Annuel à 49,99 € / 500 DH TTC :"),
                createBulletPoint("TVA (20%) : ", "-8,33 € / -83,30 DH"),
                createBulletPoint("Commission Stores Apple/Google (15% - Tarif PME) : ", "-7,50 € / -75,00 DH"),
                createBulletPoint("Coûts variables (COGS) d'infrastructure : ", "-0,17 € / -1,70 DH"),
                createBulletPoint("Marge nette Trimly par abonnement Pro Annuel : ", "33,99 € / 340,00 DH (soit un taux de marge nette de 68.0%)."),

                createHeading2("Prévisions Financières - Exercice 1 (Trimestrielles)"),
                createParagraph("Voici notre tableau de projections financières consolidé pour la première année d'activité (en Euros et en Dirhams, avec 1 € = 10 DH) :"),
                new Paragraph({ spacing: { before: 120, after: 120 } }),

                // FINANCIALS TABLE WITH ALTERNATING ROWS, CENTRED ALIGNMENT & DIRHAMS
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    rows: [
                        new TableRow({
                            children: [
                                createTableHeaderCell("Indicateurs Financiers"),
                                createTableHeaderCell("Trimestre 1"),
                                createTableHeaderCell("Trimestre 2"),
                                createTableHeaderCell("Trimestre 3"),
                                createTableHeaderCell("Trimestre 4"),
                                createTableHeaderCell("Total Année 1")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Abonnés Payants Actifs (fin de période)", { bold: true }),
                                createTableCell("300", { alignment: AlignmentType.CENTER }),
                                createTableCell("1 200", { alignment: AlignmentType.CENTER }),
                                createTableCell("3 000", { alignment: AlignmentType.CENTER }),
                                createTableCell("6 000", { alignment: AlignmentType.CENTER }),
                                createTableCell("6 000", { alignment: AlignmentType.CENTER, bold: true, fill: "F7F5F0" })
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Chiffre d'Affaires Brut", { bold: true }),
                                createTableCell("2 100 €\n(21 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("8 400 €\n(84 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("21 000 €\n(210 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("42 000 €\n(420 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("73 500 €\n(735 000 DH)", { alignment: AlignmentType.CENTER, bold: true, color: "A34839", fill: "F7F5F0" })
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Coûts Variables directes (COGS)", { bold: true }),
                                createTableCell("480 €\n(4 800 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("1 920 €\n(19 200 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("4 800 €\n(48 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("10 100 €\n(101 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("17 300 €\n(173 000 DH)", { alignment: AlignmentType.CENTER, bold: true, fill: "F7F5F0" })
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Charges Fixes", { bold: true }),
                                createTableCell("5 500 €\n(55 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("4 000 €\n(40 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("4 000 €\n(40 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("4 000 €\n(40 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("17 500 €\n(175 000 DH)", { alignment: AlignmentType.CENTER, bold: true, fill: "F7F5F0" })
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Bénéfice Net (Avant Impôts)", { bold: true }),
                                createTableCell("-3 880 €\n(-38 800 DH)", { alignment: AlignmentType.CENTER, color: "A34839" }),
                                createTableCell("2 480 €\n(24 800 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("12 200 €\n(122 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("27 900 €\n(279 000 DH)", { alignment: AlignmentType.CENTER }),
                                createTableCell("38 700 €\n(387 000 DH)", { alignment: AlignmentType.CENTER, bold: true, color: "A34839", fill: "ECE5D8" })
                            ]
                        })
                    ]
                }),
                new Paragraph({ spacing: { before: 120 } }),

                createHeading2("Seuil de Rentabilité"),
                createParagraph("Nos charges fixes courantes s'élèvent à 1 500 € / 15 000 DH par mois (serveurs, marketing d'acquisition, support). Avec un revenu net moyen lissé de 2,80 € / 28 DH par utilisateur Pro par mois, le point mort est atteint avec 535 abonnés payants actifs. Nos projections indiquent que ce seuil sera dépassé au cours du 5ème mois d'activité."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 13 : PLAN OPÉRATIONNEL =================
                createHeading1("7. Plan Opérationnel"),
                createParagraph("Cette section présente l'organisation des opérations de Trimly, de l'interaction de l'utilisateur à l'expédition postale de la lettre de résiliation par La Poste."),

                createHeading2("Processus Logistique LRAR Pas-à-Pas"),
                createBulletPoint("1. Commande de l'utilisateur : ", "L'utilisateur valide son intention de résilier un abonnement dans l'application mobile Trimly. Un appel API (Webhook) sécurisé est envoyé à notre plateforme d'orchestration n8n."),
                createBulletPoint("2. Validation et Génération : ", "Le serveur n8n vérifie la validité du token JWT de l'utilisateur et génère un PDF conforme aux normes postales françaises (placement des adresses, mise en page, formules de politesse)."),
                createBulletPoint("3. Envoi postal par API : ", "n8n transmet le PDF et les coordonnées de distribution à l'API officielle de Maileva (La Poste) qui imprime, met sous pli et expédie physiquement le recommandé (LRAR) au destinataire."),
                createBulletPoint("4. Suivi et Notification : ", "L'API retourne le numéro de suivi postal. n8n met à jour le statut dans la base de données Supabase et émet une notification push (Expo Push) à l'utilisateur."),

                createHeading2("Structure Juridique Cible"),
                createParagraph("Au lancement, le projet sera exploité sous le statut d'Auto-entrepreneur (au Maroc pour la créatrice Aya Naimi). Lors de la levée de fonds Seed, la structure évoluera vers une SASU ou une SAS basée à Casablanca, facilitant les intégrations de passerelles de paiement internationales et la facturation."),

                createHeading2("Ressources Requises pour le Lancement"),
                createBulletPoint("Outils & Stores : ", "Compte développeur Apple Developer (99 $/an / 1 000 DH) et Google Play Console (25 $ / 250 DH unique)."),
                createBulletPoint("Audit Google CASA Tier 2 : ", "Un budget initial de 15 000 DH est requis pour financer l'audit de sécurité obligatoire imposé par Google pour l'accès en lecture seule aux boîtes mails Gmail."),
                createBulletPoint("Trésorerie d'affranchissement : ", "Un montant initial de 10 000 DH est placé sur le compte Maileva pour préfinancer les envois postaux recommandés."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 14 : ÉQUIPE =================
                createHeading1("8. Équipe Projet"),
                createParagraph("L'équipe fondatrice détient les compétences techniques clés pour assurer le développement et la livraison opérationnelle du produit."),

                createHeading2("Rôle et Compétences de la Fondatrice"),
                createBulletPoint("Aya Naimi - Fondatrice & Directrice Technique (CTO) : ", "Étudiante en filière Développement Digital (Option Génie Logiciel) à l'OFPPT. Conceptrice de l'architecture logicielle de Trimly, Aya a développé le code React Native, configuré la base Supabase et modélisé l'intégration d'orchestration sous n8n. Elle est responsable de l'évolution technique et de la maintenance du produit."),

                createHeading2("Plan de Recrutement Complémentaire"),
                createParagraph("Pour combler nos besoins non techniques, deux profils clés seront recrutés à court terme :"),
                createBulletPoint("Mois 3 (Freelance) - Responsable Growth Marketing : ", "Chargé de piloter le SEO, l'ASO sur les stores et d'animer les partenariats de micro-influence."),
                createBulletPoint("Mois 6 (CDI/Stage) - Chargé d'Opérations Clients : ", "Responsable du support client in-app et du suivi logistique des recommandés auprès de Maileva."),
                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 15 : FEUILLE DE ROUTE & RISQUES =================
                createHeading1("9. Feuille de Route & Risques"),
                createParagraph("Cette section présente les jalons opérationnels sur 12 mois ainsi que les risques majeurs identifiés et leurs plans d'atténuation."),

                createHeading2("Feuille de Route 12 Mois (Roadmap)"),
                createBulletPoint("Mois 1 à 3 : Lancement Store & Audit : ", "Finalisation du connecteur Outlook. Passage de l'audit Google CASA. Bêta test privée (100 testeurs) et publication officielle sur les stores."),
                createBulletPoint("Mois 4 à 6 : Croissance & OCR : ", "Partenariats micro-influenceurs. Déploiement du module OCR pour la numérisation des factures papier. Objectif : 1 000 abonnés payants."),
                createBulletPoint("Mois 7 à 12 : Affiliation & Équilibre : ", "Intégration du moteur d'affiliation. Atteinte de l'équilibre mensuel avec 5 000 abonnés payants."),

                createHeading2("Analyse des Risques & Actions Correctives"),
                createParagraph("Trois risques clés ont été identifiés pour le projet Trimly :"),
                new Paragraph({ spacing: { before: 120, after: 120 } }),

                // RISKS TABLE WITH ALTERNATING ROWS & CENTRED ALIGNMENT
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    rows: [
                        new TableRow({
                            children: [
                                createTableHeaderCell("Type de Risque"),
                                createTableHeaderCell("Description du Risque"),
                                createTableHeaderCell("Gravité (1-5)"),
                                createTableHeaderCell("Plan d'Atténuation")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Risque Technique (OAuth Google)", { bold: true }),
                                createTableCell("Rejet ou blocage des clés d'accès OAuth lors de l'audit CASA."),
                                createTableCell("4", { alignment: AlignmentType.CENTER }),
                                createTableCell("Limiter les scopes demandés au strict minimum et proposer le mode invité local-first (saisie manuelle assistée) comme alternative immédiate.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Risque de Marché (Concurrence)", { bold: true }),
                                createTableCell("Les banques traditionnelles ou néo-banques intègrent un service similaire in-app."),
                                createTableCell("3", { alignment: AlignmentType.CENTER, fill: "F7F5F0" }),
                                createTableCell("Se concentrer sur le service de résiliation postale LRAR automatisée que les banques ne veulent pas gérer à cause de la complexité logistique.", { fill: "F7F5F0" })
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Risque Financier (Churn)", { bold: true }),
                                createTableCell("Désabonnement des utilisateurs de Trimly une fois leurs résiliations effectuées."),
                                createTableCell("3", { alignment: AlignmentType.CENTER }),
                                createTableCell("Le module budgeting permanent (suivi mensuel revenus/dépenses, objectifs d'épargne, rapports PDF) crée un usage récurrent indépendant des résiliations, réduisant fortement le churn.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createTableCell("Risque Produit (Complexité)", { bold: true }),
                                createTableCell("Difficulté à positionner une application à double module (budget + abonnements) auprès d'utilisateurs cherchant une solution simple."),
                                createTableCell("2", { alignment: AlignmentType.CENTER, fill: "F7F5F0" }),
                                createTableCell("Onboarding progressif : l'utilisateur commence par le budgeting simple, puis découvre le module abonnements. Les deux modules sont accessibles depuis la même interface unifiée.", { fill: "F7F5F0" })
                            ]
                        })
                    ]
                }),
                new Paragraph({ spacing: { before: 120 } }),

                new Paragraph({ children: [new PageBreak()] }),

                // ================= PAGE 16 : ANNEXES =================
                createHeading1("10. Annexes"),
                createParagraph("Cette section présente la méthodologie d'enquête terrain et les formules mathématiques exploitées pour valider le modèle financier."),

                createHeading2("Annexe A : Le Questionnaire d'Enquête"),
                createBulletPoint("Question 1 : ", "« Combien d'abonnements payants actifs (streaming, cloud, sport, presse) possédez-vous actuellement ? » (Moyenne : 6,2)."),
                createBulletPoint("Question 2 : ", "« Avez-vous déjà oublié de résilier un abonnement avant son renouvellement automatique ? » (Oui : 84%)."),
                createBulletPoint("Question 3 : ", "« Seriez-vous prêt à confier l'analyse de vos abonnements à une IA en connectant votre boîte mail de manière sécurisée (sans accès bancaire) ? » (Oui : 72%, Non/Hésitant : 28%)."),

                createHeading2("Annexe B : Équation de la Valeur Vie Client (LTV)"),
                createParagraph("Le calcul de la LTV est basé sur la formule suivante (exprimé en deux devises) :"),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 },
                    children: [
                        new TextRun({
                            text: "LTV = ( Revenu Moyen Mensuel Net × Durée de Rétention Moyenne ) + Marge Moyenne LRAR par Client",
                            font: "Calibri",
                            size: 20,
                            bold: true,
                            color: "A34839"
                        })
                    ]
                }),
                createParagraph("En Euros : LTV = ( 2,80 € × 18 mois ) + 2,49 € = 52,89 €. Retenu : 45,00 €.\nEn Dirhams : LTV = ( 28 DH × 18 mois ) + 24,90 DH = 528,90 DH. Retenu : 450,00 DH."),

                createHeading2("Annexe C : Captures d'Écran du MVP & Landing Page"),
                createParagraph("[Note : Les captures d'écran réelles du tableau de bord de l'application mobile React Native avec les graphiques Skia et Victory Native, ainsi que le schéma de workflow d'automatisation n8n, sont intégrées dans le dossier numérique compressé d'accompagnement de la soutenance.]")
            ]
        }
    ]
});

// Write to file with fallback
Packer.toBuffer(doc).then((buffer) => {
    try {
        fs.writeFileSync("Business_Plan_Trimly.docx", buffer);
        console.log("Business_Plan_Trimly.docx has been re-generated successfully with improved styling and DH currencies!");
    } catch (e) {
        if (e.code === 'EBUSY') {
            fs.writeFileSync("Business_Plan_Trimly_Final.docx", buffer);
            console.log("Business_Plan_Trimly.docx was busy/open. Saved as Business_Plan_Trimly_Final.docx instead!");
        } else {
            throw e;
        }
    }
}).catch((err) => {
    console.error("Error creating document:", err);
});
