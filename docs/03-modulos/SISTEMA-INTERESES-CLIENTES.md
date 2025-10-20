# 🎯 Sistema de Intereses de Clientes - Implementación Completa

## 📋 Resumen

Sistema completo de seguimiento de intereses de clientes en proyectos y viviendas específicas. Permite historial completo, múltiples intereses simultáneos y seguimiento de conversión.

---

## ✅ Implementación Completada

### 1. Base de Datos (`cliente-intereses-schema.sql`)

**Tabla:** `cliente_intereses`
```sql
- id (uuid, PK)
- cliente_id (uuid, FK → clientes)
- proyecto_id (uuid, FK → proyectos)
- vivienda_id (uuid, FK → viviendas, opcional)
- notas (text)
- estado ('Activo' | 'Descartado' | 'Convertido')
- motivo_descarte (text)
- fecha_interes (timestamp)
- fecha_actualizacion (timestamp)
- usuario_creacion (uuid, FK → auth.users)
```

**Vista:** `intereses_completos`
- Join con datos de cliente, proyecto, vivienda y manzana
- Campos calculados para mostrar información completa

**Funciones:**
- `registrar_interes_inicial()`: Crear interés al crear cliente
- `marcar_interes_convertido()`: Marcar como convertido + descartar otros

**RLS:** Políticas habilitadas para usuarios autenticados

---

### 2. TypeScript Types

**Nuevos tipos agregados en `types/index.ts`:**

```typescript
// Enum
export type EstadoInteres = 'Activo' | 'Descartado' | 'Convertido'

// Interface
export interface ClienteInteres {
  id: string
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  notas?: string
  estado: EstadoInteres
  motivo_descarte?: string
  fecha_interes: string
  fecha_actualizacion: string

  // Relaciones (desde vista)
  proyecto_nombre?: string
  proyecto_ubicacion?: string
  vivienda_numero?: string
  vivienda_precio?: number
  manzana_nombre?: string
}

// DTOs
export interface CrearInteresDTO {
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  notas?: string
}

export interface ActualizarInteresDTO {
  estado?: EstadoInteres
  motivo_descarte?: string
  notas?: string
}

// Extendido en Cliente
interface Cliente {
  intereses?: ClienteInteres[] // Intereses activos
}

// Extendido en CrearClienteDTO
interface CrearClienteDTO {
  interes_inicial?: {
    proyecto_id: string
    vivienda_id?: string
    notas_interes?: string
  }
}
```

---

### 3. Servicio de Intereses (`intereses.service.ts`)

**Métodos implementados:**

```typescript
class InteresesService {
  // Obtener intereses de un cliente
  obtenerInteresesCliente(clienteId, soloActivos?)

  // Obtener intereses de un proyecto
  obtenerInteresesProyecto(proyectoId, soloActivos?)

  // Crear nuevo interés
  crearInteres(datos: CrearInteresDTO)

  // Actualizar interés
  actualizarInteres(id, datos: ActualizarInteresDTO)

  // Descartar interés
  descartarInteres(id, motivo?)

  // Marcar como convertido (llama a función SQL)
  marcarInteresConvertido(clienteId, viviendaId)

  // Eliminar interés
  eliminarInteres(id)

  // Verificar si existe interés activo
  existeInteresActivo(clienteId, proyectoId, viviendaId?)

  // Obtener resumen de intereses
  obtenerResumenIntereses(clienteId)
}
```

---

### 4. Hook de Formulario (`useInteresFormulario.ts`)

**Hook personalizado para manejar selección de intereses:**

```typescript
const {
  proyectos,              // Array de proyectos activos
  viviendas,              // Array de viviendas disponibles del proyecto
  proyectoSeleccionado,   // ID del proyecto seleccionado
  viviendaSeleccionada,   // ID de vivienda seleccionada (opcional)
  notasInteres,           // Notas del interés
  cargandoProyectos,      // Loading state
  cargandoViviendas,      // Loading state
  handleProyectoChange,   // Handler para cambio de proyecto
  handleViviendaChange,   // Handler para cambio de vivienda
  handleNotasChange,      // Handler para notas
  resetInteres,           // Reset formulario
  getInteresData,         // Obtener datos del interés formateados
  tieneInteres,           // Boolean si tiene proyecto seleccionado
} = useInteresFormulario()
```

**Características:**
- ✅ Carga proyectos activos al montar
- ✅ Carga viviendas disponibles al seleccionar proyecto
- ✅ Reset automático de vivienda al cambiar proyecto
- ✅ Devuelve objeto formateado para `interes_inicial`

---

### 5. Formulario Modernizado

**Nuevo Step 2: "Interés" (solo para nuevos clientes)**

Ubicado entre "Contacto" y "Adicional":

```tsx
Step 0: Personal (nombres, apellidos, documento, fecha nacimiento)
Step 1: Contacto (teléfono, email, dirección, ciudad)
Step 2: Interés  ← NUEVO
Step 3: Adicional (origen, referido, notas)
```

**Campos del Step Interés:**

1. **Select Proyecto** (opcional)
   - Carga proyectos en estado `en_planificacion` o `en_construccion`
   - Opción: "Ninguno (sin interés específico)"
   - Muestra: Nombre + Ubicación

2. **Select Vivienda** (condicional, solo si seleccionó proyecto)
   - Carga viviendas disponibles del proyecto
   - Opción: "Interesado en el proyecto en general"
   - Muestra: Manzana + Casa + Precio formateado

3. **Textarea Notas** (condicional, solo si seleccionó proyecto)
   - Placeholder: "Ej: Interesado en casa de 2 pisos, presupuesto hasta $200M..."
   - 3 filas

**Estado vacío:**
- Si no selecciona proyecto, muestra mensaje:
  > "Si el cliente no tiene un proyecto específico en mente, puedes dejar esta sección vacía y continuar."

---

### 6. Integración en Container

**Flujo completo en `formulario-cliente-container.tsx`:**

```typescript
1. Hook de interés se ejecuta (carga proyectos)
2. Usuario llena formulario y selecciona interés (opcional)
3. Al submit:
   a. Se crea el cliente
   b. Si hay interés (getInteresData() !== undefined):
      - Se llama a interesesService.crearInteres()
      - Se registra el interés en la BD
   c. Se resetea el formulario de interés
   d. Se cierra el modal
```

**Manejo de errores:**
- Si falla el interés, NO bloquea la creación del cliente
- Se registra en consola pero el flujo continúa

---

## 🚀 Cómo Usar

### 1. Ejecutar SQL en Supabase

```sql
-- Copiar y pegar todo el contenido de:
supabase/cliente-intereses-schema.sql

-- En Supabase Dashboard → SQL Editor → New Query → Run
```

Esto creará:
- ✅ Tabla `cliente_intereses`
- ✅ Vista `intereses_completos`
- ✅ Funciones `registrar_interes_inicial()` y `marcar_interes_convertido()`
- ✅ RLS policies
- ✅ Índices optimizados

---

### 2. Crear Cliente con Interés

1. Click en "Nuevo Cliente"
2. Llenar datos personales (Step 0)
3. Llenar datos de contacto (Step 1)
4. **En Step 2 "Interés":**
   - Seleccionar proyecto (opcional)
   - Si seleccionó proyecto, puede elegir vivienda específica
   - Agregar notas del interés
5. Continuar con Step 3 "Adicional"
6. Click "Crear Cliente"

**Resultado:**
- Cliente creado en estado "Interesado"
- Interés registrado en `cliente_intereses` con estado "Activo"

---

### 3. Ver Intereses de un Cliente

```typescript
import { interesesService } from '@/modules/clientes/services/intereses.service'

// Obtener intereses activos
const intereses = await interesesService.obtenerInteresesCliente(
  clienteId,
  true // soloActivos
)

// Cada interés incluye:
intereses.forEach(interes => {
  console.log(interes.proyecto_nombre)     // "Villa Hermosa"
  console.log(interes.vivienda_numero)     // "5" (si especificó casa)
  console.log(interes.manzana_nombre)      // "A"
  console.log(interes.notas)               // Notas del interés
  console.log(interes.estado)              // "Activo"
})
```

---

### 4. Marcar Interés como Convertido

**Cuando se asigna vivienda al cliente:**

```typescript
import { interesesService } from '@/modules/clientes/services/intereses.service'

// Esto automáticamente:
// 1. Marca el interés en esa vivienda como "Convertido"
// 2. Marca otros intereses activos del cliente como "Descartados"
await interesesService.marcarInteresConvertido(clienteId, viviendaId)
```

---

## 📊 Casos de Uso

### Caso 1: Cliente interesado en proyecto general

```
Cliente: Juan Pérez
Interés: Proyecto "Villa Hermosa" (sin vivienda específica)
Notas: "Busca casa de 2 pisos, presupuesto flexible"

→ Se registra interés en proyecto
→ Puede ver disponibles y decidir después
```

### Caso 2: Cliente interesado en casa específica

```
Cliente: María López
Interés: Proyecto "Los Pinos" → Manzana A → Casa 5
Notas: "Le gusta la ubicación cerca del parque"

→ Se registra interés en vivienda específica
→ Al concretar venta, se marca como "Convertido"
```

### Caso 3: Cliente con múltiples intereses

```
Cliente: Pedro Gómez
Intereses:
  1. Proyecto "Villa Hermosa" → Casa A-3
  2. Proyecto "Los Pinos" → Casa B-7

→ Puede tener ambos activos simultáneamente
→ Al elegir uno, el otro se marca "Descartado"
```

---

## 🎨 Siguiente Paso: Mostrar en ClienteCardInteresado

**Pendiente:**

Cargar y mostrar intereses en la card:

```tsx
// En ClienteCardInteresado
const { intereses } = cliente

{intereses?.filter(i => i.estado === 'Activo').map(interes => (
  <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3">
    <Building2 className="h-4 w-4 text-purple-600" />
    <div>
      <p className="font-medium text-purple-900">
        {interes.proyecto_nombre}
      </p>
      {interes.vivienda_numero && (
        <p className="text-sm text-purple-600">
          Manzana {interes.manzana_nombre} - Casa {interes.vivienda_numero}
        </p>
      )}
    </div>
  </div>
))}
```

---

## 📝 Archivos Creados/Modificados

### Nuevos
- ✅ `supabase/cliente-intereses-schema.sql`
- ✅ `src/modules/clientes/services/intereses.service.ts`
- ✅ `src/modules/clientes/hooks/useInteresFormulario.ts`

### Modificados
- ✅ `src/modules/clientes/types/index.ts` (tipos + DTOs)
- ✅ `src/modules/clientes/hooks/index.ts` (barrel export)
- ✅ `src/modules/clientes/hooks/useFormularioCliente.ts` (interes_inicial)
- ✅ `src/modules/clientes/components/formulario-cliente-modern.tsx` (nuevo step)
- ✅ `src/modules/clientes/components/formulario-cliente-container.tsx` (integración)

---

## ✨ Características del Sistema

✅ **Historial completo** - Todos los intereses quedan registrados
✅ **Múltiples intereses** - Cliente puede estar interesado en varias opciones
✅ **Seguimiento de conversión** - Sabes qué interés se convirtió en venta
✅ **Análisis de descarte** - Puedes ver qué proyectos generan interés pero no ventas
✅ **Flexible** - Interés en proyecto general O vivienda específica
✅ **Opcional** - No es obligatorio registrar interés al crear cliente
✅ **Optimizado** - Vista SQL con join pre-calculado para consultas rápidas

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ⏳ Instalar `date-fns` para cards
3. ⏳ Mostrar intereses en `ClienteCardInteresado`
4. ⏳ Probar flujo completo de creación
5. ⏳ Verificar que intereses se registran correctamente

---

**Status:** ✅ **Implementación completa - Lista para usar**
