const fs = require('fs');
const code = fs.readFileSync('src/screens/Auth/LoginScreen.js', 'utf8');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let inString = null;
let inComment = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const nextChar = code[i + 1];

  if (inComment) {
    if (inComment === 'line' && char === '\n') {
      inComment = false;
    } else if (inComment === 'block' && char === '*' && nextChar === '/') {
      inComment = false;
      i++;
    }
    continue;
  }

  if (inString) {
    if (char === '\\') {
      i++; // skip next char
    } else if (char === inString) {
      inString = null;
    }
    continue;
  }

  if (char === '/' && nextChar === '/') {
    inComment = 'line';
    i++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inComment = 'block';
    i++;
    continue;
  }

  if (char === '"' || char === "'" || char === '`') {
    inString = char;
    continue;
  }

  if (char === '{') braceCount++;
  if (char === '}') {
    braceCount--;
    if (braceCount < 0) {
      console.log(`Unmatched '}' at character ${i}, line ${code.substring(0, i).split('\n').length}`);
      braceCount = 0;
    }
  }
  if (char === '(') parenCount++;
  if (char === ')') {
    parenCount--;
    if (parenCount < 0) {
      console.log(`Unmatched ')' at character ${i}, line ${code.substring(0, i).split('\n').length}`);
      parenCount = 0;
    }
  }
  if (char === '[') bracketCount++;
  if (char === ']') {
    bracketCount--;
    if (bracketCount < 0) {
      console.log(`Unmatched ']' at character ${i}, line ${code.substring(0, i).split('\n').length}`);
      bracketCount = 0;
    }
  }
}

console.log(`Final counts -> Braces: ${braceCount}, Parens: ${parenCount}, Brackets: ${bracketCount}`);
