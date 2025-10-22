# 🚀 Ejecutar Migraciones desde VS Code (Sin psql)

## ✅ Credenciales ya configuradas en .env.local:
- ✅ Service Role Key
- ✅ Database URL

---

## 🎯 Método 1: Usar Supabase Dashboard directamente desde VS Code

### Paso 1: Abrir SQL Editor
1. Click aquí para abrir directamente:
   **[Supabase SQL Editor](https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new)**

### Paso 2: Ejecutar migraciones en orden

#### 🔹 Migración 1: Estados de Clientes
1. Abre: `supabase/migrations/001_actualizar_estados_clientes.sql`
2. **Ctrl+A** (seleccionar todo)
3. **Ctrl+C** (copiar)
4. Pega en SQL Editor de Supabase
5. Click en **▶ Run**
6. ✅ Verifica que diga "Success"

#### 🔹 Migración 2: Estados de Viviendas
1. Abre: `supabase/migrations/002_actualizar_estados_viviendas.sql`
2. **Ctrl+A**, **Ctrl+C**
3. Pega en SQL Editor
4. Click en **▶ Run**
5. ✅ Verifica "Success"

#### 🔹 Migración 3: Estados de Negociaciones
1. Abre: `supabase/migrations/003_actualizar_estados_negociaciones.sql`
2. **Ctrl+A**, **Ctrl+C**
3. Pega en SQL Editor
4. Click en **▶ Run**
5. ✅ Verifica "Success"

#### 🔹 Migración 4: Tabla Renuncias
1. Abre: `supabase/migrations/004_actualizar_tabla_renuncias.sql`
2. **Ctrl+A**, **Ctrl+C**
3. Pega en SQL Editor
4. Click en **▶ Run**
5. ✅ Verifica "Success"

#### 🔹 Migración 5: Validaciones Finales
1. Abre: `supabase/migrations/005_validaciones_finales.sql`
2. **Ctrl+A**, **Ctrl+C**
3. Pega en SQL Editor
4. Click en **▶ Run**
5. ✅ Verifica "Success"

---

## 🎯 Método 2: Extensión PostgreSQL para VS Code

### Instalar extensión:
1. En VS Code, presiona **Ctrl+Shift+X**
2. Busca: **"PostgreSQL"** (por Chris Kolkman)
3. Click en **Install**

### Configurar conexión:
1. Presiona **Ctrl+Shift+P**
2. Escribe: **"PostgreSQL: New Query"**
3. Cuando pida la conexión, usa:
   ```
   postgresql://postgres.swyjhwgvkfcfdtemkyad:Wx8EwiZFhsPcHzAr@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

### Ejecutar migraciones:
1. Abre cada archivo `.sql` en VS Code
2. Click derecho → **"Run Query"**
3. O presiona **F5**

---

## 🎯 Método 3: REST API desde VS Code (Más simple)

Voy a crear un script Node.js que ejecuta las migraciones usando fetch:

```javascript
// ejecutar-migraciones.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const migrations = [
  '001_actualizar_estados_clientes.sql',
  '002_actualizar_estados_viviendas.sql',
  '003_actualizar_estados_negociaciones.sql',
  '004_actualizar_tabla_renuncias.sql',
  '005_validaciones_finales.sql'
]

for (const migration of migrations) {
  const sql = await fs.readFile(`supabase/migrations/${migration}`, 'utf-8')
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    console.error(`❌ Error en ${migration}:`, error)
    break
  }
  console.log(`✅ ${migration} ejecutado`)
}
```

---

## ✅ Validación Post-Migración

Después de ejecutar todas las migraciones, ejecuta esto en SQL Editor:

```sql
-- Verificar estados de todas las tablas
SELECT 'clientes' as tabla, estado, COUNT(*) as cantidad
FROM clientes GROUP BY estado
UNION ALL
SELECT 'viviendas', estado, COUNT(*)
FROM viviendas GROUP BY estado
UNION ALL
SELECT 'negociaciones', estado, COUNT(*)
FROM negociaciones GROUP BY estado
UNION ALL
SELECT 'renuncias', estado, COUNT(*)
FROM renuncias GROUP BY estado;
```

---

## 🎯 RECOMENDACIÓN: Método 1 (Dashboard)

El **Método 1** es el más simple y no requiere instalar nada:
1. ✅ Ya tienes las credenciales
2. ✅ Solo copiar y pegar cada SQL
3. ✅ Interfaz visual con feedback inmediato
4. ✅ No hay que instalar extensiones

**¿Empezamos con el Método 1?** 🚀
