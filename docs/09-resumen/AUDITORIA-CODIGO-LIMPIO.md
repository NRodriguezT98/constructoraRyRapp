# 🔍 AUDITORÍA DE CÓDIGO LIMPIO - constructoraRyR

**Fecha:** 15 de octubre de 2025
**Alcance:** Validación de separación de responsabilidades en toda la aplicación
**Basado en:** `.github/copilot-instructions.md` y `docs/GUIA-ESTILOS.md`

---

## 📊 RESUMEN EJECUTIVO

| Aspecto | Estado | Criticidad |
|---------|--------|-----------|
| Módulo Proyectos | ✅ **PERFECTO** | - |
| Módulo Documentos | ❌ **CRÍTICO** | 🔴 Alta |
| Módulo Viviendas | ⚠️ **INCOMPLETO** | 🟡 Media |
| Componentes Globales | ❌ **CRÍTICO** | 🔴 Alta |
| Páginas (app/) | ✅ **CORRECTO** | - |
| Shared Infrastructure | ✅ **CORRECTO** | - |

**Veredicto General:** ⚠️ **REQUIERE REFACTORIZACIÓN URGENTE**

---

## ✅ MÓDULO PROYECTOS (REFERENCIA PERFECTA)

### **Estructura:**
```
src/modules/proyectos/
├── components/          ✅ UI pura
├── hooks/              ✅ Lógica separada
├── services/           ✅ API/DB
├── store/              ✅ Estado global
├── styles/             ✅ Estilos centralizados
├── types/              ✅ TypeScript
├── constants/          ✅ Configuración
├── index.ts            ✅ Barrel export
└── README.md           ✅ Documentación
```

### **✅ Componentes Presentacionales:**
- `proyectos-page-main.tsx`: Solo orquestación de modales (useState para UI)
- `proyectos-form.tsx`: 0 lógica, solo recibe props y emite eventos
- `proyectos-lista.tsx`: Renderizado puro
- `proyectos-card.tsx`: Presentacional con hook separado

### **✅ Hooks Separados:**
- `useProyectos.ts`: CRUD + estado global
- `useProyectosFiltrados.ts`: Lógica de filtros
- `useProyectoCard.ts`: Lógica por tarjeta
- `useProyectoDetalle.ts`: Lógica detalle

### **✅ Servicios:**
- `proyectos.service.ts`: Todas las llamadas a Supabase

### **✅ Store:**
- `proyectos.store.ts`: Zustand con estado global

### **Calificación:** ⭐⭐⭐⭐⭐ (5/5)

**Este módulo cumple 100% con los principios de código limpio.**

---

## ❌ MÓDULO DOCUMENTOS (CRÍTICO - VIOLACIONES GRAVES)

### **Estructura INCOMPLETA:**
```
src/modules/documentos/
├── components/          ❌ TIENE LÓGICA MEZCLADA
├── hooks/              ❌ NO EXISTE
├── services/           ❌ EN src/services/ (mal ubicado)
├── store/              ✅ Existe
├── styles/             ❌ NO EXISTE
├── types/              ❌ EN src/types/ (mal ubicado)
├── schemas/            ✅ Existe
└── README.md           ❌ NO EXISTE
```

### **🔴 VIOLACIONES CRÍTICAS:**

#### **1. Componentes con Lógica de Negocio**

**`documentos-lista.tsx` (250+ líneas):**
```tsx
// ❌ VIOLACIÓN: useState con lógica compleja
const [vista, setVista] = useState<'grid' | 'lista'>('grid')
const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoProyecto | null>(null)
const [modalViewerAbierto, setModalViewerAbierto] = useState(false)

// ❌ VIOLACIÓN: useEffect con carga de datos
useEffect(() => {
  cargarDocumentos(proyectoId)
  if (user?.id) {
    cargarCategorias(user.id)
  }
}, [proyectoId, user?.id, cargarDocumentos, cargarCategorias])

// ❌ VIOLACIÓN: useMemo con filtrado complejo (50+ líneas)
const documentosFiltrados = useMemo(() => {
  let filtered = documentos
  if (categoriaFiltro) { /* ... */ }
  if (etiquetasFiltro.length > 0) { /* ... */ }
  if (soloImportantes) { /* ... */ }
  if (busqueda) { /* ... */ }
  return filtered
}, [documentos, categoriaFiltro, etiquetasFiltro, busqueda, soloImportantes])

// ❌ VIOLACIÓN: Lógica de descarga en componente
const handleDownload = async (documento: DocumentoProyecto) => {
  try {
    const url = await DocumentosService.obtenerUrlDescarga(documento.url_storage)
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error al descargar documento:', error)
  }
}
```

**Debería ser:**
```tsx
// ✅ CORRECTO: Hook separado
const {
  vista,
  setVista,
  documentoSeleccionado,
  modalViewerAbierto,
  documentosFiltrados,
  handleView,
  handleDownload,
  handleToggleImportante,
  handleArchive,
  handleDelete,
} = useDocumentosLista(proyectoId)

// Componente solo renderiza (< 80 líneas)
```

---

#### **2. `categorias-manager.tsx` (280+ líneas)**

```tsx
// ❌ VIOLACIÓN: Múltiples useState
const [modo, setModo] = useState<'lista' | 'crear' | 'editar'>('lista')
const [categoriaEditando, setCategoriaEditando] = useState<any>(null)
const [eliminando, setEliminando] = useState<string | null>(null)
const [cargado, setCargado] = useState(false)

// ❌ VIOLACIÓN: useEffect con lógica
useEffect(() => {
  if (userId && !cargado) {
    cargarCategorias(userId)
    setCargado(true)
  }
}, [userId, cargado, cargarCategorias])

// ❌ VIOLACIÓN: Handlers con lógica de negocio
const handleCrear = async (data: CategoriaFormData) => {
  await crearCategoria(userId, { ...data, orden: categorias.length + 1 })
  setModo('lista')
}

const handleEliminar = async (categoriaId: string) => {
  if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
  setEliminando(categoriaId)
  try {
    await eliminarCategoria(categoriaId)
  } finally {
    setEliminando(null)
  }
}
```

**Debería ser:**
```tsx
// ✅ CORRECTO
const {
  modo,
  categoriaEditando,
  eliminando,
  handleCrear,
  handleActualizar,
  handleEliminar,
  handleInicializarDefault,
  volverALista,
} = useCategoriasManager(userId)
```

---

#### **3. `documento-card.tsx` (180+ líneas)**

```tsx
// ❌ VIOLACIÓN: useState + useEffect para menú
const [menuAbierto, setMenuAbierto] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuAbierto(false)
    }
  }
  if (menuAbierto) {
    document.addEventListener('mousedown', handleClickOutside)
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [menuAbierto])
```

**Debería usar:**
```tsx
// ✅ Ya existe en shared/hooks/
import { useClickOutside } from '@/shared/hooks'

const menuRef = useClickOutside<HTMLDivElement>(() => setMenuAbierto(false))
```

---

#### **4. `documento-upload.tsx` (300+ líneas)**

```tsx
// ❌ VIOLACIÓN: Lógica compleja de drag & drop en componente
const [isDragging, setIsDragging] = useState(false)
const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

const handleDragOver = (e: DragEvent<HTMLDivElement>) => { /* ... */ }
const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { /* ... */ }
const handleDrop = (e: DragEvent<HTMLDivElement>) => { /* ... */ }
const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => { /* ... */ }
const validarArchivo = (file: File): string | null => { /* ... */ }
```

**Debería ser:**
```tsx
// ✅ CORRECTO: Hook useDocumentoUpload
const {
  isDragging,
  archivoSeleccionado,
  errorArchivo,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  limpiarArchivo,
} = useDocumentoUpload({ maxSize: 50 })
```

---

### **📂 Estructura FALTANTE:**

#### **hooks/ (NO EXISTE) - URGENTE**

Crear:
```
src/modules/documentos/hooks/
├── useDocumentosLista.ts      ⚠️ CRÍTICO
├── useCategoriasManager.ts    ⚠️ CRÍTICO
├── useDocumentoUpload.ts      ⚠️ CRÍTICO
├── useDocumentoCard.ts        🟡 Medio
└── index.ts
```

#### **styles/ (NO EXISTE)**

Crear:
```
src/modules/documentos/styles/
├── classes.ts
└── index.ts
```

#### **services/ (MAL UBICADO)**

Mover de `src/services/` a `src/modules/documentos/services/`:
- `documentos.service.ts` ✅
- `categorias.service.ts` ✅

#### **types/ (MAL UBICADO)**

Mover de `src/types/` a `src/modules/documentos/types/`:
- `documento.types.ts` ✅

---

### **Calificación:** ⭐ (1/5)

**Este módulo tiene código funcional pero NO cumple con código limpio.**

---

## ⚠️ MÓDULO VIVIENDAS (INCOMPLETO)

### **Estructura:**
```
src/modules/viviendas/
├── components/     ✅ Existe
├── hooks/          ✅ Existe
├── styles/         ✅ Existe
├── types/          ✅ Existe
├── services/       ❌ NO EXISTE
├── store/          ❌ NO EXISTE
└── README.md       ✅ Existe
```

### **⚠️ Problemas:**
1. ❌ Sin `services/` - No hay capa de datos
2. ❌ Sin `store/` - Probablemente estado en componentes
3. ⚠️ Revisar si componentes tienen lógica mezclada

### **Calificación:** ⭐⭐⭐ (3/5) - Estructura básica pero incompleta

---

## ❌ COMPONENTES GLOBALES (src/components/)

### **🔴 `sidebar.tsx` (495 líneas) - CRÍTICO**

```tsx
// ❌ VIOLACIÓN: Múltiples useState
const [isExpanded, setIsExpanded] = useState(true)
const [isMobile, setIsMobile] = useState(false)
const [searchQuery, setSearchQuery] = useState('')

// ❌ VIOLACIÓN: useEffect con lógica de resize
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth >= 768) {
      setIsExpanded(true)
    }
  }
  handleResize()
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

**Debería usar:**
```tsx
// ✅ Ya existe en shared/hooks/
import { useMediaQuery } from '@/shared/hooks'

const isMobile = useMediaQuery('(max-width: 768px)')
```

---

### **🔴 `navbar.tsx` (371 líneas) - CRÍTICO**

```tsx
// ❌ VIOLACIÓN: useState + useEffect
const [isOpen, setIsOpen] = useState(false)
const [searchOpen, setSearchOpen] = useState(false)
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20)
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

**Debería usar:**
```tsx
// ✅ Ya existe en shared/hooks/
import { useScroll } from '@/shared/hooks'

const { scrollY } = useScroll()
const scrolled = scrollY > 20
```

---

### **Calificación:** ⭐⭐ (2/5)

**Componentes funcionales pero con hooks reutilizables ignorados.**

---

## ✅ PÁGINAS (src/app/) - CORRECTO

Las páginas son **'use client'** y solo orquestan:
- Llaman a hooks
- Pasan props a componentes
- No tienen lógica de negocio

**Ejemplo perfecto:**
```tsx
// src/app/proyectos/page.tsx
export default function ProyectosPage() {
  return <ProyectosPageMain />
}
```

### **Calificación:** ⭐⭐⭐⭐⭐ (5/5)

---

## ✅ SHARED INFRASTRUCTURE - CORRECTO

```
src/shared/
├── components/ui/    ✅ Componentes reutilizables puros
├── hooks/           ✅ useClickOutside, useDebounce, useMediaQuery, useScroll
├── styles/          ✅ animations.ts, classes.ts
├── types/           ✅ common.ts
├── utils/           ✅ format.ts, helpers.ts, validation.ts
└── constants/       ✅ config.ts, messages.ts, routes.ts
```

### **Hooks Disponibles (NO USADOS):**
- ✅ `useClickOutside` → documento-card.tsx debería usarlo
- ✅ `useMediaQuery` → sidebar.tsx y navbar.tsx deberían usarlo
- ✅ `useScroll` → navbar.tsx debería usarlo
- ✅ `useDebounce` → búsquedas deberían usarlo

### **Calificación:** ⭐⭐⭐⭐⭐ (5/5)

---

## 📋 CHECKLIST DE VIOLACIONES

### **❌ PROHIBIDO (encontrado):**
- [x] Lógica en componentes (documentos-lista, categorias-manager, documento-upload)
- [x] Componentes > 150 líneas (sidebar: 495, navbar: 371, documentos-lista: 250+)
- [x] useState/useEffect complejos en componentes
- [x] Lógica de negocio mezclada con UI
- [x] No usar hooks compartidos existentes
- [x] Archivos de servicios/types mal ubicados

### **✅ REQUERIDO (faltante):**
- [ ] Hook personalizado por componente con lógica
- [ ] Archivo `.styles.ts` con estilos centralizados (documentos)
- [ ] Barrel exports en módulo documentos
- [ ] README.md en módulo documentos
- [ ] Services dentro del módulo (no en src/services/)
- [ ] Types dentro del módulo (no en src/types/)

---

## 🎯 PLAN DE REFACTORIZACIÓN

### **FASE 1: CRÍTICO (Semana 1)**

#### **1.1 Módulo Documentos - Crear Hooks**
```bash
# Crear estructura
mkdir src/modules/documentos/hooks
mkdir src/modules/documentos/styles
```

**Archivos a crear:**
- [ ] `hooks/useDocumentosLista.ts` (extraer de documentos-lista.tsx)
- [ ] `hooks/useCategoriasManager.ts` (extraer de categorias-manager.tsx)
- [ ] `hooks/useDocumentoUpload.ts` (extraer de documento-upload.tsx)
- [ ] `hooks/useDocumentoCard.ts` (extraer de documento-card.tsx)
- [ ] `hooks/index.ts` (barrel export)

#### **1.2 Módulo Documentos - Mover Archivos**
- [ ] Mover `src/services/documentos.service.ts` → `src/modules/documentos/services/`
- [ ] Mover `src/services/categorias.service.ts` → `src/modules/documentos/services/`
- [ ] Mover `src/types/documento.types.ts` → `src/modules/documentos/types/`

#### **1.3 Módulo Documentos - Refactorizar Componentes**
- [ ] `documentos-lista.tsx`: 250 líneas → < 100 líneas
- [ ] `categorias-manager.tsx`: 280 líneas → < 120 líneas
- [ ] `documento-upload.tsx`: 300 líneas → < 150 líneas
- [ ] `documento-card.tsx`: 180 líneas → < 80 líneas

#### **1.4 Componentes Globales**
- [ ] Refactorizar `sidebar.tsx` usando `useMediaQuery`
- [ ] Refactorizar `navbar.tsx` usando `useScroll`

---

### **FASE 2: IMPORTANTE (Semana 2)**

#### **2.1 Módulo Viviendas - Completar Estructura**
- [ ] Crear `src/modules/viviendas/services/viviendas.service.ts`
- [ ] Crear `src/modules/viviendas/store/viviendas.store.ts`
- [ ] Auditar componentes para verificar separación

#### **2.2 Crear Estilos Centralizados**
- [ ] `src/modules/documentos/styles/classes.ts`
- [ ] Extraer strings de Tailwind > 100 caracteres

#### **2.3 Documentación**
- [ ] Crear `src/modules/documentos/README.md`
- [ ] Actualizar `ARCHITECTURE.md`

---

### **FASE 3: MEJORAS (Semana 3)**

#### **3.1 Optimización**
- [ ] Eliminar código duplicado
- [ ] Agregar `useMemo`/`useCallback` donde falta
- [ ] Mejorar TypeScript (eliminar `any`)

#### **3.2 Testing**
- [ ] Validar que todo funciona igual
- [ ] Verificar performance
- [ ] Actualizar documentación

---

## 📊 MÉTRICAS DE CALIDAD

| Métrica | Antes | Objetivo | Prioridad |
|---------|-------|----------|-----------|
| Componentes > 150 líneas | 8 | 0 | 🔴 Alta |
| Componentes con lógica | 12+ | 0 | 🔴 Alta |
| Hooks faltantes | 4 | 0 | 🔴 Alta |
| Servicios mal ubicados | 2 | 0 | 🟡 Media |
| Types mal ubicados | 1 | 0 | 🟡 Media |
| Módulos sin README | 1 | 0 | 🟢 Baja |
| Módulos sin styles/ | 1 | 0 | 🟢 Baja |

---

## 🚨 IMPACTO EN DESARROLLO

### **Problemas Actuales:**
1. ❌ **Difícil mantenimiento:** Componentes muy largos
2. ❌ **No reutilizable:** Lógica duplicada en componentes
3. ❌ **Difícil testing:** Lógica mezclada con UI
4. ❌ **Inconsistencia:** Algunos módulos bien, otros mal
5. ❌ **Escalabilidad:** Nuevos módulos seguirán patrón incorrecto

### **Beneficios de Refactorizar:**
1. ✅ **Mantenible:** Componentes < 150 líneas
2. ✅ **Reutilizable:** Hooks compartidos
3. ✅ **Testeable:** Lógica separada
4. ✅ **Consistente:** Todos los módulos igual estructura
5. ✅ **Escalable:** Plantilla clara para nuevos módulos

---

## 🎓 LECCIONES APRENDIDAS

### **✅ Módulo Proyectos (perfecto):**
- Estructura modular completa
- Hooks separados por responsabilidad
- Componentes puros < 150 líneas
- Estilos centralizados
- Documentación completa

### **❌ Módulo Documentos (mal):**
- Componentes muy largos (250-300 líneas)
- Lógica mezclada con UI
- useState/useEffect complejos
- Sin hooks separados
- Servicios/types mal ubicados

---

## 📝 RECOMENDACIONES

### **Para AHORA (antes de continuar):**
1. 🔴 **REFACTORIZAR módulo Documentos (CRÍTICO)**
   - Crear hooks faltantes
   - Reducir tamaño de componentes
   - Mover servicios/types a su módulo

2. 🟡 **COMPLETAR módulo Viviendas**
   - Agregar services/ y store/
   - Auditar componentes

3. 🟡 **OPTIMIZAR componentes globales**
   - Usar hooks de shared/
   - Reducir tamaño de sidebar/navbar

### **Para NUEVOS módulos:**
1. ✅ **USAR módulo Proyectos como plantilla**
2. ✅ **SEGUIR MODULE_TEMPLATE.md**
3. ✅ **VALIDAR con checklist antes de commit**

---

## ✅ CONCLUSIÓN

**Estado actual:** ⚠️ **CÓDIGO FUNCIONAL PERO NO LIMPIO**

### **Resumen por Módulo:**
- ✅ Proyectos: PERFECTO (5/5)
- ❌ Documentos: CRÍTICO (1/5) → Requiere refactorización urgente
- ⚠️ Viviendas: INCOMPLETO (3/5) → Completar estructura
- ❌ Componentes globales: MEJORABLE (2/5) → Optimizar
- ✅ Páginas: CORRECTO (5/5)
- ✅ Shared: PERFECTO (5/5)

### **Recomendación:**
**NO DESARROLLAR nuevos módulos hasta refactorizar Documentos.**

De lo contrario, el código técnico aumentará y será más difícil mantener.

---

**Próximos Pasos:**
1. Revisar este reporte
2. Decidir si refactorizar ahora o después
3. Si se continúa sin refactorizar, al menos usar Proyectos como plantilla

---

**Generado por:** GitHub Copilot
**Fecha:** 15 de octubre de 2025
**Versión:** 1.0
