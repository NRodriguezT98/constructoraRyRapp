# 🔄 Modal de Reemplazo de Archivos - Guía de Uso Genérico

## 📋 Resumen

Modal profesional y genérico para reemplazar archivos de documentos en **Proyectos**, **Viviendas** y **Clientes**, con:

- ✅ **Theming dinámico** según módulo (verde/naranja/cyan)
- ✅ **Servicio genérico** con rollback automático
- ✅ **Auditoría completa** con metadata enriquecida
- ✅ **Validación admin-only** (solo administradores pueden reemplazar)
- ✅ **Backup automático** antes de reemplazo
- ✅ **Progreso en tiempo real** con 6 fases

---

## 🎨 Theming Dinámico

### Colores por Módulo

```typescript
// Proyectos → Verde/Esmeralda
<DocumentoReemplazarArchivoModal moduleName="proyectos" />

// Viviendas → Naranja/Ámbar
<DocumentoReemplazarArchivoModal moduleName="viviendas" />

// Clientes → Cyan/Azul
<DocumentoReemplazarArchivoModal moduleName="clientes" />

// Negociaciones → Rosa/Púrpura
<DocumentoReemplazarArchivoModal moduleName="negociaciones" />

// Abonos → Azul/Índigo
<DocumentoReemplazarArchivoModal moduleName="abonos" />

// Documentos → Rojo/Rosa
<DocumentoReemplazarArchivoModal moduleName="documentos" />

// Auditorías → Azul/Índigo/Púrpura
<DocumentoReemplazarArchivoModal moduleName="auditorias" />
```

### Elementos que Cambian de Color

**Header:**
- Gradiente de fondo (3 colores)
- Badge de versión
- Subtítulo

**Advertencia:**
- Borde del contenedor
- Fondo del contenedor
- Color de ícono
- Color de texto

**Formulario:**
- Border en focus de inputs
- Ring en focus (sombra)

**Drag & Drop:**
- Border cuando activo
- Fondo cuando activo
- Color de ícono
- Color de botón "Cambiar archivo"

**Progreso:**
- Gradiente de barra
- Color de porcentaje

**Botón Reemplazar:**
- Gradiente de fondo
- Gradiente en hover

---

## 🔧 Uso en Componentes

### 1. DocumentoCard (Compartido)

```tsx
import { DocumentoReemplazarArchivoModal } from '@/modules/documentos/components/modals'
import type { TipoEntidad } from '@/modules/documentos/types'
import type { ModuleName } from '@/shared/config/module-themes'

interface DocumentoCardProps {
  documento: DocumentoProyecto
  tipoEntidad: TipoEntidad        // 'proyecto' | 'vivienda' | 'cliente'
  moduleName: ModuleName          // 'proyectos' | 'viviendas' | 'clientes'
}

export function DocumentoCard({ documento, tipoEntidad, moduleName }: DocumentoCardProps) {
  const [modalReemplazar, setModalReemplazar] = useState(false)

  return (
    <>
      <button onClick={() => setModalReemplazar(true)}>
        Reemplazar archivo
      </button>

      <DocumentoReemplazarArchivoModal
        isOpen={modalReemplazar}
        documento={documento}
        tipoEntidad={tipoEntidad}
        moduleName={moduleName}
        onClose={() => setModalReemplazar(false)}
        onReemplazado={async () => {
          await refetch()
          toast.success('Archivo reemplazado')
        }}
      />
    </>
  )
}
```

### 2. En Módulo de Proyectos

```tsx
// src/modules/proyectos/components/documentos/DocumentosLista.tsx

<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="proyecto"     // ← Determina tabla: documentos_proyecto
  moduleName="proyectos"      // ← Determina color: verde
  onReemplazado={refetch}
/>
```

### 3. En Módulo de Viviendas

```tsx
// src/modules/viviendas/components/documentos/DocumentosLista.tsx

<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="vivienda"      // ← Determina tabla: documentos_vivienda
  moduleName="viviendas"      // ← Determina color: naranja
  onReemplazado={refetch}
/>
```

### 4. En Módulo de Clientes

```tsx
// src/modules/clientes/components/documentos/DocumentosLista.tsx

<DocumentoCard
  key={doc.id}
  documento={doc}
  tipoEntidad="cliente"       // ← Determina tabla: documentos_cliente
  moduleName="clientes"       // ← Determina color: cyan
  onReemplazado={refetch}
/>
```

---

## ⚙️ Arquitectura del Sistema

```
Usuario hace click en "Reemplazar"
  └─> DocumentoReemplazarArchivoModal
       ├─> Props: tipoEntidad (para lógica), moduleName (para colores)
       │
       ├─> getReemplazarArchivoModalStyles(moduleName)
       │    └─> Retorna estilos dinámicos con colores del módulo
       │
       └─> useReemplazarArchivoForm({ tipoEntidad })
            │
            └─> DocumentosService.reemplazarArchivoSeguro({ tipoEntidad, ... })
                 │
                 ├─> obtenerConfiguracionEntidad(tipoEntidad)
                 │    └─> { tabla, bucket, campoEntidad, ... }
                 │
                 ├─> Validación admin
                 ├─> Descargar archivo actual
                 ├─> Crear backup en storage
                 ├─> Verificar backup exitoso
                 ├─> Subir nuevo archivo
                 ├─> Actualizar registro en BD
                 ├─> Auditar acción
                 └─> Rollback si algo falla
```

---

## 📊 Configuración por Entidad

Definida en `src/modules/documentos/types/entidad.types.ts`:

```typescript
const CONFIGURACION_ENTIDADES: Record<TipoEntidad, ConfiguracionEntidad> = {
  proyecto: {
    tabla: 'documentos_proyecto',
    campoEntidad: 'proyecto_id',
    bucket: 'documentos-proyectos',
    moduleName: 'proyectos',
    nombreSingular: 'proyecto',
  },
  vivienda: {
    tabla: 'documentos_vivienda',
    campoEntidad: 'vivienda_id',
    bucket: 'documentos-viviendas',
    moduleName: 'viviendas',
    nombreSingular: 'vivienda',
  },
  cliente: {
    tabla: 'documentos_cliente',
    campoEntidad: 'cliente_id',
    bucket: 'documentos-clientes',
    moduleName: 'clientes',
    nombreSingular: 'cliente',
  },
}
```

---

## 🎯 Beneficios del Sistema

### 1. **Un solo componente, múltiples contextos**
- Antes: 3 modales duplicados (800 líneas)
- Ahora: 1 modal genérico (350 líneas)
- Reducción: **56% menos código**

### 2. **Theming automático**
- Colores dinámicos según módulo
- No hardcodear colores
- Consistencia visual garantizada

### 3. **Type-safe con TypeScript**
```typescript
type TipoEntidad = 'proyecto' | 'vivienda' | 'cliente'  // Solo valores permitidos
type ModuleName = 'proyectos' | 'viviendas' | 'clientes' | ...  // Auto-complete
```

### 4. **Rollback automático**
- Si falla la subida → No se actualiza BD
- Si falla actualización BD → Se elimina archivo nuevo
- Integridad de datos garantizada

### 5. **Auditoría completa**
```json
{
  "accion": "REEMPLAZO_ARCHIVO",
  "tabla": "documentos_proyecto",
  "registro_id": "doc-123",
  "metadata": {
    "tipoEntidad": "proyecto",
    "proyecto_id": "proj-456",
    "archivo_anterior": "documento-v1.pdf",
    "archivo_nuevo": "documento-v2.pdf",
    "justificacion": "Actualización de planos",
    "version_anterior": 1,
    "version_nueva": 2
  }
}
```

---

## 🚀 Cómo Extender a Otros Módulos

### Paso 1: Agregar tipo en `entidad.types.ts`

```typescript
export type TipoEntidad = 'proyecto' | 'vivienda' | 'cliente' | 'negociacion'  // ← Agregar

const CONFIGURACION_ENTIDADES: Record<TipoEntidad, ConfiguracionEntidad> = {
  // ...existentes
  negociacion: {
    tabla: 'documentos_negociacion',
    campoEntidad: 'negociacion_id',
    bucket: 'documentos-negociaciones',
    moduleName: 'negociaciones',
    nombreSingular: 'negociación',
  },
}
```

### Paso 2: Usar en componente

```tsx
<DocumentoReemplazarArchivoModal
  tipoEntidad="negociacion"      // ← Nuevo tipo
  moduleName="negociaciones"     // ← Colores rosa/púrpura
  {...props}
/>
```

¡Listo! El sistema es completamente extensible.

---

## ✅ Checklist de Implementación

Al usar el modal en un nuevo módulo:

- [ ] **Props obligatorias**: `tipoEntidad`, `moduleName` pasadas
- [ ] **Configuración creada** en `entidad.types.ts`
- [ ] **Tabla de BD existe** (ej: `documentos_cliente`)
- [ ] **Bucket de storage existe** (ej: `documentos-clientes`)
- [ ] **Políticas RLS configuradas** para el bucket
- [ ] **Campo de entidad correcto** (ej: `cliente_id`)
- [ ] **Theme color verificado** en preview
- [ ] **Callback `onReemplazado`** invalida caché correctamente

---

## 🔒 Seguridad

### Validaciones Implementadas

1. **Solo administradores** pueden reemplazar archivos
2. **Backup obligatorio** antes de reemplazar
3. **Verificación de backup** antes de proceder
4. **Rollback automático** si falla
5. **Auditoría completa** de todas las acciones
6. **Justificación requerida** con mínimo 10 caracteres
7. **Password de admin requerido**

### Flujo de Seguridad

```
1. Usuario hace click en "Reemplazar"
2. Modal solicita: nuevo archivo + justificación + password
3. Sistema valida: es admin? ✅
4. Sistema descarga: archivo actual
5. Sistema crea: backup en storage
6. Sistema verifica: backup existe? ✅
7. Sistema sube: nuevo archivo
8. Sistema actualiza: BD (version++, url_archivo)
9. Sistema audita: acción completa con metadata
10. Sistema retorna: éxito ✅

Si falla en paso 7-9 → Rollback automático (eliminar nuevo, restaurar anterior)
```

---

## 📚 Archivos Relacionados

**Core:**
- `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.tsx` (modal)
- `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.styles.ts` (estilos dinámicos)
- `src/modules/documentos/hooks/useReemplazarArchivoForm.ts` (lógica)
- `src/modules/documentos/services/documentos-reemplazo.service.ts` (servicio genérico)
- `src/modules/documentos/types/entidad.types.ts` (configuración)

**Theming:**
- `src/shared/config/module-themes.ts` (colores por módulo)

**Documentación:**
- `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md` (esta guía)
- `docs/POLITICA-ELIMINACION-DOCUMENTOS-ADMIN-ONLY.md` (seguridad)

---

## 🎨 Ejemplo Visual de Theming

### Proyectos (Verde/Esmeralda)
```
┌──────────────────────────────────────┐
│ 🔄 Reemplazar Archivo Documento      │  ← bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600
├──────────────────────────────────────┤
│ ⚠️ Esta acción es CRÍTICA            │  ← border-green-200, bg-green-50
│ • Validación admin requerida         │  ← text-green-900
│ • Se creará backup automático        │
├──────────────────────────────────────┤
│ [Archivo Actual]                     │
│ documento-v1.pdf (2.4 MB)            │
├──────────────────────────────────────┤
│ [Nuevo Archivo]                      │
│ 📄 documento-v2.pdf (3.1 MB)         │  ← text-green-600 (ícono)
│                                      │  ← border-green-500 (drag active)
├──────────────────────────────────────┤
│ Progreso: 65% █████░░░░░             │  ← bg-gradient-to-r from-green-500...
├──────────────────────────────────────┤
│ [Cancelar]  [Reemplazar Archivo]     │  ← bg-gradient-to-r from-green-600...
└──────────────────────────────────────┘
```

### Viviendas (Naranja/Ámbar)
```
Todos los green-XXX reemplazados por orange-XXX
```

### Clientes (Cyan/Azul)
```
Todos los green-XXX reemplazados por cyan-XXX
```

---

## 🔄 Migración desde Modales Antiguos

Si tienes un modal específico de módulo:

**Antes:**
```tsx
// src/modules/viviendas/components/modals/ReemplazarArchivoModal.tsx
<ReemplazarArchivoModal
  documento={doc}
  onClose={...}
/>
```

**Después:**
```tsx
// Usar modal genérico de documentos
import { DocumentoReemplazarArchivoModal } from '@/modules/documentos/components/modals'

<DocumentoReemplazarArchivoModal
  documento={doc}
  tipoEntidad="vivienda"    // ← Agregar
  moduleName="viviendas"    // ← Agregar
  onClose={...}
/>
```

**Beneficios:**
- ✅ Rollback automático (no tenías antes)
- ✅ Verificación de backup (no tenías antes)
- ✅ Auditoría completa (no tenías antes)
- ✅ Theming consistente
- ✅ Menos código duplicado

---

## 🎯 Conclusión

El `DocumentoReemplazarArchivoModal` es un componente **genérico, seguro y profesional** para reemplazar archivos en cualquier módulo del sistema.

**Ventajas principales:**
- 🎨 Theming automático por módulo
- 🔒 Seguridad admin-only con rollback
- 📊 Auditoría completa con metadata
- 🔄 Backup automático verificado
- 📦 Un componente, múltiples contextos
- ✅ Type-safe con TypeScript

**Uso:**
```tsx
<DocumentoReemplazarArchivoModal
  tipoEntidad="proyecto"   // Define lógica (tabla/bucket)
  moduleName="proyectos"   // Define colores (tema)
  documento={doc}
  onClose={...}
  onReemplazado={...}
/>
```

¡Listo para usar en Proyectos, Viviendas, Clientes y cualquier módulo futuro! 🚀
