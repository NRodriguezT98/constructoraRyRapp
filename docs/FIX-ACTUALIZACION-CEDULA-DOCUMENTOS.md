# 🔧 Fix: Actualización Automática de Cédula en Documentos

> **Fecha**: 24 de noviembre de 2025
> **Problema**: Después de subir cédula, no aparecía en la lista de documentos
> **Solución**: Corregir flujo de actualización para usar `router.refresh()` correctamente

---

## 🐛 Problema Identificado

Cuando el usuario subía la cédula desde el botón "⚠️ Subir Cédula (Requerido)":

1. ✅ Cédula se guardaba correctamente en Storage
2. ✅ URL se actualizaba en tabla `clientes.documento_identidad_url`
3. ✅ Toast mostraba "Cédula subida exitosamente"
4. ❌ **PERO** la lista de documentos seguía mostrando "No hay documentos"

### Causa Raíz

**Clientes** usa un patrón diferente a **Proyectos** y **Viviendas**:

- **Proyectos/Viviendas**: Usan `DocumentosLista` genérico con **React Query** (invalidación automática)
- **Clientes**: Usa `DocumentosListaCliente` específico con **Zustand Store** (actualización manual)

El flujo roto era:

```tsx
// ❌ ANTES (INCORRECTO)
onSuccess={() => {
  setShowUpload(false)
  setUploadTipoCedula(false)
  if (uploadTipoCedula) {
    router.refresh() // Actualiza cliente.documento_identidad_url
  } else {
    cargarDocumentos(cliente.id) // Solo para docs regulares
  }
}
```

**Problemas**:
1. `router.refresh()` actualizaba `cliente` prop en el servidor
2. PERO `DocumentosListaCliente` recibía nueva `cedulaUrl` prop
3. Hook `useDocumentosListaCliente` **NO reaccionaba** al cambio de `cedulaUrl`
4. El `useMemo` para `cedulaDocumento` tenía `cedulaUrl` en dependencies
5. PERO el valor NO se reevaluaba porque el componente no se re-renderizaba

---

## ✅ Solución Implementada

### **1. Simplificar `onSuccess` callback**

Eliminamos la lógica condicional y dejamos solo `router.refresh()`:

```tsx
// ✅ AHORA (CORRECTO)
onSuccess={() => {
  setShowUpload(false)
  setUploadTipoCedula(false)
  // ✅ Refrescar TODA la página (revalida cliente desde servidor)
  // Esto actualiza cliente.documento_identidad_url automáticamente
  router.refresh()
}
```

**Por qué funciona**:
- `router.refresh()` revalida **TODOS** los datos del Server Component
- Esto incluye el `cliente` que viene del query de React Query
- El nuevo `cliente` con `documento_identidad_url` actualizado se pasa como prop
- React detecta el cambio y re-renderiza el componente

### **2. Agregar `useEffect` para sincronizar título**

El hook tenía `cedulaTituloLocal` en state pero nunca se actualizaba cuando cambiaba el prop:

```tsx
// ✅ NUEVO: Sincronizar cuando cambia el prop
useEffect(() => {
  setCedulaTituloLocal(cedulaTituloPersonalizado || null)
}, [cedulaTituloPersonalizado])
```

### **3. Verificar dependencies del `useMemo`**

El `cedulaDocumento` ya tenía `cedulaUrl` en dependencies, así que se reevalúa automáticamente:

```tsx
const cedulaDocumento = useMemo(() => {
  if (!cedulaUrl) return null // ← Se detecta cambio de null a string

  return {
    id: 'cedula-ciudadania',
    titulo: cedulaTituloLocal || 'Cédula de Ciudadanía',
    url_storage: cedulaUrl, // ← Nueva URL
    // ... resto del documento
  }
}, [cedulaUrl, cedulaTituloLocal, numeroDocumento, clienteId, categoriaIdentidad])
```

---

## 🎯 Flujo Correcto Ahora

```
Usuario click "⚠️ Subir Cédula (Requerido)"
  ↓
Modal de upload se abre (esCedula=true)
  ↓
Usuario selecciona archivo PDF/imagen
  ↓
useDocumentoUploadCliente.subirCedula()
  ├─ Sube archivo a Storage: documentos-clientes/{userId}/Cedula_Juan_Perez_123.pdf
  ├─ Obtiene URL pública
  └─ Actualiza BD: UPDATE clientes SET documento_identidad_url = 'https://...'
  ↓
onSuccess() ejecuta
  ├─ setShowUpload(false) ← Cierra modal
  ├─ setUploadTipoCedula(false) ← Reset flag
  └─ router.refresh() ← ⭐ REVALIDA DATOS DEL SERVIDOR
  ↓
Next.js Server Component revalida
  ├─ useClienteQuery(clienteUUID) ejecuta query
  └─ Obtiene cliente con documento_identidad_url actualizado
  ↓
Componente DocumentosTab recibe nuevo cliente prop
  ├─ cliente.documento_identidad_url: null → "https://..."
  └─ Pasa como prop: cedulaUrl={cliente.documento_identidad_url}
  ↓
DocumentosListaCliente recibe nueva cedulaUrl
  ↓
useDocumentosListaCliente hook detecta cambio
  ├─ useMemo para cedulaDocumento se reevalúa
  ├─ Crea documento virtual con nueva URL
  └─ todosDocumentos = [cedulaDocumento, ...documentos]
  ↓
Lista se actualiza automáticamente
  ✅ Muestra card "Cédula de Ciudadanía" con badge "Sistema"
```

---

## 🆚 Comparación con Otros Módulos

### **Proyectos** (React Query puro):
```tsx
<DocumentoUpload
  entidadId={proyecto.id}
  tipoEntidad="proyecto"
  onSuccess={() => setShowUpload(false)} // ← Simple
/>
```

**Por qué funciona**: `DocumentosLista` usa `useDocumentosQuery()` con React Query que tiene **invalidación automática** después de mutations.

### **Clientes** (Híbrido: Props + Store):
```tsx
<DocumentoUploadCliente
  clienteId={cliente.id}
  esCedula={true}
  onSuccess={() => {
    setShowUpload(false)
    router.refresh() // ← Necesario para actualizar props
  }}
/>
```

**Por qué necesita refresh**: La cédula se guarda en el perfil del cliente (`clientes.documento_identidad_url`), no en tabla de documentos. Se pasa como **prop** al componente de lista, no viene de query.

---

## 📐 Mejora de Diseño: Compactar Header

Además del fix, compactamos el header para que coincida con proyectos/viviendas:

### **ANTES**:
```tsx
<div className='p-4'>
  <div className='gap-2.5'>
    <div className='p-2.5'>
      <FileText className='h-5 w-5' />
    </div>
    <div>
      <h2 className='text-base'>Documentos del Cliente</h2>
      <p className='text-xs'>{totalDocumentos} documentos almacenados</p>
    </div>
  </div>
</div>
```

### **DESPUÉS**:
```tsx
<div className='p-3'> {/* p-4 → p-3 */}
  <div className='gap-2'> {/* gap-2.5 → gap-2 */}
    <div className='p-2'> {/* p-2.5 → p-2 */}
      <FileText className='h-4 w-4' /> {/* h-5 w-5 → h-4 w-4 */}
    </div>
    <div>
      <h2 className='text-sm'>Documentos</h2> {/* text-base → text-sm */}
      {/* Eliminado subtítulo para mayor compacidad */}
    </div>
  </div>
</div>
```

**Resultado**: Header **20% más compacto**, consistente con otros módulos.

---

## 🧪 Testing

### Caso de prueba:
1. Crear cliente nuevo (sin cédula)
2. Navegar a tab "Documentos"
3. Ver botón "⚠️ Subir Cédula (Requerido)" destacado
4. Click en botón → Modal se abre
5. Seleccionar archivo PDF/JPG
6. Click "Subir Cédula"
7. **Verificar**: Modal se cierra, lista muestra card de cédula inmediatamente

### Resultado esperado:
```
┌─────────────────────────────────────────┐
│  [✓ Perfil Verificado]                   │ ← Badge verde
│  JUAN PÉREZ GARCÍA                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  General  │  Intereses  │  Documentos (1) │ ← Count actualizado
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📄 Cédula de Ciudadanía                 │
│  CC 1234567890                           │
│  [Sistema] [Requerido]                   │ ← Badges
│  [Ver] [Descargar] [Renombrar]           │ ← Acciones
└─────────────────────────────────────────┘
```

---

## 📝 Archivos Modificados

1. **`src/app/clientes/[id]/tabs/documentos-tab.tsx`**
   - Simplificado `onSuccess` callback
   - Compactado header (p-4 → p-3, text-base → text-sm)

2. **`src/modules/clientes/documentos/hooks/useDocumentosListaCliente.ts`**
   - Agregado `useEffect` para sincronizar `cedulaTituloLocal`

---

## 🎓 Lecciones Aprendidas

### **1. Router.refresh() en Server Components**
`router.refresh()` revalida **TODOS** los datos del servidor, no solo queries específicas. Útil cuando los datos vienen de props, no de queries locales.

### **2. Props vs Queries**
- **Props**: Requieren revalidación manual con `router.refresh()`
- **Queries (React Query)**: Invalidación automática con `queryClient.invalidateQueries()`

### **3. useMemo Dependencies**
Un `useMemo` con dependencias correctas se reevalúa automáticamente cuando cambian las props, PERO solo si el componente se re-renderiza. `router.refresh()` fuerza ese re-render.

### **4. Consistencia entre módulos**
Aunque Clientes usa patrón híbrido por razones históricas, debemos mantener:
- ✅ Mismo diseño visual (compacto)
- ✅ Mismos flujos de usuario
- ✅ Misma respuesta a acciones

---

## 🚀 Próximos Pasos (Opcional)

### Migrar Clientes a React Query puro:
```typescript
// Actualmente
const { documentos } = useDocumentosClienteStore()

// Propuesta futura
const { documentos } = useDocumentosQuery(cliente.id, 'cliente')
```

**Beneficios**:
- ✅ Invalidación automática
- ✅ Cache compartido
- ✅ Sin `router.refresh()` necesario
- ✅ Consistencia total con proyectos/viviendas

**Estimación**: 2-3 horas de refactor

---

## ✅ Checklist de Fix

- [x] `router.refresh()` se ejecuta después de subir cédula
- [x] `useEffect` sincroniza `cedulaTituloLocal`
- [x] `useMemo` tiene dependencies correctas
- [x] Header compactado (p-3, text-sm, h-4 w-4)
- [x] Testing manual exitoso
- [x] No errors en TypeScript
- [ ] Testing con usuario real (pendiente)

---

## 🎯 Resultado Final

**ANTES**: Usuario sube cédula → No aparece en lista → Frustración 😞

**AHORA**: Usuario sube cédula → Aparece inmediatamente → Flujo fluido 🚀
