const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({ connectionString: process.env.DATABASE_URL })

client
  .connect()
  .then(async () => {
    const r = await client.query(
      "SELECT viewname FROM pg_views WHERE schemaname='public' AND viewname='fuentes_pago_con_entidad'"
    )
    console.log('fuentes_pago_con_entidad exists:', r.rows.length > 0)

    const r2 = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='fuentes_pago' AND column_name='carta_aprobacion_url'"
    )
    console.log('carta_aprobacion_url still exists:', r2.rows.length > 0)

    const r3 = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('pasos_fuente_pago', 'documentos_pendientes')"
    )
    console.log(
      'Old tables still exist:',
      r3.rows.map(r => r.tablename)
    )

    await client.end()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
