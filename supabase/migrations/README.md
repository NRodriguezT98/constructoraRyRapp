# 📁 Migraciones SQL - Supabase

## ⚠️ Migraciones Pendientes

### `20250120_add_es_documento_identidad.sql` - **PENDIENTE**

**Estado**: 🔴 No ejecutada
**Prioridad**: Alta
**Fecha creación**: 20 Enero 2025

**Descripción**:
Agrega campo `es_documento_identidad` para marcar documentos como cédulas/pasaportes y habilitar validación de negociaciones.

**Bloqueado por**:
- Problemas de conexión con Supabase SQL Editor
- Connection string issues

**Impacto actual**:
- ⚠️ Validación de cédula DESHABILITADA temporalmente
- Los clientes pueden crear negociaciones sin tener cédula cargada
- Bypass temporal implementado en `useRegistrarInteres.ts`

**Documentación completa**:
- `PENDIENTE-VALIDACION-CEDULA.md` (detalles del bypass)
- `MIGRACION-CEDULA-DOCUMENTOS.md` (guía de implementación completa)
- `COMO-EJECUTAR-MIGRACION-SQL.md` (troubleshooting)

**Cuando ejecutar**:
1. Cuando Supabase se estabilice
2. ANTES de desplegar a producción
3. Después de ejecutar, rehabilitar validación en `useRegistrarInteres.ts`

---

## 📋 Cómo Ejecutar Migraciones

### Método Recomendado: Supabase Dashboard

1. Ir a: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Click en **SQL Editor**
3. Click en **+ New query**
4. Copiar contenido del archivo `.sql`
5. Click en **Run** (▶️)

### Verificar Ejecución Exitosa

```sql
-- Ver columnas de la tabla
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documentos_cliente';

-- Verificar datos migrados
SELECT COUNT(*) FROM documentos_cliente WHERE es_documento_identidad = TRUE;
```

---

## ✅ Migraciones Ejecutadas

_(vacío por ahora)_

---

## 📞 Ayuda

Si tienes problemas ejecutando migraciones:
1. Revisar `COMO-EJECUTAR-MIGRACION-SQL.md`
2. Verificar permisos en Supabase Dashboard
3. Intentar ejecutar por partes (ALTER TABLE, CREATE INDEX, DO $$, etc.)

---

**Última actualización**: 20 Enero 2025
