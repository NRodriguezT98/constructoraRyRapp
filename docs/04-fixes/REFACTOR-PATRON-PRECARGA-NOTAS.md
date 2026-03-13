# 🔄 Refactor: Patrón Consistente de Precarga para NotaModal

**Fecha**: 2025-02-01
**Objetivo**: Unificar metodología de carga de datos en modales (NotaModal → EditarClienteModal)
**Motivación**: "No me gusta que trabajemos con distintas metodologías"

---

## 🎯 Problema Identificado

### Metodología ANTERIOR (inconsistente):
```typescript
// NotaModal usaba:
1. useNotaPorId hook con React Query
2. Pre-fetch en handleEditarNota
3. notaCargandoId para rastrear loading
4. Spinner en botón de editar

// Complejidad innecesaria:
- Hook adicional (useNotaPorId)
- Estado de loading por nota
- UI spinner en botón
```

### Metodología DESEADA (EditarClienteModal):
```typescript
// FormularioClienteContainer usa:
1. clienteInicial como prop
2. useEffect para precargar datos
3. Modal se abre con datos listos
4. Sin estados de loading adicionales

// Patrón simple y consistente:
- Props de datos completos
- useEffect para sincronización
- Sin hooks extra
- Sin spinners intermedios
```

---

## ✅ Solución Implementada

### 1. Refactor de NotaModal (props + useEffect)

**ANTES:**
```typescript
interface NotaModalProps {
  notaId?: string | null  // ❌ Solo ID
}

const { data: notaData, isLoading: cargandoNota } = useNotaPorId(notaId)  // ❌ Hook separado

useEffect(() => {
  if (notaData && modoEdicion) {
    setTitulo(notaData.titulo)
    // ...
  }
}, [notaData, modoEdicion, isOpen])  // ❌ Dependencias múltiples
```

**DESPUÉS:**
```typescript
interface NotaModalProps {
  notaInicial?: NotaHistorialCliente | null  // ✅ Objeto completo (igual que clienteInicial)
}

// ✅ PRECARGA: Mismo patrón que useFormularioCliente
useEffect(() => {
  if (notaInicial) {
    // Modo edición: precargar datos
    setTitulo(notaInicial.titulo)
    setContenido(notaInicial.contenido)
    setEsImportante(notaInicial.es_importante)
  } else {
    // Reset para nueva nota
    setTitulo('')
    setContenido('')
    setEsImportante(false)
  }
}, [notaInicial])  // ✅ Dependencia simple
```

---

### 2. Refactor de historial-tab.tsx (carga + modal)

**ANTES:**
```typescript
const [notaEditando, setNotaEditando] = useState<string | null>(null)  // ❌ Solo ID
const [notaCargandoId, setNotaCargandoId] = useState<string | null>(null)  // ❌ Loading state

const handleEditarNota = async (notaId: string) => {
  setNotaCargandoId(notaId)  // ❌ Rastrear loading
  setNotaEditando(notaId)

  // Pre-fetch
  await notasHistorialService.obtenerNotaPorId(notaId)

  setNotaCargandoId(null)
  setMostrarModalNota(true)
}
```

**DESPUÉS:**
```typescript
const [notaSeleccionada, setNotaSeleccionada] = useState<any>(null)  // ✅ Objeto completo

const handleEditarNota = async (notaId: string) => {
  try {
    // Cargar nota completa desde servicio
    const nota = await notasHistorialService.obtenerNotaPorId(notaId)

    // Setear nota y abrir modal (mismo patrón que EditarCliente)
    setNotaSeleccionada(nota)
    setMostrarModalNota(true)
  } catch (error) {
    toast.error('Error al cargar la nota')
  }
}

// Pasar a modal
<NotaModal
  notaInicial={notaSeleccionada}  // ✅ Patrón consistente con clienteInicial
  // ...
/>
```

---

### 3. Simplificación de EventoCard (sin spinner)

**ANTES:**
```typescript
interface EventoCardProps {
  notaCargandoId?: string | null  // ❌ Prop de loading
}

const estaCargando = notaCargandoId === notaId  // ❌ Comparación

<button disabled={estaCargando}>
  {estaCargando ? (
    <Loader2 className="animate-spin" />  // ❌ Spinner
  ) : (
    <Edit />
  )}
  Editar
</button>
```

**DESPUÉS:**
```typescript
interface EventoCardProps {
  // ✅ Sin prop notaCargandoId
}

<button onClick={() => onEditarNota?.(notaId)}>
  <Edit />  {/* ✅ Siempre ícono estático */}
  Editar
</button>
```

---

### 4. Archivo eliminado

```bash
# ❌ Hook innecesario (lógica movida a handleEditarNota)
src/modules/clientes/hooks/useNotaPorId.ts
```

---

## 📊 Comparación de Patrones

| Aspecto | ANTES (NotaModal) | DESPUÉS (NotaModal) | EditarClienteModal |
|---------|-------------------|---------------------|-------------------|
| **Prop de datos** | `notaId?: string` | `notaInicial?: NotaHistorialCliente` | `clienteInicial?: ClienteDTO` |
| **Hook extra** | `useNotaPorId()` ✅ | ❌ Ninguno | ❌ Ninguno |
| **Precarga** | React Query hook | useEffect + props | useEffect + props |
| **Estado loading** | `notaCargandoId` ✅ | ❌ No necesario | ❌ No necesario |
| **UI spinner** | Botón "Editar" ✅ | ❌ Ninguno | ❌ Ninguno |
| **Complejidad** | Alta (4 componentes) | Baja (2 componentes) | Baja (2 componentes) |

---

## 🎨 Flujo Completo (Después del Refactor)

### Modo Creación:
```
Clic "Agregar Nota"
  ↓
setNotaSeleccionada(null)
  ↓
setMostrarModalNota(true)
  ↓
NotaModal recibe notaInicial={null}
  ↓
useEffect detecta null → reset formulario
  ↓
✅ Modal vacío (modo creación)
```

### Modo Edición:
```
Clic "Editar" en EventoCard
  ↓
handleEditarNota(notaId)
  ↓
notasHistorialService.obtenerNotaPorId(notaId) → { id, titulo, contenido, ... }
  ↓
setNotaSeleccionada(notaCompleta)
  ↓
setMostrarModalNota(true)
  ↓
NotaModal recibe notaInicial={notaCompleta}
  ↓
useEffect detecta notaInicial → setFormulario(notaInicial)
  ↓
✅ Modal precargado con datos (modo edición)
```

---

## ✅ Beneficios del Refactor

1. **Consistencia Arquitectural**
   - ✅ Misma metodología en NotaModal y EditarClienteModal
   - ✅ Patrón de props + useEffect unificado
   - ✅ Código más predecible y mantenible

2. **Simplificación del Código**
   - ✅ Hook `useNotaPorId` eliminado (25 líneas menos)
   - ✅ Estado `notaCargandoId` eliminado (complejidad reducida)
   - ✅ Spinner en botón eliminado (UI más limpia)

3. **Mejor Experiencia de Usuario**
   - ✅ Modal se abre instantáneamente
   - ✅ Datos precargados sin estados intermedios
   - ✅ Sin flashes de loading innecesarios

4. **Facilidad de Mantenimiento**
   - ✅ Patrón estándar documentado
   - ✅ Menos componentes a mantener
   - ✅ Lógica centralizada en historial-tab.tsx

---

## 📚 Referencias

### Plantillas de referencia:
- `FormularioClienteContainer.tsx` (patrón de precarga con clienteInicial)
- `useFormularioCliente.ts` (useEffect para sincronizar datos)
- `clientes-page-main.tsx` (carga completa antes de abrir modal)

### Documentación relacionada:
- `docs/04-fixes/FIX-PRECARGA-DATOS-EDICION.md`
- `docs/04-fixes/SOLUCION-DEFINITIVA-EDICION.md`
- `docs/03-modulos/MODULO-CLIENTES-EXITOSO.md`

---

## 🚀 Próximos Pasos

Este patrón debe replicarse en TODOS los modales futuros:

```typescript
// ✅ PATRÓN ESTÁNDAR PARA MODALES DE EDICIÓN

// 1. Props con objeto completo (no ID)
interface MiModalProps {
  datoInicial?: MiTipo | null  // ✅ Objeto completo
}

// 2. useEffect para precarga
useEffect(() => {
  if (datoInicial) {
    setFormData(datoInicial)  // Edición
  } else {
    setFormData(valoresVacios)  // Creación
  }
}, [datoInicial])

// 3. Handler en componente padre
const handleEditar = async (id: string) => {
  const dato = await miService.obtenerPorId(id)
  setDatoSeleccionado(dato)
  setModalAbierto(true)
}

// 4. Pasar objeto completo al modal
<MiModal datoInicial={datoSeleccionado} />
```

---

## 📝 Checklist de Validación

- [x] NotaModal usa `notaInicial` prop (no `notaId`)
- [x] useEffect precarga datos con dependencia simple
- [x] historial-tab.tsx carga nota completa antes de abrir
- [x] EventoCard sin prop `notaCargandoId`
- [x] EventoCard sin spinner en botón "Editar"
- [x] GrupoEventosFecha sin prop `notaCargandoId`
- [x] Hook `useNotaPorId` eliminado
- [x] Sin errores de TypeScript
- [x] Patrón consistente con EditarClienteModal ✅

---

**Resultado**: Metodología unificada y consistente en toda la aplicación 🎯
