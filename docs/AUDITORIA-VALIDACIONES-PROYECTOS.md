# 🔍 Auditoría de Validaciones - Módulo de Proyectos

**Fecha**: 17 de noviembre de 2025
**Módulo**: Proyectos
**Objetivo**: Identificar validaciones faltantes y mejorar integridad de datos

---

## 📊 Estado Actual de Validaciones

### ✅ Validaciones EXISTENTES (Implementadas)

#### 1. **Creación de Proyecto**
- ✅ Nombre mínimo 3 caracteres (Zod)
- ✅ Verificación de nombres duplicados (case-insensitive)
- ✅ Campos obligatorios (nombre, descripción, ubicación)
- ✅ Validación de fechas (inicio < fin estimada)
- ✅ Presupuesto > 0
- ✅ Validación de manzanas únicas (no duplicados en mismo proyecto)
- ✅ Número de viviendas por manzana > 0

#### 2. **Edición de Proyecto**
- ✅ Verificación de nombres duplicados (excluyendo proyecto actual)
- ✅ Validación granular de manzanas:
  - ✅ **NO permite editar manzanas que ya tienen viviendas creadas**
  - ✅ Permite editar manzanas sin viviendas
  - ✅ Permite crear nuevas manzanas
- ✅ Solo elimina manzanas sin viviendas
- ✅ Auditoría completa de cambios (antes/después)

#### 3. **Eliminación de Proyecto**
- ✅ Auditoría de eliminación (registro completo)
- ⚠️ **CASCADE DELETE** en base de datos:
  - Manzanas se eliminan automáticamente (ON DELETE CASCADE)
  - Viviendas se eliminan automáticamente (ON DELETE CASCADE de manzanas)
  - Documentos del proyecto se eliminan (ON DELETE CASCADE)

---

## 🚨 Validaciones FALTANTES (Propuestas)

### ❌ **CRÍTICO 1: Prevenir eliminación de proyectos con viviendas**

**Problema Actual:**
```typescript
async eliminarProyecto(id: string): Promise<void> {
  // ❌ NO verifica si hay viviendas
  const { error } = await supabase.from('proyectos').delete().eq('id', id)
  // ⚠️ Elimina TODO en cascada (manzanas + viviendas + negociaciones + abonos)
}
```

**Impacto:**
- ❌ Se pierden datos de viviendas vendidas/reservadas
- ❌ Se pierden negociaciones activas
- ❌ Se pierden abonos registrados
- ❌ Se rompe integridad financiera
- ❌ Imposible recuperar historial de ventas

**Propuesta:**
```typescript
async eliminarProyecto(id: string): Promise<void> {
  // 1. Verificar si hay viviendas en el proyecto
  const { count: totalViviendas } = await supabase
    .from('viviendas')
    .select('*', { count: 'exact', head: true })
    .in('manzana_id', manzanasIds)

  if (totalViviendas > 0) {
    throw new Error(
      `No se puede eliminar el proyecto porque tiene ${totalViviendas} vivienda(s) registrada(s). ` +
      `Elimine primero las viviendas o archive el proyecto.`
    )
  }

  // 2. Verificar si hay documentos
  const { count: totalDocumentos } = await supabase
    .from('documentos_proyecto')
    .select('*', { count: 'exact', head: true })
    .eq('proyecto_id', id)

  if (totalDocumentos > 0) {
    throw new Error(
      `No se puede eliminar el proyecto porque tiene ${totalDocumentos} documento(s) asociado(s). ` +
      `Elimine primero los documentos o archive el proyecto.`
    )
  }

  // 3. Solo entonces permitir eliminación
  const { error } = await supabase.from('proyectos').delete().eq('id', id)
}
```

---

### ❌ **CRÍTICO 2: Restricción de edición del nombre del proyecto**

**Problema Actual:**
```typescript
// ✅ Permite editar nombre en CUALQUIER momento
if (data.nombre !== undefined) updateData.nombre = data.nombre
```

**Preguntas:**
1. ¿Permitir editar nombre si ya hay viviendas vendidas?
2. ¿Permitir editar nombre si ya hay negociaciones activas?
3. ¿Permitir editar nombre si ya hay documentos legales?

**Propuesta: POLÍTICA FLEXIBLE**

**Opción A: Permitir SIEMPRE editar nombre (actual)**
- ✅ Flexibilidad total
- ❌ Puede causar confusión en documentos históricos
- ✅ Auditoría registra todos los cambios de nombre

**Opción B: Restricción PARCIAL (RECOMENDADA)**
```typescript
async actualizarProyecto(id: string, data: Partial<ProyectoFormData>) {
  // Si intenta cambiar el nombre
  if (data.nombre && proyectoAnterior.nombre !== data.nombre) {
    // Verificar si hay viviendas vendidas
    const { count: viviendasVendidas } = await supabase
      .from('viviendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'vendida')
      .in('manzana_id', manzanasIds)

    if (viviendasVendidas > 0) {
      // ⚠️ ADVERTENCIA pero PERMITIR (con confirmación en UI)
      console.warn(
        `⚠️ Cambiando nombre de proyecto con ${viviendasVendidas} viviendas vendidas. ` +
        `Se recomienda precaución por documentos legales.`
      )
    }
  }

  // Continuar actualización normalmente
  // La auditoría registrará el cambio de nombre
}
```

**Opción C: Restricción ESTRICTA (máxima seguridad)**
```typescript
if (data.nombre && proyectoAnterior.nombre !== data.nombre) {
  const { count: viviendasVendidas } = await supabase
    .from('viviendas')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'vendida')
    .in('manzana_id', manzanasIds)

  if (viviendasVendidas > 0) {
    throw new Error(
      `No se puede cambiar el nombre del proyecto porque tiene viviendas vendidas. ` +
      `Esto podría causar inconsistencias en contratos y documentos legales.`
    )
  }
}
```

**✅ Recomendación: Opción B (advertencia con confirmación en UI)**

---

### ❌ **IMPORTANTE 3: Validación de cambios de estado del proyecto**

**Problema Actual:**
```typescript
// ✅ Permite cambiar estado libremente
if (data.estado !== undefined) updateData.estado = data.estado
```

**Propuesta:**
```typescript
async actualizarProyecto(id: string, data: Partial<ProyectoFormData>) {
  // Validar transiciones de estado lógicas
  if (data.estado && proyectoAnterior.estado !== data.estado) {
    // No permitir marcar como "completado" si hay viviendas "disponibles"
    if (data.estado === 'completado') {
      const { count: viviendasDisponibles } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'disponible')
        .in('manzana_id', manzanasIds)

      if (viviendasDisponibles > 0) {
        throw new Error(
          `No se puede marcar el proyecto como completado porque tiene ` +
          `${viviendasDisponibles} vivienda(s) aún disponibles.`
        )
      }
    }

    // No permitir "pausar" si hay negociaciones activas
    if (data.estado === 'pausado') {
      // Verificar negociaciones activas (si existe esa tabla)
      console.warn('⚠️ Pausando proyecto. Verificar negociaciones activas.')
    }
  }
}
```

---

### ❌ **IMPORTANTE 4: Validación de fechas coherentes**

**Problema Actual:**
```typescript
// ✅ Validación básica en formulario (inicio < fin)
// ❌ NO valida que fechas pasadas sean coherentes con estado actual
```

**Propuesta:**
```typescript
// En el hook useProyectosForm.ts
.refine(
  (data) => {
    const ahora = new Date()
    const fechaInicio = new Date(data.fechaInicio)
    const fechaFin = new Date(data.fechaFinEstimada)

    // Si el proyecto está "completado" pero fecha_fin_estimada es futura
    if (data.estado === 'completado' && fechaFin > ahora) {
      return false // Incoherente
    }

    // Si el proyecto está "en_proceso" pero fecha_inicio es futura
    if (data.estado === 'en_proceso' && fechaInicio > ahora) {
      return false // Incoherente
    }

    return true
  },
  {
    message: 'Las fechas no son coherentes con el estado del proyecto',
    path: ['estado']
  }
)
```

---

### ⚠️ **MEJORA 5: Sistema de archivo en lugar de eliminación**

**Propuesta: Agregar campo `archivado` a la tabla proyectos**

```sql
-- Migration: Agregar campo archivado
ALTER TABLE public.proyectos
ADD COLUMN archivado BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN fecha_archivado TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_proyectos_archivado ON public.proyectos(archivado);
```

**Service actualizado:**
```typescript
class ProyectosService {
  // En lugar de eliminar, archivar
  async archivarProyecto(id: string): Promise<void> {
    const { error } = await supabase
      .from('proyectos')
      .update({ archivado: true, fecha_archivado: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(`Error al archivar proyecto: ${error.message}`)

    await auditService.auditarArchivado('proyectos', id, {...})
  }

  // Eliminación solo para admins (con validaciones estrictas)
  async eliminarProyectoDefinitivo(id: string): Promise<void> {
    // Todas las validaciones críticas antes de eliminar
    // ...
  }

  // Obtener solo proyectos activos (NO archivados)
  async obtenerProyectos(): Promise<Proyecto[]> {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .eq('archivado', false) // Solo proyectos activos
      .order('fecha_creacion', { ascending: false })
    // ...
  }
}
```

---

## 📋 Checklist de Validaciones Propuestas

### Implementación Prioritaria (CRÍTICO):

- [ ] **CRÍTICO 1**: Prevenir eliminación de proyectos con viviendas
- [ ] **CRÍTICO 2**: Política de edición de nombre de proyecto (Opción B recomendada)
- [ ] **MEJORA 5**: Sistema de archivado en lugar de eliminación física

### Implementación Secundaria (IMPORTANTE):

- [ ] **IMPORTANTE 3**: Validación de transiciones de estado coherentes
- [ ] **IMPORTANTE 4**: Validación de fechas coherentes con estado
- [ ] Agregar confirmación en UI para cambios de nombre con viviendas vendidas
- [ ] Mostrar advertencias visuales en edición de proyectos con datos sensibles

### Mejoras Adicionales (OPCIONAL):

- [ ] Agregar campo `motivo_archivo` al archivar proyectos
- [ ] Historial de cambios de nombre del proyecto
- [ ] Bloqueo de edición por rol (solo admins pueden cambiar ciertos campos)
- [ ] Validación de presupuesto vs suma de precios de viviendas
- [ ] Alertas cuando fecha_fin_estimada se acerca o pasó

---

## 🎯 Recomendación Final

**Implementar en este orden:**

1. **Fase 1 (Integridad de Datos - URGENTE):**
   - ✅ Validación de eliminación con viviendas
   - ✅ Sistema de archivado
   - ✅ Política de edición de nombre (con advertencia)

2. **Fase 2 (Coherencia Lógica):**
   - ✅ Validación de transiciones de estado
   - ✅ Validación de fechas coherentes

3. **Fase 3 (UX y Seguridad):**
   - ✅ Confirmaciones en UI
   - ✅ Bloqueos por rol
   - ✅ Historial de cambios críticos

---

## 📝 Notas de Implementación

### Compatibilidad con Sistema Actual

- ✅ **Separación de Responsabilidades**: Validaciones en service, no en componentes
- ✅ **Auditoría Completa**: Registrar TODAS las validaciones bloqueadas
- ✅ **Mensajes Claros**: Errores descriptivos para el usuario
- ✅ **No Breaking Changes**: Mantener backward compatibility

### Testing Requerido

- [ ] Test: Eliminar proyecto sin viviendas (debe funcionar)
- [ ] Test: Eliminar proyecto con viviendas (debe fallar con mensaje claro)
- [ ] Test: Cambiar nombre con viviendas vendidas (debe advertir pero permitir)
- [ ] Test: Marcar como completado con viviendas disponibles (debe fallar)
- [ ] Test: Archivar proyecto (debe ocultar de lista principal)
- [ ] Test: Restaurar proyecto archivado (debe volver a lista)

---

**🔗 Relacionado con:**
- `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
- `docs/DESARROLLO-CHECKLIST.md`
