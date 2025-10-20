# 🔄 REFACTORIZACIÓN CRÍTICA: Crear Negociación con Cierre Financiero

**Fecha**: 20 Enero 2025
**Prioridad**: 🔴 **CRÍTICA**
**Impacto**: ⚠️ **CAMBIO DE FLUJO COMPLETO**

---

## 🎯 OBJETIVO

**Cambiar el flujo de negociaciones para que el cierre financiero se configure INMEDIATAMENTE al crear la negociación**, no en un paso posterior. Esto evita negociaciones incompletas y asegura que solo se creen cuando hay compromiso real.

---

## ❌ PROBLEMA ACTUAL

### **Flujo Actual (INCORRECTO)**:
```
1. Crear negociación (solo cliente + vivienda + valor)
2. Estado: "En Proceso"
3. Usuario debe ir manualmente a configurar cierre financiero
4. Usuario debe agregar fuentes de pago
5. Usuario debe configurar cada fuente
6. Estado cambia a: "Cierre Financiero"
```

### **Problemas**:
- ❌ Negociaciones incompletas quedan en "En Proceso" indefinidamente
- ❌ Usuario puede olvidar configurar cierre financiero
- ❌ Base de datos se llena de negociaciones sin terminar
- ❌ No hay validación de que el cierre está completo
- ❌ Proceso fragmentado (2+ pasos separados)

---

## ✅ SOLUCIÓN PROPUESTA

### **Nuevo Flujo (CORRECTO)**:
```
1. Modal "Crear Negociación y Configurar Cierre Financiero"
   ├─ Paso 1: Cliente + Vivienda + Valores
   ├─ Paso 2: Fuentes de Pago (OBLIGATORIO)
   │   ├─ Cuota Inicial
   │   ├─ Crédito Hipotecario
   │   ├─ Subsidio Mi Casa Ya (opcional)
   │   └─ Subsidio Caja Compensación (opcional)
   └─ Paso 3: Revisión y Confirmación

2. Al guardar:
   ├─ Se crea la negociación
   ├─ Se crean TODAS las fuentes de pago configuradas
   ├─ Estado inicial: "Cierre Financiero" (ya configurado)
   └─ Vivienda cambia a estado: "reservada"

3. Usuario puede empezar a recibir abonos INMEDIATAMENTE
```

---

## 📋 COMPONENTES A MODIFICAR

### 1️⃣ **Modal de Crear Negociación** (COMPLETO REDISEÑO)

**Archivo**: `modal-crear-negociacion.tsx`

#### **Diseño: Stepper con 3 pasos**

```tsx
interface Step {
  number: 1 | 2 | 3
  title: string
  description: string
  icon: LucideIcon
  isValid: boolean
}

const STEPS = [
  {
    number: 1,
    title: 'Información Básica',
    description: 'Cliente, vivienda y valores',
    icon: Home,
  },
  {
    number: 2,
    title: 'Fuentes de Pago',
    description: 'Configurar financiamiento',
    icon: DollarSign,
  },
  {
    number: 3,
    title: 'Revisión',
    description: 'Confirmar información',
    icon: CheckCircle2,
  },
]
```

#### **PASO 1: Información Básica**
- Cliente (pre-seleccionado, read-only)
- Proyecto (select)
- Vivienda (select dependiente de proyecto)
- Valor Negociado (auto-llenado desde vivienda, editable)
- Descuento Aplicado (opcional)
- **Valor Total** = Valor Negociado - Descuento (calculado, read-only)

**Validación para avanzar**:
- ✅ Vivienda seleccionada
- ✅ Valor Negociado > 0
- ✅ Descuento < Valor Negociado
- ✅ Valor Total > 0

---

#### **PASO 2: Fuentes de Pago** ⭐ **NUEVO**

**Objetivo**: Configurar TODAS las fuentes que suman el valor total.

##### **Validación CRÍTICA**:
```typescript
const totalFuentesPago = fuentesPago.reduce((sum, f) => sum + f.monto_aprobado, 0)
const esValido = totalFuentesPago === valorTotal
```

**⚠️ NO se puede avanzar si**: `totalFuentesPago !== valorTotal`

##### **Fuentes Configurables**:

1. **Cuota Inicial** (OBLIGATORIA)
   ```typescript
   {
     tipo: 'Cuota Inicial',
     monto_aprobado: number,
     permite_multiples_abonos: true, // FIJO
     entidad: '',
     numero_referencia: '',
   }
   ```
   - Input: Monto (mínimo 10% del valor total)
   - Permite múltiples abonos: **SÍ** (checkbox disabled, checked)

2. **Crédito Hipotecario** (OPCIONAL)
   ```typescript
   {
     tipo: 'Crédito Hipotecario',
     monto_aprobado: number,
     permite_multiples_abonos: false, // FIJO
     entidad: string, // Ej: "Banco de Bogotá"
     numero_referencia: string, // Radicado
     carta_aprobacion_url?: string, // Upload
   }
   ```
   - Checkbox: "¿Cliente tiene crédito hipotecario?"
   - Si activo: Mostrar formulario
   - Input: Monto, Entidad, Radicado
   - Upload: Carta de aprobación (opcional)

3. **Subsidio Mi Casa Ya** (OPCIONAL)
   ```typescript
   {
     tipo: 'Subsidio Mi Casa Ya',
     monto_aprobado: number,
     permite_multiples_abonos: false,
     entidad: 'Gobierno Nacional',
     numero_referencia: string,
     carta_asignacion_url?: string,
   }
   ```
   - Checkbox: "¿Cliente tiene subsidio Mi Casa Ya?"
   - Input: Monto, Número de asignación
   - Upload: Carta de asignación (opcional)

4. **Subsidio Caja Compensación** (OPCIONAL)
   ```typescript
   {
     tipo: 'Subsidio Caja Compensación',
     monto_aprobado: number,
     permite_multiples_abonos: false,
     entidad: string, // Ej: "Compensar"
     numero_referencia: string,
     carta_asignacion_url?: string,
   }
   ```
   - Checkbox: "¿Cliente tiene subsidio de Caja?"
   - Input: Monto, Caja, Número
   - Upload: Carta de asignación (opcional)

##### **UI Design**:

```tsx
<div className="space-y-6">
  {/* Resumen del Valor Total */}
  <div className="rounded-xl bg-blue-50 p-6">
    <h3>Valor Total a Financiar</h3>
    <p className="text-3xl font-bold">${valorTotal.toLocaleString()}</p>
  </div>

  {/* Configuración de Fuentes */}
  <div className="space-y-4">
    {/* Cuota Inicial (SIEMPRE VISIBLE) */}
    <FuentePagoCard
      tipo="Cuota Inicial"
      obligatorio
      onMontoChange={handleCuotaInicialChange}
    />

    {/* Crédito Hipotecario (OPCIONAL) */}
    <div>
      <label>
        <input type="checkbox" checked={tieneCreditoHipotecario} />
        Cliente tiene Crédito Hipotecario
      </label>
      {tieneCreditoHipotecario && (
        <FuentePagoCard
          tipo="Crédito Hipotecario"
          onConfigChange={handleCreditoChange}
        />
      )}
    </div>

    {/* Subsidios */}
    {/* ... similar para cada subsidio */}
  </div>

  {/* Validación Visual */}
  <div className={cn(
    "rounded-xl p-4",
    totalFuentes === valorTotal
      ? "bg-green-50 border-2 border-green-500"
      : "bg-red-50 border-2 border-red-500"
  )}>
    <div className="flex justify-between">
      <span>Total Fuentes de Pago:</span>
      <span className="font-bold">${totalFuentes.toLocaleString()}</span>
    </div>
    <div className="flex justify-between">
      <span>Valor Total Vivienda:</span>
      <span className="font-bold">${valorTotal.toLocaleString()}</span>
    </div>
    <div className="mt-2 pt-2 border-t">
      {totalFuentes === valorTotal ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>¡Financiamiento completo!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Faltan ${Math.abs(valorTotal - totalFuentes).toLocaleString()}</span>
        </div>
      )}
    </div>
  </div>

  {/* Botones */}
  <div className="flex gap-3">
    <button onClick={handleBack}>Anterior</button>
    <button
      onClick={handleNext}
      disabled={totalFuentes !== valorTotal}
    >
      Siguiente
    </button>
  </div>
</div>
```

---

#### **PASO 3: Revisión y Confirmación**

**Mostrar resumen completo**:

```tsx
<div className="space-y-6">
  {/* Cliente y Vivienda */}
  <section>
    <h3>Información Básica</h3>
    <dl>
      <dt>Cliente:</dt>
      <dd>{clienteNombre}</dd>
      <dt>Proyecto:</dt>
      <dd>{proyectoNombre}</dd>
      <dt>Vivienda:</dt>
      <dd>Casa {viviendaNumero}</dd>
      <dt>Valor Negociado:</dt>
      <dd>${valorNegociado.toLocaleString()}</dd>
      {descuento > 0 && (
        <>
          <dt>Descuento:</dt>
          <dd className="text-orange-600">-${descuento.toLocaleString()}</dd>
        </>
      )}
      <dt>Valor Total:</dt>
      <dd className="text-2xl font-bold text-green-600">
        ${valorTotal.toLocaleString()}
      </dd>
    </dl>
  </section>

  {/* Fuentes de Pago */}
  <section>
    <h3>Fuentes de Pago Configuradas</h3>
    {fuentesPago.map((fuente) => (
      <div key={fuente.tipo} className="rounded-lg bg-gray-50 p-4">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">{fuente.tipo}</p>
            {fuente.entidad && (
              <p className="text-sm text-gray-600">{fuente.entidad}</p>
            )}
            {fuente.numero_referencia && (
              <p className="text-xs text-gray-500">Ref: {fuente.numero_referencia}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              ${fuente.monto_aprobado.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {((fuente.monto_aprobado / valorTotal) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    ))}
  </section>

  {/* Confirmación */}
  <div className="rounded-xl bg-blue-50 p-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-6 w-6 text-blue-600" />
      <div>
        <h4 className="font-semibold text-blue-900">Importante</h4>
        <p className="text-sm text-blue-700">
          Al confirmar, se creará la negociación con el cierre financiero configurado.
          La vivienda quedará reservada y podrás empezar a recibir abonos inmediatamente.
        </p>
      </div>
    </div>
  </div>

  {/* Botones */}
  <div className="flex gap-3">
    <button onClick={handleBack}>Anterior</button>
    <button onClick={handleSubmit} disabled={creando}>
      {creando ? 'Creando...' : 'Confirmar y Crear Negociación'}
    </button>
  </div>
</div>
```

---

### 2️⃣ **Hook: `useCrearNegociacion`** (ACTUALIZAR)

**Archivo**: `src/modules/clientes/hooks/useCrearNegociacion.ts`

#### **Cambios Necesarios**:

```typescript
interface FormDataNegociacion {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado: number
  notas?: string

  // ⭐ NUEVO: Fuentes de pago obligatorias
  fuentes_pago: CrearFuentePagoDTO[]
}

// Validación adicional
const validarFuentesPago = useCallback((fuentes: CrearFuentePagoDTO[], valorTotal: number) => {
  const errores: string[] = []

  // Debe tener al menos Cuota Inicial
  const tieneCuotaInicial = fuentes.some(f => f.tipo === 'Cuota Inicial')
  if (!tieneCuotaInicial) {
    errores.push('Debe configurar la Cuota Inicial')
  }

  // Sumar todas las fuentes
  const totalFuentes = fuentes.reduce((sum, f) => sum + f.monto_aprobado, 0)

  // ⚠️ CRÍTICO: Total fuentes DEBE ser igual al valor total
  if (totalFuentes !== valorTotal) {
    errores.push(`La suma de fuentes de pago (${totalFuentes.toLocaleString()}) debe ser igual al valor total (${valorTotal.toLocaleString()})`)
  }

  // Validar que cada fuente tenga monto > 0
  fuentes.forEach(f => {
    if (f.monto_aprobado <= 0) {
      errores.push(`${f.tipo} debe tener un monto mayor a 0`)
    }
  })

  return { valido: errores.length === 0, errores }
}, [])
```

#### **Actualizar `crearNegociacion`**:

```typescript
const crearNegociacion = useCallback(async (datos: FormDataNegociacion) => {
  // ... validaciones existentes ...

  // ⭐ NUEVA VALIDACIÓN
  const valorTotal = calcularValorTotal(datos.valor_negociado, datos.descuento_aplicado)
  const validacionFuentes = validarFuentesPago(datos.fuentes_pago, valorTotal)

  if (!validacionFuentes.valido) {
    setError(validacionFuentes.errores.join('\n'))
    return null
  }

  // Crear negociación CON fuentes de pago
  const negociacion = await negociacionesService.crearNegociacion({
    cliente_id: datos.cliente_id,
    vivienda_id: datos.vivienda_id,
    valor_negociado: datos.valor_negociado,
    descuento_aplicado: datos.descuento_aplicado,
    notas: datos.notas,
    fuentes_pago: datos.fuentes_pago, // ⭐ INCLUIR
  })

  // ... resto del código ...
}, [validarDatos, validarFuentesPago, calcularValorTotal])
```

---

### 3️⃣ **Servicio: `negociacionesService`** (VERIFICAR)

**Archivo**: `src/modules/clientes/services/negociaciones.service.ts`

#### **Método `crearNegociacion` debe**:

1. Crear registro en `negociaciones`
2. Crear registros en `fuentes_pago` (una transacción)
3. Estado inicial: **`'Cierre Financiero'`** (no "En Proceso")
4. Actualizar vivienda a estado: `'reservada'`

```typescript
async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
  try {
    // 1. Crear negociación
    const { data: negociacion, error: errorNegociacion } = await supabase
      .from('negociaciones')
      .insert({
        cliente_id: datos.cliente_id,
        vivienda_id: datos.vivienda_id,
        valor_negociado: datos.valor_negociado,
        descuento_aplicado: datos.descuento_aplicado || 0,
        estado: 'Cierre Financiero', // ⭐ ESTADO INICIAL
        fecha_cierre_financiero: new Date().toISOString(),
        notas: datos.notas,
      })
      .select()
      .single()

    if (errorNegociacion) throw errorNegociacion

    // 2. Crear fuentes de pago
    const fuentesConNegociacion = datos.fuentes_pago.map(f => ({
      ...f,
      negociacion_id: negociacion.id,
      monto_recibido: 0,
      saldo_pendiente: f.monto_aprobado,
      porcentaje_completado: 0,
      estado: 'Pendiente' as const,
    }))

    const { error: errorFuentes } = await supabase
      .from('fuentes_pago')
      .insert(fuentesConNegociacion)

    if (errorFuentes) {
      // Rollback: eliminar negociación
      await supabase.from('negociaciones').delete().eq('id', negociacion.id)
      throw errorFuentes
    }

    // 3. Actualizar vivienda a 'reservada'
    await supabase
      .from('viviendas')
      .update({ estado: 'reservada' })
      .eq('id', datos.vivienda_id)

    return negociacion
  } catch (error) {
    console.error('Error creando negociación:', error)
    throw error
  }
}
```

---

## 🗂️ NUEVOS COMPONENTES A CREAR

### 1. **`<StepperNegociacion />`**
Componente de navegación de pasos

### 2. **`<FuentePagoCard />`**
Card reutilizable para configurar cada fuente de pago

```tsx
interface FuentePagoCardProps {
  tipo: TipoFuentePago
  obligatorio?: boolean
  valor: CrearFuentePagoDTO | null
  valorTotal: number
  onChange: (fuente: CrearFuentePagoDTO | null) => void
}
```

### 3. **`<ResumenNegociacion />`**
Vista de confirmación (Paso 3)

---

## 📊 VALIDACIONES CRÍTICAS

### **Al crear negociación**:
- ✅ Cliente tiene cédula cargada
- ✅ Vivienda está disponible (no reservada/vendida)
- ✅ No existe otra negociación activa para la misma vivienda
- ✅ Valor negociado > 0
- ✅ Descuento < Valor negociado
- ✅ Al menos 1 fuente de pago configurada
- ✅ **Suma de fuentes === Valor total** (CRÍTICO)
- ✅ Cuota Inicial existe y > 0

---

## 🎨 UX MEJORADA

### **Antes** ❌:
```
Usuario: "Creé la negociación"
Sistema: *negociación en "En Proceso"*
Usuario: *se olvida de configurar cierre financiero*
Resultado: Negociación incompleta forever
```

### **Después** ✅:
```
Usuario: "Quiero crear negociación"
Sistema: *stepper de 3 pasos*
Usuario: *completa info básica*
Usuario: *configura fuentes de pago (OBLIGATORIO)*
Sistema: *valida que la suma sea correcta*
Usuario: *confirma*
Sistema: *crea todo atomicamente*
Resultado: Negociación COMPLETA desde el inicio
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Preparación**
- [ ] Revisar schema de `fuentes_pago` en DATABASE-SCHEMA-REFERENCE.md
- [ ] Verificar que `CrearNegociacionDTO` acepta `fuentes_pago[]`
- [ ] Confirmar método `crearNegociacion` en servicio

### **Fase 2: Crear Componentes Base**
- [ ] Crear `<StepperNegociacion />`
- [ ] Crear `<FuentePagoCard />`
- [ ] Crear `<ResumenNegociacion />`

### **Fase 3: Rediseñar Modal**
- [ ] Implementar Paso 1: Info Básica
- [ ] Implementar Paso 2: Fuentes de Pago ⭐
- [ ] Implementar Paso 3: Revisión
- [ ] Implementar navegación entre pasos
- [ ] Implementar validaciones por paso

### **Fase 4: Actualizar Lógica**
- [ ] Modificar `useCrearNegociacion` para validar fuentes
- [ ] Verificar `negociacionesService.crearNegociacion`
- [ ] Asegurar transaccionalidad (rollback si falla)

### **Fase 5: Testing**
- [ ] Crear negociación con solo Cuota Inicial
- [ ] Crear con Cuota + Crédito Hipotecario
- [ ] Crear con Cuota + Crédito + Subsidios
- [ ] Validar que suma incorrecta bloquea creación
- [ ] Verificar que vivienda queda reservada
- [ ] Confirmar que se puede recibir abonos inmediatamente

### **Fase 6: Documentación**
- [ ] Actualizar README.md con nuevo flujo
- [ ] Crear guía de usuario
- [ ] Documentar casos especiales

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Migración de Datos Existentes**:
```sql
-- Negociaciones antiguas en "En Proceso" sin fuentes de pago
-- Opción 1: Marcarlas como "Incompletas"
-- Opción 2: Crear fuente de pago genérica con valor total
-- Opción 3: Requerir que admin las complete manualmente
```

### **Flujo de Edición**:
- Una vez creada, las fuentes de pago se editan individualmente
- No se puede cambiar el valor total si hay abonos registrados
- Si se requiere ajustar: proceso de "Modificación de Negociación"

---

## 🚀 PRÓXIMOS PASOS

1. **Aprobar** este documento
2. **Crear** componentes base
3. **Refactorizar** modal
4. **Actualizar** hook y servicio
5. **Testing** exhaustivo
6. **Deploy** y monitorear

---

## 📎 ARCHIVOS RELACIONADOS

- `modal-crear-negociacion.tsx` (REDISEÑO COMPLETO)
- `useCrearNegociacion.ts` (AGREGAR VALIDACIONES)
- `negociaciones.service.ts` (VERIFICAR TRANSACCIONALIDAD)
- `DATABASE-SCHEMA-REFERENCE.md` (CONSULTAR SCHEMA)

---

**Estado**: 📋 **PROPUESTA - PENDIENTE APROBACIÓN**
**Estimación**: 6-8 horas de desarrollo
**Impacto**: 🔴 Alto (cambia flujo principal)
**Beneficio**: ✅ Elimina negociaciones incompletas, mejora UX, asegura integridad de datos
