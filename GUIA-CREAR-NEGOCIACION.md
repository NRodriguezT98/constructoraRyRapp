# 🚀 GUÍA COMPLETA: Cómo Crear una Negociación

**Fecha**: 18 de octubre de 2025
**Status**: Guía paso a paso para crear y gestionar negociaciones

---

## 📋 FLUJO COMPLETO DE NEGOCIACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESO DE NEGOCIACIÓN                        │
└─────────────────────────────────────────────────────────────────┘

1️⃣  CREAR NEGOCIACIÓN
    ├─ Cliente seleccionado ✅
    ├─ Elegir proyecto
    ├─ Seleccionar vivienda disponible
    ├─ Ingresar valor negociado
    ├─ Aplicar descuento (opcional)
    └─ Estado: "En Proceso" 🟡

            ↓

2️⃣  CONFIGURAR CIERRE FINANCIERO
    ├─ Agregar Cuota Inicial (💜)
    ├─ Agregar Crédito Hipotecario (💙) [opcional]
    ├─ Agregar Subsidio Mi Casa Ya (💚) [opcional]
    ├─ Agregar Subsidio Caja Compensación (🧡) [opcional]
    ├─ Validar: Suma = 100% del valor
    └─ Estado: "Cierre Financiero" 🟠

            ↓

3️⃣  ACTIVAR NEGOCIACIÓN
    ├─ Verificar cierre completo ✅
    ├─ Click "Activar Negociación"
    └─ Estado: "Activa" 🟢

            ↓

4️⃣  GESTIÓN Y CIERRE
    ├─ Registrar abonos recibidos
    ├─ Seguimiento de pagos
    └─ Estados finales:
        ├─ "Completada" ✅ (100% pagado)
        ├─ "Cancelada" ❌ (constructora cancela)
        └─ "Renuncia" 🚫 (cliente renuncia)
```

---

## 🎯 PASO 1: ACCEDER A CREAR NEGOCIACIÓN

### **Opción A: Desde el Detalle del Cliente**

1. Ir a `/clientes`
2. Click en un cliente
3. En el header del detalle, verás el botón **"Crear Negociación"**
4. Click → Se abre el modal

### **Opción B: Desde un Interés Activo** (Próximamente)

1. Ir al tab "Intereses" del cliente
2. Buscar un interés con estado "Activo"
3. Click en "Convertir a Negociación"
4. Se abre el modal con datos pre-llenados

---

## 💰 PASO 2: LLENAR EL FORMULARIO

### **Modal: Crear Negociación**

#### **Campo 1: Cliente** (pre-seleccionado)
- ✅ Ya aparece el nombre del cliente
- No editable

#### **Campo 2: Proyecto** (requerido)
- Dropdown con proyectos activos
- Filtrados por estado: `en_planificacion` o `en_construccion`
- Al seleccionar → carga viviendas automáticamente

#### **Campo 3: Vivienda** (requerido)
- Dropdown dinámico
- Solo viviendas:
  - Del proyecto seleccionado
  - Con estado `disponible`
- Formato: `Manzana A - Casa 12 - $120.000.000`
- Al seleccionar → pre-llena el valor negociado

#### **Campo 4: Valor Negociado** (requerido)
- Número (pesos colombianos)
- Pre-llenado con el valor de la vivienda
- Editable (por si hay negociación diferente)
- Formato: `120000000`

#### **Campo 5: Descuento Aplicado** (opcional)
- Número (pesos colombianos)
- Default: `0`
- Ejemplo: `5000000` (5 millones de descuento)

#### **Campo 6: Notas** (opcional)
- Texto libre
- Ejemplo: "Cliente pagará cuota inicial en 3 meses"

### **Cálculo Automático**
```
Valor Total = Valor Negociado - Descuento Aplicado

Ejemplo:
  Valor Negociado:    $120.000.000
  Descuento:          -$5.000.000
  ─────────────────────────────────
  Valor Total:        $115.000.000  ✅
```

### **Validaciones**
- ✅ Cliente requerido
- ✅ Vivienda requerida
- ✅ Valor negociado > 0
- ✅ No duplicar negociaciones activas (mismo cliente + vivienda)
- ✅ Vivienda debe estar disponible

### **Botones**
- **Cancelar** → Cierra el modal sin guardar
- **Crear Negociación** → Guarda y crea la negociación

---

## 🎨 PASO 3: CONFIGURAR CIERRE FINANCIERO

Una vez creada la negociación, aparece el componente **Cierre Financiero**.

### **Vista del Componente**

```
╔═══════════════════════════════════════════════════════════════╗
║                     CIERRE FINANCIERO                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Valor Total Negociación:  $115.000.000                       ║
║  Total Fuentes:            $0                                  ║
║  Falta:                    $115.000.000                        ║
║  ▓▓▓░░░░░░░░░░░░░░░░░░░░  0% cubierto                         ║
╠═══════════════════════════════════════════════════════════════╣
║  AGREGAR FUENTE DE PAGO:                                       ║
║  [💜 Cuota Inicial]  [💙 Crédito]  [💚 Mi Casa Ya]  [🧡 Caja] ║
╚═══════════════════════════════════════════════════════════════╝
```

### **4 Tipos de Fuentes de Pago**

#### **1. Cuota Inicial** 💜
- **Color**: Morado
- **Permite múltiples abonos**: ✅ SÍ
- **Requiere entidad**: ❌ No
- **Uso**: Pagos directos del cliente
- **Ejemplo**: Click → Agregar cuota inicial de $40.000.000

#### **2. Crédito Hipotecario** 💙
- **Color**: Azul
- **Permite múltiples abonos**: ❌ No (desembolso único)
- **Requiere entidad**: ✅ SÍ (banco)
- **Uso**: Financiación bancaria
- **Ejemplo**:
  - Monto: $60.000.000
  - Entidad: "Banco Davivienda"

#### **3. Subsidio Mi Casa Ya** 💚
- **Color**: Verde
- **Permite múltiples abonos**: ❌ No
- **Requiere entidad**: ❌ No
- **Uso**: Subsidio del gobierno nacional
- **Ejemplo**: Monto: $10.000.000

#### **4. Subsidio Caja Compensación** 🧡
- **Color**: Naranja
- **Permite múltiples abonos**: ❌ No
- **Requiere entidad**: ✅ SÍ (caja)
- **Uso**: Subsidio de caja de compensación familiar
- **Ejemplo**:
  - Monto: $5.000.000
  - Entidad: "Comfandi"

---

## 💡 EJEMPLO PRÁCTICO COMPLETO

### **Caso: Juan Pérez compra casa de $120 millones**

#### **Paso 1: Crear Negociación**
```
Cliente:           Juan Pérez ✅
Proyecto:          Urbanización Las Palmas
Vivienda:          Manzana A - Casa 12 - $120.000.000
Valor Negociado:   $120.000.000
Descuento:         $5.000.000 (descuento especial)
─────────────────────────────────────────────────────
Valor Total:       $115.000.000 ✅
```

#### **Paso 2: Configurar Fuentes**

**Agregar Cuota Inicial 💜**
```
Tipo:              Cuota Inicial
Monto Aprobado:    $40.000.000
Entidad:           - (no aplica)
Referencia:        "CI-2024-001"
```

**Agregar Crédito Hipotecario 💙**
```
Tipo:              Crédito Hipotecario
Monto Aprobado:    $60.000.000
Entidad:           Banco Davivienda ✅ (requerido)
Referencia:        "CRED-2024-0123"
```

**Agregar Subsidio Mi Casa Ya 💚**
```
Tipo:              Subsidio Mi Casa Ya
Monto Aprobado:    $10.000.000
Entidad:           - (no aplica)
Referencia:        "SUBS-GOB-2024"
```

**Agregar Subsidio Caja 🧡**
```
Tipo:              Subsidio Caja Compensación
Monto Aprobado:    $5.000.000
Entidad:           Comfandi ✅ (requerido)
Referencia:        "SUBS-CAJA-456"
```

#### **Validación de Totales**
```
Cuota Inicial:     $40.000.000
Crédito:           $60.000.000
Mi Casa Ya:        $10.000.000
Caja:              $5.000.000
─────────────────────────────────
Total Fuentes:     $115.000.000 ✅
Valor Total:       $115.000.000 ✅
Diferencia:        $0 ✅

Estado: 🟢 Cierre Completo (100%)
```

#### **Paso 3: Guardar y Activar**

1. Click **"Guardar Fuentes"**
   - Estado cambia a: "Cierre Financiero" 🟠

2. Click **"Activar Negociación"**
   - ✅ Valida que total = 100%
   - ✅ Cambia estado a: "Activa" 🟢
   - ✅ Negociación lista para seguimiento

---

## 🔍 VALIDACIONES AUTOMÁTICAS

### **Durante la Creación**
- ✅ No permitir viviendas ya negociadas
- ✅ Validar que el cliente no tenga negociación activa en la misma vivienda
- ✅ Valor negociado debe ser > 0
- ✅ Descuento no puede ser > valor negociado

### **Durante el Cierre Financiero**
- ✅ Solo permitir una fuente de cada tipo (excepto Cuota Inicial)
- ✅ Monto aprobado debe ser > 0
- ✅ Entidad requerida para crédito y caja
- ✅ Suma de fuentes debe = 100% del valor total

### **Antes de Activar**
- ✅ Verificar que total fuentes = valor negociación
- ✅ Margen de error: ±1 peso
- ✅ Todas las fuentes deben tener monto aprobado

---

## 🎨 ESTADOS VISUALES

### **Barra de Progreso**
```
0-30%:     ▓▓▓░░░░░░░░░░░░░░░  🟡 Amarillo - Falta mucho
31-70%:    ▓▓▓▓▓▓▓░░░░░░░░░░  🟠 Naranja - Falta
71-99%:    ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  🔵 Azul - Casi completo
100%:      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  🟢 Verde - ¡Completo!
>100%:     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  🔴 Rojo - Exceso
```

### **Cards de Fuentes**
Cada fuente tiene:
- 🎨 Color distintivo por tipo
- 📝 Formulario inline para editar
- 🗑️ Botón para eliminar
- 📊 Indicador visual del monto

---

## 🚫 ERRORES COMUNES

### **Error 1: "Ya existe una negociación activa"**
```
Causa:  Cliente ya tiene negociación activa en esta vivienda
Solución:
  - Cancelar la negociación anterior
  - O usar otra vivienda
```

### **Error 2: "El cierre no está completo"**
```
Causa:  Suma de fuentes ≠ valor total
Ejemplo:
  Valor Total:    $115.000.000
  Total Fuentes:  $110.000.000
  Falta:          $5.000.000 ❌

Solución:
  - Agregar fuente por $5.000.000
  - O aumentar montos existentes
```

### **Error 3: "La fuente requiere especificar la entidad"**
```
Causa:  Crédito o Caja sin entidad
Solución:
  - Llenar campo "Entidad" (requerido)
```

### **Error 4: "Ya existe una fuente de tipo X"**
```
Causa:  Intentar agregar 2 créditos (solo se permite 1)
Solución:
  - Eliminar fuente duplicada
  - Solo Cuota Inicial permite múltiples
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE ACTIVAR

Una vez la negociación está **Activa** 🟢:

1. **Registrar abonos** → Cuota Inicial puede recibir múltiples pagos
2. **Seguimiento de desembolsos** → Bancos y subsidios
3. **Actualizar estado** → Cuando todo esté pagado
4. **Completar negociación** → Estado final: "Completada" ✅

---

## 📱 ACCESO RÁPIDO

### **Rutas**
```
Ver lista de clientes:    /clientes
Ver detalle de cliente:   /clientes/[id]
Ver negociaciones:        /clientes/[id] → Tab "Negociaciones"
Detalle negociación:      /clientes/[id]/negociaciones/[negId]
```

### **Componentes**
```
Modal crear:              ModalCrearNegociacion
Cierre financiero:        CierreFinanciero
Hook crear:               useCrearNegociacion()
Hook gestionar:           useNegociacion(negociacionId)
```

---

## ✅ CHECKLIST RÁPIDO

Antes de crear una negociación, asegúrate de tener:

- [ ] Cliente creado en el sistema
- [ ] Proyecto activo (`en_planificacion` o `en_construccion`)
- [ ] Vivienda disponible en el proyecto
- [ ] Valor de la vivienda definido
- [ ] Cliente sin negociación activa en esa vivienda

Durante la configuración de fuentes:

- [ ] Definir cuánto pagará el cliente de cuota inicial
- [ ] Definir si hay crédito hipotecario (banco + monto)
- [ ] Definir si hay subsidios (gobierno y/o caja)
- [ ] Verificar que la suma = 100% del valor total
- [ ] Llenar entidad donde sea requerido

Para activar:

- [ ] Todas las fuentes tienen monto > 0
- [ ] Suma total = valor negociación (margen ±1)
- [ ] Campos requeridos completos

---

## 🎊 ¡LISTO!

Ya tienes toda la información para crear y gestionar negociaciones completas.

**¿Necesitas ayuda?**
- Ver: `MODULO-NEGOCIACIONES-COMPLETO.md`
- Consultar: `docs/DATABASE-SCHEMA-REFERENCE.md`

**¡Ahora vamos a integrarlo en el sistema para que puedas probarlo!** 🚀
