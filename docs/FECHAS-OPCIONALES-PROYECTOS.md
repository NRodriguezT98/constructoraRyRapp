# ✅ Fechas Opcionales en Proyectos

## 📋 Cambio Realizado

Las fechas **Fecha de Inicio** y **Fecha de Fin Estimada** ahora son **OPCIONALES** en el formulario de proyectos, ya que en muchos casos estas fechas son inciertas al momento de crear el proyecto.

---

## 🎯 Comportamiento

### **Antes:**
- ❌ Fechas eran **obligatorias**
- ❌ Default: Hoy y +1 año (valores arbitrarios)
- ❌ Error si no se llenaban

### **Ahora:**
- ✅ Fechas son **opcionales**
- ✅ Default: Campos vacíos
- ✅ Si no se llenan → Se guarda como `null` en BD
- ✅ Validación cruzada **solo si ambas están llenas**

---

## 🔧 Cambios Técnicos

### **1. Schema de Validación**

**Archivo:** `src/modules/proyectos/hooks/useProyectosForm.ts`

```typescript
// ❌ ANTES: Obligatorio
fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
fechaFinEstimada: z.string().min(1, 'La fecha de fin estimada es obligatoria'),

// ✅ AHORA: Opcional
fechaInicio: z.string().optional(),
fechaFinEstimada: z.string().optional(),
```

### **2. Validación Cruzada Mejorada**

Solo valida que `fechaFinEstimada > fechaInicio` **si ambas están presentes**:

```typescript
.refine(
  (data) => {
    // Solo validar si ambas fechas están presentes y no son strings vacías
    if (data.fechaInicio && data.fechaFinEstimada &&
        data.fechaInicio.trim() !== '' && data.fechaFinEstimada.trim() !== '') {
      return new Date(data.fechaFinEstimada) > new Date(data.fechaInicio)
    }
    return true // ← Si alguna está vacía, no validar
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFinEstimada'],
  }
)
```

### **3. Valores por Defecto**

**Antes:**
```typescript
defaultValues: {
  fechaInicio: initialData?.fechaInicio?.split('T')[0] || new Date().toISOString().split('T')[0],
  fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
}
```

**Ahora:**
```typescript
defaultValues: {
  fechaInicio: initialData?.fechaInicio?.split('T')[0] || '', // ← String vacío
  fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || '', // ← String vacío
}
```

### **4. Envío de Datos**

**Antes:**
```typescript
const formDataCompleto = {
  ...data,
  fechaInicio: `${data.fechaInicio}T12:00:00`, // ❌ Siempre envía fecha
  fechaFinEstimada: `${data.fechaFinEstimada}T12:00:00`,
}
```

**Ahora:**
```typescript
const formDataCompleto = {
  ...data,
  // Si están vacías, enviar null
  fechaInicio: data.fechaInicio && data.fechaInicio.trim() !== ''
    ? `${data.fechaInicio}T12:00:00`
    : null, // ← null si vacío
  fechaFinEstimada: data.fechaFinEstimada && data.fechaFinEstimada.trim() !== ''
    ? `${data.fechaFinEstimada}T12:00:00`
    : null, // ← null si vacío
}
```

### **5. UI del Formulario**

**Cambios visuales:**
```tsx
// ❌ ANTES
<label>Fecha de Inicio *</label> // ← Asterisco obligatorio

// ✅ AHORA
<label>Fecha de Inicio</label> // ← Sin asterisco
```

---

## 📊 Casos de Uso

### **Caso 1: Fechas Conocidas**
```typescript
// Usuario llena ambas fechas
fechaInicio: "2025-01-15"
fechaFinEstimada: "2026-06-30"

// Se envía a BD:
{
  fecha_inicio: "2025-01-15T12:00:00",
  fecha_fin_estimada: "2026-06-30T12:00:00"
}
```

### **Caso 2: Fechas Desconocidas** ⭐ **NUEVO**
```typescript
// Usuario deja campos vacíos
fechaInicio: ""
fechaFinEstimada: ""

// Se envía a BD:
{
  fecha_inicio: null,
  fecha_fin_estimada: null
}

// En la tabla se mostrará: "No especificado"
```

### **Caso 3: Solo una Fecha**
```typescript
// Usuario solo sabe fecha de inicio
fechaInicio: "2025-02-01"
fechaFinEstimada: ""

// Se envía a BD:
{
  fecha_inicio: "2025-02-01T12:00:00",
  fecha_fin_estimada: null
}

// ✅ NO genera error de validación cruzada
```

### **Caso 4: Fecha Fin Antes de Inicio** (Error)
```typescript
// Usuario comete error
fechaInicio: "2025-12-01"
fechaFinEstimada: "2025-06-01"

// ❌ Error de validación:
// "La fecha de fin debe ser posterior a la fecha de inicio"
```

---

## 🎨 Experiencia de Usuario

### **Formulario de Creación:**
```
┌────────────────────────────────────┐
│  📅 Fecha de Inicio                │  ← Sin asterisco
│  ┌──────────────────────────────┐  │
│  │ [vacío]                      │  │  ← Placeholder vacío
│  └──────────────────────────────┘  │
│                                    │
│  📅 Fecha de Fin Estimada          │  ← Sin asterisco
│  ┌──────────────────────────────┐  │
│  │ [vacío]                      │  │  ← Placeholder vacío
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Acciones posibles:**
1. ✅ Dejar ambos campos vacíos → Guardar como `null`
2. ✅ Llenar solo uno → Guardar solo ese
3. ✅ Llenar ambos → Validar que fin > inicio

### **Vista de Tabla:**
```
┌─────────────────┬──────────────────┬──────────────────┐
│ Proyecto        │ Inicio           │ Fin Estimada     │
├─────────────────┼──────────────────┼──────────────────┤
│ Urbanización A  │ 15-ene-2025     │ 30-jun-2026      │
│ Edificio B      │ No especificado  │ No especificado  │  ← Nuevo
│ Conjunto C      │ 01-feb-2025     │ No especificado  │  ← Válido
└─────────────────┴──────────────────┴──────────────────┘
```

---

## ✅ Validaciones Activas

### **1. Tipo de Dato**
- ✅ Si se llena, debe ser fecha válida (formato YYYY-MM-DD)
- ✅ Si está vacío, se permite

### **2. Validación Cruzada**
- ✅ Solo se activa si **ambas fechas tienen valor**
- ✅ Si solo una tiene valor → No genera error
- ✅ Si ambas están vacías → No genera error
- ✅ Si ambas tienen valor → Validar que fin > inicio

### **3. Persistencia**
- ✅ Valores vacíos se guardan como `null` en PostgreSQL
- ✅ No se usan valores por defecto arbitrarios

---

## 🔄 Migración de Datos Existentes

**Proyectos creados ANTES de este cambio:**
- Tienen fechas con valores por defecto (hoy y +1 año)
- **Recomendación:** Revisar y actualizar manualmente si son incorrectos
- **Acción sugerida:** Dejar en `null` si son inciertas

**Proyectos creados DESPUÉS de este cambio:**
- Solo tendrán fechas si se especifican explícitamente
- Fechas vacías = `null` en BD

---

## 📝 Notas Importantes

### **⚠️ Para Desarrolladores:**

1. **Al consultar fechas:**
   ```typescript
   // ❌ EVITAR: Asumir que siempre hay fecha
   const inicio = proyecto.fecha_inicio.split('T')[0]

   // ✅ CORRECTO: Validar null/undefined primero
   const inicio = proyecto.fecha_inicio?.split('T')[0] || 'No especificado'
   ```

2. **Al mostrar en UI:**
   ```typescript
   // ✅ Usar operador ternario
   {proyecto.fecha_inicio
     ? formatDateShort(proyecto.fecha_inicio)
     : 'No especificado'
   }
   ```

3. **Al filtrar por fechas:**
   ```sql
   -- ✅ Considerar NULL en consultas
   SELECT * FROM proyectos
   WHERE fecha_inicio IS NOT NULL
     AND fecha_inicio >= '2025-01-01'
   ```

### **💡 Para Contadoras:**

- ✅ Ahora pueden crear proyectos sin conocer las fechas exactas
- ✅ Pueden actualizar las fechas después cuando se definan
- ✅ "No especificado" se muestra claramente en la tabla
- ✅ No hay valores por defecto que confundan

---

## 🎯 Beneficios

1. **Flexibilidad:** No forzar fechas arbitrarias
2. **Precisión:** Solo guardar fechas reales y conocidas
3. **UX Mejorado:** No generar confusión con defaults
4. **Datos Limpios:** `null` es mejor que fecha inventada
5. **Validación Inteligente:** Solo cuando tiene sentido

---

**Última actualización:** 13 de noviembre de 2025
**Estado:** ✅ Implementado
**Versión:** 1.1.0
