const fs = require('fs');
const code = fs.readFileSync('src/screens/Auth/LoginScreen.js', 'utf8');
const lines = code.split('\n');

let braceCount = 0;
let inString = null;
let inComment = false;

for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum - 1];
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inComment) {
      if (inComment === 'line') {
        // Line comment ends at the end of the string, so we handle it outside the loop
      } else if (inComment === 'block' && char === '*' && nextChar === '/') {
        inComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      if (char === '\\') {
        i++;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '/' && nextChar === '/') {
      inComment = 'line';
      break; // Skip rest of the line
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

    if (char === '{') {
      braceCount++;
    }
    if (char === '}') {
      braceCount--;
    }
  }

  if (inComment === 'line') {
    inComment = false;
  }

  if (lineNum >= 447 && lineNum <= 1382) {
    console.log(`Line ${lineNum}: braceCount = ${braceCount} | Content: ${line.substring(0, 40).trim()}`);
  }
}
