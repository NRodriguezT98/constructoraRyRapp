# 🚨 TODOs Críticos - Antes de Producción

## ⚠️ PRIORIDAD ALTA

### 1. Validación de Cédula para Negociaciones - **BLOQUEANTE**
**Estado**: 🔴 DESHABILITADA TEMPORALMENTE
**Archivo**: `src/modules/clientes/hooks/useRegistrarInteres.ts` (línea ~146)
**Razón**: Problemas con Supabase SQL Editor
**Fecha**: 20 Enero 2025

**Acción requerida**:
1. Ejecutar: `supabase/migrations/20250120_add_es_documento_identidad.sql`
2. Descomentar validación en `useRegistrarInteres.ts`
3. Testing completo de flujo de negociaciones

**Documentación**:
- `PENDIENTE-VALIDACION-CEDULA.md` (detalles completos)
- `MIGRACION-CEDULA-DOCUMENTOS.md` (guía implementación)

**Impacto si no se activa**:
- ⚠️ Clientes sin cédula pueden crear negociaciones (riesgo legal)
- ⚠️ No hay validación de documentos de identidad

**Buscar en código**: `⚠️ BYPASS TEMPORAL`

---

## 📋 TODOs Menores

### 2. Unificar Cédula con Sistema de Documentos
**Estado**: ⏸️ PAUSADO
**Archivos preparados**:
- `documento-card-horizontal.tsx` (nuevo diseño)
- `documentos-cliente.service.ts` (funciones helper)

**Acción requerida**:
1. Ejecutar migración SQL (mismo del TODO #1)
2. Eliminar `SeccionDocumentosIdentidad.tsx`
3. Actualizar `documentos-tab.tsx`

**Beneficios**:
- UI más limpia (una sola lista de documentos)
- Código más simple (-150 líneas)
- Permite múltiples docs de identidad (cédula + pasaporte)

---

## 🎨 Mejoras de UI Pendientes

### 3. Aprobar y Replicar Cards Horizontales
**Estado**: ⏳ ESPERANDO APROBACIÓN
**Archivo**: `src/modules/documentos/components/lista/documento-card-horizontal.tsx`

**Acción requerida**:
1. Probar diseño horizontal en módulo Clientes
2. Si se aprueba, replicar en módulo Proyectos
3. Mantener consistencia visual

---

## 🧪 Testing Requerido

Antes de producción, verificar:

- [ ] **Negociaciones**: No se pueden crear sin cédula (cuando se active validación)
- [ ] **Documentos**: Cédula aparece en lista con badge "REQUERIDO"
- [ ] **UI**: Cards horizontales funcionan en todas las resoluciones
- [ ] **Storage**: RLS policies permiten subir/ver documentos correctamente

---

## 📞 Referencias Rápidas

**Buscar en código**:
```bash
# Ver todos los TODOs pendientes
grep -r "TODO:" src/

# Ver bypass temporal de validación
grep -r "BYPASS TEMPORAL" src/

# Ver migraciones pendientes
cat supabase/migrations/README.md
```

**Archivos clave**:
- `PENDIENTE-VALIDACION-CEDULA.md` - Detalles del bypass temporal
- `MIGRACION-CEDULA-DOCUMENTOS.md` - Guía completa de migración
- `supabase/migrations/20250120_add_es_documento_identidad.sql` - Script SQL

---

**Última actualización**: 20 Enero 2025
**Próxima revisión**: Antes de merge a producción

---

## ✅ Checklist Pre-Producción

Marcar cuando esté completado:

- [ ] Migración SQL ejecutada exitosamente
- [ ] Validación de cédula rehabilitada y probada
- [ ] Testing completo de flujo de negociaciones
- [ ] Cards horizontales aprobadas y replicadas
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Backup de base de datos realizado
