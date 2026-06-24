const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = './Guide_Business_Plan.pdf';

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  console.log('=== CONTENU DU PDF ===\n');
  console.log(data.text);
  console.log('\n=== INFORMATIONS ===');
  console.log('Pages:', data.numpages);
  
  // Sauvegarder dans un fichier texte
  fs.writeFileSync('pdf_content.txt', data.text, 'utf8');
  console.log('\nContenu sauvegardé dans pdf_content.txt');
}).catch(error => {
  console.error('Erreur parsing PDF:', error);
});
