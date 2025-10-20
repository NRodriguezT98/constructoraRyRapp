# 🧪 Testing: Modal Nuevo de Negociaciones

## ✅ IMPLEMENTACIÓN COMPLETADA

El nuevo modal con wizard de 3 pasos está **activo y listo para probar**.

---

## 📝 Cambios Realizados

### 1. Backup Creado
```
✅ modal-crear-negociacion-OLD.tsx (backup del original)
```

### 2. Modal Reemplazado
```typescript
// modal-crear-negociacion.tsx ahora exporta el nuevo componente
export { ModalCrearNegociacionNuevo as ModalCrearNegociacion }
  from './modal-crear-negociacion-nuevo'
```

### 3. Retrocompatibilidad Asegurada
- ✅ Imports existentes siguen funcionando
- ✅ Props son compatibles
- ✅ Flujo viejo sigue disponible en backup

---

## 🚀 Cómo Probar

### Paso 1: Abrir Aplicación
```bash
npm run dev
```

Navegar a: `http://localhost:3000/clientes/[id]`

### Paso 2: Abrir Modal
1. Ir a cualquier cliente
2. Click en **"Crear Negociación"**
3. Verás el **nuevo modal con 3 pasos** 🎉

---

## 🧪 Casos de Prueba

### ✅ Test Case 1: Solo Cuota Inicial
**Objetivo**: Verificar flujo básico

1. **Paso 1 - Info Básica**:
   - Seleccionar Proyecto
   - Seleccionar Vivienda (valor se auto-llena)
   - Dejar Descuento en 0
   - Click "Siguiente"

2. **Paso 2 - Fuentes de Pago**:
   - Cuota Inicial ya está habilitada
   - Configurar monto = Valor Total de la vivienda
   - Verificar feedback visual **verde** ✅
   - Verificar mensaje "¡Financiamiento completo!"
   - Click "Siguiente"

3. **Paso 3 - Revisión**:
   - Verificar todos los datos
   - Click "Crear Negociación"

4. **Verificar**:
   - ✅ Negociación creada
   - ✅ Tab de negociaciones se auto-refresca
   - ✅ Vivienda pasa a "reservada"
   - ✅ Cliente pasa a "Activo"

---

### ✅ Test Case 2: Cuota + Crédito Hipotecario
**Objetivo**: Verificar múltiples fuentes

1. **Paso 2 - Fuentes de Pago**:
   - Cuota Inicial: 30% del valor (ej: $30,000,000)
   - Habilitar "Crédito Hipotecario" (toggle ON)
   - Configurar:
     * Monto: 70% del valor (ej: $70,000,000)
     * Entidad: "Bancolombia"
     * Número Referencia: "123456789"
   - Verificar suma = 100% ✅
   - Continuar flujo

2. **Verificar**:
   - ✅ 2 fuentes de pago creadas
   - ✅ Crédito con `permite_multiples_abonos = false`

---

### ✅ Test Case 3: Financiamiento Completo (4 fuentes)
**Objetivo**: Verificar todos los tipos

1. **Paso 2 - Fuentes de Pago**:
   - Cuota Inicial: 20%
   - Crédito Hipotecario: 40%
   - Subsidio Mi Casa Ya: 20%
   - Subsidio Caja Compensación: 20%
   - Configurar entidades y referencias para cada uno
   - Verificar suma = 100%

2. **Verificar**:
   - ✅ 4 fuentes creadas
   - ✅ Cada una con su configuración

---

### ❌ Test Case 4: Validación de Suma Incorrecta
**Objetivo**: Verificar que NO permite crear si suma no cierra

1. **Paso 2 - Fuentes de Pago**:
   - Cuota Inicial: 30%
   - Crédito: 60%
   - **Total: 90%** (faltan $10,000,000)

2. **Verificar**:
   - ❌ Feedback visual **rojo**
   - ❌ Mensaje "Faltan $10,000,000"
   - ❌ Botón "Siguiente" **deshabilitado**

3. **Corregir**:
   - Ajustar Crédito a 70%
   - Verificar feedback verde ✅
   - Botón habilitado

---

### ❌ Test Case 5: Datos Faltantes en Fuentes
**Objetivo**: Verificar validaciones de campos requeridos

1. **Paso 2 - Fuentes de Pago**:
   - Habilitar Crédito Hipotecario
   - Configurar monto pero NO llenar:
     * Entidad (vacío)
     * Número de Referencia (vacío)

2. **Intentar avanzar**:
   - ❌ Error mostrado
   - ❌ No permite continuar

3. **Corregir**:
   - Llenar Entidad: "Banco de Bogotá"
   - Llenar Número: "987654321"
   - ✅ Ahora sí permite avanzar

---

### ✅ Test Case 6: Descuento Aplicado
**Objetivo**: Verificar cálculo con descuento

1. **Paso 1 - Info Básica**:
   - Valor Negociado: $100,000,000
   - Descuento: $5,000,000
   - **Valor Total: $95,000,000** (auto-calculado)

2. **Paso 2 - Fuentes de Pago**:
   - Configurar fuentes que sumen **$95,000,000** (no $100M)
   - Verificar feedback verde ✅

---

### ✅ Test Case 7: Event Listener (Auto-refresh)
**Objetivo**: Verificar que tab se actualiza

1. Crear negociación exitosamente
2. Verificar en consola: `📢 Evento "negociacion-creada" disparado`
3. **Sin recargar página**, verificar:
   - ✅ Tab "Negociaciones" muestra la nueva
   - ✅ Datos correctos en el card

---

## 🎨 Elementos Visuales a Verificar

### Stepper (Navegación)
- ✅ Paso actual con **pulso animado**
- ✅ Pasos completados con **checkmark verde**
- ✅ Pasos pendientes en **gris**
- ✅ Línea de progreso animada (desktop)
- ✅ Layout vertical en mobile

### FuentePagoCard
- ✅ Colores por tipo:
  - Azul (Cuota Inicial)
  - Morado (Crédito)
  - Verde (Subsidio Mi Casa Ya)
  - Naranja (Subsidio Caja)
- ✅ Animación al habilitar/deshabilitar
- ✅ Porcentaje calculado automáticamente
- ✅ Formato de moneda correcto

### Feedback Visual
- ✅ Verde + checkmark cuando suma cierra
- ✅ Rojo + alerta cuando falta/sobra
- ✅ Cantidad exacta mostrada

---

## 🐛 Qué Buscar (Errores Potenciales)

### Console Logs
Deberías ver:
```
📝 Creando negociación con fuentes de pago...
✅ Negociación creada: [uuid]
📝 Creando 2 fuentes de pago... (o el número que configuraste)
✅ Fuentes de pago creadas
📝 Actualizando vivienda a estado "reservada"...
✅ Vivienda actualizada a "reservada"
📝 Actualizando cliente a estado "Activo"...
✅ Cliente actualizado a "Activo"
✅ ¡Negociación creada exitosamente con cierre financiero completo!
📢 Evento "negociacion-creada" disparado
```

### NO Deberías Ver:
```
❌ Error creando negociación
❌ Error creando fuentes de pago
⚠️ Rollback: ...
```

---

## 🔄 Rollback (Si Necesitas Volver al Viejo)

Si encuentras problemas críticos:

```bash
# Restaurar modal viejo
Copy-Item "src\modules\clientes\components\modals\modal-crear-negociacion-OLD.tsx" `
          "src\modules\clientes\components\modals\modal-crear-negociacion.tsx" -Force
```

---

## 📊 Checklist de Prueba

### Funcionalidad
- [ ] Modal abre correctamente
- [ ] 3 pasos visibles en stepper
- [ ] Navegación entre pasos funciona
- [ ] Proyectos se cargan
- [ ] Viviendas se filtran por proyecto
- [ ] Valor auto-llena desde vivienda
- [ ] Descuento calcula correctamente valor total
- [ ] Cuota Inicial no se puede deshabilitar
- [ ] Otras fuentes se pueden habilitar/deshabilitar
- [ ] Validación de suma funciona
- [ ] Feedback visual correcto
- [ ] Paso 3 muestra resumen completo
- [ ] Creación exitosa
- [ ] Tab se auto-refresca

### Visual
- [ ] Stepper responsive (desktop/mobile)
- [ ] Cards de fuentes con colores correctos
- [ ] Animaciones suaves
- [ ] Loading spinner mientras crea
- [ ] Mensajes de error claros

### Base de Datos
- [ ] Negociación creada con estado "Cierre Financiero"
- [ ] Fuentes de pago creadas
- [ ] Vivienda pasa a "reservada"
- [ ] Cliente pasa a "Activo"
- [ ] `permite_multiples_abonos` correcto por tipo

---

## 📝 Reportar Issues

Si encuentras problemas, documenta:
1. **Caso de prueba** que ejecutaste
2. **Comportamiento esperado**
3. **Comportamiento actual**
4. **Logs de consola**
5. **Screenshots** (si es visual)

---

## ✅ Estado Actual

- **Fecha**: 2025-01-20
- **Modal**: ✅ ACTIVO (modal-crear-negociacion.tsx)
- **Backup**: ✅ Disponible (modal-crear-negociacion-OLD.tsx)
- **Retrocompatibilidad**: ✅ Asegurada
- **Listo para testing**: ✅ SÍ

---

**¡A probar!** 🚀
