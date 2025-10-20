# 🧪 GUÍA DE TESTING: Vista Completa Crear Negociación

## ✅ COMPLETADO

La migración de modal a vista completa está **100% implementada** y lista para probar.

---

## 🎯 TESTS A REALIZAR

### ✅ TEST 1: Navegación desde Header del Cliente

**Objetivo**: Verificar que el botón en el header navega correctamente

**Pasos**:
1. Iniciar servidor: `npm run dev`
2. Ir a `http://localhost:3000/clientes`
3. Click en "Ver" de cualquier cliente que tenga cédula subida
4. En el header del detalle, buscar botón **"Crear Negociación"** (verde con icono de handshake)
5. Click en el botón

**Resultado esperado**:
- ✅ Debe navegar a `/clientes/[id]/negociaciones/crear?nombre=...`
- ✅ Breadcrumbs debe mostrar: Home > Clientes > [Nombre Cliente] > Crear Negociación
- ✅ Header debe tener botón "Volver a [Nombre Cliente]"
- ✅ Debe aparecer el Paso 1: Información Básica
- ✅ Nombre del cliente debe estar visible

---

### ✅ TEST 2: Navegación desde Tab Negociaciones

**Objetivo**: Verificar botón en tab funciona igual

**Pasos**:
1. Estar en detalle de cliente
2. Click en tab **"Negociaciones"**
3. Si NO tiene cédula:
   - Banner naranja debe aparecer
   - Botón "Crear Negociación" debe estar **deshabilitado** (gris)
4. Si TIENE cédula:
   - Botón "Crear Negociación" debe estar **habilitado** (gradiente purple-pink)
5. Click en botón "Crear Negociación"

**Resultado esperado**:
- ✅ Misma navegación que Test 1
- ✅ Validación de cédula funciona correctamente

---

### ✅ TEST 3: Flujo Completo - Paso 1 (Info Básica)

**Objetivo**: Completar paso 1 correctamente

**Pasos**:
1. Estar en vista de crear negociación
2. **Proyecto**: Seleccionar un proyecto del dropdown
   - Debe cargar viviendas disponibles
3. **Vivienda**: Seleccionar una vivienda
   - Debe mostrar: "Manzana X - Casa Y"
   - Debe mostrar valor base
4. **Valor Negociado**: Ajustar valor si es necesario
5. **Descuento**: Ver cálculo automático de descuento (%)
6. **Valor Total**: Ver cálculo final
7. **Notas**: (Opcional) Agregar observaciones
8. Click en **"Siguiente"**

**Resultado esperado**:
- ✅ Dropdowns funcionan correctamente
- ✅ Valores se calculan automáticamente
- ✅ Viviendas muestran "Manzana - Casa" (NO "Casa 1 - $122.000.000")
- ✅ Valor negociado es **editable** ✏️
- ✅ Botón "Siguiente" solo habilitado si todo está lleno
- ✅ Smooth scroll al siguiente paso

---

### ✅ TEST 4: Flujo Completo - Paso 2 (Fuentes de Pago)

**Objetivo**: Configurar fuentes de pago hasta cerrar 100%

**Pasos**:
1. Estar en Paso 2
2. Ver **valor total** que debe cubrir
3. **Cuota Inicial**:
   - ✅ Debe estar DESHABILITADA por defecto (toggle OFF)
   - Click en toggle para habilitar
   - Ingresar valor (Ej: $40.000.000)
4. **Crédito Hipotecario**:
   - Toggle ON
   - Ingresar valor (Ej: $60.000.000)
   - **Entidad**: Seleccionar banco del dropdown (Ej: Bancolombia)
   - Ingresar plazo (Ej: 180 meses)
5. **Subsidio Caja**:
   - Toggle ON
   - Ingresar valor (Ej: $22.000.000)
   - **Entidad**: Seleccionar caja del dropdown (Ej: Comfenalco)
6. **Subsidio Gobierno**:
   - Toggle ON si aplica
   - Ingresar valor
   - Tipo de subsidio
7. Ver **barra de progreso**:
   - Debe mostrar % cubierto
   - Verde si llega a 100%
8. Click en **"Siguiente"** (solo habilitado si suma = 100%)

**Resultado esperado**:
- ✅ TODAS las fuentes empiezan **deshabilitadas** (no solo Cuota Inicial)
- ✅ Campo "Entidad" es **SELECT** (no input de texto libre)
- ✅ Dropdown de bancos tiene 15 opciones + "Otro"
- ✅ Dropdown de cajas tiene 6 opciones + "Otro"
- ✅ Barra de progreso actualiza en tiempo real
- ✅ Validación: al menos UNA fuente debe estar habilitada
- ✅ Validación: suma debe ser exactamente el valor total
- ✅ Botón "Siguiente" solo habilitado si validaciones pasan

---

### ✅ TEST 5: Flujo Completo - Paso 3 (Revisión)

**Objetivo**: Revisar todo antes de crear

**Pasos**:
1. Estar en Paso 3
2. Revisar **información de vivienda**:
   - Proyecto
   - Vivienda (Manzana - Casa)
   - Valor negociado
   - Descuento
   - Valor total
3. Revisar **fuentes de pago**:
   - Cada fuente con su valor
   - Entidades seleccionadas
   - Plazos
   - Total cubierto
4. Si hay errores:
   - Click en "Atrás" para editar
5. Si todo está bien:
   - Click en **"Crear Negociación"**

**Resultado esperado**:
- ✅ Todo se muestra correctamente
- ✅ Valores coinciden con lo ingresado
- ✅ Botón "Crear Negociación" está habilitado
- ✅ Loading spinner mientras crea

---

### ✅ TEST 6: Creación Exitosa y Navegación

**Objetivo**: Verificar creación y redirección

**Pasos**:
1. Click en "Crear Negociación" (Paso 3)
2. Esperar respuesta de servidor

**Resultado esperado**:
- ✅ Loading spinner aparece
- ✅ Negociación se crea en Supabase
- ✅ Redirige a: `/clientes/[id]?tab=negociaciones&highlight=[negId]`
- ✅ Tab "Negociaciones" se activa automáticamente
- ✅ Negociación recién creada aparece en la lista
- ✅ (Ideal) Efecto de highlight/flash en la negociación nueva

---

### ✅ TEST 7: Navegación con Breadcrumbs

**Objetivo**: Verificar que breadcrumbs funcionan

**Pasos**:
1. Estar en crear negociación (cualquier paso)
2. Click en **"Home"** del breadcrumb
   - Debe navegar a `/`
3. Volver a crear negociación
4. Click en **"Clientes"** del breadcrumb
   - Debe navegar a `/clientes`
5. Volver a crear negociación
6. Click en **"[Nombre Cliente]"** del breadcrumb
   - Debe navegar a `/clientes/[id]`

**Resultado esperado**:
- ✅ Todos los links funcionan
- ✅ Navegación rápida sin perder contexto

---

### ✅ TEST 8: Botón "Volver"

**Objetivo**: Verificar botón en header

**Pasos**:
1. Estar en crear negociación
2. Click en botón **"Volver a [Nombre Cliente]"** (arriba izquierda)

**Resultado esperado**:
- ✅ Navega a `/clientes/[id]`
- ✅ Vuelve al detalle del cliente

---

### ✅ TEST 9: Cancelación con Confirmación

**Objetivo**: Verificar botón cancelar

**Pasos**:
1. Estar en crear negociación (cualquier paso)
2. Llenar algunos campos (para tener datos)
3. Click en botón **"Cancelar"** (footer, izquierda)
4. Debe aparecer **confirm dialog**: "¿Estás seguro de cancelar? Se perderá toda la información ingresada."
5. Click en **"Cancelar"** del dialog (no confirmar)
   - Debe permanecer en la vista
6. Click en "Cancelar" de nuevo
7. Click en **"Aceptar"** del dialog

**Resultado esperado**:
- ✅ Confirm dialog aparece
- ✅ Si cancelas dialog, permaneces en vista
- ✅ Si aceptas, navega a `/clientes/[id]`
- ✅ Datos ingresados se pierden (esperado)

---

### ✅ TEST 10: Navegación Entre Pasos (Atrás)

**Objetivo**: Verificar botón "Atrás"

**Pasos**:
1. Estar en Paso 2 o 3
2. Click en botón **"Atrás"** (footer, izquierda)

**Resultado esperado**:
- ✅ Smooth scroll al paso anterior
- ✅ Datos ingresados se mantienen
- ✅ Botón "Siguiente" sigue funcionando

---

### ✅ TEST 11: Validaciones de Pasos

**Objetivo**: Verificar que no puedes avanzar con datos inválidos

**Pasos**:

**En Paso 1**:
- No seleccionar vivienda
- Botón "Siguiente" debe estar **deshabilitado**

**En Paso 2**:
- Habilitar solo Cuota Inicial con $10.000.000 (pero total es $122.000.000)
- Botón "Siguiente" debe estar **deshabilitado**
- Agregar más fuentes hasta llegar a 100%
- Botón "Siguiente" debe **habilitarse**

**Resultado esperado**:
- ✅ Validaciones funcionan en cada paso
- ✅ Mensajes de error claros
- ✅ Botones deshabilitados cuando datos inválidos

---

### ✅ TEST 12: Responsividad Mobile

**Objetivo**: Verificar que funciona en móvil

**Pasos**:
1. Abrir DevTools (F12)
2. Activar modo responsive (Ctrl+Shift+M)
3. Seleccionar "iPhone 12" o "Pixel 5"
4. Navegar por la vista de crear negociación

**Resultado esperado**:
- ✅ Layout se adapta a pantalla pequeña
- ✅ Footer sticky funciona
- ✅ Dropdowns no se cortan
- ✅ Botones son clickeables
- ✅ Texto legible

---

### ✅ TEST 13: Pre-llenado con SearchParams

**Objetivo**: Verificar que pre-llena datos con URL params

**Pasos**:
1. Navegar manualmente a:
   ```
   http://localhost:3000/clientes/[ID_REAL]/negociaciones/crear?nombre=Laura%20Pérez&viviendaId=123&valor=122000000
   ```
2. Verificar en Paso 1

**Resultado esperado**:
- ✅ Nombre "Laura Pérez" aparece
- ✅ Si `viviendaId=123` existe, se pre-selecciona
- ✅ Valor $122.000.000 se pre-llena

---

## 🐛 BUGS A REPORTAR

Si encuentras alguno de estos issues:

- ❌ Botón no navega correctamente
- ❌ Breadcrumbs no funcionan
- ❌ Viviendas NO muestran "Manzana - Casa"
- ❌ Valor negociado es read-only (debe ser editable)
- ❌ Cuota Inicial es obligatoria (debe ser opcional)
- ❌ Entidad es input de texto (debe ser SELECT)
- ❌ No valida suma de fuentes = 100%
- ❌ No redirige después de crear
- ❌ Datos no se mantienen al ir "Atrás"
- ❌ Footer no es sticky
- ❌ No aparece confirm al cancelar

**Por favor reportar con**:
- Paso donde ocurre el bug
- Resultado esperado vs resultado actual
- Screenshot si es posible
- Mensaje de error en consola (si hay)

---

## ✅ CHECKLIST FINAL

Después de todos los tests:

- [ ] Navegación desde header funciona
- [ ] Navegación desde tab funciona
- [ ] Validación de cédula funciona
- [ ] Paso 1: Selección de vivienda OK
- [ ] Paso 1: Viviendas muestran "Manzana - Casa"
- [ ] Paso 1: Valor negociado es editable
- [ ] Paso 2: TODAS las fuentes opcionales
- [ ] Paso 2: Entidad es SELECT (no texto)
- [ ] Paso 2: Validación de suma 100% funciona
- [ ] Paso 3: Revisión muestra todo correcto
- [ ] Creación exitosa y redirección OK
- [ ] Breadcrumbs funcionan
- [ ] Botón "Volver" funciona
- [ ] Cancelación con confirmación funciona
- [ ] Navegación "Atrás" mantiene datos
- [ ] Validaciones por paso funcionan
- [ ] Responsividad mobile OK
- [ ] Pre-llenado con params funciona

---

## 🎉 SI TODO PASA

**¡Vista completa lista para producción!** 🚀

La migración fue exitosa:
- ✅ Arquitectura limpia (regla de oro)
- ✅ Código reutilizable (100% del modal)
- ✅ UX mejorada (espacio completo)
- ✅ Todas las funcionalidades operativas

---

## 📞 COMANDOS ÚTILES

```bash
# Iniciar servidor
npm run dev

# Ver logs de consola
# Abrir DevTools (F12) → Pestaña Console

# Ver errores de Network
# DevTools → Pestaña Network → Filter: XHR

# Limpiar cache y recargar
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

---

## 📝 NOTAS

- Los warnings de hydration son normales en desarrollo
- El error 404 de favicon es normal (Next.js usa icon.svg)
- Los errores de tipos pre-existentes NO afectan la funcionalidad
- La nueva vista **NO tiene errores TypeScript propios**
