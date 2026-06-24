const docx = require('docx');
const fs = require('fs');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } = docx;

// Créer le document
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Page de couverture
      new Paragraph({
        text: "BUSINESS PLAN",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: "TRIMLY",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "TRIMLY",
            bold: true,
            size: 48,
            color: "5B3BF5"
          })
        ]
      }),
      new Paragraph({
        text: "Application Mobile de Gestion Budgétaire et d'Abonnements",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: "2026",
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      }),
    ]
  }]
});

console.log('Génération du document...');

// Sauvegarder
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Trimly_Business_Plan.docx", buffer);
  console.log('✓ Business Plan créé: Trimly_Business_Plan.docx');
});
