# 🎯 Cómo usar el módulo de Recargos en el Wizard de Viviendas

## ✅ Estado Actual

Ya completaste:
- ✅ Creaste el recargo de **Gastos Notariales** desde el módulo de Recargos
- ✅ El código ya está preparado para cargar automáticamente desde la DB

## 📋 Pasos para completar la configuración

### 1️⃣ Crear los recargos de esquinera

Tienes **2 opciones**:

#### Opción A - Desde la interfaz (Recomendado) 👍

1. Ve a: `/administracion/configuracion` (Módulo de Recargos)
2. Clic en **"+ Nueva Recargo"**
3. Crea los siguientes recargos:

**Recargo 1:**
- **Tipo**: `recargo_esquinera_5m`
- **Nombre**: `Recargo Esquinera $5M`
- **Valor**: `5000000`
- **Descripción**: `Recargo adicional para viviendas en esquina de $5.000.000`
- **Activo**: ✅ Sí

**Recargo 2:**
- **Tipo**: `recargo_esquinera_10m`
- **Nombre**: `Recargo Esquinera $10M`
- **Valor**: `10000000`
- **Descripción**: `Recargo adicional para viviendas en esquina de $10.000.000`
- **Activo**: ✅ Sí

**Recargo 3 (Opcional):**
- **Tipo**: `recargo_esquinera_12m`
- **Nombre**: `Recargo Esquinera $12M`
- **Valor**: `12000000`
- **Descripción**: `Recargo adicional para viviendas en esquina de $12.000.000`
- **Activo**: ✅ Sí

#### Opción B - Ejecutar SQL

Ejecuta el SQL de: `docs/RECARGOS-DATOS-INICIALES.sql` en Supabase Dashboard

---

### 2️⃣ Verificar en el wizard

1. Ve a: `/viviendas/nueva`
2. Completa los pasos 1, 2 y 3
3. En el **Paso 4 - Información Financiera**:
   - Verifica que "Gastos Notariales" muestra el valor que creaste
   - Marca el checkbox "¿Es esquinera?"
   - Verifica que aparece el select con las opciones:
     - `Recargo Esquinera $5M - $5.000.000`
     - `Recargo Esquinera $10M - $10.000.000`
     - `Recargo Esquinera $12M - $12.000.000` (si lo creaste)

4. Abre la **Consola del navegador** (F12) y verifica estos mensajes:
   ```
   ✅ Gastos notariales cargados desde DB: 5000000
   ✅ Recargos cargados desde DB: [...]
   ```

---

## 🔍 Verificación de Funcionamiento

### En la consola del navegador deberías ver:

```javascript
✅ Gastos notariales cargados desde DB: 5000000
✅ Recargos cargados desde DB: [
  {
    id: "...",
    tipo: "gastos_notariales",
    nombre: "Gastos Notariales 2025",
    valor: 5000000,
    activo: true
  },
  {
    id: "...",
    tipo: "recargo_esquinera_5m",
    nombre: "Recargo Esquinera $5M",
    valor: 5000000,
    activo: true
  },
  {
    id: "...",
    tipo: "recargo_esquinera_10m",
    nombre: "Recargo Esquinera $10M",
    valor: 10000000,
    activo: true
  }
]
```

### En el Paso 4 del wizard deberías ver:

```
📊 Información Financiera

Valor Base de la Vivienda: [input]
Gastos Notariales: $5.000.000 (cargado automáticamente)

☐ ¿Es esquinera?
  [Si marcas la casilla]

  Recargo por Esquinera:
  [Select con opciones]
    - Selecciona el recargo por esquinera
    - Recargo Esquinera $5M - $5.000.000
    - Recargo Esquinera $10M - $10.000.000
    - Recargo Esquinera $12M - $12.000.000
```

---

## 🎨 Cómo funciona el cálculo

El wizard calcula automáticamente:

```typescript
Valor Total = Valor Base + Gastos Notariales + Recargo Esquinera

Ejemplo:
- Valor Base: $80.000.000
- Gastos Notariales: $5.000.000 (desde DB)
- Recargo Esquinera: $10.000.000 (seleccionado)
----------------------------------------
Valor Total: $95.000.000
```

---

## 🔄 Actualizar valores para el próximo año

Cuando cambien los valores (ej: 2026), simplemente:

1. Ve a: `/administracion/configuracion`
2. Busca el recargo que quieres actualizar
3. Clic en **✏️ Editar**
4. Cambia:
   - **Nombre**: `Gastos Notariales 2026`
   - **Valor**: `5500000` (nuevo valor)
5. Guardar

**¡Y listo!** El wizard usará automáticamente el nuevo valor sin tocar código.

---

## ❓ Troubleshooting

### Problema: No veo los recargos en el select

**Solución:**
1. Verifica en la consola del navegador que aparezcan los mensajes de carga
2. Verifica que los recargos estén marcados como **activo: true**
3. Verifica que el tipo sea `recargo_esquinera_*`

### Problema: El valor de gastos notariales no cambia

**Solución:**
1. Refrescar la página (F5)
2. Verificar que el recargo de tipo `gastos_notariales` esté activo
3. Verificar en la consola el valor que se carga

### Problema: No veo los mensajes en consola

**Solución:**
1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Refrescar la página del wizard
4. Los mensajes deberían aparecer al cargar la página

---

## 📊 Datos de ejemplo para pruebas

Si quieres probar diferentes escenarios:

```sql
-- Escenario 1: Gastos notariales 2025
UPDATE configuracion_recargos
SET valor = 5000000
WHERE tipo = 'gastos_notariales';

-- Escenario 2: Gastos notariales 2026 (aumentados)
UPDATE configuracion_recargos
SET valor = 5500000
WHERE tipo = 'gastos_notariales';

-- Desactivar un recargo
UPDATE configuracion_recargos
SET activo = false
WHERE tipo = 'recargo_esquinera_12m';

-- Reactivar un recargo
UPDATE configuracion_recargos
SET activo = true
WHERE tipo = 'recargo_esquinera_12m';
```

---

## ✅ Checklist Final

- [ ] Crear recargos de esquinera desde módulo de Recargos
- [ ] Ir a `/viviendas/nueva`
- [ ] Abrir consola del navegador (F12)
- [ ] Verificar mensajes de carga
- [ ] Completar pasos 1-3 del wizard
- [ ] En paso 4, verificar que gastos notariales aparecen
- [ ] Marcar checkbox "Es esquinera"
- [ ] Verificar que select muestra opciones de recargos
- [ ] Seleccionar un recargo
- [ ] Verificar que resumen calcula correctamente
- [ ] Completar paso 5 y guardar vivienda
- [ ] Verificar en DB que los valores se guardaron correctamente
