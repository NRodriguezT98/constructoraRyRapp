# 📊 Análisis de Campos - Tabla Proyectos

## 🔍 Comparación: BD vs Formulario

### **Campos en la Base de Datos**

| Campo | Tipo | Nullable | Default | ¿Se usa en formulario? |
|-------|------|----------|---------|------------------------|
| `id` | uuid | NO | uuid_generate_v4() | ✅ Auto-generado |
| `nombre` | varchar(255) | NO | - | ✅ SÍ (editable) |
| `descripcion` | text | NO | - | ✅ SÍ (editable) |
| `ubicacion` | varchar(500) | NO | - | ✅ SÍ (editable) |
| `fecha_inicio` | timestamp | NO | - | ⚠️ **HARDCODED** (fecha actual) |
| `fecha_fin_estimada` | timestamp | NO | - | ⚠️ **HARDCODED** (+1 año) |
| `presupuesto` | numeric | NO | 0 | ⚠️ **HARDCODED** (0) |
| `estado` | varchar(50) | NO | 'en_planificacion' | ❌ **NO** (usa default BD) |
| `progreso` | integer | NO | 0 | ❌ **NO** (usa default BD) |
| `responsable` | varchar(255) | NO | - | ⚠️ **HARDCODED** ('RyR Constructora') |
| `telefono` | varchar(50) | NO | - | ⚠️ **HARDCODED** ('+57 300 000 0000') |
| `email` | varchar(255) | NO | - | ⚠️ **HARDCODED** ('info@ryrconstrucora.com') |
| `fecha_creacion` | timestamp | YES | now() | ✅ Auto-generado BD |
| `fecha_actualizacion` | timestamp | YES | now() | ✅ Auto-generado BD |
| `user_id` | uuid | YES | - | ✅ Auto (del usuario logueado) |

---

## ❌ **PROBLEMA IDENTIFICADO**

### **Estado del Proyecto**
- **Campo BD:** `estado` (default: `'en_planificacion'`)
- **Estados disponibles:**
  - `'en_planificacion'` (default)
  - `'en_proceso'`
  - `'en_construccion'`
  - `'completado'`
  - `'pausado'`

**🚨 PROBLEMA:**
- El formulario **NO permite seleccionar el estado** al crear
- Se usa siempre el default de la BD (`'en_planificacion'`)
- En edición **NO se puede cambiar el estado**
- Por eso tu proyecto muestra "Planificación" y no puedes modificarlo

---

## 🎯 **Campos que NO se están aprovechando**

### **1. Estado del Proyecto** ⭐ **CRÍTICO**
- **Campo:** `estado`
- **Tipo:** varchar(50)
- **Default:** 'en_planificacion'
- **Uso actual:** ❌ No editable
- **Debería ser:** ✅ Selector en formulario (crear y editar)
- **Importancia:** ALTA - Se muestra en la tabla

### **2. Fecha de Inicio** 📅
- **Campo:** `fecha_inicio`
- **Tipo:** timestamp
- **Uso actual:** ⚠️ Hardcoded (fecha actual)
- **Debería ser:** ✅ Selector de fecha en formulario
- **Importancia:** ALTA - Útil para planificación

### **3. Fecha de Fin Estimada** 📅
- **Campo:** `fecha_fin_estimada`
- **Tipo:** timestamp
- **Uso actual:** ⚠️ Hardcoded (+1 año desde hoy)
- **Debería ser:** ✅ Selector de fecha en formulario
- **Importancia:** ALTA - Útil para planificación

### **4. Presupuesto** 💰
- **Campo:** `presupuesto`
- **Tipo:** numeric
- **Uso actual:** ⚠️ Hardcoded (0)
- **Debería ser:** ✅ Input numérico en formulario
- **Importancia:** MEDIA - Útil para contabilidad

### **5. Responsable** 👤
- **Campo:** `responsable`
- **Tipo:** varchar(255)
- **Uso actual:** ⚠️ Hardcoded ('RyR Constructora')
- **Debería ser:** ✅ Input de texto o selector de usuarios
- **Importancia:** MEDIA - Útil para asignación

### **6. Teléfono** 📞
- **Campo:** `telefono`
- **Tipo:** varchar(50)
- **Uso actual:** ⚠️ Hardcoded ('+57 300 000 0000')
- **Debería ser:** ✅ Input de teléfono
- **Importancia:** BAJA - Puede ser del responsable

### **7. Email** 📧
- **Campo:** `email`
- **Tipo:** varchar(255)
- **Uso actual:** ⚠️ Hardcoded ('info@ryrconstrucora.com')
- **Debería ser:** ✅ Input de email
- **Importancia:** BAJA - Puede ser del responsable

### **8. Progreso** 📊
- **Campo:** `progreso`
- **Tipo:** integer (0-100)
- **Uso actual:** ❌ No se usa (default 0)
- **Debería ser:** ✅ Slider o calculado automático
- **Importancia:** MEDIA - Útil para dashboard

---

## 📝 **Código Actual del Formulario (Creación)**

```typescript
// useProyectosForm.ts - línea 381
const formDataCompleto: ProyectoFormData = {
  ...data,
  manzanas: data.manzanas.map(m => ({
    ...m,
    precioBase: 0,
    superficieTotal: 0,
    ubicacion: '',
  })),
  fechaInicio: new Date().toISOString(),              // ⚠️ HARDCODED
  fechaFinEstimada: new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString(),                                     // ⚠️ HARDCODED
  presupuesto: 0,                                      // ⚠️ HARDCODED
  estado: 'en_planificacion',                          // ⚠️ HARDCODED
  responsable: 'RyR Constructora',                     // ⚠️ HARDCODED
  telefono: '+57 300 000 0000',                        // ⚠️ HARDCODED
  email: 'info@ryrconstrucora.com',                    // ⚠️ HARDCODED
}
```

---

## ✅ **Campos que SÍ se están usando correctamente**

1. ✅ **nombre** - Input de texto con validación
2. ✅ **descripcion** - Textarea con validación
3. ✅ **ubicacion** - Input de texto con validación
4. ✅ **manzanas** - Array dinámico con validación granular

---

## 🎯 **Recomendaciones de Prioridad**

### **ALTA PRIORIDAD** (implementar YA)
1. **Estado** - Selector con opciones:
   - En Planificación
   - En Proceso
   - En Construcción
   - Completado
   - Pausado

2. **Fecha de Inicio** - DatePicker (default: hoy)

3. **Fecha de Fin Estimada** - DatePicker (default: +1 año desde inicio)

### **MEDIA PRIORIDAD** (implementar después)
4. **Presupuesto** - Input numérico con formato de moneda

5. **Responsable** - Input de texto o selector de usuarios

### **BAJA PRIORIDAD** (opcional)
6. **Teléfono** - Input con formato de teléfono
7. **Email** - Input de email
8. **Progreso** - Calculado automáticamente (viviendas vendidas / total)

---

## 🔧 **Propuesta de Mejora del Formulario**

### **Sección 1: Información Básica**
- ✅ Nombre del Proyecto
- ✅ Descripción
- ✅ Ubicación
- 🆕 **Estado** (selector)

### **Sección 2: Planificación** (nueva)
- 🆕 **Fecha de Inicio** (date picker)
- 🆕 **Fecha de Fin Estimada** (date picker)
- 🆕 **Presupuesto** (input numérico)

### **Sección 3: Responsable** (nueva)
- 🆕 **Responsable** (input texto o selector)
- 🆕 **Teléfono de Contacto** (input)
- 🆕 **Email de Contacto** (input)

### **Sección 4: Manzanas** (existente)
- ✅ Array dinámico de manzanas

---

## 💡 **Beneficios de Implementar Estos Campos**

### **Para las Contadoras:**
1. **Estado** → Ver rápidamente qué proyectos están activos
2. **Fechas** → Planificar mejor los recursos
3. **Presupuesto** → Control financiero
4. **Responsable** → Saber a quién contactar

### **Para la Vista de Tabla:**
- Columna de **Estado** ya implementada ✅
- Podría agregar columna de **Presupuesto**
- Podría agregar columna de **Responsable**
- Podría agregar columna de **Fechas**

---

## 📋 **Siguiente Paso Recomendado**

### **1. Agregar Campo de Estado al Formulario**

**Ubicación:** `src/modules/proyectos/components/proyectos-form.tsx`

**Código sugerido:**
```tsx
{/* Estado del Proyecto */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Estado del Proyecto
  </label>
  <select
    {...register('estado')}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
  >
    <option value="en_planificacion">En Planificación</option>
    <option value="en_proceso">En Proceso</option>
    <option value="en_construccion">En Construcción</option>
    <option value="completado">Completado</option>
    <option value="pausado">Pausado</option>
  </select>
  {errors.estado && (
    <p className="text-sm text-red-600">{errors.estado.message}</p>
  )}
</div>
```

**Schema de validación:**
```typescript
estado: z.enum(['en_planificacion', 'en_proceso', 'en_construccion', 'completado', 'pausado'])
```

---

## 📊 **Resumen Ejecutivo**

| Aspecto | Estado Actual | Estado Ideal |
|---------|---------------|--------------|
| Campos editables | 3 (nombre, descripción, ubicación) | 10 (+ estado, fechas, presupuesto, responsable, etc.) |
| Utilidad para contadoras | ⭐⭐ (básico) | ⭐⭐⭐⭐⭐ (completo) |
| Aprovechamiento BD | 30% | 100% |
| Problema del estado | ❌ No editable | ✅ Selector completo |

---

**Última actualización:** 13 de noviembre de 2025
**Prioridad:** ALTA - Implementar campo de estado
**Impacto:** ALTO - Mejora significativa en usabilidad
