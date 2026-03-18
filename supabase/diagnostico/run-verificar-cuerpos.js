const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = url.split('//')[1]?.split('.')[0];
    const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
    if (projectId && password) {
      connectionString = `postgresql://postgres.${projectId}:${password}@aws-1-us-east-2.pooler.supabase.com:5432/postgres`;
    }
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Obtener el cuerpo de las funciones huérfanas sospechosas
  const funciones = [
    'desvincular_documento_de_paso',
    'validar_categoria_documento_paso',
    'vincular_documento_a_paso_fuente',
    'vincular_documento_subido_a_pendiente_mejorado',
    'actualizar_estado_documentacion_fuente',
    'limpiar_pendientes_fuente_inactiva',
    'limpiar_pendientes_fuente_eliminada',
  ];

  for (const nombre of funciones) {
    const r = await client.query(`
      SELECT p.proname, pg_get_functiondef(p.oid) AS cuerpo
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = $1
    `, [nombre]);

    if (r.rows.length === 0) {
      console.log(`\n✅ ${nombre}: NO EXISTE EN BD`);
      continue;
    }

    const cuerpo = r.rows[0].cuerpo;
    const referencias = [];
    if (cuerpo.includes('pasos_fuente_pago')) referencias.push('⚠️ REF: pasos_fuente_pago (ELIMINADA)');
    if (cuerpo.includes('documentos_pendientes')) referencias.push('⚠️ REF: documentos_pendientes (ELIMINADA)');
    if (cuerpo.includes('requisitos_fuentes_pago_config')) referencias.push('✅ REF: requisitos_fuentes_pago_config (activa)');
    if (cuerpo.includes('fuentes_pago')) referencias.push('✅ REF: fuentes_pago (activa)');
    if (cuerpo.includes('vista_documentos_pendientes')) referencias.push('✅ REF: vista_documentos_pendientes_fuentes (activa)');

    console.log(`\n--- ${nombre} ---`);
    if (referencias.length > 0) {
      referencias.forEach(r => console.log(`  ${r}`));
    } else {
      console.log('  Sin referencias a tablas críticas');
    }
  }

  await client.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
