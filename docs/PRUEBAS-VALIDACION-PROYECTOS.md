# 🧪 Pruebas de Validación - Formulario de Proyectos

## 📝 Casos de Prueba

### **Test 1: Nombre de Proyecto - Caracteres Válidos ✅**

| Entrada | ¿Válido? | Resultado |
|---------|----------|-----------|
| `Urbanización Los Pinos` | ✅ | Check verde |
| `Proyecto 2025` | ✅ | Check verde |
| `Conjunto San José (Etapa 2)` | ✅ | Check verde |
| `Torres del Norte - Fase 1.5` | ✅ | Check verde |
| `Edificio_Alpha_123` | ✅ | Check verde |

---

### **Test 2: Nombre de Proyecto - Caracteres Inválidos ❌**

| Entrada | ¿Válido? | Error Esperado |
|---------|----------|----------------|
| `Proyecto $100M` | ❌ | "Solo se permiten letras (con acentos), números, espacios, guiones, paréntesis y puntos" |
| `Edificio #1` | ❌ | Mismo error |
| `Casa@Norte` | ❌ | Mismo error |
| `Conjunto&Más` | ❌ | Mismo error |
| `Proyecto+Premium` | ❌ | Mismo error |
| `Torre*Central` | ❌ | Mismo error |

---

### **Test 3: Nombre de Proyecto - Longitud**

| Entrada | ¿Válido? | Error Esperado |
|---------|----------|----------------|
| `AB` | ❌ | "El nombre del proyecto debe tener al menos 3 caracteres" |
| `ABC` | ✅ | Check verde |
| `A`.repeat(100) | ✅ | Check verde (justo en el límite) |
| `A`.repeat(101) | ❌ | "El nombre no puede exceder 100 caracteres" |

---

### **Test 4: Ubicación - Caracteres Válidos ✅**

| Entrada | ¿Válido? | Resultado |
|---------|----------|-----------|
| `Antioquia` | ✅ | Check verde |
| `Medellín, Colombia` | ✅ | Check verde |
| `Calle 123 #45-67` | ✅ | Check verde |
| `Carrera 50 #32-10, Barrio El Poblado` | ✅ | Check verde |
| `6.25°N, 75.56°W` | ✅ | Check verde |

---

### **Test 5: Ubicación - Caracteres Inválidos ❌**

| Entrada | ¿Válido? | Error Esperado |
|---------|----------|----------------|
| `Ubicación @ Centro` | ❌ | "Solo se permiten letras (con acentos), números, espacios, comas, guiones, # y puntos" |
| `Barrio $Premium` | ❌ | Mismo error |
| `Sector & Alrededores` | ❌ | Mismo error |

---

### **Test 6: Descripción - Caracteres Válidos ✅**

| Entrada | ¿Válido? | Resultado |
|---------|----------|-----------|
| `Proyecto de 50 viviendas de 3 pisos c/u.` | ✅ | Check verde |
| `Presupuesto: $1.500.000.000 (aprox.)` | ✅ | Check verde |
| `¿Incluye áreas verdes? ¡Sí, totalmente!` | ✅ | Check verde |
| `Desarrollo urbanístico de alta calidad: 80% completado.` | ✅ | Check verde |

---

### **Test 7: Descripción - Caracteres Inválidos ❌**

| Entrada | ¿Válido? | Error Esperado |
|---------|----------|----------------|
| `Proyecto con código: <script>` | ❌ | "Caracteres no permitidos en la descripción..." |
| `Email: info@proyecto.com` | ❌ | Mismo error |
| `Redes: #hashtag @usuario` | ❌ | Mismo error |
| `Operación: 2 + 2 = 4` | ❌ | Mismo error |

---

### **Test 8: Descripción - Longitud**

| Entrada | ¿Válido? | Error Esperado |
|---------|----------|----------------|
| `Proyecto` | ❌ | "La descripción debe tener al menos 10 caracteres" |
| `Proyecto nuevo` | ✅ | Check verde (10 caracteres exactos) |
| `A`.repeat(1000) | ✅ | Check verde (límite exacto) |
| `A`.repeat(1001) | ❌ | "La descripción no puede exceder 1000 caracteres" |

---

## 🎯 Prueba de Validación Progresiva (UX)

### **Escenario 1: Primera vez escribiendo**

**Pasos:**
1. Hacer clic en el campo "Nombre del Proyecto"
2. Escribir: `P` → `r` → `o` → `y` → `$`
3. **No mostrar error** (usuario está escribiendo)
4. Hacer clic fuera del campo (onBlur)
5. **Ahora sí mostrar error:** ❌ "Solo se permiten letras..."

**Resultado esperado:**
- ✅ No molesta mientras escribe
- ✅ Valida solo al salir del campo

---

### **Escenario 2: Corrigiendo error**

**Pasos:**
1. Campo tiene error visible: `Proy$` ❌
2. Hacer clic en el campo
3. Borrar `$`
4. **Error desaparece INMEDIATAMENTE** (validación en tiempo real)
5. Escribir `ecto`
6. **Check verde aparece** ✓

**Resultado esperado:**
- ✅ Validación en tiempo real mientras corrige
- ✅ Feedback positivo inmediato

---

### **Escenario 3: Campo válido desde el inicio**

**Pasos:**
1. Hacer clic en el campo
2. Escribir: `Proyecto Norte`
3. Hacer clic fuera del campo
4. **Check verde aparece** ✓
5. **Borde verde** alrededor del input

**Resultado esperado:**
- ✅ Feedback positivo
- ✅ Usuario sabe que está correcto

---

## 🔍 Checklist de Verificación Manual

### **Validación de Caracteres**
- [ ] Nombre rechaza `$, @, #, %, &, *, =, +, <, >`
- [ ] Nombre acepta `á, é, í, ó, ú, ñ, Ñ`
- [ ] Nombre acepta `-, _, ., (, )`
- [ ] Ubicación rechaza `@, $, &, *, =`
- [ ] Ubicación acepta `#` (para direcciones)
- [ ] Ubicación acepta `°` (para coordenadas)
- [ ] Descripción rechaza `@, #, <, >, +, =`
- [ ] Descripción acepta `¿, ?, ¡, !, $, %`

### **Validación Progresiva (UX)**
- [ ] NO muestra error mientras escribe (primera vez)
- [ ] SÍ muestra error al salir del campo (onBlur)
- [ ] SÍ valida en tiempo real si ya hay error (onChange)
- [ ] Check verde aparece cuando es válido
- [ ] Borde verde en campos válidos
- [ ] Borde rojo en campos con error
- [ ] Animación suave (fade-in) en iconos

### **Mensajes de Ayuda**
- [ ] Hint informativo visible cuando NO hay error
- [ ] Error específico visible cuando hay error
- [ ] Hint desaparece cuando hay error (no se superponen)

### **Límites de Caracteres**
- [ ] Nombre: máximo 100 caracteres
- [ ] Ubicación: máximo 200 caracteres
- [ ] Descripción: máximo 1000 caracteres
- [ ] No permite escribir más del límite (maxLength)

### **Accesibilidad**
- [ ] Labels con `*` para campos requeridos
- [ ] aria-invalid en campos con error
- [ ] role="alert" en mensajes de error

---

## 🎮 Prueba Interactiva Rápida

### **Copiar y pegar estos valores para probar:**

**✅ VÁLIDOS:**
```
Nombre: Urbanización Los Pinos 2025
Ubicación: Calle 123 #45-67, Medellín, Antioquia
Descripción: Proyecto de vivienda de interés social con 50 unidades habitacionales de 3 pisos. Presupuesto: $1.500.000.000. ¿Incluye áreas verdes? ¡Sí!
```

**❌ INVÁLIDOS (para probar errores):**
```
Nombre: Proyecto $100M @Premium
Ubicación: Barrio & Sector @ Centro
Descripción: Email: info@proyecto.com <script>alert('test')</script>
```

---

## 📊 Resultados Esperados

### **Input válido:**
```
┌────────────────────────────────┐
│ Nombre del Proyecto *          │
│ ┌────────────────────────────┐ │
│ │ Urbanización Los Pinos ✓  │ │ ← Verde con check
│ └────────────────────────────┘ │
│ Solo letras, números...        │ ← Hint gris
└────────────────────────────────┘
```

### **Input inválido:**
```
┌────────────────────────────────┐
│ Nombre del Proyecto *          │
│ ┌────────────────────────────┐ │
│ │ Proyecto $100M         ❌  │ │ ← Rojo con X
│ └────────────────────────────┘ │
│ ❌ Solo se permiten letras...  │ ← Error rojo
└────────────────────────────────┘
```

---

## ✅ Criterios de Aceptación

1. ✅ **Validación onBlur:** No muestra errores mientras escribe la primera vez
2. ✅ **Validación onChange:** Valida en tiempo real si ya hay error
3. ✅ **Regex correctos:** Rechazan caracteres no permitidos
4. ✅ **Mensajes específicos:** Errores claros y accionables
5. ✅ **Feedback visual:** Iconos ✓ ❌ con colores apropiados
6. ✅ **Límites de longitud:** maxLength funciona correctamente
7. ✅ **Modo oscuro:** Estilos funcionan en dark mode
8. ✅ **Accesibilidad:** Labels, aria-invalid, roles correctos
9. ✅ **Animaciones:** Transiciones suaves y agradables
10. ✅ **Responsive:** Funciona en móvil, tablet y desktop
