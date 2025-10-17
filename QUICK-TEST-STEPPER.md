# ⚡ QUICK TEST - Fix Stepper Validation

## 🎯 Objetivo
Verificar que el fix de validación en el stepper del formulario funcione correctamente.

---

## 🚀 Inicio Rápido

### 1. Iniciar App
```powershell
npm run dev
```

### 2. Navegar a Clientes
```
http://localhost:3000/clientes
```

### 3. Abrir Formulario
```
Click en botón "Nuevo Cliente"
```

---

## ✅ Test 1: Bloqueo de Avance (2 min)

**Objetivo**: Verificar que NO se puede saltar sin validar

### Pasos:
1. Formulario abierto en Step 0 (Personal)
2. **NO llenar ningún campo**
3. Click en icono "📞 Contacto" del stepper

### ✅ Resultado Esperado:
- ❌ **NO avanza** al Step 1
- ✅ Se mantiene en Step 0
- ✅ Aparecen errores rojos:
  ```
  ❌ Los nombres son requeridos
  ❌ Los apellidos son requeridos
  ❌ El tipo de documento es requerido
  ❌ El número de documento es requerido
  ```

### ❌ Si falla:
- Bug: El stepper permite saltar sin validar
- Ver consola del navegador (F12) para errores

---

## ✅ Test 2: Bloqueo en Paso Intermedio (3 min)

**Objetivo**: Verificar validación de múltiples pasos

### Pasos:
1. Llenar Step 0 correctamente:
   - Nombres: "Juan"
   - Apellidos: "Pérez"
   - Tipo Doc: CC
   - Número: "123456789"
2. Click "Siguiente" → Avanza a Step 1 ✓
3. En Step 1, **NO llenar** teléfono ni email
4. Click en icono "💬 Adicional" (Step 3) del stepper

### ✅ Resultado Esperado:
- ❌ **NO avanza** al Step 3
- ✅ Se detiene en Step 1
- ✅ Aparece error:
  ```
  ❌ Debe proporcionar al menos teléfono o email
  ```

---

## ✅ Test 3: Retroceso Libre (1 min)

**Objetivo**: Verificar que retroceder NO requiere validación

### Pasos:
1. Estar en Step 2 (Interés)
2. Click en icono "👤 Personal" (Step 0) del stepper

### ✅ Resultado Esperado:
- ✅ Retrocede **inmediatamente** a Step 0
- ✅ No valida nada
- ✅ Datos llenados en Step 1 se mantienen

---

## ✅ Test 4: Salto Válido (3 min)

**Objetivo**: Verificar que permite saltar si todo es válido

### Pasos:
1. Llenar Step 0 correctamente
2. Avanzar a Step 1 con "Siguiente"
3. Llenar Step 1:
   - Teléfono: "3001234567"
4. **Desde Step 1**, click en icono "💬 Adicional" (Step 3)

### ✅ Resultado Esperado:
- ✅ Valida Step 1 → Pasa ✓
- ✅ Valida Step 2 → Pasa ✓ (opcional, siempre válido)
- ✅ **Avanza** a Step 3
- ✅ No muestra errores

---

## ✅ Test 5: Botones Navegación (2 min)

**Objetivo**: Verificar que botones "Siguiente/Anterior" sigan funcionando

### Pasos:
1. Step 0 sin llenar
2. Click botón "Siguiente" (abajo a la derecha)

### ✅ Resultado Esperado:
- ❌ **NO avanza** (igual que antes del fix)
- ✅ Muestra errores
- ✅ Funcionalidad original intacta

---

## 📊 Checklist Rápido

- [ ] Test 1: Bloquea avance sin datos ✅
- [ ] Test 2: Bloquea salto múltiple sin datos ✅
- [ ] Test 3: Permite retroceso siempre ✅
- [ ] Test 4: Permite salto con datos válidos ✅
- [ ] Test 5: Botones funcionan igual ✅

---

## 🎬 Video de Prueba

### Grabación Sugerida:
1. Abre OBS o herramienta de grabación
2. Ejecuta los 5 tests en secuencia
3. Muestra cada resultado esperado
4. Confirma que todo funciona

---

## 🐛 Si Algo Falla

### Error: Stepper permite saltar sin validar

**Verificar**:
```bash
# Ver línea del onClick en formulario-cliente-modern.tsx
grep -n "onClick={() => goToStep" src/modules/clientes/components/formulario-cliente-modern.tsx
```

**Debe decir**:
```tsx
onClick={() => goToStep(step.id)}  // ✅ Correcto
```

**NO debe decir**:
```tsx
onClick={() => setCurrentStep(step.id)}  // ❌ Bug
```

---

### Error: TypeScript en consola

**Solución**:
```powershell
# Regenerar tipos
npx tsc --noEmit
```

---

### Error: Validaciones no se ejecutan

**Check en DevTools Console**:
```javascript
// Verifica que las funciones de validación existen
console.log(typeof validarStep0)  // Debe ser "function"
console.log(typeof validarStep1)  // Debe ser "function"
```

---

## 📸 Screenshots Esperados

### Test 1: Bloqueo de Avance

```
┌─────────────────────────────────────────┐
│ 🎨 Nuevo Cliente                        │
├─────────────────────────────────────────┤
│ [👤 Personal] → [📞 Contacto] → [💬]    │
│     ACTIVO      BLOQUEADO                │
├─────────────────────────────────────────┤
│ Nombres: [____________]                 │
│ ❌ Los nombres son requeridos           │
│                                         │
│ Apellidos: [____________]               │
│ ❌ Los apellidos son requeridos         │
│                                         │
│ (Más errores...)                        │
└─────────────────────────────────────────┘
```

---

## ⏱️ Tiempo Total

- **Setup**: 2 min (iniciar app + abrir formulario)
- **Tests**: 11 min (5 tests × ~2 min cada uno)
- **Total**: ~15 minutos

---

## ✅ Si Todo Pasa

**Marcar como completo**:
- [x] Fix de validación en stepper funciona
- [x] No hay regresiones
- [x] UX mejorada significativamente

**Siguiente**:
- Testear en móvil (responsive)
- Testear en dark mode
- Considerar mejoras visuales (tooltips, animaciones)

---

## 📚 Documentación

- **Detalle del fix**: `FIX-STEPPER-VALIDATION.md`
- **Archivo modificado**: `src/modules/clientes/components/formulario-cliente-modern.tsx`
- **Validaciones originales**: `VALIDACION-STEPS-COMPLETADA.md`

---

**Fecha**: 2025-10-17
**Fix**: Validación en stepper
**Tiempo estimado**: 15 minutos
**Status**: ⚡ **READY TO TEST**
