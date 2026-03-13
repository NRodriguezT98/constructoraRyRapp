# 🎨 Diagrama Visual - Sistema de Descuentos

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USUARIO: Asignar Vivienda                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 1: Información Básica                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣ Selecciona Proyecto → Carga Viviendas Disponibles                      │
│  2️⃣ Selecciona Vivienda → Carga Valores Base (DB):                          │
│     ┌───────────────────────────────────────┐                              │
│     │ Valor Base:        $117.000.000 (RO) │ ← viviendas.valor_base       │
│     │ Gastos Notariales: $  5.000.000 (RO) │ ← viviendas.gastos_notariales│
│     │ ─────────────────────────────────     │                              │
│     │ Total Original:    $122.000.000       │ ← Calculado                  │
│     └───────────────────────────────────────┘                              │
│                                                                             │
│  3️⃣ ¿Aplicar Descuento? (Checkbox)                                          │
│     │                                                                       │
│     ├─ ❌ NO → Salta a Paso 6                                               │
│     │                                                                       │
│     └─ ✅ SÍ → Expande Sección de Descuento                                 │
│         ┌───────────────────────────────────────────────────────┐          │
│         │ 4️⃣ Monto:    $14.000.000 (manual)                     │          │
│         │    Tipo:     Trabajador de la Empresa (select)        │          │
│         │    Motivo:   "Trabajador con 5 años..." (textarea)    │          │
│         │                                                        │          │
│         │ 5️⃣ Auto-Cálculo:                                       │          │
│         │    Porcentaje: (14M / 122M) * 100 = 11.48% ✅        │          │
│         │                                                        │          │
│         │    Resumen Visual:                                     │          │
│         │    Original:   $122.000.000                            │          │
│         │    Descuento:  -$ 14.000.000 (11.48%)                 │          │
│         │    ───────────────────────────────                     │          │
│         │    Final:      $108.000.000 💚                         │          │
│         └───────────────────────────────────────────────────────┘          │
│                                                                             │
│  6️⃣ Valor en Minuta:                                                        │
│     ┌───────────────────────────────────────────────┐                      │
│     │ $128.000.000 (editable)                       │                      │
│     │ ℹ️ Sugerido: $128M (facilita crédito)         │                      │
│     │                                                │                      │
│     │ 7️⃣ Auto-Comparación:                           │                      │
│     │    Real:   $108.000.000                        │                      │
│     │    Minuta: $128.000.000                        │                      │
│     │    Diferencia: +$20.000.000 (solo en papel) ℹ️ │                      │
│     └───────────────────────────────────────────────┘                      │
│                                                                             │
│  8️⃣ Resumen Final:                                                          │
│     ┌───────────────────────────────────────┐                              │
│     │ ✅ Resumen de la Asignación           │                              │
│     ├───────────────────────────────────────┤                              │
│     │ Base + Gastos:  $122.000.000          │                              │
│     │ Descuento:      -$ 14.000.000         │                              │
│     │ ───────────────────────────────        │                              │
│     │ Valor Final:    $108.000.000 💚       │                              │
│     └───────────────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 2: Fuentes de Pago ($108M)                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 3: Revisión y Confirmación                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  GUARDAR EN BASE DE DATOS                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INSERT INTO negociaciones (                                                │
│    cliente_id,                                                              │
│    vivienda_id,                                                             │
│    valor_negociado,          ← $108.000.000                                 │
│    descuento_aplicado,       ← $ 14.000.000                                 │
│    tipo_descuento,           ← 'trabajador_empresa'                         │
│    motivo_descuento,         ← 'Trabajador con 5 años...'                   │
│    porcentaje_descuento,     ← NULL (trigger calcula automático)            │
│    valor_escritura_publica,  ← $128.000.000                                 │
│    estado,                   ← 'Activa'                                     │
│    ...                                                                      │
│  )                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRIGGER: trigger_calcular_porcentaje_descuento                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BEFORE INSERT OR UPDATE ON negociaciones                                   │
│                                                                             │
│  IF NEW.descuento_aplicado > 0 THEN                                         │
│    valor_total = NEW.valor_negociado + NEW.descuento_aplicado              │
│    NEW.porcentaje_descuento = (NEW.descuento_aplicado / valor_total) * 100 │
│  END IF                                                                     │
│                                                                             │
│  Resultado: porcentaje_descuento = 11.48 ✅                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRIGGER: trigger_validar_motivo_descuento                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BEFORE INSERT OR UPDATE ON negociaciones                                   │
│                                                                             │
│  IF NEW.descuento_aplicado > 0 THEN                                         │
│    IF NEW.motivo_descuento IS NULL OR LENGTH(TRIM(motivo)) < 10 THEN       │
│      RAISE EXCEPTION 'motivo_descuento debe tener al menos 10 caracteres'  │
│    END IF                                                                   │
│  END IF                                                                     │
│                                                                             │
│  Resultado: Validación OK ✅ (motivo tiene 31 caracteres)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  REGISTRO CREADO EN BD                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  negociaciones.id = uuid-1234                                               │
│  negociaciones.descuento_aplicado = 14000000                                │
│  negociaciones.porcentaje_descuento = 11.48 (auto-calculado) ✅             │
│  negociaciones.tipo_descuento = 'trabajador_empresa'                        │
│  negociaciones.motivo_descuento = 'Trabajador con 5 años de antigüedad'    │
│  negociaciones.valor_escritura_publica = 128000000                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  VISTA: vista_descuentos_aplicados                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SELECT * FROM vista_descuentos_aplicados WHERE cliente_id = ...            │
│                                                                             │
│  Resultado:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Cliente:         Juan Pérez                                         │   │
│  │ Vivienda:        C19                                                 │   │
│  │ Proyecto:        Proyecto Verde                                      │   │
│  │ Valor Original:  $122.000.000                                        │   │
│  │ Descuento:       $ 14.000.000 (11.48%)                               │   │
│  │ Tipo:            Trabajador de la Empresa                            │   │
│  │ Motivo:          Trabajador con 5 años de antigüedad                 │   │
│  │ Valor Final:     $108.000.000                                        │   │
│  │ Valor Minuta:    $128.000.000                                        │   │
│  │ Diferencia:      +$ 20.000.000 (notarial)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Puntos de Validación

```
┌────────────────────────────────────────────────────────────────┐
│  VALIDACIÓN FRONTEND (Zod Schema)                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ descuento_aplicado >= 0                                    │
│  ✅ descuento_aplicado < valor_total_original                  │
│  ✅ Si descuento > 0 → tipo_descuento REQUIRED                 │
│  ✅ Si descuento > 0 → motivo_descuento min 10 chars           │
│  ✅ valor_escritura_publica > 0                                │
│  ⚠️  valor_escritura < valor_final (warning, no error)         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  VALIDACIÓN BACKEND (PostgreSQL Triggers)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ CONSTRAINT: descuento_aplicado >= 0                        │
│  ✅ CONSTRAINT: valor_escritura IS NULL OR > 0                 │
│  ✅ TRIGGER: Si descuento > 0 → motivo min 10 chars (bloqueo)  │
│  ✅ TRIGGER: Auto-calcula porcentaje_descuento                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Cálculos Automáticos

```
ENTRADA DEL USUARIO:
┌──────────────────────────────────────┐
│ Vivienda Seleccionada: C19           │
│ ├─ valor_base: $117.000.000 (DB)    │
│ └─ gastos_notariales: $5.000.000    │
│                                      │
│ Descuento Ingresado: $14.000.000    │
│ Tipo: trabajador_empresa             │
│ Motivo: "Trabajador con 5 años..."   │
│                                      │
│ Valor Escritura: $128.000.000        │
└──────────────────────────────────────┘
           │
           ▼
CÁLCULOS AUTOMÁTICOS (Frontend):
┌──────────────────────────────────────────────────┐
│ const valor_total_original = 117M + 5M           │
│   → $122.000.000                                 │
│                                                  │
│ const valor_final = 122M - 14M                   │
│   → $108.000.000                                 │
│                                                  │
│ const porcentaje = (14M / 122M) * 100            │
│   → 11.48%                                       │
│                                                  │
│ const diferencia = 128M - 108M                   │
│   → +$20.000.000                                 │
└──────────────────────────────────────────────────┘
           │
           ▼
CÁLCULOS AUTOMÁTICOS (Backend Trigger):
┌──────────────────────────────────────────────────┐
│ CREATE FUNCTION calcular_porcentaje_descuento()  │
│   NEW.valor_total = valor_negociado + descuento  │
│     → $122.000.000                               │
│                                                  │
│   NEW.porcentaje_descuento = (14M / 122M) * 100 │
│     → 11.48 ✅ (guardado en DB)                  │
│                                                  │
│   RETURN NEW                                     │
└──────────────────────────────────────────────────┘
           │
           ▼
RESULTADO FINAL EN DB:
┌──────────────────────────────────────────────────┐
│ negociaciones.valor_negociado = $108.000.000     │
│ negociaciones.descuento_aplicado = $14.000.000   │
│ negociaciones.porcentaje_descuento = 11.48       │
│ negociaciones.tipo_descuento = 'trabajador_...'  │
│ negociaciones.motivo_descuento = 'Trabajador...' │
│ negociaciones.valor_escritura_publica = $128M    │
└──────────────────────────────────────────────────┘
```

---

## 📊 Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│  Paso1InfoBasicaRefactored (Component)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Estado Local:                                                  │
│  ├─ aplicarDescuento: boolean (checkbox state)                 │
│  └─ ...form values (desde React Hook Form)                     │
│                                                                 │
│  Valores Observados (watch):                                    │
│  ├─ vivienda_id                                                 │
│  ├─ descuento_aplicado                                          │
│  ├─ tipo_descuento                                              │
│  ├─ motivo_descuento                                            │
│  └─ valor_escritura_publica                                     │
│                                                                 │
│  Cálculos Derivados:                                            │
│  ├─ viviendaSeleccionada = viviendas.find(v => v.id === id)    │
│  ├─ valor_base = viviendaSeleccionada?.valor_base              │
│  ├─ gastos_notariales = viviendaSeleccionada?.gastos_notariales│
│  ├─ valor_total_original = valor_base + gastos_notariales      │
│  ├─ valor_final = valor_total_original - descuento_aplicado    │
│  ├─ porcentaje_descuento = (descuento / total) * 100           │
│  └─ diferencia_notarial = valor_escritura - valor_final        │
│                                                                 │
│  Renderizado:                                                   │
│  ├─ Valores Base (RO)                                           │
│  ├─ Checkbox Toggle                                             │
│  ├─ AnimatePresence                                             │
│  │   └─ Sección Descuento (expandible)                          │
│  │       ├─ InputCurrency (monto)                               │
│  │       ├─ Select (tipo)                                       │
│  │       ├─ Textarea (motivo)                                   │
│  │       └─ Resumen Visual                                      │
│  ├─ InputCurrency (valor_escritura)                             │
│  ├─ Alert (diferencia_notarial)                                 │
│  └─ Resumen Final                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  useAsignarViviendaForm (Hook)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  React Hook Form:                                               │
│  ├─ register(fieldName)                                         │
│  ├─ watch(fieldName)                                            │
│  ├─ setValue(fieldName, value)                                  │
│  ├─ errors (from Zod validation)                                │
│  └─ touchedFields                                               │
│                                                                 │
│  Zod Schema (paso1Schema):                                      │
│  ├─ proyecto_id: required                                       │
│  ├─ vivienda_id: required                                       │
│  ├─ valor_negociado: positive                                   │
│  ├─ descuento_aplicado: >= 0, < valor_negociado                 │
│  ├─ tipo_descuento: required if descuento > 0                   │
│  ├─ motivo_descuento: min 10 chars if descuento > 0             │
│  └─ valor_escritura_publica: positive, optional                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  viviendas:                                                     │
│  ├─ valor_base DECIMAL(15,2)                                    │
│  └─ gastos_notariales DECIMAL(15,2) DEFAULT 5000000             │
│                                                                 │
│  negociaciones:                                                 │
│  ├─ valor_negociado DECIMAL(15,2)                               │
│  ├─ descuento_aplicado DECIMAL(15,2) DEFAULT 0                  │
│  ├─ tipo_descuento VARCHAR(50)                                  │
│  ├─ motivo_descuento TEXT                                       │
│  ├─ porcentaje_descuento DECIMAL(5,2) DEFAULT 0                 │
│  └─ valor_escritura_publica DECIMAL(15,2)                       │
│                                                                 │
│  Triggers:                                                      │
│  ├─ trigger_calcular_porcentaje_descuento (BEFORE INSERT/UPDATE)│
│  └─ trigger_validar_motivo_descuento (BEFORE INSERT/UPDATE)     │
│                                                                 │
│  Vista:                                                         │
│  └─ vista_descuentos_aplicados (reportes)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Estados Visuales

### Estado Inicial (Sin Vivienda Seleccionada)
```
┌────────────────────────────────────────┐
│  Selecciona Proyecto                   │
│  Selecciona Vivienda                   │
│                                        │
│  [Valores base no visibles]            │
│  [Checkbox descuento no visible]       │
└────────────────────────────────────────┘
```

### Vivienda Seleccionada (Sin Descuento)
```
┌────────────────────────────────────────┐
│  ✅ Proyecto: Proyecto Verde           │
│  ✅ Vivienda: C19                      │
│                                        │
│  ┌─ Valores Base (Desde BD) ──────┐   │
│  │ Base: $117M  Gastos: $5M       │   │
│  │ Total: $122M                    │   │
│  └────────────────────────────────┘   │
│                                        │
│  ☐ ¿Aplicar descuento?                 │
│                                        │
│  Valor en Minuta: $128.000.000         │
│  ℹ️ Diferencia: +$6M (solo papel)      │
│                                        │
│  ┌─ Resumen Final ─────────────────┐   │
│  │ Base + Gastos: $122M             │   │
│  │ Valor Final: $122M 💚            │   │
│  └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### Con Descuento Expandido
```
┌────────────────────────────────────────┐
│  ✅ Proyecto: Proyecto Verde           │
│  ✅ Vivienda: C19                      │
│                                        │
│  ┌─ Valores Base ─────────────────┐   │
│  │ Base: $117M  Gastos: $5M       │   │
│  │ Total: $122M                    │   │
│  └────────────────────────────────┘   │
│                                        │
│  ☑ ¿Aplicar descuento?                 │
│  ┌─ Detalles del Descuento ───────┐   │
│  │ Monto: $14.000.000 (11.48%)    │   │
│  │ Tipo: Trabajador Empresa       │   │
│  │ Motivo: "Trabajador con 5..."   │   │
│  │                                 │   │
│  │ ┌─ Resumen ─────────────────┐  │   │
│  │ │ Original:   $122.000.000  │  │   │
│  │ │ Descuento:  -$14.000.000  │  │   │
│  │ │ Final:      $108.000.000✅ │  │   │
│  │ └───────────────────────────┘  │   │
│  └────────────────────────────────┘   │
│                                        │
│  Valor en Minuta: $128.000.000         │
│  ℹ️ Diferencia: +$20M (solo papel)     │
│                                        │
│  ┌─ Resumen Final ─────────────────┐   │
│  │ Base + Gastos: $122M             │   │
│  │ Descuento:     -$14M             │   │
│  │ Valor Final:   $108M 💚          │   │
│  └──────────────────────────────────┘   │
└────────────────────────────────────────┘
```

---

**Creado**: 2025-12-05
**Versión**: 1.0.0
**Propósito**: Visualización del flujo completo del sistema de descuentos
