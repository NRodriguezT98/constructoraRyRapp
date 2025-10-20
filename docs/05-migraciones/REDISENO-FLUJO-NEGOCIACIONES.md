# 🔄 REDISEÑO COMPLETO DEL FLUJO DE NEGOCIACIONES

**Fecha**: 20 de octubre de 2025
**Objetivo**: Simplificar y hacer el flujo intuitivo basado en reglas de negocio reales

---

## 🎯 REGLAS DE NEGOCIO CONFIRMADAS

### 1. **Fuentes de Pago - UNA VEZ CADA UNA**
- ❌ **INCORRECTO ACTUAL**: Permite agregar Cuota Inicial múltiples veces
- ✅ **CORRECTO**: Cada fuente se selecciona UNA VEZ y se configura su monto
- Las 4 fuentes son opcionales, pero cada una máximo 1 vez
- Si necesitan registrar múltiples abonos de cuota inicial, eso es DESPUÉS (módulo de abonos)

### 2. **Estados de Negociación**
```
En Proceso → Cierre Financiero → Activa → Completada
                                    ↓
                                Cancelada (antes de Activa)
                                Renuncia (solo desde Activa)
```

**Diferencia crítica**:
- **Cancelación**: Cliente se arrepiente ANTES de tener vivienda asignada oficialmente
- **Renuncia**: Cliente renuncia DESPUÉS de tener vivienda asignada (ya puede recibir abonos)

### 3. **Crear Negociación = Proceso Atómico**
- Al hacer click en "Crear Negociación" se debe completar TODO el cierre financiero
- **NO se puede salir** sin terminar o se revierte todo
- Modal/Wizard con advertencia si intenta cerrar sin terminar

### 4. **Descuentos**
- Son comunes, deben estar visibles

### 5. **Valor Negociado**
- Mayoría de veces = valor vivienda, pero NO pre-llenar (usuario decide)

---

## 🚀 FLUJO REDISEÑADO (TO-BE)

### PASO 1: Cliente + Cédula
```
┌─────────────────────────────────────────┐
│  Crear Cliente                          │
├─────────────────────────────────────────┤
│  Nombres: ____________                  │
│  Apellidos: ____________                │
│  Tipo Doc: [CC ▼]                       │
│  Número: ____________                   │
│  Teléfono: ____________                 │
│  Email: ____________                    │
│  Ciudad: ____________                   │
│  ...otros campos...                     │
│                                         │
│  📎 Subir Cédula: [Elegir archivo]    │
│     (Imagen o PDF - OBLIGATORIO)       │
│                                         │
│  [Cancelar]  [Crear Cliente]           │
└─────────────────────────────────────────┘
```

**Cambios**:
- ✅ Campo de upload de cédula INTEGRADO en formulario de crear cliente
- ✅ Obligatorio antes de guardar
- ✅ Un solo paso, todo junto

---

### PASO 2: Crear Negociación (WIZARD ÚNICO)

**Click en "Crear Negociación"** → Abre wizard de **5 sub-pasos** que NO se puede abandonar:

#### **SUB-PASO 1: Seleccionar Vivienda**
```
┌───────────────────────────────────────────────┐
│  Crear Negociación (Paso 1 de 5)             │
├───────────────────────────────────────────────┤
│  Proyecto: [Seleccionar ▼]                   │
│  Vivienda: [Seleccionar ▼]                   │
│           Casa 12 - $150.000.000             │
│                                               │
│  [Siguiente →]                                │
└───────────────────────────────────────────────┘
```

#### **SUB-PASO 2: Valores de la Negociación**
```
┌───────────────────────────────────────────────┐
│  Crear Negociación (Paso 2 de 5)             │
├───────────────────────────────────────────────┤
│  Vivienda seleccionada:                       │
│  Casa 12 - Valor: $150.000.000               │
│                                               │
│  Valor Negociado: $________________          │
│  Descuento:       $________________          │
│  ─────────────────────────────────           │
│  Valor Total:     $130.000.000               │
│                                               │
│  [← Atrás]  [Siguiente →]                    │
└───────────────────────────────────────────────┘
```

#### **SUB-PASO 3: Seleccionar Fuentes de Pago**
```
┌────────────────────────────────────────────────┐
│  Crear Negociación (Paso 3 de 5)              │
│  Cierre Financiero                             │
├────────────────────────────────────────────────┤
│  Valor Total a Cubrir: $130.000.000           │
│                                                │
│  Selecciona las fuentes que usará el cliente: │
│                                                │
│  ☐ Cuota Inicial                              │
│  ☐ Crédito Hipotecario (Requiere carta)      │
│  ☐ Subsidio Mi Casa Ya                        │
│  ☐ Subsidio Caja Compensación (Requiere carta)│
│                                                │
│  Debe seleccionar al menos una fuente         │
│                                                │
│  [← Atrás]  [Siguiente →]                     │
└────────────────────────────────────────────────┘
```

#### **SUB-PASO 4: Configurar Fuentes Seleccionadas**

**Ejemplo: Si seleccionó Cuota Inicial + Crédito**

```
┌─────────────────────────────────────────────────┐
│  Crear Negociación (Paso 4 de 5)               │
│  Configurar Fuentes de Pago                     │
├─────────────────────────────────────────────────┤
│  Valor Total: $130.000.000                     │
│  Configurado: $0 (0%)                          │
│  ▓░░░░░░░░░░░░░░░░░░░ 0%                      │
│                                                 │
│  ┌─ CUOTA INICIAL ────────────────────┐       │
│  │ Monto: $_______________            │       │
│  └────────────────────────────────────┘       │
│                                                 │
│  ┌─ CRÉDITO HIPOTECARIO ──────────────┐       │
│  │ Banco: [Bancolombia ▼]             │       │
│  │ Monto Aprobado: $_______________   │       │
│  │ Nº Referencia: _______________     │       │
│  │ 📎 Carta Aprobación: [Subir] ⚠️   │       │
│  └────────────────────────────────────┘       │
│                                                 │
│  ⚠️ Debe cubrir el 100% del valor total       │
│                                                 │
│  [← Atrás]  [Siguiente →] (deshabilitado)     │
└─────────────────────────────────────────────────┘
```

**Validaciones en tiempo real**:
- Suma de montos se actualiza automáticamente
- Botón "Siguiente" se habilita solo cuando:
  - ✅ Suma = 100% del valor total (±1 peso de margen)
  - ✅ Documentos requeridos subidos

#### **SUB-PASO 5: Confirmación**
```
┌──────────────────────────────────────────────┐
│  Crear Negociación (Paso 5 de 5)            │
│  Confirmación                                 │
├──────────────────────────────────────────────┤
│  ✓ Cliente: Juan Pérez García               │
│  ✓ Vivienda: Casa 12 - Proyecto Los Pinos   │
│  ✓ Valor Total: $130.000.000                │
│                                               │
│  Fuentes de Pago Configuradas:               │
│  ✓ Cuota Inicial: $50.000.000 (38%)         │
│  ✓ Crédito Hipotecario: $80.000.000 (62%)   │
│    - Bancolombia                             │
│    - Carta aprobación: ✅ Subida             │
│                                               │
│  ────────────────────────────────             │
│  Total Configurado: $130.000.000 ✅          │
│                                               │
│  Al confirmar, la negociación se activará    │
│  automáticamente y estará lista para         │
│  recibir abonos.                             │
│                                               │
│  [← Atrás]  [Confirmar y Activar]           │
└──────────────────────────────────────────────┘
```

**Al hacer click en "Confirmar y Activar"**:
1. ✅ Crea la negociación (estado: "Activa" directamente)
2. ✅ Crea las fuentes de pago configuradas
3. ✅ Asigna vivienda al cliente
4. ✅ Redirige a detalle de negociación
5. ✅ Ya puede empezar a registrar abonos

---

### ADVERTENCIA AL INTENTAR CERRAR EL WIZARD

**Si usuario intenta cerrar (X) o salir sin terminar**:
```
┌─────────────────────────────────────────┐
│  ⚠️ Advertencia                         │
├─────────────────────────────────────────┤
│  ¿Seguro que deseas cancelar?          │
│                                         │
│  Si cierras ahora, se perderá todo     │
│  el progreso de la negociación.        │
│                                         │
│  No se guardará nada hasta que         │
│  completes todos los pasos.            │
│                                         │
│  [Volver al Wizard]  [Sí, Cancelar]   │
└─────────────────────────────────────────┘
```

---

## 📊 ESTADOS SIMPLIFICADOS

### Estados de Negociación:
```
1. "Activa" (único estado inicial después de crear)
   ├─→ 2. "Completada" (cuando se reciban todos los abonos)
   ├─→ 3. "Cancelada" (si cliente se arrepiente ANTES de empezar abonos)
   └─→ 4. "Renuncia" (si cliente renuncia DESPUÉS de empezar abonos)
```

**Eliminar estados**:
- ❌ "En Proceso" (no existe, se crea ya activa)
- ❌ "Cierre Financiero" (es parte del wizard, no un estado)

---

## 🎨 ACCIONES SEGÚN ESTADO

### Estado: **Activa**
**Acciones disponibles**:
- ✅ Ver detalle
- ✅ Registrar abonos
- ✅ Ver timeline de pagos
- ✅ Cancelar negociación (con motivo)
- ❌ NO "Registrar Renuncia" (solo si ya tiene abonos registrados)

### Estado: **Activa** + Ya tiene abonos registrados
**Acciones disponibles**:
- ✅ Ver detalle
- ✅ Registrar más abonos
- ✅ Ver timeline de pagos
- ✅ Registrar Renuncia (con motivo - porque ya empezó a pagar)
- ❌ NO "Cancelar" (ya empezó a pagar, solo puede renunciar)

---

## 🛠️ CAMBIOS TÉCNICOS REQUERIDOS

### 1. **Formulario de Crear Cliente**
```tsx
// Agregar campo de upload
<div>
  <label>Documento de Identidad (Cédula) *</label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    required
  />
  <p className="text-xs text-gray-500">
    Sube una foto o PDF de la cédula del cliente
  </p>
</div>
```

### 2. **Componente Wizard de Negociación**
```tsx
// Nuevo componente: WizardCrearNegociacion
// 5 pasos obligatorios
// No se puede salir sin completar
// Validación en cada paso
```

### 3. **Fuentes de Pago - UNA VEZ**
```tsx
// CAMBIAR DE:
permite_multiples_abonos: boolean // ❌

// A:
// Simplemente no permitir agregar la misma fuente 2 veces
// Los "múltiples abonos" se registran después en el módulo de abonos
```

### 4. **Estados de Negociación**
```sql
-- Actualizar enum en Supabase
CREATE TYPE estado_negociacion AS ENUM (
  'Activa',        -- Estado inicial único
  'Completada',    -- Todos los abonos recibidos
  'Cancelada',     -- Cliente se arrepiente (sin abonos aún)
  'Renuncia'       -- Cliente renuncia (ya tiene abonos)
);
```

### 5. **Lógica de Cancelar vs Renunciar**
```tsx
// En detalle de negociación:
const tieneAbonos = abonos.length > 0

// Mostrar botones según:
{!tieneAbonos && (
  <Button onClick={cancelarNegociacion}>
    Cancelar Negociación
  </Button>
)}

{tieneAbonos && (
  <Button onClick={registrarRenuncia}>
    Registrar Renuncia
  </Button>
)}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Crear Cliente con Cédula ✅
- [ ] Agregar campo de upload en formulario
- [ ] Validar que archivo sea obligatorio
- [ ] Subir a Supabase Storage al crear cliente
- [ ] Guardar URL en `documento_identidad_url`

### FASE 2: Wizard de Negociación 🔄
- [ ] Crear componente `WizardCrearNegociacion`
- [ ] Sub-paso 1: Selección de vivienda
- [ ] Sub-paso 2: Valores (negociado, descuento, total)
- [ ] Sub-paso 3: Seleccionar fuentes (checkboxes)
- [ ] Sub-paso 4: Configurar fuentes (formulario dinámico)
- [ ] Sub-paso 5: Confirmación
- [ ] Validación de salida (modal de advertencia)
- [ ] Crear negociación con estado "Activa" directamente

### FASE 3: Simplificar Fuentes de Pago ✅
- [ ] Eliminar lógica de "múltiples abonos" en fuentes
- [ ] Permitir solo 1 de cada tipo
- [ ] Validación: suma = 100%
- [ ] Upload de documentos inline

### FASE 4: Estados Simplificados ✅
- [ ] Actualizar enum en Supabase
- [ ] Eliminar estados "En Proceso" y "Cierre Financiero"
- [ ] Lógica condicional: Cancelar vs Renunciar

### FASE 5: Detalle de Negociación ✅
- [ ] Remover timeline innecesario
- [ ] Mostrar info de fuentes configuradas
- [ ] Sección de abonos (próximo módulo)
- [ ] Botones según estado y abonos

---

## 🎯 FLUJO FINAL SIMPLIFICADO

```
1. Crear Cliente (con cédula obligatoria)
   ↓
2. Click "Crear Negociación"
   ↓
3. Wizard de 5 pasos (NO se puede salir)
   - Seleccionar vivienda
   - Ingresar valores
   - Seleccionar fuentes
   - Configurar fuentes (montos + documentos)
   - Confirmar
   ↓
4. Negociación creada → Estado: "Activa"
   ↓
5. Registrar abonos (próximo módulo)
   ↓
6. Cuando suma abonos = 100% → "Completada"
```

**De 5-7 pasos separados → 2 pasos principales** ✅

---

## ✅ BENEFICIOS

1. **Flujo atómico**: Todo o nada, no hay negociaciones "a medias"
2. **Menos confusión**: Estados claros, acciones claras
3. **Validación temprana**: Cédula obligatoria desde el inicio
4. **UX guiada**: Wizard paso a paso, no se pierde el usuario
5. **Menos clicks**: De ~15-20 clicks a ~8-10 clicks
6. **Lógica de negocio correcta**: Cancelar vs Renunciar según abonos

---

**¿Apruebas este rediseño? ¿Empiezo con FASE 1 (Crear Cliente con Cédula)?** 🚀
