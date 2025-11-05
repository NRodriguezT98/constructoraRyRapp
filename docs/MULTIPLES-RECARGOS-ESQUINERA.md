# 🎯 Múltiples Recargos de Esquinera - Explicación

## ✅ Funcionamiento Actual

El sistema **YA está preparado** para manejar múltiples recargos de esquinera activos simultáneamente.

### 🔍 Cómo funciona:

```typescript
// El código filtra TODOS los recargos activos que incluyan "esquinera"
const recargosEsquinera = configuracionRecargos.filter(r =>
  r.tipo.toLowerCase().includes('esquinera') && r.activo
)

// Luego muestra TODAS las opciones en el select
<select>
  <option value="0">Selecciona el recargo por esquinera</option>
  {recargosEsquinera.map((recargo) => (
    <option key={recargo.id} value={recargo.valor}>
      {recargo.nombre} - {formatCurrency(recargo.valor)}
    </option>
  ))}
</select>
```

---

## 🎨 Ejemplo de Uso Real

### Escenario 1: Diferentes valores según tipo de esquinera

```
✅ ACTIVOS (aparecen en el select):
- Recargo Esquinera Tipo A - $5.000.000   (activo: true)
- Recargo Esquinera Tipo B - $10.000.000  (activo: true)
- Recargo Esquinera Tipo C - $12.000.000  (activo: true)

❌ INACTIVOS (NO aparecen):
- Recargo Esquinera 2024 - $4.500.000     (activo: false)
```

**Resultado en el wizard:**
```
Recargo por Esquinera:
[ Seleccionar... ▼ ]
  ├─ Recargo Esquinera Tipo A - $5.000.000
  ├─ Recargo Esquinera Tipo B - $10.000.000
  └─ Recargo Esquinera Tipo C - $12.000.000
```

---

### Escenario 2: Valores vigentes vs. históricos

```
✅ ACTIVOS (vigentes para 2025):
- Recargo Esquinera 5M (2025) - $5.500.000   (activo: true)
- Recargo Esquinera 10M (2025) - $11.000.000 (activo: true)

❌ INACTIVOS (valores antiguos):
- Recargo Esquinera 5M (2024) - $5.000.000   (activo: false)
- Recargo Esquinera 10M (2024) - $10.000.000 (activo: false)
```

**Beneficio**: Mantienes histórico de valores antiguos sin que aparezcan en nuevas viviendas.

---

## 📋 Pasos para crear múltiples recargos activos

### 1️⃣ Ir al módulo de Recargos
`/administracion/configuracion`

### 2️⃣ Crear el primer recargo
```
Tipo: recargo_esquinera_5m
Nombre: Recargo Esquinera $5M
Valor: 5000000
Activo: ✅ SÍ
```

### 3️⃣ Crear el segundo recargo
```
Tipo: recargo_esquinera_10m
Nombre: Recargo Esquinera $10M
Valor: 10000000
Activo: ✅ SÍ
```

### 4️⃣ Crear el tercer recargo
```
Tipo: recargo_esquinera_12m
Nombre: Recargo Esquinera $12M
Valor: 12000000
Activo: ✅ SÍ
```

### 5️⃣ (Opcional) Crear más recargos
```
Tipo: recargo_esquinera_15m
Nombre: Recargo Esquinera Premium $15M
Valor: 15000000
Activo: ✅ SÍ
```

**Todos aparecerán en el select** porque:
- ✅ Tienen "esquinera" en el `tipo`
- ✅ Están marcados como `activo: true`

---

## 🎯 Casos de Uso

### Caso 1: Vivienda en esquina simple
```
Usuario marca: ☑ Es esquinera
Usuario selecciona: Recargo Esquinera $5M - $5.000.000
Resultado: Se suma $5M al valor total
```

### Caso 2: Vivienda en esquina doble
```
Usuario marca: ☑ Es esquinera
Usuario selecciona: Recargo Esquinera $10M - $10.000.000
Resultado: Se suma $10M al valor total
```

### Caso 3: Vivienda en esquina premium
```
Usuario marca: ☑ Es esquinera
Usuario selecciona: Recargo Esquinera Premium $15M - $15.000.000
Resultado: Se suma $15M al valor total
```

---

## 🔄 Actualizar valores sin perder histórico

### Escenario: Cambio de año 2025 → 2026

**Opción A - Desactivar antiguos, crear nuevos:**
```sql
-- 1. Desactivar recargos del 2025
UPDATE configuracion_recargos
SET activo = false
WHERE tipo LIKE 'recargo_esquinera%'
  AND nombre LIKE '%2025%';

-- 2. Crear recargos del 2026
INSERT INTO configuracion_recargos (tipo, nombre, valor, activo)
VALUES
  ('recargo_esquinera_5m', 'Recargo Esquinera $5.5M (2026)', 5500000, true),
  ('recargo_esquinera_10m', 'Recargo Esquinera $11M (2026)', 11000000, true);
```

**Beneficio**: Las viviendas creadas en 2025 mantienen sus valores históricos.

---

**Opción B - Actualizar valores directamente:**
```sql
-- Actualizar valores existentes
UPDATE configuracion_recargos
SET
  valor = 5500000,
  nombre = 'Recargo Esquinera $5.5M (2026)'
WHERE tipo = 'recargo_esquinera_5m';

UPDATE configuracion_recargos
SET
  valor = 11000000,
  nombre = 'Recargo Esquinera $11M (2026)'
WHERE tipo = 'recargo_esquinera_10m';
```

**Advertencia**: Las viviendas antiguas mostrarán valores actualizados en el resumen.

---

## 🎨 Convención de Nombres Recomendada

Para mantener claridad:

```
Tipo de recargo          Nombre sugerido
===================      ===============================
recargo_esquinera_5m     Recargo Esquinera Simple - $5M
recargo_esquinera_10m    Recargo Esquinera Doble - $10M
recargo_esquinera_12m    Recargo Esquinera Triple - $12M
recargo_esquinera_15m    Recargo Esquinera Premium - $15M
```

O con años:
```
recargo_esquinera_5m     Recargo Esquinera 5M (2025)
recargo_esquinera_10m    Recargo Esquinera 10M (2025)
```

---

## ❓ FAQ

### ¿Cuántos recargos puedo tener activos?
**R:** Los que necesites. No hay límite técnico.

### ¿Si desactivo un recargo, qué pasa con las viviendas que ya lo usan?
**R:** Las viviendas guardadas mantienen el valor. Solo deja de aparecer en nuevas viviendas.

### ¿Puedo tener recargos con el mismo valor?
**R:** Sí, pero no es recomendado. Es mejor tener nombres descriptivos únicos.

### ¿Puedo cambiar el nombre sin afectar el valor?
**R:** Sí, solo edita el registro y cambia el campo `nombre`.

### ¿Cómo saber qué recargos están activos?
**R:** Ve a `/administracion/configuracion` y mira la columna "Estado". Toggle verde = activo.

---

## ✅ Resumen

1. **Crea TODOS los recargos que necesites** con `activo: true`
2. **Todos aparecerán en el select** del wizard
3. **El usuario elige cuál aplicar** según la vivienda
4. **Desactiva recargos antiguos** para mantener histórico sin mostrarlos

**No hay restricción de "solo 1 activo"**. Puedes tener 10, 20, los que quieras. 🎉
