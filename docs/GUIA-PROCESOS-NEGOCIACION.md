# 📋 Guía: Sistema de Procesos de Negociación

## 🎯 ¿Qué es el Sistema de Procesos?

El sistema de procesos permite definir y hacer seguimiento a los **pasos que debe completar un cliente** desde que inicia la negociación de una vivienda hasta que la entrega se completa.

## 🔄 Flujo Completo

### 1. **Crear Plantilla de Proceso** (Admin)
```
/admin/procesos → Click "Nueva Plantilla"
```

#### Pasos para crear plantilla:

1. **Información básica**:
   - Nombre: "Proceso Venta Vivienda VIS"
   - Descripción: "Pasos completos para venta de vivienda VIS"
   - ☑️ Establecer como predeterminada

2. **Agregar pasos** (Click "Agregar Paso"):
   - **Paso 1**: Envío de Promesa de Compraventa
   - **Paso 2**: Firma de Promesa
   - **Paso 3**: Radicación de Crédito (solo si usa Crédito Hipotecario)
   - **Paso 4**: Estudio de Crédito
   - ...etc

3. **Configurar cada paso**:
   - ✅ **Obligatorio**: Si el paso es requerido
   - ✅ **Permite Omitir**: Si se puede saltar
   - 🏦 **Fuentes de Pago**: Seleccionar para qué tipos aplica
     - Crédito Hipotecario
     - Subsidio Caja de Compensación
     - Recursos Propios
     - Cesantías
   - 🔗 **Depende de**: Seleccionar pasos previos que deben completarse primero
   - 📄 **Documentos**: Agregar documentos requeridos para completar el paso

4. **Guardar**: Click "Guardar Plantilla"

### 2. **Crear Negociación** (Automático)

Cuando creas una negociación en `/clientes/[id]` → Tab "Negociaciones":

```typescript
✅ PASO AUTOMÁTICO: Se crea el proceso
```

**¿Qué hace el sistema automáticamente?**

1. Obtiene la plantilla predeterminada
2. Lee las fuentes de pago de la negociación:
   - Cuota Inicial → Recursos Propios
   - Crédito Hipotecario → Crédito Hipotecario
   - Subsidio Caja → Subsidio Caja
   - etc.
3. **Filtra los pasos** según las fuentes de pago:
   - Si tiene Crédito Hipotecario → incluye pasos bancarios
   - Si tiene Subsidio → incluye pasos de caja de compensación
   - Si es solo recursos propios → omite pasos condicionales
4. Crea el proceso en estado "Pendiente"

### 3. **Ver Proceso del Cliente**

```
/clientes/[id] → Tab "Actividad"
```

El cliente y los administradores ven:

- **Timeline vertical** con todos los pasos
- **Estados visuales**:
  - ⏸️ Gris: Pendiente
  - 🔵 Azul (pulsando): En Proceso
  - ✅ Verde: Completado
  - ⏭️ Gris tachado: Omitido

- **Información por paso**:
  - Nombre y descripción
  - Documentos requeridos
  - Fecha de inicio/completado
  - Notas adicionales

### 4. **Actualizar Pasos** (Manual)

Cada paso se puede expandir y:

1. **Iniciar Paso**: Marca como "En Proceso"
2. **Marcar Completado**:
   - ⚠️ Verifica que:
     - Documentos obligatorios estén subidos
     - Pasos dependientes estén completos
     - Días mínimos hayan pasado (si aplica)
3. **Omitir Paso**: Si permite_omitir = true

## 📊 Ejemplo Práctico

### Plantilla: "Proceso Venta VIS con Crédito"

**17 Pasos configurados**:

| # | Paso | Obligatorio | Fuentes Aplicables | Dependencias |
|---|------|-------------|-------------------|--------------|
| 1 | Envío de Promesa | ✅ | Todas | - |
| 2 | Firma de Promesa | ✅ | Todas | Paso 1 |
| 3 | Radicación de Crédito | ✅ | Solo Crédito Hipotecario | Paso 2 |
| 4 | Estudio de Crédito | ✅ | Solo Crédito Hipotecario | Paso 3 |
| 5 | Aprobación de Crédito | ✅ | Solo Crédito Hipotecario | Paso 4 |
| 6 | Carta de Aprobación | ✅ | Solo Crédito Hipotecario | Paso 5 |
| 7 | Firma de Minuta | ✅ | Todas | Paso 2 o 6 |
| 8 | Registro en Notaría | ✅ | Todas | Paso 7 |
| ... | ... | ... | ... | ... |
| 17 | Entrega de Vivienda | ✅ | Todas | Todos |

### Cliente con Crédito Hipotecario

**Fuentes de pago**:
- Crédito Hipotecario: $80,000,000
- Cuota Inicial: $20,000,000

**Pasos que verá**: 17 pasos (todos aplican)

### Cliente solo Recursos Propios

**Fuentes de pago**:
- Recursos Propios: $100,000,000

**Pasos que verá**: 11 pasos (omite pasos 3-6 de crédito, 13-14 subsidio)

## 🔧 Archivos Clave

### Backend/Servicios

```typescript
// Crear proceso automáticamente
src/modules/clientes/services/negociaciones.service.ts
  → PASO 5: Crear proceso desde plantilla

// Gestión de procesos
src/modules/admin/procesos/services/procesos.service.ts
  → obtenerPlantillaPredeterminada()
  → crearProcesoDesdePlantilla()
  → actualizarProceso()
  → obtenerProgresoNegociacion()
```

### Frontend

```typescript
// Vista admin de plantillas
src/app/admin/procesos/page.tsx
  → Lista de plantillas

src/app/admin/procesos/crear/page.tsx
  → Formulario crear plantilla

src/app/admin/procesos/[id]/editar/page.tsx
  → Formulario editar plantilla

// Vista cliente (timeline)
src/app/clientes/[id]/tabs/actividad-tab.tsx
  → Renderiza TimelineProceso

src/modules/admin/procesos/components/timeline-proceso.tsx
  → Timeline visual interactivo
```

### Base de Datos

```sql
-- Plantillas (configuración)
plantillas_proceso
  - id
  - nombre
  - descripcion
  - pasos (JSONB) -- Array de PasoPlantilla
  - es_predeterminado
  - activo

-- Procesos (instancias por negociación)
procesos_negociacion
  - id
  - negociacion_id (FK)
  - plantilla_id (FK)
  - estado ('Activo', 'Completado', 'Cancelado')
  - pasos (JSONB) -- Array de PasoConEstado
  - fecha_inicio
  - fecha_completado
  - progreso_porcentaje
```

## ⚙️ Configuración Avanzada

### Dependencias entre Pasos

```typescript
// Paso 7 depende del paso 2 Y el paso 6
{
  orden: 7,
  nombre: "Firma de Minuta",
  condiciones: {
    dependeDe: ["paso_2_id", "paso_6_id"], // OR logic
    diasMinimoDespuesDe: 1 // Mínimo 1 día después
  }
}
```

### Documentos Requeridos

```typescript
{
  orden: 5,
  nombre: "Aprobación de Crédito",
  documentos: [
    {
      id: "doc_1",
      nombre: "Carta de Aprobación Bancaria",
      obligatorio: true,
      tiposArchivo: ["application/pdf"]
    },
    {
      id: "doc_2",
      nombre: "Estudio de Títulos",
      obligatorio: true,
      tiposArchivo: ["application/pdf"]
    }
  ]
}
```

### Validación Automática

El sistema valida automáticamente:

✅ **Antes de completar un paso**:
- Todos los documentos obligatorios subidos
- Pasos dependientes completados
- Días mínimos transcurridos

⚠️ **Si falta algo**:
- Muestra mensaje de error
- No permite marcar como completado
- Indica qué falta

## 🎨 Personalización

### Cambiar Plantilla Predeterminada

```
/admin/procesos → Click en plantilla → "Establecer predeterminada"
```

### Editar Pasos Existentes

```
/admin/procesos → Click "Editar" → Modificar pasos → Guardar
```

⚠️ **Nota**: Los cambios **NO afectan** procesos ya creados, solo nuevas negociaciones.

### Duplicar Plantilla

```
/admin/procesos → Click "Duplicar" → Modificar → Guardar
```

Útil para crear variantes (ej: "VIS con Subsidio", "VIS sin Subsidio", "No VIS")

## 🚀 Próximas Mejoras

### Pendientes de Implementación

- [ ] **Upload de documentos**: Integrar Supabase Storage
- [ ] **Notificaciones**: Alertar cuando paso completado
- [ ] **Drag & Drop**: Editor visual de pasos
- [ ] **Métricas**: Tiempo promedio por paso
- [ ] **Plantillas múltiples**: Selector en creación de negociación
- [ ] **Historial**: Ver cambios de estado de pasos

## 📞 Soporte

Si tienes dudas o encuentras errores:

1. Revisar logs en consola (`console.log` con emojis)
2. Verificar datos en Supabase → Tabla `procesos_negociacion`
3. Consultar `docs/DATABASE-SCHEMA-REFERENCE.md` para estructura

---

**Última actualización**: 23 de octubre, 2025
