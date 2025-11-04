# 📅 Validación de Fechas en Procesos de Negociación

## 🎯 Objetivo

Garantizar la **consistencia cronológica** del proceso de negociación mediante validación de fechas al completar pasos.

---

## 📋 Reglas de Validación

### **Paso 1 (Sin Dependencias)**

```
Fecha Mínima: fecha_negociacion (inicio de la negociación)
Fecha Máxima: Hoy (fecha actual)

Ejemplo:
- Negociación iniciada: 1 de diciembre de 2024
- Al completar Paso 1:
  ✅ Válido: 1 dic 2024 - Hoy
  ❌ Inválido: Antes del 1 dic 2024
  ❌ Inválido: Fechas futuras
```

### **Pasos 2+ (Con Dependencias)**

```
Fecha Mínima: fecha_completado del paso del que depende
Fecha Máxima: Hoy (fecha actual)

Ejemplo:
- Paso 1 completado: 5 de diciembre de 2024
- Paso 2 depende de Paso 1
- Al completar Paso 2:
  ✅ Válido: 5 dic 2024 - Hoy
  ❌ Inválido: Antes del 5 dic 2024 (sería ilógico)
  ❌ Inválido: Fechas futuras
```

---

## 🔧 Implementación

### **Modal de Fecha Completado**

**Archivo:** `modal-fecha-completado.tsx`

**Props agregadas:**
```typescript
interface ModalFechaCompletadoProps {
  // ... props existentes
  fechaCompletadoDependencia?: string  // ✅ NUEVO
  nombrePasoDependencia?: string       // ✅ NUEVO
}
```

**Lógica de cálculo:**

```typescript
const calcularFechaMinima = () => {
  // Paso 1: Usar fecha de negociación
  if (ordenPaso === 1 && fechaNegociacion) {
    return formatDateForInput(fechaNegociacion)
  }

  // Otros pasos: Usar fecha del paso del que depende
  if (fechaCompletadoDependencia) {
    return formatDateForInput(fechaCompletadoDependencia)
  }

  // Fallback (no debería llegar aquí)
  return fecha30DiasAtras
}
```

---

## 🎨 UI Mejorada

### **Información Mostrada al Usuario**

#### **Paso 1:**
```
📌 Inicio de negociación: 1 de diciembre de 2024
📅 Fecha mínima: 1 de diciembre de 2024
📅 Fecha máxima: Hoy (15 de diciembre de 2024)
```

#### **Pasos con dependencias:**
```
⛓️ Depende de: Promesa de compraventa enviada
✅ Completado: 5 de diciembre de 2024
📅 Fecha mínima permitida: 5 de diciembre de 2024
📅 Fecha máxima: Hoy (15 de diciembre de 2024)
```

---

## ⚠️ Mensajes de Error

### **Si fecha anterior a la mínima:**

**Paso 1:**
```
⚠️ La fecha no puede ser anterior al inicio de la negociación
```

**Otros pasos:**
```
⚠️ La fecha debe ser posterior o igual a "Promesa de compraventa enviada"
```

### **Si fecha futura:**
```
⚠️ La fecha no puede ser futura
```

---

## 📊 Casos de Uso

### **Caso 1: Proceso Normal**

```
Negociación inicia: 1 dic 2024

Usuario completa Paso 1: 3 dic 2024 ✅
  → Válido (entre 1 dic - hoy)

Usuario completa Paso 2: 5 dic 2024 ✅
  → Válido (>= 3 dic)

Usuario completa Paso 3: 6 dic 2024 ✅
  → Válido (>= 5 dic)
```

### **Caso 2: Error de Fecha (Bloqueado)**

```
Paso 1 completado: 5 dic 2024

Usuario intenta completar Paso 2: 3 dic 2024 ❌
  → Rechazado: "La fecha debe ser posterior o igual a Paso 1"
  → Fecha mínima: 5 dic 2024
```

### **Caso 3: Corrección Retroactiva**

```
Paso 1 completado: 10 dic 2024
Paso 2 completado: 12 dic 2024

Usuario reabre Paso 1 y corrige fecha: 8 dic 2024 ✅
  → Válido (>= fecha_negociacion)

Paso 2 sigue válido porque 12 dic >= 8 dic ✅
```

---

## 🔗 Relación con Dependencias

### **Dependencias Simples (Paso Anterior)**

```typescript
Paso 2: dependeDe = [paso_1_id]

Al completar Paso 2:
  fecha_minima = fecha_completado de Paso 1
```

### **Dependencias Múltiples**

```typescript
Paso 5: dependeDe = [paso_2_id, paso_4_id]

Al completar Paso 5:
  fecha_minima = MAX(
    fecha_completado Paso 2,
    fecha_completado Paso 4
  )
```

**Nota:** Actualmente se usa el primer paso de la lista. Para múltiples dependencias, se puede extender la lógica.

---

## 🚀 Próximas Mejoras

### **Pendientes:**

- [ ] Soporte para múltiples dependencias (tomar fecha máxima)
- [ ] Validación al reabrir pasos (ajustar fechas en cascada)
- [ ] Alertas preventivas si la fecha parece incorrecta
- [ ] Sugerencias de fecha basadas en patrones históricos

---

## 🐛 Troubleshooting

### **Error: Fecha mínima no se muestra correctamente**

**Causa:** `dependeDe` es `null` o vacío

**Solución:**
```typescript
// Verificar que el paso tenga dependencias configuradas
console.log(paso.dependeDe) // Debe ser array con IDs
```

### **Error: No encuentra paso dependiente**

**Causa:** El ID en `dependeDe` no coincide con ningún paso

**Solución:**
```typescript
// Verificar IDs en consola
console.log('Buscando:', paso.dependeDe[0])
console.log('Pasos disponibles:', pasos.map(p => p.id))
```

---

## 📝 Checklist de Testing

- [ ] Paso 1 usa fecha_negociacion como mínima
- [ ] Paso 2 usa fecha_completado de Paso 1 como mínima
- [ ] No permite fechas futuras
- [ ] Muestra mensaje de error claro al violar restricciones
- [ ] Muestra información del paso dependiente en UI
- [ ] Funciona con diferentes órdenes de pasos
- [ ] Funciona después de reabrir pasos

---

**Última actualización:** 1 de noviembre de 2025
