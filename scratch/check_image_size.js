const fs = require('fs');
const path = require('path');

function getPNGDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PNG width is at bytes 16-19, height is at 20-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

try {
  const mockupPath = path.join(__dirname, 'assets', 'iphone14-mockup.png');
  const size = getPNGDimensions(mockupPath);
  console.log('Mockup size:', size, 'Aspect Ratio:', size.height / size.width);
} catch (err) {
  console.error(err);
}
