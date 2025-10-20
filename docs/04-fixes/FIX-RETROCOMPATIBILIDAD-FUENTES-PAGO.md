# ✅ Fix: Retrocompatibilidad con Modal Viejo

## 🐛 Problema Detectado

```
❌ Error: Cannot read properties of undefined (reading 'some')
   at validarDatos (useCrearNegociacion.ts:93)
```

**Causa**: El hook `useCrearNegociacion` esperaba `fuentes_pago` como **obligatorio**, pero el modal actual (viejo) no lo envía.

---

## ✅ Solución Implementada

### 1. Campo Opcional en Interface
```typescript
interface FormDataNegociacion {
  // ...otros campos
  fuentes_pago?: CrearFuentePagoDTO[] // ⭐ Ahora OPCIONAL
}
```

### 2. Validación Condicional en Hook
```typescript
// Solo validar fuentes si se proporcionan
if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {
  // Validaciones de fuentes de pago...
}
```

### 3. Flujo Dual en Servicio
```typescript
const tieneFuentesPago = datos.fuentes_pago && datos.fuentes_pago.length > 0

// Estado depende del flujo:
estado: tieneFuentesPago ? 'Cierre Financiero' : 'En Proceso'

if (tieneFuentesPago) {
  // Flujo NUEVO: Crear fuentes + actualizar vivienda + actualizar cliente
} else {
  // Flujo ANTIGUO: Solo crear negociación
}
```

---

## 📊 Resultado

### Modal Viejo (Actual)
✅ **Sigue funcionando** sin cambios
- No envía `fuentes_pago`
- Crea negociación en estado `"En Proceso"`
- NO actualiza vivienda ni cliente
- Flujo original intacto

### Modal Nuevo (modal-crear-negociacion-nuevo.tsx)
✅ **Funcionará cuando se active**
- SÍ envía `fuentes_pago`
- Crea negociación en estado `"Cierre Financiero"`
- Actualiza vivienda → `"reservada"`
- Actualiza cliente → `"Activo"`
- Validación estricta de suma total

---

## 🚀 Despliegue Gradual

1. **AHORA**: Ambos modales coexisten
   - Viejo sigue funcionando
   - Nuevo está listo para probar

2. **Siguiente**: Probar modal nuevo
   - Verificar flujo completo
   - Validar todas las combinaciones

3. **Futuro**: Reemplazar modal viejo
   - Renombrar `modal-crear-negociacion-nuevo.tsx` → `modal-crear-negociacion.tsx`
   - Eliminar modal viejo

---

## 📝 Archivos Modificados

- ✅ `useCrearNegociacion.ts` - Campo opcional + validación condicional
- ✅ `negociaciones.service.ts` - Flujo dual (nuevo/antiguo)

---

**Fecha**: 2025-01-20
**Estado**: ✅ RESUELTO
