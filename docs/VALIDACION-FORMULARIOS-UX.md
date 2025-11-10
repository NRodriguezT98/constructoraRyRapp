# 🎯 Guía de Validación Progresiva en Formularios

## 📊 Flujo de Validación UX Correcto

### **FASE 1: Usuario escribiendo (NO validar)**
```
┌─────────────────────────────────────────┐
│ Nombre del Proyecto                     │
│ ┌─────────────────────────────────────┐ │
│ │ Proyecto $                        │ │ ← Usuario escribiendo
│ └─────────────────────────────────────┘ │
│ Solo letras, números y acentos          │ ← Hint informativo (NO error)
└─────────────────────────────────────────┘
```
**Estado:** Sin errores, sin validación
**Borde:** Gris neutral
**Razón:** No molestar mientras escribe

---

### **FASE 2: Usuario sale del campo (`onBlur`) → Validar**
```
┌─────────────────────────────────────────┐
│ Nombre del Proyecto *                   │
│ ┌─────────────────────────────────────┐ │
│ │ Proyecto $                        ❌│ │ ← Error visible
│ └─────────────────────────────────────┘ │
│ ❌ Solo se permiten letras, números...  │ ← Mensaje claro
└─────────────────────────────────────────┘
```
**Estado:** Error detectado
**Borde:** Rojo
**Fondo:** Rojo muy suave
**Razón:** Usuario terminó de escribir, hora de validar

---

### **FASE 3: Usuario corrige (`onChange` activo)**
```
┌─────────────────────────────────────────┐
│ Nombre del Proyecto *                   │
│ ┌─────────────────────────────────────┐ │
│ │ Proyecto Los Pinos              🔄 │ │ ← Validando en tiempo real
│ └─────────────────────────────────────┘ │
│ Solo letras, números y acentos          │
└─────────────────────────────────────────┘
```
**Estado:** Validando mientras corrige
**Borde:** Azul (en foco)
**Razón:** Confirmar que el error se está resolviendo

---

### **FASE 4: Campo válido (`onChange` confirma)**
```
┌─────────────────────────────────────────┐
│ Nombre del Proyecto *                   │
│ ┌─────────────────────────────────────┐ │
│ │ Proyecto Los Pinos              ✓  │ │ ← Check verde
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```
**Estado:** Válido
**Borde:** Verde suave
**Fondo:** Verde muy suave
**Razón:** Feedback positivo, usuario lo arregló

---

## 🔧 Configuración React Hook Form

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur',           // ← Validar SOLO al salir del campo
  reValidateMode: 'onChange' // ← Si ya hay error, validar mientras escribe
})
```

### **¿Por qué esta configuración?**

| Modo | Cuándo valida | UX |
|------|---------------|-----|
| `mode: 'onChange'` | Mientras escribe | ❌ Molesta, errores prematuros |
| `mode: 'onBlur'` | Al salir del campo | ✅ Respeta al usuario |
| `mode: 'onSubmit'` | Al enviar | ❌ Muy tarde, frustra |
| **`mode: 'onBlur'` + `reValidateMode: 'onChange'`** | **Primero `onBlur`, luego `onChange`** | **✅ PERFECTO** |

---

## 🎨 Estados Visuales

### **1. Estado Inicial (sin tocar)**
```typescript
className: 'border-gray-300 dark:border-gray-700'
```

### **2. Estado con Error**
```typescript
className: 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
```
- Borde rojo
- Fondo rojo muy suave
- Ring rojo al hacer focus
- Icono ❌ rojo

### **3. Estado Válido**
```typescript
className: 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50'
```
- Borde verde
- Fondo verde muy suave
- Icono ✓ verde

### **4. Estado Validando (async)**
```typescript
className: 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
```
- Borde azul
- Spinner animado

---

## 📝 Mensajes de Error Efectivos

### ❌ **MALO: Vago e inútil**
```
"Entrada inválida"
"Error en el campo"
"Formato incorrecto"
```

### ✅ **BUENO: Específico y accionable**
```
"Solo se permiten letras, números, espacios y guiones"
"El nombre debe tener entre 3 y 100 caracteres"
"Este número de matrícula ya existe en Proyecto Norte - Casa 12"
```

---

## 🔄 Validaciones Asíncronas (BD)

### **Cuándo ejecutar:**
1. **`onBlur`** → Primera validación (salir del campo)
2. **Debouncing 500ms** → Esperar que termine de escribir
3. **Cache 30s** → No repetir validaciones innecesarias

### **Ejemplo:**
```typescript
// Usuario escribe: "ABC-123456"
// ⏱️ 0ms:   Escribe "A"
// ⏱️ 100ms: Escribe "B"
// ⏱️ 200ms: Escribe "C"
// ⏱️ 300ms: Escribe "-"
// ⏱️ 400ms: Escribe "1"
// ⏱️ 800ms: Sale del campo (onBlur)
// ⏱️ 1300ms: Ejecuta validación (500ms después de última tecla)
```

### **Indicadores visuales:**
```tsx
{isValidating && <Loader2 className="animate-spin" />}
{!isValidating && isValid && <CheckCircle2 className="text-green-500" />}
{!isValidating && error && <XCircle className="text-red-500" />}
```

---

## 🚀 Casos de Uso por Tipo de Campo

### **1. Campos de texto cortos (nombre, email)**
- `mode: 'onBlur'`
- Validación síncrona instantánea
- Iconos visuales de estado

### **2. Campos únicos (matrícula, cédula)**
- `mode: 'onBlur'`
- Validación asíncrona con debouncing
- Spinner mientras valida
- Mensaje específico si existe

### **3. Campos numéricos (precios, áreas)**
- `mode: 'onBlur'`
- Validación de rangos
- Formateo automático (separadores de miles)

### **4. Relaciones (proyecto → manzana)**
- Validar en `onChange` (selects)
- Deshabilitar opciones inválidas
- Mostrar información contextual

---

## 📦 Componente Reutilizable

```typescript
<CampoValidado
  label="Nombre del Proyecto"
  name="nombre"
  placeholder="Ej: Urbanización Los Pinos"
  required
  register={register}
  error={errors.nombre}
  touched={touchedFields.nombre}
  isValidating={validationStatus.nombre.isValidating}
  isValid={validationStatus.nombre.isValid}
  helpText="Solo letras, números y acentos permitidos"
  maxLength={100}
/>
```

**Ventajas:**
- ✅ UX consistente en todo el sistema
- ✅ Menos código repetido
- ✅ Mantenimiento centralizado
- ✅ Accesibilidad garantizada

---

## 🎯 Checklist de Validación UX

- [ ] **NO validar mientras escribe** (primera vez)
- [ ] **Validar al salir del campo** (`onBlur`)
- [ ] **Validar en tiempo real** si ya hay error (`reValidateMode: 'onChange'`)
- [ ] **Mostrar iconos visuales** (✓ ❌ 🔄)
- [ ] **Mensajes específicos y útiles** (nada de "error")
- [ ] **Debouncing en validaciones async** (500ms)
- [ ] **Cache en consultas a BD** (30s)
- [ ] **Deshabilitar submit** si hay errores o validaciones pendientes
- [ ] **Feedback positivo** (verde cuando es válido)
- [ ] **Accesibilidad** (labels, aria-invalid, role="alert")

---

## 🏆 Resultado Final

### **Experiencia del Usuario:**
1. ✍️ Escribe tranquilo sin errores molestos
2. 👀 Sale del campo → Ve error específico si hay
3. ✏️ Corrige → Ve en tiempo real que se resuelve
4. ✅ Ve check verde → Sabe que está correcto
5. 🚀 Envía formulario con confianza

### **Beneficios:**
- 🎯 UX no intrusiva
- ⚡ Validación eficiente (no sobrecargar BD)
- 💡 Errores claros y accionables
- 🎨 Feedback visual inmediato
- ♿ Accesible para todos

---

## 📚 Referencias

- **React Hook Form Modes**: https://react-hook-form.com/docs/useform#mode
- **Zod Validations**: https://zod.dev
- **TanStack Query (cache)**: https://tanstack.com/query
- **Accesibilidad WCAG**: https://www.w3.org/WAI/WCAG21/quickref/
