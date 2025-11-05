# ✨ VALIDACIÓN GRANULAR DE MANZANAS

> **Solución inteligente para edición segura de proyectos**
> **Fecha:** 5 de Noviembre de 2025
> **Estado:** ✅ IMPLEMENTADO

---

## 🎯 PROBLEMA RESUELTO

### **Pregunta original**:
> "¿Es muy loco permitir modificar las manzanas de las cuales no haya viviendas creadas? ¿O esto sería riesgoso?"

### **Respuesta**:
✅ **NO es loco, es la solución ÓPTIMA**
✅ **NO es riesgoso si se valida correctamente**
✅ **Es la mejor UX posible manteniendo seguridad**

---

## 💡 SOLUCIÓN IMPLEMENTADA

### **Regla de negocio inteligente**:

> **Validación GRANULAR por manzana:**
> - ✅ Manzana SIN viviendas → **EDITABLE** (puede modificar/eliminar)
> - 🔒 Manzana CON viviendas → **BLOQUEADA** (solo lectura)

---

## 🔍 CÓMO FUNCIONA

### **1. Hook de validación** (`useManzanasEditables.ts`):

```typescript
// Consulta la DB para cada manzana
const validarManzanas = async (manzanasIds: string[]) => {
  for (const manzanaId of manzanasIds) {
    // 1. Obtener datos de la manzana
    const { data: manzana } = await supabase
      .from('manzanas')
      .select('id, nombre')
      .eq('id', manzanaId)
      .single()

    // 2. Contar viviendas asociadas
    const { count } = await supabase
      .from('viviendas')
      .select('*', { count: 'exact', head: true })
      .eq('manzana_id', manzanaId)

    // 3. Determinar si es editable
    const esEditable = count === 0 // ← CLAVE

    // 4. Guardar estado
    manzanasState.set(manzanaId, {
      id: manzanaId,
      nombre: manzana.nombre,
      esEditable,
      cantidadViviendas: count || 0,
    })
  }
}
```

### **2. Integración en formulario**:

```typescript
// Para cada manzana, verificar si es editable
const esEditable = esManzanaEditable(index)
const esEliminable = esManzanaEliminable(index)

// Aplicar validación granular
<input
  disabled={!esEditable}  // ← Solo deshabilitar si NO es editable
  className={cn(
    'input-base',
    !esEditable && 'opacity-60 cursor-not-allowed bg-gray-100'
  )}
/>
```

---

## 🎨 UI VISUAL

### **Modo EDICIÓN con validación granular**:

```
┌────────────────────────────────────────────────────────┐
│ Manzanas del Proyecto                     [+ Agregar]  │
├────────────────────────────────────────────────────────┤
│ ℹ️ Edición inteligente de manzanas                    │
│ Solo puedes modificar las manzanas que NO tienen      │
│ viviendas creadas.                                     │
│                                                         │
│ 🔓 Sin viviendas = Editable                            │
│ 🔒 Con viviendas = Bloqueada                           │
├────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐          │
│ │ Manzana #1  🔓 Editable          [🗑️]   │ ← EDITABLE
│ │ Nombre:  [Manzana A___________]          │ ← Input habilitado
│ │ Viviendas: [10]                          │ ← Input habilitado
│ └──────────────────────────────────────────┘          │
│                                                         │
│ ┌──────────────────────────────────────────┐          │
│ │ Manzana #2  🔒 5 viviendas               │ ← BLOQUEADA
│ │ Nombre:  [Manzana B] (deshabilitado)     │ ← Input deshabilitado
│ │ Viviendas: [8] (deshabilitado)           │ ← Input deshabilitado
│ │                                           │
│ │ 🔒 Esta manzana tiene 5 viviendas        │ ← Tooltip explicativo
│ │    creadas. No se puede modificar para   │
│ │    proteger la integridad de datos.      │
│ └──────────────────────────────────────────┘          │
│                                                         │
│ ┌──────────────────────────────────────────┐          │
│ │ Manzana #3  🔓 Editable          [🗑️]   │ ← EDITABLE
│ │ Nombre:  [Manzana C___________]          │ ← Input habilitado
│ │ Viviendas: [12]                          │ ← Input habilitado
│ └──────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────┘
```

---

## 📊 CASOS DE USO DETALLADOS

### **Caso 1: Proyecto con manzanas mixtas** ✅

```
Proyecto: "Urbanización Los Pinos"
├─ Manzana A (10 viviendas planificadas)
│   └─ Viviendas creadas: 0 → 🔓 EDITABLE
├─ Manzana B (8 viviendas planificadas)
│   └─ Viviendas creadas: 5 → 🔒 BLOQUEADA
└─ Manzana C (12 viviendas planificadas)
    └─ Viviendas creadas: 0 → 🔓 EDITABLE

Usuario edita proyecto:
✅ Puede cambiar nombre de Manzana A (A → A1)
✅ Puede cambiar cantidad de viviendas de Manzana A (10 → 15)
✅ Puede eliminar Manzana A (botón visible)
❌ NO puede editar nombre de Manzana B (input deshabilitado)
❌ NO puede cambiar viviendas de Manzana B (input deshabilitado)
❌ NO puede eliminar Manzana B (botón oculto)
✅ Puede editar Manzana C libremente
✅ Ve tooltip en Manzana B explicando por qué está bloqueada
```

---

### **Caso 2: Usuario intenta eliminar manzana con viviendas** ❌

```
Usuario: Hace clic en [🗑️] de Manzana B

Sistema verifica:
├─ manzana.id existe? → SÍ
├─ puedeEliminar(manzana.id)? → NO
│   └─ Consulta: SELECT COUNT(*) FROM viviendas WHERE manzana_id = 'B'
│       └─ Resultado: count = 5 viviendas

Acción del sistema:
├─ alert() con mensaje:
│   "Esta manzana tiene 5 viviendas creadas.
│    No se puede modificar para proteger la integridad de datos."
└─ NO ejecuta remove(index)

Resultado:
✅ Manzana B permanece intacta
✅ Usuario entiende el por qué
✅ Datos protegidos
```

---

### **Caso 3: Crear nueva manzana en modo edición** ✅

```
Usuario edita proyecto y hace clic en [+ Agregar]:

Sistema agrega:
├─ Manzana #4 (nueva, sin ID en DB)
├─ Estado: EDITABLE (porque no existe en DB aún)
├─ Input nombre: HABILITADO
├─ Input viviendas: HABILITADO
└─ Botón eliminar: VISIBLE

Usuario completa:
├─ Nombre: "Manzana D"
├─ Viviendas: 6
└─ Hace submit

Backend:
├─ Crea nueva manzana en tabla `manzanas`
├─ Asocia a proyecto actual (proyecto_id)
└─ Retorna OK

Resultado:
✅ Proyecto actualizado con 4 manzanas
✅ Manzana D creada correctamente
✅ Manzanas antiguas con viviendas intactas
```

---

## 🔄 FLUJO TÉCNICO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario abre modal "Editar Proyecto"                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. useProyectosForm detecta isEditing = true                │
│    └─ useEffect ejecuta validarManzanas(manzanasIds)        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. useManzanasEditables consulta DB por cada manzana        │
│    Para Manzana A:                                          │
│    ├─ SELECT id, nombre FROM manzanas WHERE id = 'A'        │
│    ├─ SELECT COUNT(*) FROM viviendas WHERE manzana_id = 'A' │
│    └─ count = 0 → esEditable = true                         │
│                                                             │
│    Para Manzana B:                                          │
│    ├─ SELECT id, nombre FROM manzanas WHERE id = 'B'        │
│    ├─ SELECT COUNT(*) FROM viviendas WHERE manzana_id = 'B' │
│    └─ count = 5 → esEditable = false                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. manzanasState actualizado:                               │
│    Map {                                                    │
│      'A' => { esEditable: true, cantidadViviendas: 0 }      │
│      'B' => { esEditable: false, cantidadViviendas: 5 }     │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Componente renderiza con validación granular             │
│    Manzana A:                                               │
│    ├─ <input disabled={false} /> ✅                         │
│    ├─ Badge: "🔓 Editable"                                  │
│    └─ <button [🗑️]> visible                                │
│                                                             │
│    Manzana B:                                               │
│    ├─ <input disabled={true} /> 🔒                          │
│    ├─ Badge: "🔒 5 viviendas"                               │
│    ├─ <button [🗑️]> oculto                                 │
│    └─ Tooltip: "Esta manzana tiene 5 viviendas..."         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuario edita Manzana A y hace submit                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. onSubmitForm:                                            │
│    - Incluye cambios de Manzana A ✅                        │
│    - Excluye cambios de Manzana B (disabled) ✅             │
│    - Envia solo datos válidos al backend                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Backend actualiza:                                       │
│    UPDATE proyectos SET nombre = ..., ubicacion = ...       │
│    UPDATE manzanas SET nombre = 'A1' WHERE id = 'A'         │
│    (Manzana B NO se toca en DB)                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ RESULTADO: Actualización segura y granular               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ PROTECCIONES IMPLEMENTADAS

### **1. Validación en Frontend**:
```typescript
// Al intentar eliminar
const handleEliminarManzana = (index: number) => {
  if (isEditing) {
    const manzana = fields[index]
    if (manzana.id && !puedeEliminar(manzana.id)) {
      alert(obtenerMotivoBloqueado(manzana.id))
      return // ← BLOQUEADO
    }
  }
  remove(index) // Solo si pasó validación
}
```

### **2. UI condicional por manzana**:
```typescript
// Badge visual de estado
{esEditable ? (
  <div className="badge-green">
    <LockOpen /> Editable
  </div>
) : (
  <div className="badge-red" title={motivoBloqueado}>
    <Lock /> {cantidadViviendas} vivienda{s}
  </div>
)}

// Botón eliminar condicional
{esEliminable && <button onClick={eliminar}>🗑️</button>}

// Inputs deshabilitados granularmente
<input disabled={!esEditable} />
```

### **3. Mensajes explicativos**:
```typescript
obtenerMotivoBloqueado(manzanaId) →
  "Esta manzana tiene 5 viviendas creadas.
   No se puede modificar para proteger la integridad de datos."
```

---

## 📈 VENTAJAS vs SOLUCIÓN ANTERIOR

| Aspecto | Solución ANTERIOR | Solución NUEVA (Granular) |
|---------|-------------------|---------------------------|
| **Flexibilidad** | ❌ Ninguna manzana editable | ✅ Manzanas sin viviendas editables |
| **UX** | ❌ Todo bloqueado, frustrante | ✅ Intuitiva, indica por qué |
| **Seguridad** | ✅ Alta (todo bloqueado) | ✅ Alta (validación por manzana) |
| **Eficiencia** | ❌ Requiere ir a otro módulo | ✅ Edición directa cuando es seguro |
| **Feedback** | ❌ Mensaje genérico | ✅ Tooltip específico por manzana |
| **Escalabilidad** | ❌ Limitante a futuro | ✅ Flexible para casos complejos |

---

## 🧪 TESTING RECOMENDADO

### **Test 1: Manzana sin viviendas es editable**
```typescript
describe('Validación granular de manzanas', () => {
  it('debe permitir editar manzana sin viviendas', async () => {
    // Mock: Manzana A con 0 viviendas
    mockSupabase.from('viviendas').select.mockResolvedValue({ count: 0 })

    const { getByPlaceholderText } = render(
      <ProyectosForm
        isEditing={true}
        initialData={{ manzanas: [{ id: 'A', nombre: 'Manzana A' }] }}
      />
    )

    await waitFor(() => {
      const input = getByPlaceholderText('Nombre')
      expect(input).not.toBeDisabled() // ✅ Input habilitado
    })
  })
})
```

### **Test 2: Manzana con viviendas está bloqueada**
```typescript
it('debe bloquear manzana con viviendas', async () => {
  // Mock: Manzana B con 5 viviendas
  mockSupabase.from('viviendas').select.mockResolvedValue({ count: 5 })

  const { getByText, getByPlaceholderText } = render(
    <ProyectosForm
      isEditing={true}
      initialData={{ manzanas: [{ id: 'B', nombre: 'Manzana B' }] }}
    />
  )

  await waitFor(() => {
    const input = getByPlaceholderText('Nombre')
    expect(input).toBeDisabled() // ✅ Input deshabilitado
    expect(getByText(/5 viviendas/)).toBeInTheDocument() // ✅ Badge visible
  })
})
```

### **Test 3: Validar eliminación bloqueada**
```typescript
it('debe bloquear eliminación de manzana con viviendas', async () => {
  mockSupabase.from('viviendas').select.mockResolvedValue({ count: 3 })
  window.alert = jest.fn()

  const { getByRole } = render(
    <ProyectosForm
      isEditing={true}
      initialData={{ manzanas: [{ id: 'C', nombre: 'Manzana C' }] }}
    />
  )

  await waitFor(() => {
    const deleteButton = getByRole('button', { name: /eliminar/i })
    fireEvent.click(deleteButton)

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('3 viviendas creadas')
    )
  })
})
```

---

## 🎯 CONCLUSIÓN

### **¿Es loco permitir modificar manzanas sin viviendas?**
❌ **NO, es la solución CORRECTA**

### **¿Es riesgoso?**
❌ **NO, si se valida correctamente** (como lo implementamos)

### **Beneficios**:
1. ✅ **Máxima flexibilidad** sin sacrificar seguridad
2. ✅ **UX intuitiva** con feedback visual claro
3. ✅ **Protección granular** (por manzana, no global)
4. ✅ **Código escalable** y mantenible
5. ✅ **Testing sencillo** por casos individuales

### **Trade-offs aceptados**:
- Consultas adicionales a DB en modo edición (acceptable, se cachea)
- Complejidad ligeramente mayor en el código (compensado por mejor UX)

---

## 📚 ARCHIVOS RELACIONADOS

- **Hook de validación**: `src/modules/proyectos/hooks/useManzanasEditables.ts` ⭐
- **Hook de formulario**: `src/modules/proyectos/hooks/useProyectosForm.ts` (actualizado)
- **Componente**: `src/modules/proyectos/components/proyectos-form.tsx` (actualizado)
- **Documentación anterior**: `docs/INTEGRIDAD-REFERENCIAL-MANZANAS.md`

---

**Última actualización:** 5 de Noviembre de 2025
**Estado:** ✅ IMPLEMENTADO Y LISTO PARA TESTING
**Próximo paso:** Probar en desarrollo y validar flujo completo
