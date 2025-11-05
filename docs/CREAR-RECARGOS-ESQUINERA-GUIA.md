# 📋 Guía: Crear Recargos de Esquinera Adicionales

## 🎯 Objetivo
Crear múltiples recargos de esquinera (#2, #3, #4) para ofrecer diferentes opciones de precio en el wizard de nuevas viviendas.

---

## ✅ Pre-requisitos Completados

✅ **Constraint UNIQUE eliminado** - Migración ejecutada exitosamente
✅ **2 recargos creados**:
- Gastos Notariales 2025 ($5.000.000)
- Recargo Esquinera #1 2025 ($5.000.000)

✅ **Sistema listo** - Permite múltiples recargos del mismo tipo

---

## 📝 Pasos para Crear Recargos Adicionales

### 1️⃣ Acceder al Módulo de Recargos

1. Abrir aplicación en navegador
2. Ir a **Administración → Recargos**
3. URL: `http://localhost:3000/administracion/configuracion`
4. Verificar que se muestran los 2 recargos existentes

---

### 2️⃣ Crear Recargo Esquinera #2 ($10M)

1. **Clic en botón**: "+ Nuevo Recargo" (esquina superior derecha)
2. **Llenar formulario**:
   ```
   Tipo: recargo_esquinera
   Nombre: Recargo Esquinera #2 2025
   Valor: 10000000
   Descripción: Recargo adicional para viviendas en esquina - Opción estándar
   Activo: ✅ Sí
   ```
3. **Clic en**: "Guardar"
4. **Verificar**: Debe aparecer en la tabla sin error 409 ✅

---

### 3️⃣ Crear Recargo Esquinera #3 ($12M)

1. **Clic en botón**: "+ Nuevo Recargo"
2. **Llenar formulario**:
   ```
   Tipo: recargo_esquinera
   Nombre: Recargo Esquinera #3 2025
   Valor: 12000000
   Descripción: Recargo adicional para viviendas en esquina - Opción premium
   Activo: ✅ Sí
   ```
3. **Clic en**: "Guardar"
4. **Verificar**: Debe aparecer en la tabla ✅

---

### 4️⃣ Crear Recargo Esquinera #4 ($15M) - OPCIONAL

1. **Clic en botón**: "+ Nuevo Recargo"
2. **Llenar formulario**:
   ```
   Tipo: recargo_esquinera
   Nombre: Recargo Esquinera #4 2025
   Valor: 15000000
   Descripción: Recargo adicional para viviendas en esquina - Opción VIP
   Activo: ✅ Sí
   ```
3. **Clic en**: "Guardar"
4. **Verificar**: Debe aparecer en la tabla ✅

---

## 🔍 Verificación Post-Creación

### Verificar en la UI del Módulo

Deberías ver **5-6 recargos** en la tabla:

| Tipo              | Nombre                    | Valor        | Activo |
|-------------------|---------------------------|--------------|--------|
| gastos_notariales | Gastos Notariales 2025    | $5.000.000   | ✅ Sí  |
| recargo_esquinera | Recargo Esquinera #1 2025 | $5.000.000   | ✅ Sí  |
| recargo_esquinera | Recargo Esquinera #2 2025 | $10.000.000  | ✅ Sí  |
| recargo_esquinera | Recargo Esquinera #3 2025 | $12.000.000  | ✅ Sí  |
| recargo_esquinera | Recargo Esquinera #4 2025 | $15.000.000  | ✅ Sí  |

### Verificar en Base de Datos (Opcional)

```sql
-- En Supabase Dashboard → SQL Editor
SELECT id, tipo, nombre, valor, activo
FROM configuracion_recargos
WHERE tipo LIKE '%esquinera%'
ORDER BY valor;
```

Resultado esperado:
```
5 filas con valores: 5M, 10M, 12M, 15M
Todas con activo = true
```

---

## 🧪 Probar en el Wizard de Nuevas Viviendas

### 1️⃣ Verificar Carga en Consola

1. Ir a: `http://localhost:3000/viviendas/nueva`
2. Abrir consola del navegador: **F12 → Console**
3. Buscar mensajes de debug:
   ```
   ✅ Gastos notariales cargados desde DB: 5000000
   ✅ Recargos cargados desde DB: [Array(5)]
   ```
4. Expandir el array y verificar que contiene los 4-5 recargos

### 2️⃣ Verificar Select Dinámico

1. Completar **Paso 1**: Información básica
2. Completar **Paso 2**: Ubicación
3. Completar **Paso 3**: Características
4. En **Paso 4 (Financiero)**:
   - Marcar checkbox: **"¿Es vivienda esquinera?"** ✅
   - El select debe aparecer/habilitarse
5. Hacer clic en el select "Recargo por Esquinera"
6. **Verificar opciones**:
   ```
   Recargo por Esquinera: [ Seleccionar... ▼ ]
     ├─ Recargo Esquinera #1 2025 - $5.000.000
     ├─ Recargo Esquinera #2 2025 - $10.000.000
     ├─ Recargo Esquinera #3 2025 - $12.000.000
     └─ Recargo Esquinera #4 2025 - $15.000.000
   ```

### 3️⃣ Probar Cálculo Automático

1. Seleccionar **Recargo Esquinera #2 2025** ($10M)
2. Ir a **Paso 5 (Resumen)**
3. **Verificar cálculos**:
   ```
   Ejemplo con:
   - Valor Base: $80.000.000
   - Gastos Notariales: $5.000.000 (automático)
   - Recargo Esquinera: $10.000.000 (seleccionado)
   ----------------------------------------
   Valor Total: $95.000.000 ✅
   ```

### 4️⃣ Guardar Vivienda

1. Clic en **"Crear Vivienda"**
2. Verificar mensaje de éxito
3. Ir a módulo de Viviendas
4. Verificar que aparece con valores correctos

---

## 📸 Screenshots de Referencia

### Formulario de Nuevo Recargo
```
┌─────────────────────────────────────────┐
│  Nuevo Recargo                      [X] │
├─────────────────────────────────────────┤
│                                         │
│  Tipo:                                  │
│  [recargo_esquinera              ]      │
│                                         │
│  Nombre:                                │
│  [Recargo Esquinera #2 2025      ]      │
│                                         │
│  Valor:                                 │
│  [$10.000.000                    ]      │
│                                         │
│  Descripción:                           │
│  [Recargo adicional para viviendas...   │
│   ...en esquina - Opción estándar]      │
│                                         │
│  Activo: ☑ Sí                           │
│                                         │
│         [Cancelar]  [Guardar]           │
└─────────────────────────────────────────┘
```

### Select en Wizard (Paso 4)
```
┌────────────────────────────────────────┐
│  Paso 4 - Información Financiera       │
├────────────────────────────────────────┤
│                                        │
│  ☑ ¿Es vivienda esquinera?             │
│                                        │
│  Recargo por Esquinera:                │
│  ┌──────────────────────────────────┐  │
│  │ Seleccionar...               ▼  │  │
│  ├──────────────────────────────────┤  │
│  │ Recargo Esquinera #1 - $5M      │  │
│  │ Recargo Esquinera #2 - $10M  ◄──┼──┐
│  │ Recargo Esquinera #3 - $12M     │  │ 4 opciones
│  │ Recargo Esquinera #4 - $15M     │  │ disponibles
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

---

## ⚠️ Posibles Errores y Soluciones

### ❌ Error 409: "duplicate key value"
**Causa**: Constraint UNIQUE aún existe
**Solución**: Verificar que migración se ejecutó:
```sql
-- En Supabase Dashboard → SQL Editor
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'configuracion_recargos'::regclass
  AND conname = 'configuracion_recargos_tipo_key';
```
Si aparece 1 fila → Constraint existe (ejecutar migración)
Si aparece 0 filas → Constraint eliminado ✅

### ❌ Select no muestra las opciones
**Causa**: Checkbox esquinera no marcado
**Solución**: Marcar **"¿Es vivienda esquinera?"** ✅

### ❌ Console no muestra recargos cargados
**Causa**: Página cargada antes de agregar debug
**Solución**: Refrescar página (F5) o hard refresh (Ctrl+F5)

### ❌ Recargo guardado pero no aparece en select
**Causa**: Campo `activo` en false
**Solución**: Editar recargo y marcar "Activo: ✅ Sí"

---

## 📊 Casos de Uso Reales

### Caso 1: Vivienda Esquinera Simple
```
Cliente: "Quiero una vivienda en esquina básica"
Acción: Seleccionar "Recargo Esquinera #1 2025" ($5M)
Resultado: Valor total = Valor base + Gastos + $5M
```

### Caso 2: Vivienda Esquinera Estándar
```
Cliente: "Quiero una vivienda en esquina con mejor ubicación"
Acción: Seleccionar "Recargo Esquinera #2 2025" ($10M)
Resultado: Valor total = Valor base + Gastos + $10M
```

### Caso 3: Vivienda Esquinera Premium
```
Cliente: "Quiero la mejor esquina del proyecto"
Acción: Seleccionar "Recargo Esquinera #3 2025" ($12M)
Resultado: Valor total = Valor base + Gastos + $12M
```

### Caso 4: Vivienda Esquinera VIP
```
Cliente: "Quiero la esquina más exclusiva"
Acción: Seleccionar "Recargo Esquinera #4 2025" ($15M)
Resultado: Valor total = Valor base + Gastos + $15M
```

---

## 🔄 Actualización Anual de Recargos

### Proceso Recomendado (Fin de Año)

1. **No eliminar recargos antiguos** (mantener histórico)
2. **Desactivar recargos del año anterior**:
   - Editar cada recargo 2025
   - Cambiar "Activo: ❌ No"
   - Guardar

3. **Crear nuevos recargos para 2026**:
   ```
   Tipo: recargo_esquinera
   Nombre: Recargo Esquinera #1 2026
   Valor: 6000000 (ajuste inflación)
   Activo: ✅ Sí
   ```

4. **Wizard usa automáticamente los nuevos**:
   - Filtro solo carga recargos con `activo = true`
   - No requiere modificar código
   - Viviendas antiguas mantienen valores históricos

---

## 📚 Documentación Relacionada

- **Guía de uso en wizard**: `docs/GUIA-USO-RECARGOS-WIZARD.md`
- **Explicación técnica**: `docs/MULTIPLES-RECARGOS-ESQUINERA.md`
- **Solución error 409**: `docs/ERROR-409-CONSTRAINT-SOLUCION.md`
- **Migración SQL**: `supabase/migrations/2025-11-05_permitir_multiples_recargos.sql`

---

## ✅ Checklist Final

- [ ] Accedí a `/administracion/configuracion`
- [ ] Creé Recargo Esquinera #2 ($10M)
- [ ] Creé Recargo Esquinera #3 ($12M)
- [ ] Creé Recargo Esquinera #4 ($15M) - opcional
- [ ] Verifiqué que aparecen en tabla sin errores
- [ ] Abrí wizard en `/viviendas/nueva`
- [ ] Abrí consola (F12) y verifiqué mensajes de carga
- [ ] Marqué checkbox esquinera en paso 4
- [ ] Verifiqué que select muestra 4-5 opciones
- [ ] Seleccioné un recargo y verifiqué cálculo
- [ ] Guardé vivienda de prueba exitosamente

---

## 🎉 Resultado Esperado

**Tabla de recargos completa**:
- ✅ 1 recargo de gastos notariales
- ✅ 4-5 recargos de esquinera con diferentes valores
- ✅ Todos activos y funcionando en wizard
- ✅ Select dinámico con múltiples opciones
- ✅ Cálculos automáticos correctos
- ✅ Sistema listo para producción

**Sistema completo y funcional para gestión flexible de recargos anuales** 🚀
