# ⚠️ PENDIENTE: Validación de Cédula para Negociaciones

## 🚨 Estado Actual: DESHABILITADO TEMPORALMENTE

### 📋 Contexto
Debido a problemas de conexión con Supabase, hemos **deshabilitado temporalmente** la validación que requiere que el cliente tenga cédula cargada antes de crear una negociación.

**Fecha de deshabilitación**: 20 de Enero, 2025
**Razón**: Problemas con Supabase SQL Editor / Connection string
**Impacto**: Los clientes pueden crear negociaciones SIN tener cédula cargada

---

## ✅ TRABAJO COMPLETADO (Listo para activar)

### Archivos preparados:
1. ✅ **SQL Migration**: `supabase/migrations/20250120_add_es_documento_identidad.sql`
   - Agrega campo `es_documento_identidad` boolean
   - Migra cédulas existentes automáticamente
   - Crea función `puede_crear_negociacion()`

2. ✅ **TypeScript Types**: `src/modules/clientes/documentos/types/index.ts`
   - Agregado `es_documento_identidad: boolean` a `DocumentoCliente`

3. ✅ **Service**: `src/modules/clientes/documentos/services/documentos-cliente.service.ts`
   - Agregado parámetro `es_documento_identidad` en `subirDocumento()`
   - Funciones helper: `tieneCedulaActiva()`, `obtenerCedula()`

4. ✅ **Card Horizontal**: `src/modules/documentos/components/lista/documento-card-horizontal.tsx`
   - Nuevo diseño horizontal de documentos
   - Badge "REQUERIDO" para documentos de identidad

---

## 🔧 CAMBIOS TEMPORALES APLICADOS

### Archivo: `src/modules/clientes/hooks/useRegistrarInteres.ts`

**Validación DESHABILITADA** (comentada):
```typescript
// ⚠️ TEMPORALMENTE DESHABILITADO - Pendiente migración SQL
// TODO: Rehabilitar cuando Supabase se estabilice
/*
const tieneCedula = await DocumentosClienteService.tieneCedulaActiva(cliente.id)
if (!tieneCedula) {
  toast.error('Debes subir la cédula antes de crear una negociación')
  return
}
*/

// BYPASS TEMPORAL: Permitir negociaciones sin cédula
console.warn('⚠️ VALIDACIÓN DE CÉDULA DESHABILITADA - Bypass temporal activo')
```

---

## 📝 CUANDO SUPABASE SE ESTABILICE

### Paso 1: Ejecutar Migración SQL
```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar: supabase/migrations/20250120_add_es_documento_identidad.sql
```

### Paso 2: Verificar Migración
```sql
-- Verificar que el campo existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
AND column_name = 'es_documento_identidad';

-- Verificar cédulas migradas
SELECT COUNT(*) FROM documentos_cliente WHERE es_documento_identidad = TRUE;
```

### Paso 3: Rehabilitar Validación
En `src/modules/clientes/hooks/useRegistrarInteres.ts`:
```typescript
// ✅ REHABILITAR: Descomentar esto
const tieneCedula = await DocumentosClienteService.tieneCedulaActiva(cliente.id)
if (!tieneCedula) {
  toast.error('Debes subir la cédula antes de crear una negociación')
  return
}

// ❌ ELIMINAR: Quitar bypass temporal
// console.warn('⚠️ VALIDACIÓN DE CÉDULA DESHABILITADA - Bypass temporal activo')
```

### Paso 4: Testing
- [ ] Cliente SIN cédula → No puede crear negociación (toast error)
- [ ] Cliente CON cédula → Puede crear negociación
- [ ] Badge "REQUERIDO" visible en cédula
- [ ] Función `puede_crear_negociacion()` funciona correctamente

---

## 🎯 BENEFICIOS AL ACTIVAR

1. ✅ **Validación de negocio**: Solo clientes con documentos válidos
2. ✅ **Unificación**: Cédula es un documento más (no sección separada)
3. ✅ **Flexibilidad**: Permite múltiples docs de identidad (cédula + pasaporte)
4. ✅ **UI más limpia**: Una sola lista de documentos
5. ✅ **Código más simple**: -150 líneas (eliminar SeccionDocumentosIdentidad)

---

## 📊 Archivos Relacionados

### Para activar funcionalidad:
- `supabase/migrations/20250120_add_es_documento_identidad.sql` (ejecutar)
- `src/modules/clientes/hooks/useRegistrarInteres.ts` (descomentar validación)
- `src/app/clientes/[id]/tabs/documentos-tab.tsx` (eliminar SeccionDocumentosIdentidad)

### Documentación:
- `MIGRACION-CEDULA-DOCUMENTOS.md` (guía completa)
- `COMO-EJECUTAR-MIGRACION-SQL.md` (troubleshooting)

---

## 🚨 RECORDATORIOS

**ANTES de producción**:
- [ ] Ejecutar migración SQL
- [ ] Rehabilitar validación de cédula
- [ ] Testing completo
- [ ] Verificar cédulas migradas correctamente
- [ ] Documentar en changelog

**NO OLVIDAR**: Esta es una medida temporal. La validación de cédula es CRÍTICA para el negocio.

---

## 📞 Contacto

Si tienes dudas al rehabilitar:
1. Revisar `MIGRACION-CEDULA-DOCUMENTOS.md`
2. Buscar `⚠️ TEMPORALMENTE DESHABILITADO` en el código
3. Ejecutar tests antes de hacer commit

---

**Última actualización**: 20 Enero 2025
**Estado**: ⏸️ PAUSADO - Esperando estabilización de Supabase
**Prioridad**: 🔴 ALTA - Rehabilitar antes de producción
