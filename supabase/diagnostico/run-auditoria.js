const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function run() {
  // Intentar obtener connection string
  let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    // Construir desde variables individuales
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = url.split('//')[1]?.split('.')[0];
    const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
    if (projectId && password) {
      connectionString = `postgresql://postgres.${projectId}:${password}@aws-1-us-east-2.pooler.supabase.com:5432/postgres`;
    }
  }

  if (!connectionString) {
    console.error('No se encontró connectionString. Variables disponibles:', Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('DATABASE') || k.includes('POSTGRES')));
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Conectado a BD');

  // 1. Triggers
  const triggers = await client.query(`
    SELECT
      t.trigger_name,
      t.event_object_table AS tabla,
      STRING_AGG(t.event_manipulation, '/' ORDER BY t.event_manipulation) AS eventos,
      t.action_timing AS momento,
      CASE
        WHEN tr.tgenabled = 'D' THEN 'DESHABILITADO'
        WHEN tr.tgenabled = 'O' THEN 'HABILITADO'
        WHEN tr.tgenabled = 'R' THEN 'REPLICA'
        WHEN tr.tgenabled = 'A' THEN 'SIEMPRE'
        ELSE tr.tgenabled::text
      END AS estado
    FROM information_schema.triggers t
    JOIN pg_trigger tr ON tr.tgname = t.trigger_name
    JOIN pg_class pc ON pc.oid = tr.tgrelid
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pn.nspname = 'public'
      AND NOT tr.tgisinternal
    GROUP BY t.trigger_name, t.event_object_table, t.action_timing, tr.tgenabled
    ORDER BY t.event_object_table, t.trigger_name
  `);

  // 2. Funciones
  const funciones = await client.query(`
    SELECT
      p.proname AS funcion,
      pg_get_function_identity_arguments(p.oid) AS argumentos,
      p.prosecdef AS security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
    ORDER BY p.proname
  `);

  // 3. Vistas
  const vistas = await client.query(`
    SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname
  `);

  const resultado = {
    triggers: triggers.rows,
    funciones: funciones.rows,
    vistas: vistas.rows.map(v => v.viewname),
  };

  fs.writeFileSync('supabase/diagnostico/resultado-auditoria-bd.json', JSON.stringify(resultado, null, 2));
  console.log(`\nRESUMEN:`);
  console.log(`  Triggers: ${triggers.rows.length}`);
  console.log(`  Funciones: ${funciones.rows.length}`);
  console.log(`  Vistas: ${vistas.rows.length}`);

  // Mostrar triggers DESHABILITADOS
  const deshabilitados = triggers.rows.filter(t => t.estado === 'DESHABILITADO');
  if (deshabilitados.length > 0) {
    console.log(`\n⚠️  TRIGGERS DESHABILITADOS (${deshabilitados.length}):`);
    deshabilitados.forEach(t => console.log(`  - ${t.trigger_name} en ${t.tabla}`));
  }

  // Mostrar todos los triggers agrupados por tabla
  console.log(`\n📋 TRIGGERS POR TABLA:`);
  const porTabla = {};
  triggers.rows.forEach(t => {
    if (!porTabla[t.tabla]) porTabla[t.tabla] = [];
    porTabla[t.tabla].push(`${t.estado === 'DESHABILITADO' ? '❌' : '✅'} ${t.trigger_name} (${t.eventos} ${t.momento})`);
  });
  Object.entries(porTabla).sort().forEach(([tabla, list]) => {
    console.log(`\n  ${tabla}:`);
    list.forEach(item => console.log(`    ${item}`));
  });

  // Mostrar todas las funciones
  console.log(`\n📋 FUNCIONES:`);
  funciones.rows.forEach(f => console.log(`  ${f.security_definer ? '🔐' : '  '} ${f.funcion}(${f.argumentos})`));

  // Mostrar vistas
  console.log(`\n📋 VISTAS:`);
  vistas.rows.forEach(v => console.log(`  - ${v.viewname}`));

  await client.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
