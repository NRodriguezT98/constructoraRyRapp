# ✅ Ajuste: Campo "Valor Estimado" Eliminado del Formulario de Interés

**Fecha**: 20 Enero 2025
**Cambio**: Simplificación del flujo de registro de interés

---

## 🎯 Cambio Realizado

### ANTES:
```tsx
// Modal mostraba campo "Valor Estimado"
<MoneyInput
  label="Valor Estimado"
  value={valorEstimado} // Se auto-completaba desde vivienda
  required
/>
```

### DESPUÉS:
```tsx
// Campo eliminado del formulario
// El valor se tomará directamente de la vivienda cuando se necesite
```

---

## 📋 Razón del Cambio

**Lógica de negocio**:
- El valor de la vivienda NO se modifica al registrar el interés
- El valor viene directamente de `viviendas.valor_total`
- La ÚNICA forma de modificar el valor es aplicando un **descuento** más adelante en el proceso de negociación
- Campo `descuento_aplicado` es el que controla ajustes de precio

**Experiencia de usuario**:
- Simplifica el formulario (1 campo menos)
- Evita confusión sobre "¿puedo cambiar el precio aquí?"
- Flujo más rápido para registrar interés

---

## 🔧 Archivos Modificados

### 1. **`useRegistrarInteres.ts`** (Hook)
```typescript
// ❌ Eliminado
interface FormData {
  valorEstimado?: number  // REMOVED
}

// ❌ Eliminado
const valorEstimado = watch('valorEstimado')

// ❌ Eliminado
useEffect(() => {
  setValue('valorEstimado', vivienda.valor_total)  // Ya no se auto-completa
}, [viviendaIdSeleccionada])

// ❌ Eliminado del servicio
await interesesService.crearInteres({
  valor_estimado: data.valorEstimado,  // REMOVED
})
```

### 2. **`modal-registrar-interes.tsx`** (UI)
```typescript
// ❌ Eliminada sección completa
<MoneyInput
  icon={DollarSign}
  label="Valor Estimado"
  value={valorEstimado}
/>
// + input hidden
// + mensaje de descripción
```

---

## 💾 Base de Datos

**Campo en DB**: `cliente_intereses.valor_estimado` (number, nullable)

**Estado actual**:
- ✅ Campo existe en la base de datos
- ✅ Es nullable (puede ser NULL)
- ⚠️ **NO se envía desde el front al crear interés**

**¿Se usa?**:
- ❌ NO se usa al registrar interés (queda NULL)
- ⚠️ PODRÍA usarse más adelante si se necesita tracking histórico
- ✅ Valor real siempre viene de `viviendas.valor_total`

**Migración necesaria**: NO (campo existe, solo dejamos de usarlo)

---

## 🎨 Flujo Actualizado

### 1️⃣ Registrar Interés (Simplificado)
```
Usuario selecciona:
  - Proyecto ✅
  - Vivienda ✅
  - Origen ✅
  - Prioridad ✅
  - Notas (opcional) ✅

❌ NO ingresa valor (se omite)
```

### 2️⃣ Ver Interés (Lista)
```
Muestra:
  - Vivienda: "Casa 13 - Manzana A"
  - Valor: $350.000.000 ← Viene de viviendas.valor_total
```

### 3️⃣ Convertir a Negociación (Futuro)
```
En este paso SÍ se maneja valor:
  - Valor base: viviendas.valor_total
  - Descuento aplicado: campo descuento_aplicado
  - Valor final: valor_total - descuento_aplicado
```

---

## ✅ Testing

Verificar que funciona:

- [ ] Crear interés sin campo valor → ✅ Se guarda correctamente
- [ ] Ver lista de intereses → ✅ Muestra valor de vivienda
- [ ] Campo `valor_estimado` en DB → ✅ Queda NULL (esperado)
- [ ] Formulario más simple → ✅ 1 campo menos, más rápido

---

## 📊 Impacto

**Código**:
- ✅ -40 líneas de código (formulario más simple)
- ✅ Menos lógica de validación
- ✅ Menos estados en el hook

**UX**:
- ✅ Formulario más rápido de completar
- ✅ Menos confusión sobre modificar precios
- ✅ Flujo más claro

**Datos**:
- ⚠️ Campo `valor_estimado` queda NULL (aceptable)
- ✅ Valor real siempre desde `viviendas.valor_total` (fuente única de verdad)
- ✅ Descuentos se manejan en negociación formal (lugar correcto)

---

## 🔄 Rollback (si fuera necesario)

Para revertir este cambio:

1. Restaurar hook:
   ```bash
   git checkout HEAD~1 -- src/modules/clientes/hooks/useRegistrarInteres.ts
   ```

2. Restaurar modal:
   ```bash
   git checkout HEAD~1 -- src/modules/clientes/components/modals/modal-registrar-interes.tsx
   ```

3. Re-agregar `MoneyInput` component al formulario

---

**Última actualización**: 20 Enero 2025
**Estado**: ✅ Implementado y funcionando
**Próximo paso**: Implementar conversión de interés → negociación
