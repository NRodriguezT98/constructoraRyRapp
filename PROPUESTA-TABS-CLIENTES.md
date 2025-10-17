# 🎯 PROPUESTA: Sistema de Tabs en Detalle de Cliente

## 📊 Análisis del Problema Actual

### ❌ Problemas Identificados

**1. Exceso de Scroll**
- Modal con 500+ líneas de altura
- Usuario debe hacer scroll para ver información completa
- Experiencia poco amigable en pantallas pequeñas

**2. Información Desorganizada**
- Todo mezclado en un solo scroll
- No hay separación lógica clara
- Difícil encontrar información específica

**3. Documento de Identidad**
- **NO** está en el formulario de creación
- Se maneja DESPUÉS de crear el cliente
- ¿Es correcto este flujo?

---

## ✅ Solución Propuesta: Sistema de Tabs

### Patrón de Referencia

Ya implementamos exitosamente tabs en:
- ✅ **Proyectos**: Info, Documentos, Configuración
- ✅ **Viviendas**: Info, Linderos, Documentos, Abonos

**Ejemplo de código** (de `vivienda-detalle-client.tsx`):

```tsx
// Definir tabs
const tabs = [
  { id: 'info', label: 'Información', icon: Info, count: null },
  { id: 'documentos', label: 'Documentos', icon: FileText, count: documentosCount },
  { id: 'historial', label: 'Historial', icon: Activity, count: null },
]

// Estado
const [activeTab, setActiveTab] = useState<TabType>('info')

// UI
<nav className={styles.tabsClasses.nav}>
  {tabs.map((tab) => (
    <motion.button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={activeTab === tab.id ? 'active' : 'inactive'}
    >
      <tab.icon />
      <span>{tab.label}</span>
      {tab.count && <Badge>{tab.count}</Badge>}
    </motion.button>
  ))}
</nav>

{/* Renderizado condicional */}
{activeTab === 'info' && <InfoTab />}
{activeTab === 'documentos' && <DocumentosTab />}
```

---

## 🗂️ Estructura de Tabs Propuesta

### Tab 1: **Información General** 📋

**Contenido**:
- ✅ Información Personal (nombres, apellidos, documento, fecha nacimiento)
- ✅ Información de Contacto (teléfonos, email, dirección, ciudad, departamento)
- ✅ Interés Inicial (si lo indicó al crear)
- ✅ Origen y Referido por
- ✅ Notas

**Lógica**:
```tsx
// Tab siempre visible (no tiene count)
{
  id: 'general',
  label: 'Información General',
  icon: User,
  count: null
}
```

**UI propuesta**:
```
┌────────────────────────────────────────┐
│  👤 Información Personal               │
│  ┌──────────────┬──────────────┐       │
│  │ Nombres      │ Apellidos    │       │
│  │ Laura        │ Duque        │       │
│  └──────────────┴──────────────┘       │
│  ┌──────────────┬──────────────┐       │
│  │ Tipo Doc     │ Número       │       │
│  │ CC           │ 1452122      │       │
│  └──────────────┴──────────────┘       │
│  Fecha Nac: No especificado            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  📞 Información de Contacto            │
│  Teléfono: 3057485555                  │
│  Email: No especificado                │
│  ...                                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  💜 Interés Inicial                    │
│  Proyecto: Conjunto Residencial XYZ    │
│  Vivienda: Mz A - Casa 12              │
│  Estado: Interesado                    │
│  Fecha: 17 oct 2025                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  💬 Información Adicional              │
│  Origen: Redes Sociales                │
│  Referido: No especificado             │
│  Notas: Sin notas                      │
└────────────────────────────────────────┘
```

**Beneficios**:
- ✅ Todo lo básico en un solo lugar
- ✅ Sin scroll (cabe en pantalla)
- ✅ Fácil acceso a información clave

---

### Tab 2: **Intereses** 💜

**Contenido**:
- ✅ Lista de TODOS los intereses (incluyendo el inicial)
- ✅ Por cada interés: proyecto, vivienda, estado, fecha
- ✅ Timeline de intereses
- ✅ Botón "Registrar Nuevo Interés"

**Lógica**:
```tsx
// Count dinámico
{
  id: 'intereses',
  label: 'Intereses',
  icon: Heart,
  count: intereses.length  // ej: 3
}
```

**UI propuesta**:
```
┌────────────────────────────────────────┐
│  💜 Intereses (3)                      │
│  [+ Registrar Nuevo Interés]           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  🟢 Activo                             │
│  Proyecto: Conjunto Residencial XYZ    │
│  Vivienda: Mz A - Casa 12              │
│  Registrado: 17 oct 2025               │
│  Última actualización: hace 2 días     │
│  [Ver Detalles] [Actualizar Estado]    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⏸️ Pausado                            │
│  Proyecto: Torres del Norte            │
│  Vivienda: Mz B - Apto 202             │
│  Registrado: 10 oct 2025               │
│  [Ver Detalles] [Actualizar Estado]    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⏰ Timeline de Intereses              │
│  17 oct • Registró interés en Mz A-12  │
│  15 oct • Pausó interés en Mz B-202    │
│  10 oct • Registró interés en Mz B-202 │
└────────────────────────────────────────┘
```

**Beneficios**:
- ✅ Vista completa de historial de intereses
- ✅ Facilita seguimiento comercial
- ✅ Count visual en tab

---

### Tab 3: **Documentos** 📄

**Contenido**:
- ✅ Cédula de Identidad (obligatorio)
- ✅ Otros documentos (opcional)
- ✅ Subir/Eliminar/Descargar
- ✅ Fecha de carga
- ✅ Tamaño de archivo

**Lógica**:
```tsx
// Count: total de documentos
{
  id: 'documentos',
  label: 'Documentos',
  icon: FileText,
  count: documentos.length  // ej: 2
}

// IMPORTANTE: Si NO tiene cédula, mostrar warning
if (!tieneCedula) {
  return <WarningState>⚠️ Debe subir cédula</WarningState>
}
```

**UI propuesta**:
```
┌────────────────────────────────────────┐
│  📄 Documentos (2)                     │
│  [+ Subir Documento]                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ✅ Cédula de Identidad                │
│  📎 cedula_1452122.pdf                 │
│  Subido: 17 oct 2025, 10:32            │
│  Tamaño: 1.2 MB                        │
│  [Ver] [Descargar] [Eliminar]          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  📋 Carta Laboral                      │
│  📎 carta_laboral.pdf                  │
│  Subido: 18 oct 2025, 14:20            │
│  Tamaño: 850 KB                        │
│  [Ver] [Descargar] [Eliminar]          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⚠️ No tienes documentos subidos       │
│  La cédula es OBLIGATORIA para:        │
│  • Asignar vivienda                    │
│  • Registrar abonos                    │
│  • Generar contratos                   │
│  [Subir Cédula Ahora]                  │
└────────────────────────────────────────┘
```

**Beneficios**:
- ✅ Gestión clara de documentos
- ✅ Validación de cédula obligatoria
- ✅ Facilita auditoría

---

### Tab 4: **Negociaciones** 💼

**Contenido**:
- ✅ Lista de negociaciones activas
- ✅ Por cada negociación: vivienda, monto, estado, avance
- ✅ Timeline de pagos/abonos
- ✅ Botón "Iniciar Nueva Negociación"

**Lógica**:
```tsx
// Count: negociaciones activas
{
  id: 'negociaciones',
  label: 'Negociaciones',
  icon: DollarSign,
  count: negociacionesActivas.length
}
```

**UI propuesta**:
```
┌────────────────────────────────────────┐
│  💼 Negociaciones (2)                  │
│  [+ Iniciar Nueva Negociación]         │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  🟢 En Proceso - 65% completado        │
│  Vivienda: Mz A - Casa 12              │
│  Precio Total: $180,000,000            │
│  Abonado: $117,000,000                 │
│  Pendiente: $63,000,000                │
│  Último abono: hace 5 días             │
│  [Ver Detalles] [Registrar Abono]      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⏸️ Pausada                            │
│  Vivienda: Mz B - Apto 202             │
│  Precio Total: $220,000,000            │
│  Abonado: $44,000,000 (20%)            │
│  [Ver Detalles] [Reactivar]            │
└────────────────────────────────────────┘
```

**Beneficios**:
- ✅ Vista clara de negociaciones
- ✅ Seguimiento de pagos
- ✅ Facilita gestión comercial

---

### Tab 5: **Actividad** 📊

**Contenido**:
- ✅ Timeline de TODAS las acciones
- ✅ Auditoría completa
- ✅ Estadísticas del cliente
- ✅ Filtros por tipo de actividad

**Lógica**:
```tsx
// Sin count (siempre tiene actividad)
{
  id: 'actividad',
  label: 'Actividad',
  icon: Activity,
  count: null
}
```

**UI propuesta**:
```
┌────────────────────────────────────────┐
│  📊 Estadísticas                       │
│  Total Intereses: 3                    │
│  Negociaciones: 2 activas, 1 pausada   │
│  Total Abonado: $161,000,000           │
│  Documentos: 2 subidos                 │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⏰ Actividad Reciente                 │
│  Filtros: [Todos] [Intereses] [Abonos]│
└────────────────────────────────────────┘

│  18 oct, 14:20                         │
│  📄 Subió carta laboral                │
│  Por: Admin                            │

│  17 oct, 10:32                         │
│  💰 Registró abono de $20M             │
│  Vivienda: Mz A - Casa 12              │

│  15 oct, 09:15                         │
│  ⏸️ Pausó negociación Mz B-202        │
│  Razón: Solicitud del cliente          │

│  10 oct, 16:40                         │
│  💜 Registró interés en Mz B-202       │
│  Estado inicial: Interesado            │
```

**Beneficios**:
- ✅ Auditoría completa
- ✅ Visibilidad de historial
- ✅ Facilita análisis de cliente

---

## 📁 Estructura de Archivos Propuesta

```
src/modules/clientes/components/
├── detalle-cliente.tsx              # Componente principal con tabs
├── detalle-cliente.styles.ts        # Estilos (tabs, cards, etc)
├── tabs/
│   ├── general-tab.tsx             # Tab 1: Info general
│   ├── intereses-tab.tsx           # Tab 2: Intereses
│   ├── documentos-tab.tsx          # Tab 3: Documentos
│   ├── negociaciones-tab.tsx       # Tab 4: Negociaciones
│   ├── actividad-tab.tsx           # Tab 5: Actividad
│   └── index.ts                    # Barrel export
└── index.ts
```

**Ejemplo de `general-tab.tsx`**:

```tsx
'use client'

import { User, Phone, Mail, MapPin, Heart } from 'lucide-react'
import type { Cliente } from '../../types'

interface GeneralTabProps {
  cliente: Cliente
}

export function GeneralTab({ cliente }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <section>
        <h3>👤 Información Personal</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoField icon={User} label="Nombres" value={cliente.nombres} showEmpty />
          <InfoField icon={User} label="Apellidos" value={cliente.apellidos} showEmpty />
          {/* ... */}
        </div>
      </section>

      {/* Información de Contacto */}
      <section>
        <h3>📞 Información de Contacto</h3>
        {/* ... */}
      </section>

      {/* Interés Inicial (si existe) */}
      {cliente.interes_inicial && (
        <section>
          <h3>💜 Interés Inicial</h3>
          {/* ... */}
        </section>
      )}

      {/* Información Adicional */}
      <section>
        <h3>💬 Información Adicional</h3>
        {/* ... */}
      </section>
    </div>
  )
}
```

---

## 🔧 Implementación Técnica

### Paso 1: Crear Estilos para Tabs

**Archivo**: `detalle-cliente.styles.ts`

```typescript
export const tabsClasses = {
  container: 'border-b border-gray-200 dark:border-gray-700 mb-6',
  nav: 'flex gap-4 overflow-x-auto',
  tab: 'relative flex-1 min-w-max cursor-pointer border-b-2 px-4 py-3 text-center transition-colors',
  tabActive: 'border-purple-500 text-purple-600 dark:text-purple-400',
  tabInactive: 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400',
  tabContent: 'flex items-center justify-center gap-2 text-sm font-medium',
  tabIcon: 'h-4 w-4',
  tabBadge: 'rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/30',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500',
}
```

---

### Paso 2: Actualizar `detalle-cliente.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, FileText, DollarSign, Activity } from 'lucide-react'
import { tabsClasses } from './detalle-cliente.styles'
import {
  GeneralTab,
  InteresesTab,
  DocumentosTab,
  NegociacionesTab,
  ActividadTab,
} from './tabs'

type TabType = 'general' | 'intereses' | 'documentos' | 'negociaciones' | 'actividad'

export function DetalleCliente({ cliente, isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const tabs = [
    { id: 'general', label: 'Información General', icon: User, count: null },
    { id: 'intereses', label: 'Intereses', icon: Heart, count: cliente.intereses?.length || 0 },
    { id: 'documentos', label: 'Documentos', icon: FileText, count: cliente.documentos?.length || 0 },
    { id: 'negociaciones', label: 'Negociaciones', icon: DollarSign, count: cliente.negociaciones_activas || 0 },
    { id: 'actividad', label: 'Actividad', icon: Activity, count: null },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="mb-6">
        <h2>{cliente.nombres} {cliente.apellidos}</h2>
        <p>{cliente.tipo_documento} - {cliente.numero_documento}</p>
      </div>

      {/* Tabs */}
      <div className={tabsClasses.container}>
        <nav className={tabsClasses.nav}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`${tabsClasses.tab} ${
                activeTab === tab.id ? tabsClasses.tabActive : tabsClasses.tabInactive
              }`}
              whileHover={{ y: -2 }}
            >
              <div className={tabsClasses.tabContent}>
                <tab.icon className={tabsClasses.tabIcon} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={tabsClasses.tabBadge}>{tab.count}</span>
                )}
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={tabsClasses.tabUnderline}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Contenido de Tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && <GeneralTab cliente={cliente} />}
          {activeTab === 'intereses' && <InteresesTab clienteId={cliente.id} />}
          {activeTab === 'documentos' && <DocumentosTab clienteId={cliente.id} />}
          {activeTab === 'negociaciones' && <NegociacionesTab clienteId={cliente.id} />}
          {activeTab === 'actividad' && <ActividadTab clienteId={cliente.id} />}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
```

---

## 📝 Decisión Crítica: ¿Cédula en Formulario de Creación?

### Opción A: **NO incluir cédula en formulario de creación** ✅ RECOMENDADO

**Flujo**:
1. Usuario crea cliente con datos básicos
2. Cliente se guarda en BD
3. Redirige a detalle del cliente
4. Tab "Documentos" muestra warning: "⚠️ Debe subir cédula"
5. Usuario sube cédula desde el tab

**Ventajas**:
- ✅ Formulario más corto y rápido
- ✅ Permite crear cliente aunque no tenga cédula a mano
- ✅ Facilita captura rápida de leads
- ✅ Gestión de documentos centralizada en un solo lugar
- ✅ Evita errores de carga durante creación
- ✅ Cédula puede subirse/actualizarse después

**Desventajas**:
- ❌ Cliente puede quedar sin cédula
- ❌ Requiere validación posterior

**Validación sugerida**:
```tsx
// Bloquear acciones críticas si no tiene cédula
function validarCedula(cliente: Cliente) {
  if (!cliente.documento_identidad_url) {
    toast.error('Debe subir la cédula del cliente primero')
    return false
  }
  return true
}

// Aplicar en:
- Asignar vivienda
- Registrar abono
- Generar contrato
- Aprobar negociación
```

---

### Opción B: **SÍ incluir cédula en formulario** ❌ NO RECOMENDADO

**Flujo**:
1. Formulario de creación tiene Step 4: "Documentación"
2. Usuario sube cédula obligatoriamente
3. No se puede crear cliente sin cédula

**Ventajas**:
- ✅ Cliente siempre tiene cédula completa
- ✅ Validación inmediata

**Desventajas**:
- ❌ Formulario muy largo (4 steps)
- ❌ Barrera de entrada alta
- ❌ Dificulta captura rápida
- ❌ Puede causar abandono del formulario
- ❌ No permite crear cliente si no tiene cédula a mano
- ❌ Errores de carga bloquean creación

---

### 🎯 Recomendación Final

**Opción A: NO incluir cédula en formulario**

**Implementación**:

1. **Formulario de creación**: 3 steps (Personal, Contacto, Interés)
2. **Tab de Documentos**: Gestión completa de cédula + otros docs
3. **Validaciones**: Bloquear acciones críticas si no tiene cédula
4. **Recordatorios**: Mostrar warning en detalle si falta cédula

**Badge en Tab de Documentos**:
```tsx
// Si NO tiene cédula
<span className="text-red-500">⚠️ 0</span>

// Si tiene cédula
<span className="text-green-500">✓ 2</span>
```

---

## 📋 Checklist de Implementación

### Fase 1: Crear Tabs (4-6 horas)

- [ ] Crear `detalle-cliente.styles.ts` con `tabsClasses`
- [ ] Crear carpeta `tabs/`
- [ ] Implementar `GeneralTab` (mover info actual)
- [ ] Implementar `InteresesTab` (reutilizar código existente)
- [ ] Implementar `DocumentosTab` (nuevo)
- [ ] Implementar `NegociacionesTab` (nuevo)
- [ ] Implementar `ActividadTab` (nuevo)
- [ ] Barrel export en `tabs/index.ts`

### Fase 2: Actualizar Detalle (2-3 horas)

- [ ] Agregar estado `activeTab`
- [ ] Renderizar UI de tabs
- [ ] Implementar navegación entre tabs
- [ ] Agregar animaciones (Framer Motion)
- [ ] Agregar counts dinámicos
- [ ] Testing responsive

### Fase 3: Tab de Documentos (3-4 horas)

- [ ] Crear servicio `subirDocumento(clienteId, archivo)`
- [ ] Crear servicio `eliminarDocumento(clienteId, documentoId)`
- [ ] UI de subida (drag & drop)
- [ ] Validación de archivos (PDF, max 5MB)
- [ ] Vista previa de documentos
- [ ] Warning si no tiene cédula
- [ ] Badge visual en tab

### Fase 4: Validaciones (1-2 horas)

- [ ] Función `validarCedula(cliente)`
- [ ] Bloquear asignación de vivienda sin cédula
- [ ] Bloquear registro de abono sin cédula
- [ ] Toast de error explicativo
- [ ] Documentar en README.md

---

## 📊 Comparación Visual

### Antes (Scroll Infinito)
```
┌────────────────────────────┐ ↑
│  Header                    │ │
│  Info Personal             │ │
│  Info Contacto             │ │ Scroll
│  Intereses                 │ │ 500px
│  Estadísticas              │ │
│  Documento                 │ │
│  Info Adicional            │ │
│  Metadatos                 │ ↓
└────────────────────────────┘
```

### Después (Tabs - Sin Scroll)
```
┌────────────────────────────┐
│  Header                    │
│  [General][Intereses][...]  │ ← Tabs
│  ──────────                │
│                            │
│  Contenido de tab actual   │ ← Altura fija
│  (sin scroll)              │   ~400px
│                            │
└────────────────────────────┘
```

---

## 🎯 Resultado Esperado

**Mejoras**:
- ✅ Sin scroll vertical
- ✅ Información organizada lógicamente
- ✅ Navegación clara por tabs
- ✅ Gestión centralizada de documentos
- ✅ Validaciones de cédula obligatoria
- ✅ Counts visuales en tabs
- ✅ Animaciones fluidas
- ✅ Responsive y mobile-friendly

**Experiencia del Usuario**:
- ✅ Encuentra información rápidamente
- ✅ Sabe cuántos intereses/documentos tiene el cliente (counts)
- ✅ Gestiona documentos en un solo lugar
- ✅ Timeline completo de actividad

---

**Fecha**: 2025-10-17
**Módulo**: Clientes - Detalle
**Status**: 📝 **PROPUESTA - PENDIENTE APROBACIÓN**
**Tiempo Estimado**: 10-15 horas de desarrollo
