# 📊 Estructura de Documentos: Proyectos vs Viviendas

## 🎯 Objetivo
Replicar EXACTAMENTE la estructura de documentos de Proyectos en Viviendas para mantener consistencia y reutilizar componentes.

---

## 📁 Estructura en Proyectos (REFERENCIA)

### **Tab Principal**
```
src/app/proyectos/[id]/tabs/documentos-tab.tsx
```

**Características:**
- ✅ 3 vistas: Principal, Upload, Categorías
- ✅ Usa componentes de `@/modules/documentos/components`
- ✅ Tema dinámico con `moduleThemes` (verde para proyectos)
- ✅ Estados locales: `showUpload`, `showCategorias`

**Patrón de navegación:**
```typescript
Vista Principal ← → Vista Upload
       ↓
Vista Categorías
```

---

### **Componentes Principales Usados**

#### 1. **DocumentoUpload** (Subir documentos)
```typescript
import { DocumentoUpload } from '@/modules/documentos/components/upload/documento-upload'

<DocumentoUpload
  proyectoId={proyecto.id}
  onSuccess={() => setShowUpload(false)}
  onCancel={() => setShowUpload(false)}
/>
```

#### 2. **DocumentosLista** (Listar documentos)
```typescript
import { DocumentosLista } from '@/modules/documentos/components/lista/documentos-lista'

<DocumentosLista
  proyectoId={proyecto.id}
  onUploadClick={() => setShowUpload(true)}
  moduleName="proyectos"
/>
```

#### 3. **CategoriasManager** (Gestionar categorías)
```typescript
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'

<CategoriasManager
  userId={user.id}
  onClose={() => setShowCategorias(false)}
  modulo="proyectos"
/>
```

---

## 📁 Estructura en Viviendas (ACTUAL)

### **Tab Principal**
```
src/modules/viviendas/components/detalle/tabs/DocumentosTab.tsx
```

**Estado:**
- ✅ Estructura IDÉNTICA a Proyectos
- ✅ Usa componentes propios de viviendas (`@/modules/viviendas/components/documentos`)
- ✅ Tema naranja/ámbar (`moduleThemes.viviendas`)
- ⚠️ **PROBLEMA**: Los componentes son ESPECÍFICOS de viviendas, no reutiliza de `@/modules/documentos`

---

### **Componentes Propios de Viviendas**

```
src/modules/viviendas/components/documentos/
├── badge-estado-proceso.tsx
├── lista/
│   ├── documento-card.tsx
│   ├── documento-card-horizontal.tsx
│   ├── documentos-filtros.tsx
│   ├── documentos-lista.tsx
│   └── index.ts
├── modals/
│   ├── ConfirmarCambiosDocumentoModal.tsx
│   ├── DocumentoEditarMetadatosModal.tsx
│   ├── DocumentoNuevaVersionModal.tsx
│   ├── DocumentoReemplazarArchivoModal.tsx
│   ├── DocumentoVersionesModal.tsx
│   ├── MarcarEstadoVersionModal.tsx
│   └── index.ts
├── shared/
│   ├── EstadoVersionBadge.tsx
│   ├── categoria-icon.tsx
│   └── index.ts
├── upload/
│   ├── documento-upload.tsx
│   └── index.ts
├── viewer/
│   ├── documento-viewer.tsx
│   └── index.ts
└── index.ts
```

---

## 🔄 Componentes Compartidos vs Específicos

### **Módulo General de Documentos** (`@/modules/documentos`)

**Componentes Reutilizables:**
```
src/modules/documentos/components/
├── archivados/                    # ⚠️ NO existe en viviendas
├── badge-estado-proceso.tsx       # ✅ Duplicado en viviendas
├── categorias/                    # ✅ Compartido (usado por proyectos Y viviendas)
├── eliminados/                    # ⚠️ NO existe en viviendas
├── lista/                         # ✅ Similar en viviendas
├── modals/                        # ✅ Similar en viviendas
├── shared/                        # ✅ Similar en viviendas
├── upload/                        # ✅ Similar en viviendas
└── viewer/                        # ✅ Similar en viviendas
```

---

## 🎨 Theming y Diferencias Clave

### **Proyectos (Verde/Esmeralda)**
```typescript
const theme = moduleThemes.proyectos
// Colores: from-green-600 via-emerald-600 to-teal-600
```

### **Viviendas (Naranja/Ámbar)**
```typescript
const theme = moduleThemes.viviendas
// Colores: from-orange-600 via-amber-600 to-yellow-600
```

### **Sistema de Theming**
Ambos usan el mismo sistema:
```typescript
theme.classes.button.primary    // Botón primario
theme.classes.button.secondary  // Botón secundario
theme.classes.border.light      // Borde claro
theme.classes.gradient.primary  // Gradiente principal
```

---

## 🔧 Diferencias Clave de Implementación

| Aspecto | Proyectos | Viviendas | Estado |
|---------|-----------|-----------|--------|
| **Props del Tab** | `proyecto: Proyecto` | `viviendaId: string` | ⚠️ Diferente |
| **Componente Upload** | `@/modules/documentos` | `@/modules/viviendas` | ⚠️ Duplicado |
| **Componente Lista** | `@/modules/documentos` | `@/modules/viviendas` | ⚠️ Duplicado |
| **Categorías Manager** | `@/modules/documentos` | `@/modules/documentos` | ✅ Compartido |
| **Tema** | `proyectos` | `viviendas` | ✅ Correcto |
| **Prop `proyectoId`** | Sí | No (`viviendaId`) | ⚠️ Diferente |

---

## 🚨 Problema Actual

**Duplicación innecesaria:**
- Los componentes de `DocumentoUpload` y `DocumentosLista` están **duplicados** entre:
  - `@/modules/documentos/components/` (usados por Proyectos)
  - `@/modules/viviendas/components/documentos/` (específicos para Viviendas)

**¿Por qué es problemático?**
- ❌ Código duplicado difícil de mantener
- ❌ Bugs se arreglan en un lado pero no en otro
- ❌ Nuevas features requieren implementarse 2 veces
- ❌ Inconsistencias visuales y funcionales

---

## ✅ Solución Propuesta

### **Opción A: Componentes Genéricos con Props** (RECOMENDADO)

Hacer que los componentes de `@/modules/documentos` acepten props genéricas:

```typescript
// Antes (Proyectos)
<DocumentoUpload proyectoId={proyecto.id} />

// Después (Genérico)
<DocumentoUpload
  entidadId={proyecto.id}      // o vivienda.id
  tipoEntidad="proyectos"       // o "viviendas"
  onSuccess={handleSuccess}
/>
```

**Ventajas:**
- ✅ Un solo componente para todo
- ✅ Cambios se reflejan en todos los módulos
- ✅ Menos código que mantener
- ✅ Theming ya implementado con `moduleName` prop

### **Opción B: Mantener Separados** (ACTUAL)

Mantener componentes específicos por módulo:

**Ventajas:**
- ✅ Máxima flexibilidad por módulo
- ✅ Cambios en viviendas no afectan proyectos

**Desventajas:**
- ❌ Código duplicado
- ❌ Mantenimiento doble
- ❌ Riesgo de inconsistencias

---

## 📋 Checklist de Implementación

### **Si se elige Opción A (Componentes Genéricos):**

- [ ] **Actualizar DocumentoUpload**
  - [ ] Cambiar `proyectoId` → `entidadId`
  - [ ] Agregar prop `tipoEntidad: 'proyectos' | 'viviendas'`
  - [ ] Actualizar service calls para usar tabla correcta

- [ ] **Actualizar DocumentosLista**
  - [ ] Cambiar `proyectoId` → `entidadId`
  - [ ] Agregar prop `tipoEntidad`
  - [ ] Actualizar queries de React Query

- [ ] **Migrar viviendas a usar componentes genéricos**
  - [ ] Cambiar imports de `@/modules/viviendas` → `@/modules/documentos`
  - [ ] Pasar `tipoEntidad="viviendas"`
  - [ ] Eliminar componentes duplicados de viviendas

- [ ] **Verificar funcionamiento**
  - [ ] Proyectos sigue funcionando igual
  - [ ] Viviendas funciona con nuevos componentes
  - [ ] Dark mode funciona en ambos
  - [ ] Theming se aplica correctamente

### **Si se mantiene Opción B (Separados):**

- [x] ✅ Componentes de viviendas ya creados
- [x] ✅ Estructura replicada de proyectos
- [ ] ⚠️ Documentar diferencias específicas
- [ ] ⚠️ Proceso para sincronizar cambios entre módulos

---

## 🎯 Recomendación Final

**OPCIÓN A (Componentes Genéricos)** es la mejor opción a largo plazo porque:

1. ✅ Ya existe el sistema de theming (`moduleName` prop)
2. ✅ La lógica de negocio es idéntica (subir, listar, editar documentos)
3. ✅ Solo cambia la tabla (`documentos_proyecto` vs `documentos_vivienda`)
4. ✅ Facilita agregar más módulos en el futuro (clientes, contratos, etc.)
5. ✅ Reduce deuda técnica significativamente

**Implementación sugerida:**
1. Refactorizar componentes de `@/modules/documentos` para que sean genéricos
2. Migrar proyectos a usar la nueva API
3. Migrar viviendas a usar los mismos componentes
4. Eliminar componentes duplicados de `@/modules/viviendas/components/documentos`

---

## 📊 Estado Actual vs Objetivo

### **Actual**
```
Proyectos → @/modules/documentos/components
Viviendas → @/modules/viviendas/components/documentos (duplicado)
```

### **Objetivo (Opción A)**
```
Proyectos → @/modules/documentos/components (genérico)
Viviendas → @/modules/documentos/components (genérico)
Clientes  → @/modules/documentos/components (genérico) ← BONUS
```

---

## 🔗 Archivos Clave

**Proyectos:**
- Tab: `src/app/proyectos/[id]/tabs/documentos-tab.tsx`
- Componentes: `src/modules/documentos/components/`

**Viviendas:**
- Tab: `src/modules/viviendas/components/detalle/tabs/DocumentosTab.tsx`
- Componentes: `src/modules/viviendas/components/documentos/`

**Configuración:**
- Theming: `src/shared/config/module-themes.ts`
- Tipos: `src/modules/documentos/types/documento.types.ts`
