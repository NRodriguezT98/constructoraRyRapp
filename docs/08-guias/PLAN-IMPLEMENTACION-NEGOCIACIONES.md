# ✅ LISTO PARA IMPLEMENTAR: Nuevo Flujo de Negociaciones

**Fecha**: 20 Enero 2025
**Estado**: 🚀 **APROBADO - LISTO PARA DESARROLLO**

---

## 📋 RESUMEN DE DECISIONES

### 1️⃣ **Fuentes de Pago** ✅
- Cuota Inicial
- Crédito Hipotecario
- Subsidio Mi Casa Ya
- Subsidio Caja Compensación

### 2️⃣ **Validación Estricta** ✅
```
Suma de fuentes = Valor total vivienda (SIEMPRE)
```

### 3️⃣ **Cuota Inicial** ✅
- Sin mínimo obligatorio
- Editable siempre
- Restricción: nuevo monto >= monto_recibido

### 4️⃣ **Documentos** ✅
- Cartas de crédito/subsidios: Opcionales por ahora
- Se volverán obligatorios cuando se resuelva Supabase Storage

### 5️⃣ **Diseño UI** ✅
- Stepper de 3 pasos (recomendado por su claridad)

### 6️⃣ **Estado Inicial** ✅
- Al crear con cierre financiero configurado: Cliente pasa a **ACTIVO**
- Significa: Ya tiene vivienda asignada

### 7️⃣ **Negociaciones Viejas** ✅
- Ignorar por ahora
- Se hará limpieza de BD después

### 8️⃣ **Reglas de Edición** ✅
- **Cuota Inicial**: Siempre editable (con restricción >= recibido)
- **Crédito/Subsidios**: Solo si NO han sido desembolsados
- **Desembolso**: Todo o nada (no hay abonos parciales)
- **Suma total**: Siempre debe cerrar en $0

---

## 🎯 LO QUE VOY A IMPLEMENTAR

### **FASE 1: Componentes Base** (2 horas)
```
✅ Stepper de navegación (3 pasos)
✅ FuentePagoCard (componente reutilizable)
✅ Validaciones (archivo ya creado)
```

### **FASE 2: Modal Completo** (3 horas)
```
✅ PASO 1: Info Básica
   - Cliente (pre-seleccionado)
   - Proyecto (select)
   - Vivienda (select dependiente)
   - Valor negociado (auto-fill, editable)
   - Descuento (opcional)
   - Valor total (calculado)

✅ PASO 2: Fuentes de Pago ⭐ CRÍTICO
   - Cuota Inicial (siempre visible)
   - Checkbox: Crédito Hipotecario
     ├─ Si activo: Monto, Entidad, Radicado
     └─ Upload: Carta (opcional)
   - Checkbox: Subsidio Mi Casa Ya
     ├─ Si activo: Monto, Radicado
     └─ Upload: Carta (opcional)
   - Checkbox: Subsidio Caja
     ├─ Si activo: Monto, Caja, Radicado
     └─ Upload: Carta (opcional)

   - Validación visual en tiempo real:
     [Suma Fuentes] vs [Valor Total]
     ✅ Verde si cierra | ❌ Rojo si no cierra

   - Botón "Siguiente" deshabilitado hasta que cierre

✅ PASO 3: Revisión
   - Resumen completo
   - Info básica
   - Todas las fuentes configuradas
   - Porcentajes
   - Confirmación
```

### **FASE 3: Lógica Backend** (2 horas)
```
✅ Actualizar useCrearNegociacion
   - Agregar validación de fuentes
   - Validar suma total

✅ Verificar negociacionesService.crearNegociacion
   - Crear negociación
   - Crear todas las fuentes_pago
   - Marcar vivienda como "reservada"
   - Actualizar cliente a "Activo"
   - Todo en una transacción

✅ Eventos
   - Disparar 'negociacion-creada'
   - Actualizar tabs automáticamente
```

### **FASE 4: Edición** (1.5 horas)
```
✅ Componente de edición de fuentes
✅ Aplicar reglas de validación
✅ UI que muestra qué se puede/no se puede editar
✅ Mensajes claros de por qué está bloqueado
```

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

### **Nuevos** 🆕
```
src/modules/clientes/components/
├── stepper-negociacion.tsx
├── fuente-pago-card.tsx
└── resumen-negociacion.tsx

src/modules/clientes/utils/
└── validar-edicion-fuentes.ts ✅ (YA CREADO)

docs/
├── REGLAS-NEGOCIO-FUENTES-PAGO.md ✅ (YA CREADO)
└── REFACTORIZACION-CREAR-NEGOCIACION.md ✅ (YA CREADO)
```

### **Modificar** 📝
```
src/modules/clientes/components/modals/
└── modal-crear-negociacion.tsx (REDISEÑO COMPLETO)

src/modules/clientes/hooks/
└── useCrearNegociacion.ts (AGREGAR VALIDACIONES)

src/modules/clientes/services/
└── negociaciones.service.ts (VERIFICAR TRANSACCIONALIDAD)
```

---

## ⏱️ TIEMPO ESTIMADO

| Fase | Horas | Descripción |
|------|-------|-------------|
| Fase 1 | 2h | Componentes base |
| Fase 2 | 3h | Modal con stepper |
| Fase 3 | 2h | Lógica backend |
| Fase 4 | 1.5h | Edición |
| **TOTAL** | **8.5h** | Desarrollo completo |

---

## 🧪 PLAN DE TESTING

### **Test 1: Crear Negociación Básica**
```
1. Seleccionar cliente
2. Seleccionar proyecto y vivienda
3. Configurar solo Cuota Inicial por valor total
4. Verificar que se crea correctamente
5. Verificar que cliente pasa a ACTIVO
6. Verificar que vivienda queda RESERVADA
```

### **Test 2: Crear con Crédito**
```
1. Configurar Cuota + Crédito
2. Verificar suma cierra
3. Intentar avanzar sin cerrar → BLOQUEADO
4. Ajustar hasta cerrar → PERMITE
5. Crear y verificar fuentes en DB
```

### **Test 3: Crear con Todos los Tipos**
```
1. Cuota + Crédito + Mi Casa Ya + Caja
2. Suma debe cerrar exactamente
3. Verificar porcentajes en revisión
4. Crear y verificar 4 fuentes en DB
```

### **Test 4: Edición - Sin Abonos**
```
1. Crear negociación
2. NO registrar abonos
3. Editar fuentes → PERMITIDO
4. Cambiar distribución
5. Verificar que cierra suma
```

### **Test 5: Edición - Con Abonos en Cuota**
```
1. Crear negociación
2. Registrar abono de $5M en cuota
3. Intentar reducir cuota a $3M → BLOQUEADO
4. Aumentar cuota a $7M → PERMITIDO
5. Ajustar crédito → PERMITIDO (no desembolsado)
```

### **Test 6: Edición - Crédito Desembolsado**
```
1. Crear negociación
2. Marcar crédito como desembolsado
3. Intentar editar crédito → BLOQUEADO
4. Editar cuota → PERMITIDO (si no reduce < recibido)
5. Agregar subsidio → PERMITIDO
```

---

## 📊 INDICADORES DE ÉXITO

✅ **Funcionalidad**:
- [ ] Se puede crear negociación con fuentes configuradas
- [ ] Validación de suma funciona correctamente
- [ ] No permite avanzar si suma no cierra
- [ ] Cliente pasa a ACTIVO al crear
- [ ] Vivienda queda RESERVADA
- [ ] Fuentes se crean en DB correctamente

✅ **Edición**:
- [ ] Cuota inicial editable con restricciones
- [ ] Créditos/subsidios bloqueados después de desembolso
- [ ] Mensajes claros de por qué está bloqueado
- [ ] Puede agregar nuevas fuentes

✅ **UX**:
- [ ] Stepper intuitivo
- [ ] Validación visual en tiempo real
- [ ] Mensajes de error claros
- [ ] Resumen completo antes de confirmar
- [ ] Sin errores TypeScript
- [ ] Responsive en mobile

---

## 🚀 PRÓXIMO PASO

**¿Empiezo con FASE 1 (Componentes Base)?**

Voy a crear:
1. `<StepperNegociacion />` - Navegación visual de pasos
2. `<FuentePagoCard />` - Card para configurar cada fuente
3. Estructura base del nuevo modal

**¿Procedo?** ✅
