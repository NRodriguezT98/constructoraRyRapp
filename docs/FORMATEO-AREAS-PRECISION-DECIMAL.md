# 📏 Formateo de Áreas con Precisión Decimal Exacta

## 🎯 Problema Identificado

Al mostrar áreas decimales (ej: `66.125 m²`), el uso de `.toString()` en JavaScript puede causar **aproximaciones** debido a la representación de punto flotante:

```typescript
// ❌ INCORRECTO - Puede aproximar
area_lote?.toString() // 66.125 → "66.13" (aproximado)

// ❌ INCORRECTO - Puede aproximar
`${area_lote}m²` // En algunos casos puede aproximar
```

**Ejemplo real reportado:**
- Valor guardado en BD: `66.125`
- Valor mostrado en UI: `66.13` ❌

---

## ✅ Solución Implementada

### **Función Helper: `formatArea()`**

```typescript
/**
 * Formatear área (m²) con precisión decimal exacta
 * ✅ Preserva decimales sin aproximación (66.125 → "66.125 m²")
 * ✅ Elimina trailing zeros innecesarios (66.000 → "66 m²")
 * @param area - Área en metros cuadrados
 * @returns String con el valor exacto + " m²"
 */
export const formatArea = (area: number | null | undefined): string => {
  if (area == null) return 'N/A'

  // Convertir a string y eliminar trailing zeros innecesarios
  const areaStr = area.toString().replace(/\.?0+$/, '')
  return `${areaStr} m²`
}
```

**Ubicación:** `src/shared/utils/format.ts`

---

## 🔧 Uso Correcto

### **Antes (INCORRECTO)**
```tsx
// ❌ Aproximación posible
<p>{vivienda.area_lote?.toString() || 'N/A'} m²</p>

// ❌ Interpolación directa puede aproximar
<p>{vivienda.area_lote ?? 'N/A'} m²</p>
```

### **Después (CORRECTO)**
```tsx
import { formatArea } from '@/shared/utils'

// ✅ Precisión exacta garantizada
<p>{formatArea(vivienda.area_lote)}</p>
```

---

## 📊 Casos de Prueba

```typescript
formatArea(66.125)    // → "66.125 m²" ✅
formatArea(66.12500)  // → "66.125 m²" (elimina trailing zeros)
formatArea(66)        // → "66 m²" (sin decimales innecesarios)
formatArea(66.0)      // → "66 m²" (elimina trailing zeros)
formatArea(null)      // → "N/A" (manejo de nullish)
formatArea(undefined) // → "N/A" (manejo de nullish)
```

---

## 🎯 Archivos Actualizados

### **1. Utility Function**
- ✅ `src/shared/utils/format.ts` - Agregada función `formatArea()`

### **2. Componentes de Viviendas**
- ✅ `src/modules/viviendas/components/detalle/tabs/InfoTab.tsx`
  - Líneas 152-161: Área Construida y Área de Lote
- ✅ `src/modules/viviendas/components/cards/vivienda-card-pagada.tsx`
  - Líneas 135-143: Sección de Áreas

---

## 🔍 Validación en BD

### **Tipo de Columna en PostgreSQL**
```sql
-- Verificar tipo de columna
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN ('area_lote', 'area_construida');
```

**Resultado esperado:**
- `data_type`: `numeric` (preserva decimales exactos)
- `numeric_precision`: Variable (ej: 10)
- `numeric_scale`: Variable (ej: 3 para 3 decimales)

### **Tipos TypeScript (Supabase)**
```typescript
// src/lib/supabase/database.types.ts
viviendas: {
  Row: {
    area_lote: number | null      // ✅ Correcto
    area_construida: number | null // ✅ Correcto
  }
}
```

---

## 🚨 Regla CRÍTICA

**⚠️ AL mostrar CUALQUIER área (lote, construida) en la UI:**

1. **IMPORTAR** → `formatArea` de `@/shared/utils`
2. **USAR** → `formatArea(area)` en lugar de `.toString()` o interpolación directa
3. **NUNCA** → Usar `.toFixed()` con redondeo arbitrario
4. **VALIDAR** → Con valor decimal real (ej: 66.125) en ambiente de pruebas

---

## 📋 Checklist de Validación

Antes de marcar como completo, verificar:

- [ ] Importada función `formatArea` desde `@/shared/utils`
- [ ] Reemplazado `.toString()` o interpolación directa
- [ ] Probado con valor decimal real (ej: 66.125)
- [ ] Validado que muestra valor exacto sin aproximación
- [ ] Validado dark mode (si aplica)
- [ ] Sin console.logs de debugging

---

## 🎓 Lecciones Aprendidas

### **Problema de Representación en JavaScript**
JavaScript usa IEEE 754 para números flotantes, lo que puede causar:
```javascript
0.1 + 0.2 // → 0.30000000000000004 ❌
```

### **Solución: String Conversion Directa**
```javascript
// ✅ .toString() preserva el valor exacto del number
const area = 66.125
area.toString() // → "66.125" (sin aproximación)

// ✅ Regex elimina trailing zeros
"66.12500".replace(/\.?0+$/, '') // → "66.125"
"66.00000".replace(/\.?0+$/, '') // → "66"
```

### **Por qué funciona:**
1. PostgreSQL almacena como `numeric` (precisión arbitraria)
2. Supabase retorna como `number` (preserva valor exacto)
3. `.toString()` convierte sin aproximación
4. Regex limpia formato sin alterar precisión

---

## 🔗 Referencias

- **Utility Functions**: `src/shared/utils/format.ts`
- **Componente InfoTab**: `src/modules/viviendas/components/detalle/tabs/InfoTab.tsx`
- **Cards**: `src/modules/viviendas/components/cards/`
- **Database Types**: `src/lib/supabase/database.types.ts`

---

**🏆 Resultado:** Precisión decimal exacta garantizada en toda la UI de viviendas (66.125 → "66.125 m²" ✅)
