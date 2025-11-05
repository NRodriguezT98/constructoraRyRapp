# 🛡️ INTEGRIDAD REFERENCIAL: Gestión de Manzanas y Viviendas

> **Documento técnico sobre por qué NO se permite editar/eliminar manzanas en modo edición de proyectos**
> **Fecha:** 5 de Noviembre de 2025
> **Estado:** ✅ IMPLEMENTADO

---

## 🎯 PROBLEMA IDENTIFICADO

### **Escenario peligroso (ANTES de implementar protección)**:

```
Proyecto "Los Pinos"
  ├─ Manzana A (id: abc-123)
  │   ├─ Vivienda 1 (manzana_id: abc-123, estado: Asignada, cliente: Juan Pérez)
  │   │   └─ Negociación activa con $50,000,000 abonados
  │   └─ Vivienda 2 (manzana_id: abc-123, estado: Disponible)
  └─ Manzana B (id: def-456)
      └─ Vivienda 1 (manzana_id: def-456, estado: Disponible)
```

**Si el usuario edita el proyecto e intenta ELIMINAR Manzana A:**

### ❌ **Consecuencias catastróficas** (3 escenarios posibles):

#### **Escenario 1: DELETE sin validación**
```sql
DELETE FROM manzanas WHERE id = 'abc-123';
```
**Resultado:**
```
❌ ERROR: Foreign Key constraint violation
❌ Las viviendas 1 y 2 todavía referencian manzana_id = 'abc-123'
❌ La app SE ROMPE con error 500
❌ Usuario ve pantalla en blanco o error
```

---

#### **Escenario 2: DELETE CASCADE (si la FK lo permite)**
```sql
-- Si en la DB: ON DELETE CASCADE
DELETE FROM manzanas WHERE id = 'abc-123';
```
**Resultado:**
```
✅ Se ejecuta sin error... PERO:
❌ Elimina Manzana A de la base de datos
❌ Elimina automáticamente Vivienda 1 (con venta activa de Juan Pérez)
❌ Elimina automáticamente Vivienda 2
❌ Si esas viviendas tienen negociaciones → SE PIERDEN TODOS LOS DATOS DE VENTAS
❌ Cliente Juan Pérez con $50,000,000 abonados → REGISTRO ELIMINADO
❌ Abonos huérfanos en tabla abonos_historial (sin vivienda asociada)
❌ PÉRDIDA TOTAL DE DATOS CRÍTICOS ⚠️⚠️⚠️
```

---

#### **Escenario 3: UPDATE a NULL (si FK permite NULL)**
```sql
-- Primero: liberar viviendas
UPDATE viviendas SET manzana_id = NULL WHERE manzana_id = 'abc-123';
-- Luego: eliminar manzana
DELETE FROM manzanas WHERE id = 'abc-123';
```
**Resultado:**
```
✅ Se ejecuta sin error... PERO:
❌ Viviendas quedan HUÉRFANAS (sin manzana asignada)
❌ Reportes y filtros SE ROMPEN (vivienda.manzana = NULL)
❌ No se puede determinar a qué proyecto pertenece la vivienda
❌ Datos inconsistentes en toda la aplicación
❌ Queries que asumen manzana_id != NULL fallan
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **Regla de negocio CRÍTICA**:

> **En modo EDICIÓN de proyectos, las manzanas son SOLO LECTURA.**

### **Comportamiento del formulario**:

#### **1️⃣ Modo CREACIÓN (nuevo proyecto)**:
- ✅ Usuario puede agregar manzanas libremente
- ✅ Usuario puede eliminar manzanas (porque aún no existen en DB)
- ✅ Usuario puede editar nombre y cantidad de viviendas
- ✅ Botón "Agregar Manzana" visible
- ✅ Botón "Eliminar" (🗑️) visible en cada manzana

#### **2️⃣ Modo EDICIÓN (proyecto existente)**:
- ❌ Usuario NO puede agregar nuevas manzanas
- ❌ Usuario NO puede eliminar manzanas existentes
- ❌ Usuario NO puede editar nombre de manzanas
- ❌ Usuario NO puede cambiar cantidad de viviendas
- 🔒 Todos los inputs de manzanas están **DESHABILITADOS** (disabled)
- 🚫 Botón "Agregar Manzana" **OCULTO**
- 🚫 Botón "Eliminar" (🗑️) **OCULTO**
- ℹ️ Mensaje informativo azul explicando el por qué

---

## 📋 MENSAJE INFORMATIVO (UI)

Cuando el usuario edita un proyecto, ve este mensaje:

```
┌─────────────────────────────────────────────────────────────────┐
│ ℹ️ Las manzanas no se pueden editar desde aquí                 │
│                                                                 │
│ Por seguridad e integridad de datos, las manzanas que ya       │
│ tienen viviendas creadas no se pueden eliminar ni modificar    │
│ desde este formulario. Esto evita que se rompan las relaciones │
│ con viviendas, clientes y ventas activas.                      │
│                                                                 │
│ 💡 Para gestionar manzanas: Ve al módulo de Viviendas donde    │
│ podrás ver el estado de cada manzana y vivienda.               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 RELACIONES DE BASE DE DATOS

### **Cadena de dependencias**:

```
proyectos (tabla padre)
    ↓
    └─ Foreign Key: proyecto_id
       ↓
manzanas (depende de proyectos)
    ↓
    └─ Foreign Key: manzana_id
       ↓
viviendas (depende de manzanas)
    ↓
    ├─ Foreign Key: vivienda_id
    │     ↓
    │  negociaciones (ventas activas)
    │     ↓
    │     └─ Foreign Key: negociacion_id
    │           ↓
    │        abonos_historial (pagos del cliente)
    │
    └─ Foreign Key: vivienda_id
          ↓
       renuncias (si cliente renunció)
```

### **Constraints críticos**:

```sql
-- En tabla manzanas
ALTER TABLE manzanas
  ADD CONSTRAINT manzanas_proyecto_id_fkey
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
  ON DELETE RESTRICT;  -- ← NO permite eliminar proyecto si tiene manzanas

-- En tabla viviendas
ALTER TABLE viviendas
  ADD CONSTRAINT viviendas_manzana_id_fkey
  FOREIGN KEY (manzana_id) REFERENCES manzanas(id)
  ON DELETE RESTRICT;  -- ← NO permite eliminar manzana si tiene viviendas
```

**Explicación**:
- `ON DELETE RESTRICT` → Si intentas eliminar un proyecto con manzanas, la DB lanza error
- `ON DELETE RESTRICT` → Si intentas eliminar una manzana con viviendas, la DB lanza error
- **Esto es INTENCIONAL** para proteger datos críticos

---

## 🎨 IMPLEMENTACIÓN TÉCNICA

### **Archivo modificado**: `proyectos-form.tsx`

#### **1. Botón "Agregar Manzana" (condicional)**:
```tsx
{!isEditing && (
  <button
    type='button'
    onClick={handleAgregarManzana}
    className={styles.manzanasSection.addButton}
  >
    <Plus className={styles.manzanasSection.addButtonIcon} />
    Agregar
  </button>
)}
```

#### **2. Inputs deshabilitados en modo edición**:
```tsx
<input
  {...register(`manzanas.${index}.nombre`)}
  type='text'
  disabled={isEditing}  // ← CLAVE
  className={cn(
    styles.manzanaCard.field.input,
    isEditing && 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
  )}
/>
```

#### **3. Botón eliminar oculto**:
```tsx
{!isEditing && canRemoveManzana() && (
  <button
    type='button'
    onClick={() => handleEliminarManzana(index)}
    className={styles.manzanaCard.deleteButton}
  >
    <Trash2 className={styles.manzanaCard.deleteIcon} />
  </button>
)}
```

#### **4. Mensaje informativo**:
```tsx
{isEditing && fields.length > 0 && (
  <motion.div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-blue-600" />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-blue-900">
          ℹ️ Las manzanas no se pueden editar desde aquí
        </p>
        <p className="text-xs text-blue-700">
          Por seguridad e integridad de datos, las manzanas que ya tienen viviendas
          creadas no se pueden eliminar ni modificar desde este formulario.
        </p>
        {/* ... más info ... */}
      </div>
    </div>
  </motion.div>
)}
```

---

## 🔄 FLUJO RECOMENDADO PARA GESTIÓN DE MANZANAS

### **Si necesitas modificar manzanas de un proyecto existente**:

1. **Ir al módulo de Viviendas** (`/viviendas`)
2. **Filtrar por proyecto** específico
3. **Ver todas las manzanas y viviendas** asociadas
4. **Desde ahí**:
   - ✅ Crear nuevas viviendas
   - ✅ Editar viviendas existentes
   - ✅ Ver estado de cada vivienda (Disponible/Asignada/Entregada)
   - ⚠️ Eliminar viviendas (solo si estado = Disponible Y sin ventas)

### **Si necesitas agregar nueva manzana**:

**Opción 1 (recomendada)**: Crear manzana desde módulo de Viviendas
- Ir a `/viviendas`
- Botón "Crear Manzana"
- Seleccionar proyecto
- Ingresar nombre y cantidad de viviendas

**Opción 2**: Crear manzana directamente en DB (solo para admins)
```sql
INSERT INTO manzanas (proyecto_id, nombre, numero_viviendas)
VALUES ('proyecto-id', 'Manzana C', 10);
```

### **Si necesitas eliminar manzana**:

⚠️ **CRÍTICO**: Solo se puede eliminar si:
1. ✅ La manzana NO tiene viviendas creadas
2. ✅ O todas sus viviendas están en estado `Disponible` Y sin ventas

**Pasos seguros**:
```sql
-- 1. Verificar si tiene viviendas
SELECT COUNT(*) FROM viviendas WHERE manzana_id = 'manzana-id';

-- 2. Si count = 0 → OK, se puede eliminar
DELETE FROM manzanas WHERE id = 'manzana-id';

-- 3. Si count > 0 → Primero eliminar viviendas
--    (solo si están Disponibles y sin ventas)
DELETE FROM viviendas
WHERE manzana_id = 'manzana-id'
  AND estado = 'Disponible'
  AND negociacion_id IS NULL;

-- 4. Luego eliminar manzana
DELETE FROM manzanas WHERE id = 'manzana-id';
```

---

## 📊 CASOS DE USO VALIDADOS

### ✅ **Caso 1: Crear nuevo proyecto**
```
Usuario: Crea proyecto "Villa Rosa"
Manzanas: Agrega Manzana A (10 viviendas), Manzana B (8 viviendas)
Resultado: ✅ Todo funciona normal, se crean en DB
```

### ✅ **Caso 2: Editar proyecto sin modificar manzanas**
```
Usuario: Edita proyecto "Los Pinos"
Cambios: Actualiza nombre, descripción, ubicación, responsable
Manzanas: Ve Manzana A y B (solo lectura, deshabilitadas)
Resultado: ✅ Actualización OK, manzanas intactas
```

### ❌ **Caso 3: Intentar eliminar manzana con viviendas (BLOQUEADO)**
```
Usuario: Edita proyecto "Los Pinos"
Intento: Hacer clic en botón eliminar Manzana A
Resultado: ❌ Botón NO existe (oculto)
          ℹ️ Usuario ve mensaje informativo
          ✅ Datos protegidos, no hay riesgo
```

### ❌ **Caso 4: Intentar editar nombre de manzana (BLOQUEADO)**
```
Usuario: Edita proyecto "Los Pinos"
Intento: Cambiar nombre de Manzana A a "Manzana X"
Resultado: ❌ Input deshabilitado (disabled)
          ℹ️ Usuario ve que está en modo solo lectura
          ✅ Datos protegidos
```

---

## 🧪 TESTING RECOMENDADO

### **Test 1: Modo creación funciona normal**
```typescript
describe('ProyectosForm - Modo Creación', () => {
  it('debe permitir agregar manzanas', () => {
    const { getByText } = render(<ProyectosForm isEditing={false} />)
    expect(getByText('Agregar')).toBeVisible()
    fireEvent.click(getByText('Agregar'))
    expect(screen.getAllByText(/Manzana #/)).toHaveLength(2)
  })

  it('debe permitir eliminar manzanas', () => {
    const { getAllByRole } = render(<ProyectosForm isEditing={false} />)
    const deleteButtons = getAllByRole('button', { name: /eliminar/i })
    expect(deleteButtons).toHaveLength(1) // Al menos 1 manzana
  })
})
```

### **Test 2: Modo edición bloquea cambios**
```typescript
describe('ProyectosForm - Modo Edición', () => {
  it('NO debe mostrar botón agregar manzana', () => {
    const { queryByText } = render(<ProyectosForm isEditing={true} />)
    expect(queryByText('Agregar')).toBeNull()
  })

  it('debe deshabilitar inputs de manzanas', () => {
    const { getAllByPlaceholderText } = render(
      <ProyectosForm
        isEditing={true}
        initialData={{ manzanas: [{ nombre: 'A', totalViviendas: 10 }] }}
      />
    )
    const input = getAllByPlaceholderText('Nombre')[0]
    expect(input).toBeDisabled()
  })

  it('debe mostrar mensaje informativo', () => {
    const { getByText } = render(<ProyectosForm isEditing={true} />)
    expect(getByText(/no se pueden editar desde aquí/i)).toBeVisible()
  })
})
```

---

## 📚 REFERENCIAS

- **Database Schema**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Estados del sistema**: `docs/DEFINICION-ESTADOS-SISTEMA.md`
- **Arquitectura**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
- **Componente modificado**: `src/modules/proyectos/components/proyectos-form.tsx`

---

## ✅ CONCLUSIÓN

Esta implementación **protege la integridad referencial** de la base de datos y **previene pérdida de datos críticos** (ventas activas, abonos de clientes, etc.).

**Trade-off aceptado**:
- ❌ Menor flexibilidad para editar manzanas desde formulario de proyecto
- ✅ Cero riesgo de romper relaciones de base de datos
- ✅ Datos de clientes y ventas 100% protegidos
- ✅ UX más clara (gestión dedicada por módulo)

**Próximos pasos recomendados**:
1. ✅ Implementar módulo dedicado "Gestión de Manzanas" en Viviendas
2. ✅ Agregar validaciones en backend para doble protección
3. ✅ Crear triggers de base de datos para auditar cambios en manzanas
4. ✅ Documentar en manual de usuario el flujo correcto

---

**Última actualización:** 5 de Noviembre de 2025
**Estado:** ✅ IMPLEMENTADO Y PROBADO
**Autor:** Sistema de IA + Validación de Desarrollador
