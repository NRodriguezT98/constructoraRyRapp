# 🎯 Implementación Sistema de Categorías Híbrido

## ✅ Paso 1: Ejecutar SQL en Supabase

1. **Asegúrate de estar logueado** en tu aplicación (localhost:3000/login)
2. Ve al **SQL Editor** de Supabase Dashboard
3. **IMPORTANTE**: Ejecuta este comando primero para verificar que estás autenticado:

```sql
SELECT auth.uid()::text as tu_user_id;
```

Si retorna `NULL`, necesitas:
- Ir a Authentication → Users en Supabase
- Copiar un User ID existente
- O crear un usuario desde tu app (localhost:3000/login → Registrarse)

4. Copia todo el contenido de `supabase/categorias-tipo-entidad.sql`
5. Pega en SQL Editor
6. Ejecuta (Run)

## ✅ Paso 2: Regenerar Tipos TypeScript

Abre terminal PowerShell y ejecuta:
```powershell
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
```

## ✅ Paso 3: Verificar que se agregó la columna

En Supabase SQL Editor, ejecuta:
```sql
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
  AND column_name = 'tipo_entidad';
```

Deberías ver:
```
column_name   | data_type      | column_default
tipo_entidad  | character varying | 'proyecto'::character varying
```

## ✅ Paso 4: Ver categorías creadas

```sql
SELECT
  tipo_entidad,
  COUNT(*) as total,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
GROUP BY tipo_entidad
ORDER BY tipo_entidad;
```

Deberías ver:
- **ambos**: 3 categorías (Contratos, Facturas, Comprobantes de Pago)
- **cliente**: 4 categorías (Identificación, Referencias Laborales, etc.)
- **proyecto**: 4 categorías (Licencias, Planos, Estudios, Permisos)

---

## 📋 Siguiente Paso

Una vez completados estos pasos, **avísame** y continuaremos con:
- Actualizar tipos TypeScript de categorías
- Modificar componente de crear categoría (agregar radio buttons)
- Actualizar stores de proyectos y clientes
- Testing completo

## ⚠️ Notas Importantes

### Si NO tienes usuario creado:
1. Ve a `localhost:3000/login`
2. Click en "¿No tienes cuenta? Regístrate"
3. Crea una cuenta con email y contraseña
4. Luego ejecuta el SQL

### Si ya tenías categorías:
Todas las categorías existentes se marcaron como `tipo_entidad = 'proyecto'` por defecto.
Puedes cambiarlas manualmente:
```sql
UPDATE categorias_documento
SET tipo_entidad = 'ambos'
WHERE nombre IN ('Contratos', 'Facturas');
```

### Verificar que funcionó:
```sql
SELECT tipo_entidad, COUNT(*), STRING_AGG(nombre, ', ')
FROM categorias_documento
WHERE user_id = auth.uid()::text
GROUP BY tipo_entidad;
```
