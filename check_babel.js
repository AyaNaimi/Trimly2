const fs = require('fs');
const babel = require('@babel/core');

try {
  const code = fs.readFileSync('src/screens/Auth/LoginScreen.js', 'utf8');
  babel.parseSync(code, {
    filename: 'src/screens/Auth/LoginScreen.js',
    presets: ['babel-preset-expo'],
  });
  console.log("SUCCESS: Babel parsed the file successfully!");
} catch (err) {
  console.error("BABEL PARSE ERROR:");
  console.error(err.message);
  console.error(err.stack);
}
