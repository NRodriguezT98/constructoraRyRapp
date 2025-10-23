# 📋 Vista de Detalle de Negociaciones

## 🎯 Descripción

Vista detallada de una negociación dentro del módulo de Clientes, mostrando información completa sobre el progreso de pago, fuentes de financiamiento, abonos y acciones disponibles.

---

## 🏗️ Componentes

### 1. `progress-section.tsx`
**Función**: Muestra el progreso de pago de la negociación

**Métricas mostradas**:
- Valor Base
- Descuento aplicado
- Valor Final
- Total Abonado
- Progreso de Abonos (%)
- Progreso de Fuentes de Pago (%)
- Saldo Pendiente

### 2. `fuentes-pago-section.tsx`
**Función**: Muestra las fuentes de financiamiento configuradas

**Información por fuente**:
- Tipo (Cuota Inicial, Crédito Hipotecario, Subsidio, Otros)
- Monto aprobado
- 🏦 **Banco/Entidad financiera** (campo `entidad`)
- 🔢 **Número de referencia/crédito** (campo `numero_referencia`)
- Porcentaje del total
- Estado (Completada o Pendiente)

**🔒 Validaciones para editar**:

#### ✅ **CUOTA INICIAL**
- **Siempre editable**
- ⚠️ Restricción: Nuevo monto debe ser >= monto ya abonado
- Permite ajustes mientras se reciben pagos

#### 🏦 **CRÉDITO HIPOTECARIO**
- **Solo editable SI NO ha sido desembolsado**
- ❌ Bloqueado cuando: `monto_recibido === monto_aprobado`
- Razón: El banco ya desembolsó el dinero completo
- Desembolso es TODO O NADA (no hay abonos parciales)

#### 🎁 **SUBSIDIOS** (Mi Casa Ya, Caja Compensación)
- **Solo editable SI NO ha sido desembolsado**
- ❌ Bloqueado cuando: `monto_recibido === monto_aprobado`
- Razón: El subsidio ya fue aplicado
- Desembolso es TODO O NADA

#### 📊 **REGLA DE SUMA TOTAL**
- La suma de todas las fuentes debe ser igual al valor total de la vivienda
- `SUM(fuentes) = valor_negociado - descuento_aplicado`

**Estados de la negociación que permiten edición**:
- ✅ `Activa` - Permite editar
- ❌ `Suspendida` - Bloqueado
- ❌ `Cerrada por Renuncia` - Bloqueado
- ❌ `Completada` - Bloqueado

### 3. `ultimos-abonos-section.tsx`
**Función**: Muestra los últimos 5 abonos registrados

**Información por abono**:
- Monto
- Método de pago (Efectivo, Transferencia, Cheque, Tarjeta)
- Fecha relativa (hace X días)
- Número de recibo
- Observaciones

### 4. `acciones-section.tsx`
**Función**: Botones de acciones sobre la negociación

#### 💰 **Registrar Abono**
- Disponible en: `Activa`, `Suspendida`
- Bloqueado en: `Cerrada por Renuncia`, `Completada`
- Abre modal para registrar nuevo pago

#### ⏸️ **Suspender**
- Disponible en: `Activa`
- Bloqueado en: `Suspendida`, `Cerrada por Renuncia`, `Completada`
- **¿Por qué existe?**:
  - Cliente viajó temporalmente
  - Problemas financieros temporales del cliente
  - Pausa temporal en el proyecto
  - Revisión de documentos pendientes
- ⚠️ La negociación puede reactivarse después
- La vivienda queda "reservada" para el cliente

#### ❌ **Renunciar**
- Disponible en: `Activa`, `Suspendida`
- Bloqueado en: `Cerrada por Renuncia`, `Completada`
- **ACCIÓN IRREVERSIBLE**
- Cliente renuncia definitivamente a la compra
- Libera la vivienda para nueva asignación
- Se debe indicar motivo de renuncia

#### 📄 **Generar PDF**
- Siempre disponible
- Genera reporte completo de la negociación
- Incluye: datos, fuentes, abonos, estado

---

## 🔄 Flujo de Usuario

1. **Lista de Negociaciones**
   - Usuario ve todas las negociaciones del cliente
   - Click en "Ver Detalle" de cualquier negociación

2. **Vista Detallada**
   - Se cargan datos de la negociación seleccionada
   - Se obtienen fuentes de pago con `obtenerFuentesPagoConAbonos()`
   - Se extraen todos los abonos de todas las fuentes
   - Se calculan totales en tiempo real

3. **Interacciones**
   - Ver progreso de pago
   - Editar fuentes (si está permitido)
   - Registrar nuevo abono
   - Suspender o renunciar
   - Generar PDF
   - Volver a la lista

---

## 📊 Cálculos Automáticos

```typescript
// Valor final después de descuento
valorFinal = valor_negociado - descuento_aplicado

// Total abonado (suma de todos los abonos)
totalAbonado = SUM(abonos.monto)

// Total fuentes configuradas
totalFuentesPago = SUM(fuentes_pago.monto_aprobado)

// Porcentaje pagado
porcentajePagado = (totalAbonado / valorFinal) * 100

// Porcentaje fuentes configuradas
porcentajeFuentes = (totalFuentesPago / valorFinal) * 100

// Saldo pendiente
saldoPendiente = valorFinal - totalAbonado
```

---

## 🔐 Referencias de Seguridad

**Archivo de validaciones**: `src/modules/clientes/utils/validar-edicion-fuentes.ts`

**Funciones clave**:
- `puedeEditarFuente(fuente)` - Valida si una fuente específica es editable
- `validarMontoNuevaFuente(fuente, montoNuevo)` - Valida el nuevo monto
- `validarSumaTotal(fuentes, valorTotal)` - Verifica que la suma cierre correctamente

---

## 🎨 Estilos y UX

- **Responsive**: Se adapta a móvil y desktop
- **Dark Mode**: Soporte completo
- **Animaciones**: Transiciones suaves con Tailwind
- **Loading States**: Indicadores de carga durante peticiones
- **Tooltips**: Explicaciones contextuales en botones deshabilitados
- **Color Coding**: Estados visualmente diferenciados

---

## 🚀 Próximos Pasos

- [ ] Implementar modal de edición de fuentes de pago
- [ ] Implementar modal de registrar abono
- [ ] Implementar modal de suspender negociación
- [ ] Implementar modal de renuncia
- [ ] Implementar generación de PDF
- [ ] Agregar vista completa de abonos (historial)
- [ ] Agregar exportación a Excel
- [ ] Implementar filtros por fecha y fuente
