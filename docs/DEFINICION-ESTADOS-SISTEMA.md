# DEFINICIÓN DE ESTADOS DEL SISTEMA - FUENTE ÚNICA DE VERDAD

> **Documento maestro de estados**
> Define todos los estados, transiciones y reglas de negocio del sistema
> **Fecha de creación:** 22 de octubre de 2025
> **Estado:** ✅ APROBADO Y FINAL

---

## 📋 ÍNDICE

1. [Estados del Cliente](#1-estados-del-cliente)
2. [Estados de la Vivienda](#2-estados-de-la-vivienda)
3. [Estados de la Venta/Negociación](#3-estados-de-la-ventanegociación)
4. [Estados de la Renuncia](#4-estados-de-la-renuncia)
5. [Tabla de Sincronización](#5-tabla-de-sincronización-de-estados)
6. [Diagramas de Flujo](#6-diagramas-de-flujo-completos)
7. [Reglas de Negocio](#7-reglas-de-negocio-críticas)
8. [Validaciones](#8-validaciones-por-estado)

---

## 1️⃣ ESTADOS DEL CLIENTE

### **Definición TypeScript:**

```typescript
export type EstadoCliente =
  | 'Interesado'              // Sin venta formal
  | 'Activo'                  // Con venta vigente
  | 'En Proceso de Renuncia'  // Renuncia iniciada (reversible)
  | 'Inactivo'                // Renuncia cerrada
  | 'Propietario'             // Completó compra exitosamente
```

### **Descripción Detallada:**

#### 1.1 **INTERESADO**
- **Significado**: Cliente prospecto registrado en el sistema sin vinculación formal a ninguna vivienda
- **Propósito**: Construir base de datos de clientes potenciales (funnel de ventas)
- **Características**:
  - ❌ NO tiene venta/negociación formal
  - ✅ Puede tener `interes_proyecto_id` (opcional)
  - ✅ Puede tener `interes_vivienda_id` (opcional)
  - 📊 Mayoría no va a prosperar (70-80% estadística normal)
- **Campos clave**:
  - `estado = 'Interesado'`
  - `interes_proyecto_id`: UUID o NULL
  - `interes_vivienda_id`: UUID o NULL
- **Uso**: Marketing, remarketing, análisis de mercado

#### 1.2 **ACTIVO**
- **Significado**: Cliente con venta formal vigente, pagando activamente
- **Trigger de entrada**: Se crea una venta/negociación vinculada a una vivienda
- **Características**:
  - ✅ Tiene al menos 1 venta con estado `Activa`
  - ✅ Vivienda vinculada y reservada
  - ✅ Demostró recursos (pre-aprobación financiera)
  - ✅ Firmó documentos iniciales
  - ⏳ Puede tener desde 0% hasta 99% pagado
  - ⏳ **Permanece ACTIVO durante TODO el proceso de pago** (puede durar años)
- **Campos clave**:
  - `estado = 'Activo'`
  - Al menos 1 registro en `negociaciones` con `estado = 'Activa'`
- **Restricciones**:
  - NO puede tener 2 ventas activas simultáneamente (validación)
  - NO puede volver a 'Interesado' (solo avanza)

#### 1.3 **EN PROCESO DE RENUNCIA**
- **Significado**: Cliente activo que inició trámite de renuncia a su vivienda (estado transitorio y reversible)
- **Trigger de entrada**: Se registra una renuncia en el sistema
- **Características**:
  - ✅ Negociación/venta existe pero cambió a estado `Suspendida`
  - ✅ Vivienda SE LIBERA INMEDIATAMENTE (disponible para otros)
  - ⏳ Renuncia con `fecha_renuncia_efectiva = NULL` (aún no confirmada)
  - 🔄 **REVERSIBLE**: Puede volver a estado `Activo`
  - ⏱️ Estado temporal (días/semanas mientras se tramita)
- **Subcasos**:
  - **Sin abonos**: Renuncia se cierra automáticamente → `Inactivo` (inmediato)
  - **Con abonos**: Espera devolución de dinero → Permanece en este estado hasta devolución
- **Campos clave**:
  - `estado = 'En Proceso de Renuncia'`
  - Registro en `renuncias` con `estado = 'Pendiente Devolución'` o ya `Cerrada`
  - Venta con `estado = 'Suspendida'`
- **Transiciones posibles**:
  - → `Activo` (cancela renuncia, vuelve al proceso normal)
  - → `Inactivo` (confirma renuncia, cierra proceso)

#### 1.4 **INACTIVO**
- **Significado**: Cliente que tuvo venta formal pero ya NO tiene ninguna venta activa (renuncia efectiva o cancelación)
- **Trigger de entrada**: Renuncia confirmada y cerrada
- **Características**:
  - ✅ Tuvo al menos 1 venta formal en el pasado
  - ❌ Renuncia efectiva completada (`fecha_renuncia_efectiva != NULL`)
  - ❌ NO tiene venta activa actualmente
  - 🏠 Vivienda fue liberada y está disponible
  - 📋 **Diferencia clave con 'Interesado'**: Tiene historial de venta formal
- **Campos clave**:
  - `estado = 'Inactivo'`
  - Registro en `renuncias` con `estado = 'Cerrada'`
  - Venta con `estado = 'Cerrada por Renuncia'`
- **Uso**: Base de datos histórica, análisis de conversión, identificar clientes con historial
- **Posibilidad**: Puede volver a tener una nueva venta en el futuro (nuevo ciclo)

#### 1.5 **PROPIETARIO**
- **Significado**: Cliente que completó la compra exitosamente (estado final exitoso)
- **Trigger de entrada**: Venta 100% pagada Y vivienda entregada físicamente
- **Características**:
  - ✅ Venta con estado `Completada`
  - ✅ `porcentaje_completado = 100%` (verificado por triggers DB)
  - ✅ Vivienda entregada físicamente (`fecha_entrega != NULL`)
  - 🏆 **Estado final exitoso** (objetivo del negocio)
  - 🏠 Vivienda con estado `Entregada`
- **Campos clave**:
  - `estado = 'Propietario'`
  - Venta con `estado = 'Completada'` y `porcentaje_completado = 100`
  - Vivienda con `estado = 'Entregada'` y `fecha_entrega != NULL`
- **Uso**: Base de datos de propietarios, postventa, referencias, testimonios

### **Transiciones de Estados:**

```
Interesado
    ↓ (crea venta formal)
Activo
    ↓ (registra renuncia)
En Proceso de Renuncia
    ↓                    ↓
(cancela renuncia)    (confirma renuncia)
    ↓                    ↓
Activo              Inactivo
    ↓
(completa 100% + entrega)
    ↓
Propietario
```

**Reglas:**
- ✅ `Interesado` → `Activo` (única forma de activarse)
- ✅ `Activo` → `En Proceso de Renuncia` (única forma de renunciar)
- 🔄 `En Proceso de Renuncia` → `Activo` (reversible, validaciones aplican)
- ✅ `En Proceso de Renuncia` → `Inactivo` (renuncia efectiva)
- ✅ `Activo` → `Propietario` (compra exitosa)
- ❌ NO puede volver de `Inactivo` a `Activo` directamente (requiere nueva venta)
- ❌ `Propietario` e `Inactivo` son estados finales (no cambian)

---

## 2️⃣ ESTADOS DE LA VIVIENDA

### **Definición TypeScript:**

```typescript
export type EstadoVivienda =
  | 'Disponible'  // Sin cliente asignado
  | 'Asignada'    // Cliente vinculado, pagando
  | 'Entregada'   // 100% pagada + entregada físicamente
```

### **Descripción Detallada:**

#### 2.1 **DISPONIBLE**
- **Significado**: Vivienda sin cliente asignado, lista para nueva venta
- **Características**:
  - ✅ `cliente_id = NULL`
  - ✅ `negociacion_id = NULL`
  - ✅ `fecha_entrega = NULL`
  - ✅ Puede asignarse a nuevo cliente inmediatamente
  - ✅ Puede tener precio actualizable
- **Campos clave**:
  - `estado = 'Disponible'`
  - `cliente_id`: NULL
  - `negociacion_id`: NULL
- **Uso**: Inventario disponible para ventas, catálogo de viviendas

#### 2.2 **ASIGNADA**
- **Significado**: Vivienda vinculada a cliente específico, en proceso de pago
- **Trigger de entrada**: Se crea venta/negociación
- **Características**:
  - ✅ `cliente_id != NULL`
  - ✅ `negociacion_id != NULL`
  - ✅ `fecha_entrega = NULL`
  - ✅ Incluye desde 0% hasta 99% de pago
  - ⚠️ NO puede asignarse a otro cliente (constraint DB)
  - 🔒 Vivienda "reservada" para este cliente
- **Campos clave**:
  - `estado = 'Asignada'`
  - `cliente_id`: UUID válido
  - `negociacion_id`: UUID válido
- **Restricciones**:
  - NO puede tener 2 clientes simultáneamente
  - Cliente debe estar en estado `Activo`

#### 2.3 **ENTREGADA**
- **Significado**: Vivienda 100% pagada y entregada físicamente al cliente (estado final)
- **Trigger de entrada**: Venta completa (100% pagada) Y entrega física realizada
- **Características**:
  - ✅ `cliente_id != NULL` (el propietario)
  - ✅ `negociacion_id != NULL`
  - ✅ `fecha_entrega != NULL` (fecha de entrega física registrada)
  - ❌ **NO puede volver a 'Disponible'** (estado final)
  - ❌ **NO puede asignarse a otro cliente** (escriturada)
  - 🏆 Venta completada exitosamente
- **Campos clave**:
  - `estado = 'Entregada'`
  - `cliente_id`: UUID del propietario
  - `negociacion_id`: UUID de la venta completada
  - `fecha_entrega`: TIMESTAMP válido
- **Uso**: Inventario vendido, reportes de ventas completadas, postventa

### **Transiciones de Estados:**

```
Disponible
    ↓ (crea venta)
Asignada
    ↓                    ↓
(renuncia cliente)   (completa 100% + entrega)
    ↓                    ↓
Disponible          Entregada (FINAL)
```

**Reglas:**
- ✅ `Disponible` → `Asignada` (crea venta)
- 🔄 `Asignada` → `Disponible` (cliente renuncia, vivienda se libera INMEDIATAMENTE)
- ✅ `Asignada` → `Entregada` (100% pagada + entrega física)
- ❌ `Entregada` NO puede volver a `Disponible` (constraint DB)

### **Caso Especial: Renuncia y Liberación Inmediata**

Cuando cliente renuncia:
1. ⚡ Vivienda cambia a `Disponible` INMEDIATAMENTE
2. ⚡ Vivienda queda disponible para OTRO cliente (aunque haya dinero pendiente por devolver)
3. ✅ Si cliente cancela renuncia, vivienda SOLO se reasigna si:
   - Vivienda sigue en estado `Disponible` (no fue asignada a otro)
   - Precio NO cambió (se guarda `vivienda_valor_snapshot` en renuncia)

---

## 3️⃣ ESTADOS DE LA VENTA/NEGOCIACIÓN

### **Definición TypeScript:**

```typescript
export type EstadoVenta =
  | 'Activa'               // Recibiendo abonos normalmente
  | 'Suspendida'           // En trámite de renuncia (reversible)
  | 'Cerrada por Renuncia' // Renuncia confirmada
  | 'Completada'           // 100% pagada + entregada
```

### **Descripción Detallada:**

#### 3.1 **ACTIVA**
- **Significado**: Venta vigente, cliente pagando normalmente
- **Trigger de entrada**: Se crea venta (vincula cliente + vivienda + fuentes de pago)
- **Características**:
  - ✅ Negociación/venta formal iniciada
  - ✅ Cliente presentó fuentes de pago (OBLIGATORIO al crear)
  - ✅ Recibiendo abonos activamente
  - ✅ Puede tener desde 0% hasta 100% pagado (antes de entrega)
  - ✅ Cliente en estado `Activo`
  - ✅ Vivienda en estado `Asignada`
- **Campos clave**:
  - `estado = 'Activa'`
  - `cliente_id`: UUID válido
  - `vivienda_id`: UUID válido
  - Al menos 1 registro en `fuentes_pago`
- **Operaciones permitidas**:
  - ✅ Agregar abonos
  - ✅ Agregar/modificar fuentes de pago
  - ✅ Registrar renuncia (cambia a `Suspendida`)
  - ✅ Completar venta (cambia a `Completada`)

#### 3.2 **SUSPENDIDA**
- **Significado**: Venta en trámite de renuncia (estado transitorio y reversible)
- **Trigger de entrada**: Cliente registra renuncia
- **Características**:
  - ⏳ Venta temporalmente pausada
  - ✅ Cliente en estado `En Proceso de Renuncia`
  - ✅ Vivienda cambió a `Disponible` (liberada inmediatamente)
  - 🔄 **REVERSIBLE**: Puede volver a `Activa`
  - ⏱️ Estado temporal (días/semanas)
  - ❌ NO se permiten nuevos abonos mientras esté suspendida
- **Campos clave**:
  - `estado = 'Suspendida'`
  - Registro activo en `renuncias` con `estado = 'Pendiente Devolución'`
- **Operaciones permitidas**:
  - ✅ Cancelar renuncia (vuelve a `Activa`)
  - ✅ Confirmar renuncia (cambia a `Cerrada por Renuncia`)
  - ❌ NO agregar abonos
  - ❌ NO modificar fuentes de pago

#### 3.3 **CERRADA POR RENUNCIA**
- **Significado**: Venta terminada porque cliente renunció efectivamente (estado final)
- **Trigger de entrada**: Renuncia confirmada y cerrada (devolución completada si aplicaba)
- **Características**:
  - ❌ Venta terminada definitivamente
  - ✅ Cliente cambió a `Inactivo`
  - ✅ Vivienda en `Disponible` (ya fue liberada antes)
  - ✅ Renuncia con `estado = 'Cerrada'`
  - 📋 Registro histórico completo en tabla `renuncias`
  - ❌ NO puede volver a estado `Activa`
- **Campos clave**:
  - `estado = 'Cerrada por Renuncia'`
  - `fecha_renuncia_efectiva`: TIMESTAMP válido
  - Registro en `renuncias` con `estado = 'Cerrada'`
- **Uso**: Auditoría, análisis de conversión, reportes de renuncias

#### 3.4 **COMPLETADA**
- **Significado**: Venta completada exitosamente (estado final exitoso)
- **Trigger de entrada**: Venta 100% pagada Y vivienda entregada físicamente
- **Características**:
  - ✅ `porcentaje_completado = 100%`
  - ✅ `saldo_pendiente = 0`
  - ✅ Vivienda entregada (`fecha_entrega != NULL`)
  - ✅ Cliente cambió a `Propietario`
  - ✅ Vivienda cambió a `Entregada`
  - 🏆 **Estado final exitoso** (objetivo del negocio)
- **Campos clave**:
  - `estado = 'Completada'`
  - `porcentaje_completado = 100`
  - `saldo_pendiente = 0`
  - `fecha_completada`: TIMESTAMP válido
- **Uso**: Reportes de ventas exitosas, cálculo de comisiones, métricas de negocio

### **Transiciones de Estados:**

```
ACTIVA
    ↓                          ↓
(registra renuncia)      (100% pagada + entrega)
    ↓                          ↓
SUSPENDIDA              COMPLETADA (FINAL)
    ↓              ↓
(cancela)    (confirma)
    ↓              ↓
ACTIVA     CERRADA POR RENUNCIA (FINAL)
```

**Reglas:**
- ✅ Venta inicia SIEMPRE como `Activa`
- ✅ `Activa` → `Suspendida` (registra renuncia)
- 🔄 `Suspendida` → `Activa` (cancela renuncia, con validaciones)
- ✅ `Suspendida` → `Cerrada por Renuncia` (confirma renuncia)
- ✅ `Activa` → `Completada` (100% + entrega)
- ❌ `Completada` y `Cerrada por Renuncia` son estados finales (no cambian)

---

## 4️⃣ ESTADOS DE LA RENUNCIA

### **Definición TypeScript:**

```typescript
export type EstadoRenuncia =
  | 'Pendiente Devolución'  // Esperando devolver dinero
  | 'Cerrada'               // Devolución completada
  | 'Cancelada'             // Cliente se retractó
```

### **Descripción Detallada:**

#### 4.1 **PENDIENTE DEVOLUCIÓN**
- **Significado**: Renuncia registrada, cliente tiene abonos que deben devolverse
- **Trigger de entrada**: Se registra renuncia Y cliente tiene abonos > 0
- **Características**:
  - ✅ Cliente tiene abonos realizados (monto_a_devolver > 0)
  - ⏳ Esperando que gerencia devuelva el dinero
  - ✅ Vivienda YA liberada (desde el momento del registro)
  - 📋 Requiere registro de:
    - Fecha de devolución (manual)
    - Comprobante de pago (PDF)
    - Método de devolución (Transferencia/Cheque/Efectivo)
    - Número de comprobante
- **Campos clave**:
  - `estado = 'Pendiente Devolución'`
  - `requiere_devolucion = true`
  - `monto_a_devolver > 0`
  - `fecha_devolucion = NULL` (aún no devuelto)
  - `comprobante_devolucion_url = NULL`
- **Transiciones posibles**:
  - → `Cerrada` (se registra devolución completada)
  - → `Cancelada` (cliente se retracta)

#### 4.2 **CERRADA**
- **Significado**: Renuncia completada exitosamente (estado final)
- **Casos de cierre**:
  - **A) Con devolución**: Dinero fue devuelto al cliente
  - **B) Sin devolución**: Cliente no tenía abonos (cierre automático)
- **Características**:
  - ✅ Proceso de renuncia finalizado
  - ✅ Cliente cambió a `Inactivo`
  - ✅ Venta cambió a `Cerrada por Renuncia`
  - ✅ Si hubo devolución:
    - `fecha_devolucion != NULL`
    - `comprobante_devolucion_url != NULL`
  - ❌ NO puede volver a estado anterior
- **Campos clave**:
  - `estado = 'Cerrada'`
  - `fecha_cierre`: TIMESTAMP válido
  - `usuario_cierre`: UUID del usuario que cerró
  - Si requería devolución:
    - `fecha_devolucion`: TIMESTAMP válido
    - `comprobante_devolucion_url`: URL del documento
    - `metodo_devolucion`: 'Transferencia' | 'Cheque' | 'Efectivo'
    - `numero_comprobante`: String
- **Uso**: Archivo histórico completo, auditoría de renuncias

#### 4.3 **CANCELADA**
- **Significado**: Cliente se retractó de la renuncia (estado final)
- **Trigger de entrada**: Cliente en 'En Proceso de Renuncia' decide NO renunciar
- **Validaciones previas** (críticas):
  1. ✅ Vivienda sigue en estado `Disponible` (no fue asignada a otro cliente)
  2. ✅ Precio de vivienda NO cambió (se verifica contra `vivienda_valor_snapshot`)
- **Características**:
  - ✅ Cliente vuelve a `Activo`
  - ✅ Vivienda vuelve a `Asignada` (se reasigna al mismo cliente)
  - ✅ Venta vuelve a `Activa`
  - ✅ Abonos se restauran (nunca se borraron)
  - 📋 Requiere `motivo_cancelacion` (obligatorio)
  - ❌ NO puede volver a estado anterior
- **Campos clave**:
  - `estado = 'Cancelada'`
  - `fecha_cancelacion`: TIMESTAMP válido
  - `motivo_cancelacion`: TEXT (obligatorio)
  - `usuario_cancelacion`: UUID del usuario que canceló
- **Uso**: Análisis de reversiones, métricas de retención

### **Transiciones de Estados:**

```
(Registro de renuncia)
        ↓
    ┌───────┴──────┐
    │              │
Sin abonos     Con abonos
    │              │
    ↓              ↓
CERRADA    PENDIENTE DEVOLUCIÓN
(automático)       │
                   ↓
            ┌──────┴───────┐
            │              │
    (se retracta)   (se devuelve $)
            │              │
            ↓              ↓
       CANCELADA       CERRADA
```

**Reglas:**
- ✅ Si abonos = 0 → `Cerrada` automáticamente
- ✅ Si abonos > 0 → `Pendiente Devolución`
- 🔄 `Pendiente Devolución` → `Cancelada` (con validaciones)
- ✅ `Pendiente Devolución` → `Cerrada` (registra devolución)
- ❌ `Cerrada` y `Cancelada` son estados finales

---

## 5️⃣ TABLA DE SINCRONIZACIÓN DE ESTADOS

| Evento | Cliente | Vivienda | Venta | Renuncia | Notas |
|--------|---------|----------|-------|----------|-------|
| **Crear venta** | `Interesado` → `Activo` | `Disponible` → `Asignada` | → `Activa` | - | Requiere fuentes de pago |
| **Agregar abono** | `Activo` | `Asignada` | `Activa` | - | Solo si venta `Activa` |
| **Registrar renuncia (sin abonos)** | `Activo` → `En Proceso de Renuncia` → `Inactivo` | `Asignada` → `Disponible` | `Activa` → `Suspendida` → `Cerrada por Renuncia` | → `Cerrada` | Cierre automático |
| **Registrar renuncia (con abonos)** | `Activo` → `En Proceso de Renuncia` | `Asignada` → `Disponible` | `Activa` → `Suspendida` | → `Pendiente Devolución` | Espera devolución |
| **Cancelar renuncia** ✅ | `En Proceso de Renuncia` → `Activo` | `Disponible` → `Asignada`* | `Suspendida` → `Activa` | `Pendiente Devolución` → `Cancelada` | *Validaciones aplican |
| **Confirmar renuncia (devolver $)** | `En Proceso de Renuncia` → `Inactivo` | (ya `Disponible`) | `Suspendida` → `Cerrada por Renuncia` | `Pendiente Devolución` → `Cerrada` | Requiere comprobante |
| **Completar venta (100% + entrega)** | `Activo` → `Propietario` | `Asignada` → `Entregada` | `Activa` → `Completada` | - | Requiere fecha_entrega |

**Notas críticas:**
- *Cancelar renuncia solo si vivienda disponible Y precio igual
- Vivienda se libera INMEDIATAMENTE al registrar renuncia (aunque haya dinero por devolver)
- Estados finales: `Inactivo`, `Propietario`, `Entregada`, `Completada`, `Cerrada por Renuncia`, `Cerrada` (renuncia), `Cancelada` (renuncia)

---

## 6️⃣ DIAGRAMAS DE FLUJO COMPLETOS

### **6.1 Flujo del Cliente:**

```
┌─────────────────┐
│   INTERESADO    │ ← Registro inicial
│                 │   Sin venta formal
└────────┬────────┘
         │
         │ ✅ Crea venta (vincula vivienda + fuentes pago)
         ▼
┌─────────────────┐
│     ACTIVO      │ ◄────────────────┐
│                 │                  │
│ - Pagando       │                  │
│ - 0% a 100%     │                  │ 🔄 Cancela renuncia
└────┬────────────┘                  │ (vivienda disp. + precio=)
     │                               │
     ├─────────────────┬─────────────┤
     │                 │             │
     │ ⚠️ Registra     │ ✅ 100%     │
     │    renuncia     │ + entrega   │
     ▼                 ▼             │
┌─────────────────┐  ┌──────────────┴──┐
│ EN PROCESO DE   │  │   PROPIETARIO   │ ← FINAL exitoso
│ RENUNCIA        │  │                 │
│                 │  └─────────────────┘
│ (reversible)    │
└────┬────────────┘
     │
     │ ✅ Confirma renuncia
     │    (devolución hecha)
     ▼
┌─────────────────┐
│   INACTIVO      │ ← FINAL (renunció)
│                 │
└─────────────────┘
```

### **6.2 Flujo de la Vivienda:**

```
┌─────────────────┐
│   DISPONIBLE    │ ← Sin cliente
│                 │   Lista para venta
└────────┬────────┘
         │
         │ ✅ Se crea venta
         ▼
┌─────────────────┐
│    ASIGNADA     │ ◄────────────┐
│                 │              │
│ - Cliente       │              │ 🔄 Cancela renuncia
│   pagando       │              │ (si disponible + precio=)
└────┬───────┬────┘              │
     │       │                   │
     │       │ ⚠️ Renuncia       │
     │       └───┐               │
     │           │               │
     │           ▼               │
     │    ┌─────────────────┐   │
     │    │   DISPONIBLE    │───┘
     │    │  (liberada)     │
     │    └─────────────────┘
     │
     │ ✅ 100% + entrega
     ▼
┌─────────────────┐
│   ENTREGADA     │ ← FINAL
│                 │   Escriturada
└─────────────────┘
```

### **6.3 Flujo de la Venta:**

```
┌─────────────────┐
│     ACTIVA      │ ← Recibiendo abonos
│                 │
└────┬────────────┘
     │
     ├──────────────────────┐
     │                      │
     │ ⚠️ Registra          │ ✅ 100% pagada
     │    renuncia          │    + entrega
     ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   SUSPENDIDA    │    │   COMPLETADA    │ ← FINAL exitoso
│                 │    └─────────────────┘
│ (reversible)    │
└────┬────────────┘
     │
     ├──────────────────────┐
     │                      │
     │ 🔄 Cancela           │ ✅ Confirma
     │    renuncia          │    + devuelve $
     ▼                      ▼
┌─────────────────┐    ┌─────────────────────┐
│     ACTIVA      │    │ CERRADA POR RENUNCIA│ ← FINAL
│  (restaurada)   │    └─────────────────────┘
└─────────────────┘
```

### **6.4 Flujo de la Renuncia:**

```
       Registro
          ↓
    ┌─────┴──────┐
    │            │
Sin abonos   Con abonos
    │            │
    ↓            ▼
CERRADA    PENDIENTE
(auto)     DEVOLUCIÓN
               ↓
         ┌─────┴──────┐
         │            │
    (retracta)   (devuelve $)
         │            │
         ↓            ▼
    CANCELADA    CERRADA
    (FINAL)      (FINAL)
```

---

## 7️⃣ REGLAS DE NEGOCIO CRÍTICAS

### **7.1 Creación de Venta:**
- ✅ Cliente debe estar en estado `Interesado`
- ✅ Vivienda debe estar en estado `Disponible`
- ✅ **OBLIGATORIO**: Cliente debe presentar fuentes de pago al crear venta
- ✅ Se crea registro en tabla `negociaciones` con estado `Activa`
- ✅ Se crean registros en `fuentes_pago` (mínimo 1)
- ⚡ Cambios automáticos:
  - Cliente → `Activo`
  - Vivienda → `Asignada`
  - Vivienda.cliente_id = cliente.id
  - Vivienda.negociacion_id = negociacion.id

### **7.2 Registro de Renuncia:**
- ✅ Cliente debe estar en estado `Activo`
- ✅ Venta debe estar en estado `Activa`
- ✅ Se crea registro en tabla `renuncias`
- ✅ Se guarda snapshot de datos originales:
  - `vivienda_valor_snapshot`: Precio actual de vivienda (para validar reversión)
  - `abonos_snapshot`: JSON con fuentes_pago (auditoría)
- ✅ Se calcula `monto_a_devolver`: SUM(fuentes_pago.monto_recibido) donde tipo = 'Cuota Inicial'
- ⚡ **Vivienda se libera INMEDIATAMENTE**:
  - Vivienda → `Disponible`
  - Vivienda.cliente_id = NULL
  - Vivienda.negociacion_id = NULL
- ⚡ Cambios automáticos:
  - Cliente → `En Proceso de Renuncia`
  - Venta → `Suspendida`
  - Si monto_a_devolver = 0:
    - Renuncia → `Cerrada` (automático)
    - Cliente → `Inactivo` (inmediato)
    - Venta → `Cerrada por Renuncia`
  - Si monto_a_devolver > 0:
    - Renuncia → `Pendiente Devolución`

### **7.3 Cancelación de Renuncia (Reversión):**
- ✅ Cliente debe estar en estado `En Proceso de Renuncia`
- ✅ Renuncia debe estar en estado `Pendiente Devolución`
- ✅ **VALIDACIÓN CRÍTICA 1**: Vivienda debe seguir en `Disponible`
  - Si vivienda ya fue asignada a otro cliente → ❌ NO se puede cancelar
- ✅ **VALIDACIÓN CRÍTICA 2**: Precio de vivienda NO debe haber cambiado
  - Se compara: `vivienda.valor_total === renuncia.vivienda_valor_snapshot`
  - Si precio cambió → ❌ NO se puede cancelar
- ✅ **OBLIGATORIO**: Requiere `motivo_cancelacion` (TEXT)
- ⚡ Si validaciones pasan, cambios automáticos:
  - Renuncia → `Cancelada`
  - Cliente → `Activo`
  - Vivienda → `Asignada`
  - Vivienda.cliente_id = cliente.id (reasignación)
  - Vivienda.negociacion_id = negociacion.id
  - Venta → `Activa`
  - Abonos NO se tocan (nunca se borraron)

### **7.4 Confirmación de Renuncia (Cierre):**
- ✅ Cliente debe estar en estado `En Proceso de Renuncia`
- ✅ Renuncia debe estar en estado `Pendiente Devolución`
- ✅ **OBLIGATORIO** registrar:
  - `fecha_devolucion`: Fecha MANUAL ingresada por usuario
  - `comprobante_devolucion_url`: URL del PDF en Supabase Storage
  - `metodo_devolucion`: 'Transferencia' | 'Cheque' | 'Efectivo'
  - `numero_comprobante`: Número de transferencia/cheque
- ⚡ Cambios automáticos:
  - Renuncia → `Cerrada`
  - Cliente → `Inactivo`
  - Venta → `Cerrada por Renuncia`
  - Vivienda NO cambia (ya está en `Disponible` desde el registro)

### **7.5 Completar Venta:**
- ✅ Cliente debe estar en estado `Activo`
- ✅ Venta debe estar en estado `Activa`
- ✅ `porcentaje_completado = 100%` (calculado automáticamente por trigger)
- ✅ `saldo_pendiente = 0` (calculado automáticamente por trigger)
- ✅ **OBLIGATORIO**: Registrar `vivienda.fecha_entrega` (entrega física)
- ⚡ Cambios automáticos:
  - Venta → `Completada`
  - Cliente → `Propietario`
  - Vivienda → `Entregada`

### **7.6 Restricciones de Fuentes de Pago:**
- ✅ Cliente puede renunciar SI:
  - Solo tiene abonos de tipo `Cuota Inicial`
  - Créditos/Subsidios NO han sido desembolsados (monto_recibido = 0)
- ❌ Cliente NO puede renunciar SI:
  - Crédito Bancario desembolsado (monto_recibido > 0)
  - Subsidio aplicado (monto_recibido > 0)
- ✅ `monto_a_devolver` = SUM de SOLO `Cuota Inicial` recibida
- ❌ Créditos/Subsidios desembolsados NO se devuelven al cliente

---

## 8️⃣ VALIDACIONES POR ESTADO

### **8.1 Validaciones de Cliente:**

| Estado | Permitido | NO Permitido |
|--------|-----------|--------------|
| **Interesado** | - Crear venta<br>- Modificar datos | - Agregar abonos<br>- Registrar renuncia |
| **Activo** | - Agregar abonos<br>- Modificar fuentes pago<br>- Registrar renuncia<br>- Completar venta | - Tener 2 ventas activas<br>- Volver a Interesado |
| **En Proceso de Renuncia** | - Cancelar renuncia<br>- Confirmar renuncia | - Agregar abonos<br>- Crear nueva venta |
| **Inactivo** | - Crear nueva venta | - Modificar venta anterior<br>- Agregar abonos a venta cerrada |
| **Propietario** | - Consulta histórica | - Modificar venta completada |

### **8.2 Validaciones de Vivienda:**

| Estado | Permitido | NO Permitido |
|--------|-----------|--------------|
| **Disponible** | - Asignar a cliente<br>- Actualizar precio | - Tener cliente_id<br>- Tener negociacion_id |
| **Asignada** | - Agregar abonos<br>- Registrar renuncia<br>- Completar venta | - Asignar a otro cliente<br>- Modificar precio |
| **Entregada** | - Consulta histórica | - Reasignar a otro cliente<br>- Modificar datos |

### **8.3 Validaciones de Venta:**

| Estado | Permitido | NO Permitido |
|--------|-----------|--------------|
| **Activa** | - Agregar abonos<br>- Modificar fuentes pago<br>- Registrar renuncia<br>- Completar | - Estar suspendida y activa<br>- Tener 0 fuentes pago |
| **Suspendida** | - Cancelar renuncia<br>- Confirmar renuncia | - Agregar abonos<br>- Modificar fuentes pago |
| **Cerrada por Renuncia** | - Consulta histórica | - Modificar estado<br>- Agregar abonos |
| **Completada** | - Consulta histórica | - Modificar estado<br>- Agregar abonos |

### **8.4 Validaciones de Renuncia:**

| Estado | Permitido | NO Permitido |
|--------|-----------|--------------|
| **Pendiente Devolución** | - Cancelar renuncia (con validaciones)<br>- Registrar devolución | - Cerrar sin comprobante<br>- Modificar monto |
| **Cerrada** | - Consulta histórica | - Modificar estado<br>- Reabrir |
| **Cancelada** | - Consulta histórica | - Modificar estado<br>- Reactivar |

---

## 9️⃣ NOMENCLATURA: NEGOCIACIÓN vs VENTA

### **Decisión Estratégica:**

**Término de negocio**: **VENTA**
- ✅ UI: "Ventas", "Registrar Venta", "Dashboard de Ventas"
- ✅ Código: `Venta`, `EstadoVenta`, `VentasService`

**Implementación técnica**: **NEGOCIACIÓN**
- ✅ Base de datos: Tabla `negociaciones`
- ✅ Razón: Evitar migración compleja de FK y datos existentes
- ✅ Mapeo: Interface `Venta` → tabla `negociaciones`

### **Nota para desarrolladores:**
El término "negociación" es histórico en la BD. En código y UI siempre usar "venta" para mayor claridad. Este documento usa ambos términos de forma intercambiable: **Venta/Negociación**.

---

## 🔟 CAMPOS CLAVE EN BASE DE DATOS

### **10.1 Tabla `clientes`:**
```sql
estado VARCHAR(50) CHECK (estado IN (
  'Interesado',
  'Activo',
  'En Proceso de Renuncia',  -- 🆕 AGREGAR
  'Inactivo',
  'Propietario'               -- 🆕 AGREGAR
))
```

### **10.2 Tabla `viviendas`:**
```sql
estado VARCHAR(50) CHECK (estado IN (
  'Disponible',
  'Asignada',    -- Cambiar de 'Reservada' o actual
  'Entregada'    -- 🆕 AGREGAR (o cambiar de 'Vendida')
))
cliente_id UUID NULL REFERENCES clientes(id)
negociacion_id UUID NULL REFERENCES negociaciones(id)
fecha_entrega TIMESTAMP WITH TIME ZONE NULL
```

### **10.3 Tabla `negociaciones`:**
```sql
estado VARCHAR(50) CHECK (estado IN (
  'Activa',               -- Cambiar de 'En Proceso'
  'Suspendida',           -- 🆕 AGREGAR
  'Cerrada por Renuncia', -- Cambiar de 'Renuncia'
  'Completada'            -- Mantener
))
fecha_renuncia_efectiva TIMESTAMP WITH TIME ZONE NULL
```

### **10.4 Tabla `renuncias`:**
```sql
estado VARCHAR(50) CHECK (estado IN (
  'Pendiente Devolución',  -- Cambiar de 'pendiente'
  'Cerrada',               -- Cambiar de 'aprobada'
  'Cancelada'              -- 🆕 AGREGAR
))

-- Campos nuevos a agregar:
negociacion_id UUID REFERENCES negociaciones(id) ON DELETE CASCADE  -- 🆕
vivienda_valor_snapshot NUMERIC(15,2) NOT NULL                      -- 🆕
abonos_snapshot JSONB                                               -- 🆕
requiere_devolucion BOOLEAN NOT NULL DEFAULT false                  -- 🆕
monto_a_devolver NUMERIC(15,2) DEFAULT 0                            -- Renombrar de monto_devolucion
fecha_devolucion TIMESTAMP WITH TIME ZONE                           -- 🆕
comprobante_devolucion_url TEXT                                     -- 🆕
metodo_devolucion VARCHAR(50)                                       -- 🆕
numero_comprobante VARCHAR(100)                                     -- 🆕
fecha_cancelacion TIMESTAMP WITH TIME ZONE                          -- 🆕
motivo_cancelacion TEXT                                             -- 🆕
usuario_cancelacion UUID REFERENCES auth.users(id)                  -- 🆕
fecha_cierre TIMESTAMP WITH TIME ZONE                               -- 🆕
usuario_cierre UUID REFERENCES auth.users(id)                       -- 🆕
```

---

## 🔚 CONCLUSIÓN

Este documento define de forma exhaustiva todos los estados del sistema, sus transiciones, reglas de negocio y validaciones. Es la **FUENTE ÚNICA DE VERDAD** para el desarrollo, testing y mantenimiento de la aplicación.

**Próximos pasos:**
1. ✅ Crear scripts SQL de migración basados en esta definición
2. ✅ Actualizar tipos TypeScript en código
3. ✅ Implementar validaciones en servicios
4. ✅ Actualizar UI para reflejar nuevos estados
5. ✅ Crear triggers de BD para sincronización automática

---

**Última actualización:** 22 de octubre de 2025
**Versión:** 1.0 FINAL
**Estado:** ✅ APROBADO Y LISTO PARA IMPLEMENTACIÓN
