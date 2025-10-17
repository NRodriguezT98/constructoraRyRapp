# 🚀 Instrucciones para Ejecutar SQL en Supabase

## ⚠️ IMPORTANTE: Ejecutar en este orden exacto

### Paso 1: Migrar tabla clientes existente
**Archivo**: `migracion-clientes.sql`

Este script:
- ✅ Preserva los datos de clientes existentes
- ✅ Renombra la tabla antigua a `clientes_old`
- ✅ Crea la nueva estructura
- ✅ Migra los datos
- ✅ Mantiene las relaciones con viviendas y abonos

**Ejecutar**:
1. Ir a Supabase Dashboard
2. SQL Editor → New Query
3. Copiar TODO el contenido de `migracion-clientes.sql`
4. Click en "Run"

**Verificar**:
```sql
-- Ver cuántos clientes se migraron
SELECT COUNT(*) as clientes_migrados FROM clientes;
SELECT COUNT(*) as clientes_antiguos FROM clientes_old;

-- Ver estructura nueva
SELECT * FROM clientes LIMIT 5;
```

Si los números coinciden y todo se ve bien, **eliminar tabla antigua**:
```sql
DROP TABLE clientes_old CASCADE;
```

---

### Paso 2: Crear tablas de negociaciones
**Archivo**: `negociaciones-schema.sql`

Este script crea:
- ✅ Tabla `negociaciones`
- ✅ Tabla `fuentes_pago`
- ✅ Tabla `procesos_negociacion`
- ✅ Tabla `plantillas_proceso`
- ✅ Triggers automáticos
- ✅ Vistas útiles

**Ejecutar**:
1. SQL Editor → New Query
2. Copiar TODO el contenido de `negociaciones-schema.sql`
3. Click en "Run"

**Verificar**:
```sql
-- Ver tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso');

-- Ver vistas creadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('vista_clientes_resumen', 'vista_negociaciones_completas');
```

---

### Paso 3: Aplicar políticas RLS
**Archivo**: `clientes-negociaciones-rls.sql`

Este script configura seguridad Row Level Security.

**Ejecutar**:
1. SQL Editor → New Query
2. Copiar TODO el contenido de `clientes-negociaciones-rls.sql`
3. Click en "Run"

**Verificar**:
```sql
-- Ver políticas aplicadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso');
```

---

### Paso 4: Regenerar tipos de TypeScript

**En tu terminal local** (PowerShell):

```powershell
# Opción 1: Con Supabase CLI (si lo tienes instalado)
npx supabase gen types typescript --project-id [TU_PROJECT_ID] > src/lib/supabase/database.types.ts

# Opción 2: Desde Supabase Dashboard
# 1. Ve a Settings → API
# 2. Busca "Generate Types"
# 3. Copia el código TypeScript generado
# 4. Reemplaza el contenido de src/lib/supabase/database.types.ts
```

---

## ✅ Checklist de Verificación

Después de ejecutar todo, verifica:

- [ ] Tabla `clientes` tiene la nueva estructura (nombres, apellidos, estado, origen, etc.)
- [ ] Datos antiguos de clientes se migraron correctamente
- [ ] Tabla `negociaciones` existe y está vacía
- [ ] Tabla `fuentes_pago` existe y está vacía
- [ ] Tabla `procesos_negociacion` existe y está vacía
- [ ] Tabla `plantillas_proceso` existe y está vacía
- [ ] Vista `vista_clientes_resumen` funciona: `SELECT * FROM vista_clientes_resumen LIMIT 5;`
- [ ] Vista `vista_negociaciones_completas` existe (vacía por ahora)
- [ ] Políticas RLS están aplicadas
- [ ] Archivo `database.types.ts` regenerado (sin errores en VS Code)

---

## 🐛 Solución de Problemas

### Error: "column X does not exist"
**Solución**: Asegúrate de ejecutar `migracion-clientes.sql` PRIMERO antes de `negociaciones-schema.sql`

### Error: "relation already exists"
**Solución**:
```sql
-- Eliminar tabla problemática y volver a ejecutar
DROP TABLE IF EXISTS nombre_tabla CASCADE;
```

### Error en triggers
**Solución**:
```sql
-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS nombre_trigger ON nombre_tabla;
-- Luego volver a ejecutar el script
```

### Error: "violates foreign key constraint"
**Solución**: Verifica que las tablas de referencia (viviendas, auth.users) existen

---

## 📊 Queries Útiles de Verificación

```sql
-- Ver todas las tablas del módulo
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%client%'
   OR table_name LIKE '%negoci%'
   OR table_name LIKE '%fuente%'
   OR table_name LIKE '%proceso%';

-- Ver estructura de clientes
\d+ clientes;

-- Ver estructura de negociaciones
\d+ negociaciones;

-- Probar vista de resumen
SELECT * FROM vista_clientes_resumen;

-- Ver todos los triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public';
```

---

## 🎯 Siguiente Paso

Una vez completado todo:
1. ✅ Regenera tipos TypeScript
2. ✅ Reinicia el servidor dev: `npm run dev`
3. ✅ Verifica que no hay errores de tipo en VS Code
4. ✅ ¡Listo para desarrollar los componentes! 🚀

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún error:
1. Copia el mensaje de error completo
2. Copia el SQL que estabas ejecutando
3. Comparte capturas de pantalla si es necesario
