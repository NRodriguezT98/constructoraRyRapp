const fs = require('fs');

const files = [
  'src/modules/documentos/services/documentos-eliminacion.service.ts',
  'src/modules/documentos/services/documentos-reemplazo.service.ts',
  'src/modules/documentos/services/documentos-versiones.service.ts',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  let original = c;

  // Fix broken .from( as any) -> .from(tabla as any)
  c = c.split('.from( as any)').join('.from(tabla as any)');

  // Also fix .from(config.tabla as any) if broken somehow
  c = c.split('.from( as any)').join('.from(config.tabla as any)');

  // Now add `as any` to remaining .from(tabla) calls that don't have it
  c = c.replace(/\.from\(tabla\)(?!\s*\.)/g, '.from(tabla as any)');
  c = c.replace(/\.from\(config\.tabla\)(?!\s*\.)/g, '.from(config.tabla as any)');

  // Also pattern .from(tabla)\n  .select -> .from(tabla as any)\n  .select
  c = c.replace(/\.from\(tabla\)\s*\n/g, '.from(tabla as any)\n');
  c = c.replace(/\.from\(config\.tabla\)\s*\n/g, '.from(config.tabla as any)\n');

  if (c !== original) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('Fixed: ' + f);
  } else {
    console.log('No change: ' + f);
  }
}
console.log('Done.');
