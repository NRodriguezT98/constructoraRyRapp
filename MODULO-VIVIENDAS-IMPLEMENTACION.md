# 🏠 Módulo de Viviendas - Implementación Completa

**Fecha:** 15 de octubre de 2025
**Estado:** ⚠️ REQUIERE SQL - Leer sección "Antes de Continuar"

---

## ⚠️ ANTES DE CONTINUAR - EJECUTAR SQL

**IMPORTANTE:** Este módulo requiere que ejecutes el siguiente SQL en Supabase:

### 📝 Pasos Obligatorios:

1. **Abrir Supabase SQL Editor**
   - Ve a tu proyecto en https://supabase.com
   - Click en "SQL Editor" en el menú lateral

2. **Ejecutar el Script**
   - Abre el archivo: `supabase/viviendas-extended-schema.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click en "RUN" o presiona Ctrl+Enter

3. **Verificar Ejecución**
   ```sql
   -- Verificar que las columnas se agregaron
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'viviendas';
   ```

4. **Regenerar Tipos de TypeScript**
   ```powershell
   # Después de ejecutar el SQL, regenera los tipos:
   npx supabase gen types typescript --project-id [tu-project-id] > src/lib/supabase/database.types.ts
   ```

   ✅ Esto eliminará los errores de TypeScript en `viviendas.service.ts`

---

## 📊 LO QUE YA ESTÁ CREADO

### ✅ Completado (100%)

| Archivo | Líneas | Descripción | Estado |
|---------|--------|-------------|--------|
| `types/index.ts` | 228 | Tipos completos de Vivienda, Form, Manzanas, Config | ✅ |
| `constants/index.ts` | 211 | Todas las constantes, recargos, labels, formatos | ✅ |
| `utils/index.ts` | 176 | Formateo COP, cálculos, validaciones | ✅ |
| `services/viviendas.service.ts` | 322 | CRUD completo, upload PDF, config recargos | ✅ |
| `hooks/useViviendaForm.ts` | 438 | Hook wizard completo, validación, navegación | ✅ |
| `styles/vivienda-form.styles.ts` | 224 | Estilos centralizados para TODO el formulario | ✅ |
| **TOTAL** | **1,599** | **Arquitectura completa** | ✅ |

---

## 🎨 DISEÑO Y DISTRIBUCIÓN RECOMENDADA

### **Opción 1: Wizard Multi-Paso con Stepper (RECOMENDADO) ⭐**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREAR NUEVA VIVIENDA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ①━━━━━━②━━━━━━③━━━━━━④━━━━━━⑤                                │
│ Ubicación  Linderos  Legal  Financiero  Resumen                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 PASO 1: UBICACIÓN                       │   │
│  │                                                         │   │
│  │  📍 Proyecto:    [Select Proyecto A        ▼]          │   │
│  │                                                         │   │
│  │  🏘️  Manzana:    [Select Manzana B        ▼]          │   │
│  │                  ℹ️ Manzana B: 2 viviendas disponibles │   │
│  │                                                         │   │
│  │  🏠 Vivienda:    Vivienda #18 (Última disponible)      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Atrás]                                   [Siguiente →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **Ventajas:**
- ✅ Proceso guiado paso a paso
- ✅ Usuario no se abruma con todos los campos
- ✅ Validación progresiva
- ✅ Sensación de progreso visual
- ✅ Fácil volver atrás y corregir

---

### **Paso 2: Linderos (Grid 2x2)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASO 2: LINDEROS                             │
│  Define los límites de la vivienda                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ 🧭 Lindero Norte         │  │ 🧭 Lindero Sur           │    │
│  │ [________________]       │  │ [________________]       │    │
│  │ Ej: Calle 123            │  │ Ej: Lote 45              │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ 🧭 Lindero Oriente       │  │ 🧭 Lindero Occidente     │    │
│  │ [________________]       │  │ [________________]       │    │
│  │ Ej: Carrera 67           │  │ Ej: Manzana C            │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
│  [← Atrás]                                   [Siguiente →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Paso 3: Información Legal**

```
┌─────────────────────────────────────────────────────────────────┐
│              PASO 3: INFORMACIÓN LEGAL                          │
│  Datos catastrales y documentos                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ 📄 Matrícula Inmobiliaria│  │ 🏘️  Nomenclatura         │    │
│  │ [123-456789]             │  │ [Calle 123 #45-67]       │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ 📏 Área del Lote (m²)    │  │ 🏗️  Área Construida (m²) │    │
│  │ [120.50]                 │  │ [85.00]                  │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 🏡 Tipo de Vivienda                                    │    │
│  │ [⚪ Regular    ⚫ Irregular]                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 📎 Certificado de Tradición y Libertad (Opcional)     │    │
│  │ [📁 Seleccionar archivo PDF]                           │    │
│  │ ℹ️ Tamaño máximo: 10MB                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [← Atrás]                                   [Siguiente →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Paso 4: Información Financiera (CON RESUMEN EN VIVO) ⭐**

```
┌─────────────────────────────────────────────────────────────────┐
│           PASO 4: INFORMACIÓN FINANCIERA                        │
│  Valor base y recargos                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 💵 Valor Base de la Casa                               │    │
│  │ $ [150.000.000]                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 🏠 ¿Casa Esquinera? (Aplica Recargo)        [🔘 No] │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  RESUMEN FINANCIERO                                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Valor Base Vivienda:          $ 150.000.000           │   │
│  │                                                         │   │
│  │  Gastos Notariales                                      │   │
│  │  (Recargo Obligatorio):        $   5.000.000           │   │
│  │                                                         │   │
│  │  Recargo por Casa Esquinera:   $           0           │   │
│  │  ─────────────────────────────────────────────────      │   │
│  │  💎 VALOR TOTAL:               $ 155.000.000           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Atrás]                                   [Siguiente →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **Cuando se activa el toggle "Casa Esquinera":**

```
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 🏠 ¿Casa Esquinera? (Aplica Recargo)        [🔵 Sí] │    │
│  │                                                        │    │
│  │  💰 Selecciona el Recargo:                            │    │
│  │  [Select: $5.000.000        ▼]                        │    │
│  │           $10.000.000                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  RESUMEN FINANCIERO                                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Valor Base Vivienda:          $ 150.000.000           │   │
│  │                                                         │   │
│  │  Gastos Notariales                                      │   │
│  │  (Recargo Obligatorio):        $   5.000.000           │   │
│  │                                                         │   │
│  │  Recargo por Casa Esquinera:   $   5.000.000  ⭐       │   │
│  │  ─────────────────────────────────────────────────      │   │
│  │  💎 VALOR TOTAL:               $ 160.000.000           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
```

---

### **Paso 5: Resumen Final**

```
┌─────────────────────────────────────────────────────────────────┐
│                     PASO 5: RESUMEN                             │
│  Revisa la información antes de guardar                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ UBICACIÓN                                                   │
│  Proyecto: Proyecto A | Manzana: B | Vivienda: #18             │
│                                                                 │
│  ✅ LINDEROS                                                    │
│  Norte: Calle 123 | Sur: Lote 45 | ...                         │
│                                                                 │
│  ✅ INFORMACIÓN LEGAL                                           │
│  Matrícula: 123-456789 | Nomenclatura: Calle 123 #45-67        │
│  Área Lote: 120.50 m² | Área Construida: 85.00 m²              │
│  Tipo: Regular | Certificado: ✅ Adjunto                        │
│                                                                 │
│  ✅ INFORMACIÓN FINANCIERA                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💎 VALOR TOTAL: $ 160.000.000                          │   │
│  │  (Incluye gastos notariales + recargo esquinera)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Atrás]              [❌ Cancelar]        [✅ Crear Vivienda]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 RECOMENDACIONES DE DISEÑO

### **Layout Sugerido:**

1. **Ancho del Formulario:**
   - Desktop: Máximo 800px centrado
   - Mobile: 100% del viewport con padding

2. **Stepper (Indicador de Pasos):**
   - Circular con número o ícono
   - Línea conectora entre pasos
   - Color azul para activo, verde para completado

3. **Animaciones:**
   - Transición suave entre pasos (slide-in/fade)
   - Animación del resumen financiero al actualizar valores
   - Toggle de casa esquinera con slide-down del select

4. **Responsive:**
   - Desktop: Grid 2 columnas para campos
   - Tablet: Grid 2 columnas parcial
   - Mobile: Todos los campos a 1 columna

5. **Colores:**
   - Primario: Azul (#3B82F6)
   - Éxito: Verde (#10B981)
   - Valores: Texto grande y destacado
   - Resumen financiero: Fondo degradado azul-morado

---

## 📦 ESTRUCTURA DE COMPONENTES A CREAR

### **Componentes Necesarios (7 componentes):**

```
components/
├── formulario-vivienda.tsx          # Componente principal wizard
├── paso-ubicacion.tsx                # Paso 1
├── paso-linderos.tsx                 # Paso 2
├── paso-legal.tsx                    # Paso 3
├── paso-financiero.tsx               # Paso 4
├── paso-resumen.tsx                  # Paso 5
└── resumen-financiero-card.tsx       # Card reutilizable del resumen
```

### **Código Base para Empezar:**

```tsx
// formulario-vivienda.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useViviendaForm } from '../hooks/useViviendaForm'
import { PASOS_FORMULARIO } from '../constants'
import { wizardClasses, navigationClasses } from '../styles/vivienda-form.styles'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function FormularioVivienda() {
  const {
    pasoActual,
    pasosCompletados,
    avanzarPaso,
    retrocederPaso,
    submitFormulario,
  } = useViviendaForm()

  const pasoIndex = PASOS_FORMULARIO.findIndex((p) => p.id === pasoActual)
  const isFirstStep = pasoIndex === 0
  const isLastStep = pasoIndex === PASOS_FORMULARIO.length - 1

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Stepper */}
      <div className={wizardClasses.stepper}>
        {PASOS_FORMULARIO.map((paso, index) => {
          const isActive = paso.id === pasoActual
          const isCompleted = pasosCompletados.includes(paso.id)

          return (
            <div key={paso.id} className={wizardClasses.stepItem}>
              <div
                className={`
                  ${wizardClasses.stepCircle.base}
                  ${isActive && wizardClasses.stepCircle.active}
                  ${isCompleted && wizardClasses.stepCircle.completed}
                  ${!isActive && !isCompleted && wizardClasses.stepCircle.inactive}
                `}
              >
                {index + 1}
              </div>

              <div
                className={`
                  ${wizardClasses.stepLabel.base}
                  ${isActive && wizardClasses.stepLabel.active}
                  ${isCompleted && wizardClasses.stepLabel.completed}
                  ${!isActive && !isCompleted && wizardClasses.stepLabel.inactive}
                `}
              >
                {paso.label}
              </div>

              {index < PASOS_FORMULARIO.length - 1 && (
                <div
                  className={`
                    ${wizardClasses.stepLine.base}
                    ${isCompleted ? wizardClasses.stepLine.completed : wizardClasses.stepLine.inactive}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido del paso actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pasoActual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={wizardClasses.content}
        >
          {/* Aquí van los componentes de cada paso */}
          {renderPasoActual(pasoActual)}
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <div className={navigationClasses.container}>
        <button
          onClick={retrocederPaso}
          disabled={isFirstStep}
          className={navigationClasses.button.secondary}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>

        <button
          onClick={isLastStep ? submitFormulario : avanzarPaso}
          className={navigationClasses.button.primary}
        >
          {isLastStep ? 'Crear Vivienda' : 'Siguiente'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function renderPasoActual(paso: PasoFormulario) {
  switch (paso) {
    case 'ubicacion':
      return <PasoUbicacion />
    case 'linderos':
      return <PasoLinderos />
    case 'legal':
      return <PasoLegal />
    case 'financiero':
      return <PasoFinanciero />
    case 'resumen':
      return <PasoResumen />
  }
}
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Ejecutar SQL** en Supabase (viviendas-extended-schema.sql)
2. ✅ **Regenerar tipos** de TypeScript
3. ⏳ **Crear componentes** de cada paso (usar estilos ya creados)
4. ⏳ **Crear página** `app/viviendas/page.tsx`
5. ⏳ **Probar** el flujo completo

---

## 💡 CONSEJOS FINALES

### **Para los Recargos Variables:**
Ya está resuelto con la tabla `configuracion_recargos`:
- Los valores se cargan desde la BD
- Pueden cambiarse sin modificar código
- Se usa `configuracionRecargos` del hook

### **Para el Formato de Pesos:**
Usa las utilidades ya creadas:
```tsx
import { formatCurrency, parseCurrency, formatCurrencyInput } from '../utils'

// Mostrar
{formatCurrency(150000000)} // $ 150.000.000

// Input controlado
<input
  value={formatCurrencyInput(formData.valor_base?.toString() || '')}
  onChange={(e) => {
    const valor = parseCurrency(e.target.value)
    actualizarCampo('valor_base', valor)
  }}
/>
```

### **Para el Resumen en Vivo:**
El hook ya calcula `resumenFinanciero` automáticamente:
```tsx
const { resumenFinanciero } = useViviendaForm()

// Se actualiza automáticamente cuando cambian los valores
<div>{formatCurrency(resumenFinanciero.valor_total)}</div>
```

---

**¿Listo para crear los componentes visuales?** 🎨

Confirma y procedo a crear los 7 componentes del formulario con el diseño sugerido.
