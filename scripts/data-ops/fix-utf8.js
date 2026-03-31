// Fix UTF-8 Encoding for all TypeScript/React files
const fs = require('fs');
const path = require('path');

const replacements = {
  // Emojis mal codificados
  'ðŸŽ¨': '🎨',

  // Símbolos
  '€¢': '•',

  // Vocales con tilde
  'Ã³': 'ó',
  'Ã­': 'í',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã"': 'Ó',
  'Ã': 'Í',
  'Ã': 'Á',
  'Ã‰': 'É',
  'Ãš': 'Ú',
  'Ã'': 'Ñ'
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [bad, good] of Object.entries(replacements)) {
      if (content.includes(bad)) {
        content = content.replaceAll(bad, good);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error en ${filePath}:`, error.message);
    return 0;
  }
}

function walkDir(dir) {
  let fixed = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build'].includes(file)) {
        fixed += walkDir(filePath);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fixed += fixFile(filePath);
    }
  }

  return fixed;
}

console.log('\n🔤 Arreglando encoding UTF-8...\n');
const totalFixed = walkDir('./src/modules/viviendas');
console.log(`\n✅ Total: ${totalFixed} archivos corregidos\n`);
