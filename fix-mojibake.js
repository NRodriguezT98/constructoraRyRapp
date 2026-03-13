const fs = require('fs');
const path = require('path');

// Map: double-encoded UTF-8 sequences -> correct characters
// These were UTF-8 bytes (C3 xx) read as Latin-1, giving "Ã" + some char,
// then re-saved as UTF-8, producing 4 bytes instead of 2.
const replacements = [
  // Most common Spanish characters
  ['\u00C3\u00A9', '\u00E9'], // Ã© -> é
  ['\u00C3\u00AD', '\u00ED'], // Ã­ -> í
  ['\u00C3\u00B3', '\u00F3'], // Ã³ -> ó
  ['\u00C3\u00BA', '\u00FA'], // Ãº -> ú
  ['\u00C3\u00A1', '\u00E1'], // Ã¡ -> á
  ['\u00C3\u00B1', '\u00F1'], // Ã± -> ñ
  ['\u00C3\u0093', '\u00D3'], // Ã" -> Ó
  ['\u00C3\u0089', '\u00C9'], // Ã‰ -> É
  ['\u00C3\u009A', '\u00DA'], // Ãš -> Ú
  ['\u00C3\u0081', '\u00C1'], // Ã€ -> Á (actually Á is C1)
  ['\u00C3\u00A0', '\u00E0'], // Ã  -> à (à)
  ['\u00C3\u009C', '\u00DC'], // Ãœ -> Ü
  ['\u00C3\u00BC', '\u00FC'], // Ã¼ -> ü
  ['\u00C3\u00A4', '\u00E4'], // Ã¤ -> ä
  ['\u00C3\u00B6', '\u00F6'], // Ã¶ -> ö
  // Uppercase A variants
  ['\u00C3\u0080', '\u00C0'], // À
  // Emojis that got double-encoded (common culprits)
  // â„¹ (U+2139 information) -> ℹ
  ['\u00E2\u0084\u00B9', '\u2139'],
  // â€™ (right single quote) -> '
  ['\u00E2\u0080\u0099', '\u2019'],
  // â€œ (left double quote) -> "
  ['\u00E2\u0080\u009C', '\u201C'],
  // â€ followed by special chars can vary - be careful
  // âœ… (U+2705 checkmark) -> ✅
  ['\u00E2\u009C\u0085', '\u2705'],
  // âŒ (U+274C cross) -> ❌
  ['\u00E2\u008C', '\u274C'],
  // â—ï¸ - skip (too ambiguous)
  // Punctuation
  ['\u00C2\u00BF', '\u00BF'], // Â¿ -> ¿
  ['\u00C2\u00A1', '\u00A1'], // Â¡ -> ¡
  ['\u00C2\u00B7', '\u00B7'], // Â· -> ·
];

function getAllTsFiles(dir) {
  const results = [];
  let items;
  try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return results; }
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !['node_modules', '.next', '.git', 'dist'].includes(item.name)) {
      results.push(...getAllTsFiles(full));
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllTsFiles('src');
let filesFixed = 0;

for (const f of files) {
  const buf = fs.readFileSync(f);
  let content = buf.toString('utf8');
  let original = content;
  
  for (const [from, to] of replacements) {
    while (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed: ' + path.relative('src', f));
    filesFixed++;
  }
}
console.log('\nDone. Fixed ' + filesFixed + ' files.');
