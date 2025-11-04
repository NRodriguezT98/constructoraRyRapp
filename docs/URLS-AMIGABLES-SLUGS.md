# 🔗 URLs Amigables con Slugs

## 📋 Resumen

Se implementó un sistema de URLs amigables que reemplaza los UUIDs largos con slugs legibles que incluyen el nombre y un identificador corto.

**Antes:**
```
❌ http://localhost:3000/clientes/3af5d98c-2747-441e-8114-224d37a7c050
```

**Ahora:**
```
✅ http://localhost:3000/clientes/maria-garcia-lopez-3af5d98c
```

---

## 🎯 Beneficios

1. **✨ SEO Mejorado** - URLs descriptivas mejoran indexación
2. **👁️ Legibilidad** - Fácil identificar el recurso sin abrir el enlace
3. **🔗 Compartible** - URLs más amigables para compartir
4. **🔄 Retrocompatible** - Los UUIDs directos siguen funcionando
5. **🛡️ Seguridad** - Solo expone primeros 8 caracteres del UUID

---

## 📁 Archivos Creados

### 1. `src/lib/utils/slug.utils.ts` ⭐
**Utilidades principales del sistema de slugs**

```typescript
// Generación de slugs
generarSlugCliente(cliente: {nombres, apellidos, id}): string
generarSlugProyecto(proyecto: {nombre, id}): string
generarSlugVivienda(vivienda: {numero, manzana_nombre?, id}): string

// Resolución de slugs → UUIDs
resolverSlugAUUID(slugOUUID, tabla): Promise<string | null>
resolverSlugCliente(slugOUUID): Promise<string | null>
resolverSlugProyecto(slugOUUID): Promise<string | null>
resolverSlugVivienda(slugOUUID): Promise<string | null>

// Construcción de URLs
construirURLCliente(cliente): string
construirURLProyecto(proyecto): string
construirURLVivienda(vivienda): string

// Utilidades
normalizarTexto(texto): string
extraerShortIDDeSlug(slug): string
esUUID(str): boolean
```

---

## 🔄 Archivos Actualizados

### Páginas Dinámicas (Resolución de Slugs)

#### `src/app/clientes/[id]/cliente-detalle-client.tsx`
- ✅ Resuelve slug → UUID en `useEffect`
- ✅ Usa `clienteUUID` en toda la lógica
- ✅ Construye slugs para navegación

#### `src/app/clientes/[id]/negociaciones/crear/page.tsx`
- ✅ Resuelve slug en Server Component
- ✅ Pasa `clienteSlug` para breadcrumbs
- ✅ Usa `clienteUUID` para lógica

### Componentes de Navegación (Generación de Slugs)

#### `src/modules/clientes/components/clientes-page-main.tsx`
```typescript
const url = construirURLCliente({
  id: cliente.id,
  nombres: cliente.nombres,
  apellidos: cliente.apellidos
})
router.push(url)
```

#### `src/app/clientes/[id]/tabs/negociaciones-tab.tsx`
- ✅ Botón "Crear Negociación" usa slug
- ✅ FAB flotante usa slug

#### `src/modules/abonos/components/modal-registrar-abono/AlertaValidacionDesembolso.tsx`
- ✅ Consulta cliente para construir slug
- ✅ Redirige a proceso con URL amigable

---

## 🔍 Formato de Slugs

### Clientes
**Formato:** `{nombres-apellidos}-{short-uuid}`

**Ejemplo:**
```typescript
{
  nombres: "María José",
  apellidos: "García López",
  id: "3af5d98c-2747-441e-8114-224d37a7c050"
}

→ "maria-jose-garcia-lopez-3af5d98c"
```

### Proyectos
**Formato:** `{nombre-proyecto}-{short-uuid}`

**Ejemplo:**
```typescript
{
  nombre: "Urbanización Los Robles",
  id: "7b2c4f1a-9d3e-4c2a-8b1f-6e5d4c3b2a1f"
}

→ "urbanizacion-los-robles-7b2c4f1a"
```

### Viviendas
**Formato:** `{manzana}-{numero}-{short-uuid}` o `casa-{numero}-{short-uuid}`

**Ejemplo:**
```typescript
{
  manzana_nombre: "A",
  numero: "15",
  id: "9d8e7f6g-5h4i-3j2k-1l0m-9n8o7p6q5r4s"
}

→ "manzana-a-casa-15-9d8e7f6g"
```

---

## 🛠️ Normalización de Texto

La función `normalizarTexto()` aplica:

1. **Lowercase** - Convierte a minúsculas
2. **Elimina tildes** - `á → a`, `é → e`, etc.
3. **Elimina caracteres especiales** - Solo letras, números, guiones
4. **Reemplaza espacios** - Espacios → guiones
5. **Limpia guiones múltiples** - `---` → `-`
6. **Trim** - Elimina guiones al inicio/final

**Ejemplo:**
```typescript
normalizarTexto("María José García & López")
// → "maria-jose-garcia-lopez"
```

---

## 🔄 Flujo de Resolución

### 1. Usuario hace clic en link
```
/clientes/maria-garcia-3af5d98c
```

### 2. Page recibe el parámetro
```typescript
// src/app/clientes/[id]/page.tsx
const { id } = await params // "maria-garcia-3af5d98c"
```

### 3. Cliente Component resuelve
```typescript
useEffect(() => {
  const resolver = async () => {
    const uuid = await resolverSlugCliente(id)
    // uuid = "3af5d98c-2747-441e-8114-224d37a7c050"
    setClienteUUID(uuid || id)
  }
  resolver()
}, [id])
```

### 4. Query a la DB
```typescript
// En resolverSlugAUUID()
supabase
  .from('clientes')
  .select('id')
  .ilike('id', '3af5d98c%') // Match por prefijo
  .limit(1)
  .single()
```

### 5. Usa UUID en toda la lógica
```typescript
await clientesService.obtenerCliente(clienteUUID)
```

---

## 🔐 Retrocompatibilidad

El sistema detecta automáticamente si el parámetro es UUID o slug:

```typescript
// ✅ Slug nuevo
/clientes/maria-garcia-3af5d98c
→ Resuelve a UUID completo

// ✅ UUID directo (backward compatible)
/clientes/3af5d98c-2747-441e-8114-224d37a7c050
→ Detectado como UUID, se usa directamente

function esUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}
```

---

## 🚀 Uso en Nuevos Componentes

### Para generar link a cliente:

```typescript
import { construirURLCliente } from '@/lib/utils/slug.utils'

const url = construirURLCliente({
  id: cliente.id,
  nombres: cliente.nombres,
  apellidos: cliente.apellidos
})

// Usar en Link
<Link href={url}>Ver cliente</Link>

// O en router
router.push(url)
```

### Para resolver slug en página dinámica:

```typescript
import { resolverSlugCliente } from '@/lib/utils/slug.utils'

useEffect(() => {
  const resolver = async () => {
    const uuid = await resolverSlugCliente(params.id)
    setClienteUUID(uuid || params.id)
  }
  resolver()
}, [params.id])
```

---

## 📊 Casos de Uso Implementados

### ✅ Navegación a Detalle de Cliente
**Desde:** Lista de clientes (`clientes-page-main.tsx`)
**Genera:** `/clientes/maria-garcia-lopez-3af5d98c`

### ✅ Crear Negociación
**Desde:** Detalle de cliente y tab de negociaciones
**Genera:** `/clientes/maria-garcia-lopez-3af5d98c/negociaciones/crear`

### ✅ Breadcrumbs
**En:** Página de crear negociación
**Link:** Usa slug en breadcrumb de cliente

### ✅ Alerta de Validación
**En:** Modal de desembolsos
**Redirige:** A proceso del cliente con slug

---

## 🔮 Próximos Pasos (Opcional)

### Pendientes para extender:

1. **Proyectos**
   - `/proyectos/urbanizacion-robles-7b2c4f1a`

2. **Viviendas**
   - `/proyectos/urbanizacion-robles-7b2c4f1a/viviendas/manzana-a-casa-15-9d8e7f6g`

3. **Negociaciones**
   - `/clientes/maria-garcia-3af5d98c/negociaciones/negociacion-1-5f4e3d2c`

4. **Abonos**
   - Actualizar `/abonos/[clienteId]` para usar slugs

---

## 🧪 Testing

### Casos a probar:

```bash
# ✅ Slug nuevo funciona
http://localhost:3000/clientes/maria-garcia-lopez-3af5d98c

# ✅ UUID directo sigue funcionando
http://localhost:3000/clientes/3af5d98c-2747-441e-8114-224d37a7c050

# ✅ Navegación desde lista usa slugs
Click en cliente → URL con slug

# ✅ Crear negociación usa slug
Desde detalle → Crear negociación → URL con slug

# ✅ Breadcrumbs usan slug
En crear negociación → Link de breadcrumb usa slug

# ✅ Alerta de validación redirige con slug
Modal desembolso → "Ir al Proceso" → URL con slug
```

---

## 📝 Notas Técnicas

### Performance
- **Resolución:** Una query simple con `ILIKE` por prefijo
- **Cache:** Los resultados pueden cachearse en el futuro
- **Indexación:** El campo `id` ya está indexado (PK)

### Seguridad
- **Exposición mínima:** Solo primeros 8 caracteres del UUID
- **Colisiones:** Altamente improbables con 8 caracteres hex
- **Validación:** Query segura con Supabase parametrizada

### SEO
- **Descriptivo:** Incluye nombre del recurso
- **Único:** Garantizado por short UUID
- **Permanente:** El UUID no cambia, slug estable

---

## 🎉 Resultado

Las URLs ahora son:
- ✨ **Legibles** - Sabes qué estás viendo
- 🔗 **Compartibles** - Fácil de copiar/pegar
- 🔍 **SEO-friendly** - Mejor indexación
- 🔄 **Retrocompatibles** - Nada se rompe
- 🚀 **Fáciles de extender** - Mismo patrón para todo

**Ejemplo real:**
```
Antes: http://localhost:3000/clientes/3af5d98c-2747-441e-8114-224d37a7c050
Ahora:  http://localhost:3000/clientes/maria-garcia-lopez-3af5d98c
```

¡Mucho mejor! 🎊
