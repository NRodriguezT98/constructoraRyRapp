const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

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

  // ─────────────────────────────────────────────────────────────────
  // 1. Funciones de trigger (retornan trigger) QUE NO TIENEN TRIGGER ACTIVO
  // ─────────────────────────────────────────────────────────────────
  const huerfanas = await client.query(`
    SELECT
      p.proname AS funcion,
      pg_get_function_identity_arguments(p.oid) AS argumentos,
      COALESCE(
        (SELECT STRING_AGG(c.relname, ', ')
         FROM pg_trigger t
         JOIN pg_class c ON c.oid = t.tgrelid
         WHERE t.tgfoid = p.oid AND NOT t.tgisinternal),
        'NINGUNO - POSIBLEMENTE HUÉRFANA'
      ) AS usada_en_tablas
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND p.prorettype = (SELECT oid FROM pg_type WHERE typname = 'trigger')
    ORDER BY p.proname
  `);

  // ─────────────────────────────────────────────────────────────────
  // 2. Triggers duplicados (mismo nombre en misma tabla para distinto evento o BEFORE/AFTER)
  // ─────────────────────────────────────────────────────────────────
  const duplicados = await client.query(`
    SELECT
      t.event_object_table AS tabla,
      t.trigger_name,
      COUNT(*) AS filas,
      STRING_AGG(t.event_manipulation || ' ' || t.action_timing, ' | ') AS detalles
    FROM information_schema.triggers t
    JOIN pg_trigger tr ON tr.tgname = t.trigger_name
    JOIN pg_class pc ON pc.oid = tr.tgrelid
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pn.nspname = 'public'
      AND NOT tr.tgisinternal
    GROUP BY t.event_object_table, t.trigger_name
    ORDER BY filas DESC, t.event_object_table
  `);

  // ─────────────────────────────────────────────────────────────────
  // 3. Funciones con nombre idéntico pero diferente firma (sobrecargas)
  // ─────────────────────────────────────────────────────────────────
  const similares = await client.query(`
    SELECT
      p.proname AS funcion,
      COUNT(*) AS versiones,
      STRING_AGG(pg_get_function_identity_arguments(p.oid), ' | ') AS firmas
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
    GROUP BY p.proname
    HAVING COUNT(*) > 1
    ORDER BY p.proname
  `);

  // ─────────────────────────────────────────────────────────────────
  // 4. Comentarios en funciones (para detectar las marcadas como "DESACTIVADO")
  // ─────────────────────────────────────────────────────────────────
  const comentadas = await client.query(`
    SELECT
      p.proname AS funcion,
      d.description AS comentario
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_description d ON d.objoid = p.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND d.description IS NOT NULL
    ORDER BY p.proname
  `);

  // ─────────────────────────────────────────────────────────────────
  // 5. Dos triggers INSERT en la misma tabla (posible doble creación)
  // ─────────────────────────────────────────────────────────────────
  const doblesInsert = await client.query(`
    SELECT
      t.event_object_table AS tabla,
      t.action_timing AS momento,
      t.event_manipulation AS evento,
      COUNT(*) AS cantidad,
      STRING_AGG(t.trigger_name, ', ') AS triggers
    FROM information_schema.triggers t
    JOIN pg_trigger tr ON tr.tgname = t.trigger_name
    JOIN pg_class pc ON pc.oid = tr.tgrelid
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE pn.nspname = 'public'
      AND NOT tr.tgisinternal
    GROUP BY t.event_object_table, t.action_timing, t.event_manipulation
    HAVING COUNT(*) > 1
    ORDER BY cantidad DESC, t.event_object_table
  `);

  console.log('\n==== FUNCIONES TRIGGER SIN TRIGGER ACTIVO (POSIBLEMENTE HUÉRFANAS) ====');
  huerfanas.rows.forEach(r => {
    console.log(`  [${r.usada_en_tablas === 'NINGUNO - POSIBLEMENTE HUÉRFANA' ? '❌ HUÉRFANA' : '✅ EN USO'}] ${r.funcion}() → ${r.usada_en_tablas}`);
  });

  console.log('\n==== FUNCIONES CON COMENTARIO "DESACTIVADO" ====');
  comentadas.rows.forEach(r => {
    console.log(`  📌 ${r.funcion}: ${r.comentario?.substring(0, 100)}...`);
  });

  console.log('\n==== MÚLTIPLES TRIGGERS MISMO EVENTO/MOMENTO EN UNA TABLA ====');
  doblesInsert.rows.forEach(r => {
    console.log(`  ⚠️  ${r.tabla} → ${r.momento} ${r.evento}: ${r.triggers}`);
  });

  console.log('\n==== FUNCIONES CON NOMBRE IDÉNTICO (SOBRECARGAS/DUPLICADOS) ====');
  similares.rows.forEach(r => {
    console.log(`  ⚠️  ${r.funcion} (${r.versiones} versiones): ${r.firmas}`);
  });

  // Guardar resultado completo
  fs.writeFileSync('supabase/diagnostico/resultado-analisis-profundo.json', JSON.stringify({
    huerfanas: huerfanas.rows,
    comentadas: comentadas.rows,
    doblesInsert: doblesInsert.rows,
    similares: similares.rows,
  }, null, 2));

  await client.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
