# 🔍 ANÁLISIS DEL FLUJO DE NEGOCIACIONES

**Fecha**: 20 de octubre de 2025
**Objetivo**: Reevaluar el flujo actual e identificar mejoras

---

## 📊 FLUJO ACTUAL (AS-IS)

### FASE 1: Creación del Cliente
```
1. Usuario va a /clientes
2. Click "Nuevo Cliente"
3. Formulario completo:
   - Nombres y apellidos
   - ✅ Tipo de documento (CC, CE, NIT, Pasaporte)
   - ✅ Número de documento (texto)
   - Fecha nacimiento
   - Teléfono y email
   - Dirección, ciudad, departamento
   - Origen (Redes, Referido, Valla, etc.)
   - Notas
4. Cliente creado → Estado: "Activo"
5. **PROBLEMA**: El ARCHIVO de la cédula (imagen/PDF) NO se sube aquí
```

**Issues identificados**:
- ✅ Número de documento SÍ se captura
- ❌ Archivo/imagen de la cédula NO se sube (campo `documento_identidad_url` queda NULL)
- ⚠️ No hay prompt para subir el archivo después de crear
- ⚠️ Formulario extenso pero campos son relevantes

---

### FASE 2: Registro de Interés
```
1. Usuario entra a detalle del cliente (/clientes/[id])
2. Tab "Intereses"
3. Click "Registrar Interés"
4. Modal solicita:
   - Proyecto
   - Vivienda
   - Valor estimado
   - Descripción
5. Interés creado → Estado: "Activo"
```

**Issues identificados**:
- ⚠️ Paso intermedio que podría ser opcional
- ⚠️ "Valor estimado" vs "Valor negociado" causa confusión
- ❓ ¿Realmente necesitamos intereses separados de negociaciones?

---

### FASE 3: Subir Archivo de Cédula (REQUISITO CRÍTICO)
```
1. Usuario debe ir manualmente a detalle del cliente
2. Buscar botón/sección para subir documento
3. Subir archivo (imagen o PDF de la cédula)
4. **PROBLEMA**: No hay indicador visual claro de que falta
5. **PROBLEMA**: No hay recordatorio ni checklist
```

**Issues identificados**:
- ❌ Paso fácil de olvidar (no es obligatorio en el flujo visual)
- ❌ No hay notificación de "falta subir cédula"
- ❌ Usuario puede avanzar sin esto y recién se entera al crear negociación
- ⚠️ Debería ser parte del wizard de crear cliente o tener un prompt después

---

### FASE 4: Crear Negociación
```
1. Usuario en detalle del cliente
2. Click botón "Crear Negociación" (header)
3. Modal ModalCrearNegociacion:
   - Seleccionar proyecto
   - Seleccionar vivienda (filtra por disponibles del proyecto)
   - Ingresar valor negociado (formato $XXX.XXX.XXX)
   - Ingresar descuento opcional (formato $XXX.XXX.XXX)
   - Ver cálculo automático de valor total
   - Notas opcionales
4. Click "Crear"
5. **VALIDACIÓN CRÍTICA**: Sistema verifica documento_identidad_url
   - ❌ SI NO TIENE ARCHIVO: Error "El cliente debe tener cargada su cédula..."
   - ✅ SI TIENE ARCHIVO: Continúa
6. **VALIDACIÓN**: Verifica que no exista negociación activa
7. Negociación creada → Estado: "En Proceso"
```

**Issues identificados**:
- ✅ Validación de archivo de cédula funciona
- ❌ Pero la validación es TARDÍA (usuario ya llenó todo el modal)
- ⚠️ Modal tiene varios campos, pero son necesarios
- ✅ Formato de moneda es claro
- ❓ ¿El valor negociado podría pre-llenarse del valor de la vivienda?
- ❓ ¿El descuento es común o caso especial?

---

### FASE 5: Configurar Cierre Financiero
```
1. Usuario navega a Tab "Negociaciones"
2. Click "Ver" en la negociación creada
3. Página de detalle carga
4. Click "Configurar Cierre Financiero"
5. Componente CierreFinanciero se expande:
   - Muestra resumen (valor total, progreso, diferencia)
   - Botones para agregar 4 fuentes de pago
6. Usuario agrega fuentes una por una:

   A. CUOTA INICIAL:
      - Click "Agregar Cuota Inicial"
      - Ingresar monto (con formato $)
      - NO pide entidad
      - NO pide número de referencia
      - Puede agregar múltiples

   B. CRÉDITO HIPOTECARIO:
      - Click "Agregar Crédito Hipotecario"
      - Ingresar monto aprobado
      - **SELECT obligatorio**: Banco (7 opciones)
      - Número de referencia (opcional)
      - **UPLOAD obligatorio**: Carta de aprobación
      - Solo puede agregar 1

   C. SUBSIDIO MI CASA YA:
      - Click "Agregar Subsidio Mi Casa Ya"
      - Ingresar monto aprobado
      - NO pide entidad
      - Número de referencia (opcional)
      - NO pide documento
      - Solo puede agregar 1

   D. SUBSIDIO CAJA COMPENSACIÓN:
      - Click "Agregar Subsidio Caja Compensación"
      - Ingresar monto aprobado
      - Input texto: Entidad (ej: Comfandi)
      - Número de referencia (opcional)
      - **UPLOAD obligatorio**: Carta de aprobación
      - Solo puede agregar 1

7. Click "Guardar Fuentes"
8. **VALIDACIÓN**:
   - Todos los montos > 0
   - Entidades requeridas completadas
   - **Documentos obligatorios subidos**
9. Sistema actualiza estado a "Cierre Financiero"
10. Recarga componente mostrando fuentes guardadas
```

**Issues identificados**:
- ❌ **FLUJO MUY LARGO**: Agregar cada fuente es tedioso
- ❌ **MUCHOS CLICKS**: Agregar fuente → llenar campos → guardar → repetir
- ⚠️ Validación de documentos solo al final (podría ser inline)
- ⚠️ Usuario puede olvidar agregar fuentes importantes
- ⚠️ No hay "template" o "sugerencia" de fuentes comunes
- ❓ ¿Siempre se usan las mismas combinaciones? (ej: Cuota + Crédito)

---

### FASE 6: Activar Negociación
```
1. Usuario ve barra de progreso en verde (100%)
2. Click "Activar Negociación"
3. **VALIDACIÓN FINAL**:
   - Suma de fuentes = 100% del valor total
   - Todos los documentos requeridos subidos
4. Negociación → Estado: "Activa"
5. Timeline avanza a paso 3
```

**Issues identificados**:
- ✅ Este paso está bien
- ⚠️ Pero llegó aquí después de MUCHOS pasos previos

---

### FASE 7: Registrar Abonos (FUTURO)
```
1. Usuario en negociación activa
2. Tab "Abonos" o sección similar
3. Registrar pagos reales vs proyectados
4. Cuando suma = 100% → Marcar como "Completada"
```

**Issues identificados**:
- ⏳ Aún no implementado
- ❓ ¿Cómo se vinculan los abonos a las fuentes de pago?

---

## 🚨 PROBLEMAS PRINCIPALES IDENTIFICADOS

### 1. **Flujo Fragmentado**
- Cliente → Interés → Negociación → Cierre → Activar
- **5 pasos separados** antes de empezar a registrar abonos
- Usuario puede perderse en el camino

### 2. **Validaciones Tardías**
- Cédula se valida DESPUÉS de intentar crear negociación
- Documentos de fuentes se validan DESPUÉS de configurar todo
- No hay checklist visible de requisitos previos

### 3. **UI Compleja en Cierre Financiero**
- Agregar fuentes es repetitivo
- Demasiados modales/componentes anidados
- No hay shortcuts para casos comunes

### 4. **Campos Redundantes**
- "Valor estimado" (interés) vs "Valor negociado" (negociación)
- ¿Por qué tener ambos?

### 5. **Falta de Guía**
- No hay wizard o stepper claro
- Usuario no sabe qué falta completar
- No hay vista de "checklist de requisitos"

---

## 💡 PROPUESTAS DE MEJORA

### OPCIÓN A: **Simplificar eliminando Intereses** ⭐ RECOMENDADA

**Razonamiento**:
- Un "interés" es una negociación en etapa temprana
- ¿Por qué tener 2 tablas separadas?
- Podemos unificar en una sola tabla `negociaciones` con más estados

**Nuevo flujo**:
```
1. Crear Cliente (con cédula obligatoria desde el inicio)
2. Crear Negociación (más simple, menos campos)
3. Configurar Cierre (wizard guiado paso a paso)
4. Activar
5. Registrar Abonos
```

**Ventajas**:
- ✅ 3 pasos en lugar de 5
- ✅ Menos confusión
- ✅ Menos código duplicado

---

### OPCIÓN B: **Wizard Guiado para Cierre Financiero**

**Implementación**:
```tsx
// En lugar de agregar fuentes una por una...
// Usar un wizard de 3 pasos:

PASO 1: ¿Qué fuentes usarás?
  [ ] Cuota Inicial
  [ ] Crédito Hipotecario
  [ ] Subsidio Mi Casa Ya
  [ ] Subsidio Caja Compensación
  [Siguiente]

PASO 2: Configurar cada fuente (tabs o accordion)
  Tab: Cuota Inicial
    - Monto: $____________
    [+ Agregar otro abono]

  Tab: Crédito Hipotecario
    - Banco: [Select]
    - Monto: $____________
    - Carta: [Upload] ✅

  [Siguiente]

PASO 3: Verificación
  ✓ Cuota Inicial: $50.000.000
  ✓ Crédito: $80.000.000 (Bancolombia) ✅
  ✓ Total: $130.000.000 (100% cubierto)
  [Activar Negociación]
```

**Ventajas**:
- ✅ Flujo guiado claro
- ✅ Se ven todas las fuentes de una vez
- ✅ Validación progresiva

---

### OPCIÓN C: **Templates de Cierre Comunes**

**Implementación**:
```tsx
// Antes de configurar fuentes manualmente...
// Ofrecer templates:

┌─────────────────────────────────┐
│ Selecciona un template común:   │
│                                  │
│ ○ Cuota + Crédito (más común)  │
│ ○ Cuota + Crédito + Subsidio   │
│ ○ Solo Cuota Inicial           │
│ ○ Personalizado                │
└─────────────────────────────────┘

// Si elige "Cuota + Crédito":
// El sistema pre-carga 2 fuentes vacías
// Usuario solo llena montos y sube documentos
```

**Ventajas**:
- ✅ Más rápido para casos comunes
- ✅ Reduce clicks
- ✅ Guía a usuarios nuevos

---

### OPCIÓN D: **Checklist de Requisitos Visible**

**Implementación**:
```tsx
// En la página de detalle de negociación:
// Sidebar o card destacado:

┌─────────────────────────────────┐
│ 📋 Checklist de Activación      │
├─────────────────────────────────┤
│ ✅ Cliente creado               │
│ ✅ Cédula subida                │
│ ✅ Negociación creada           │
│ ⏳ Cierre financiero (60%)      │
│   ✅ Cuota inicial configurada  │
│   ❌ Crédito hipotecario        │
│      ⚠️ Falta carta aprobación │
│ ❌ Activar negociación          │
└─────────────────────────────────┘
```

**Ventajas**:
- ✅ Usuario sabe qué falta
- ✅ Reduce errores
- ✅ Mejor UX

---

## 🎯 RECOMENDACIÓN FINAL (CORREGIDA)

### Implementar en este orden:

1. **CRÍTICO - HOY** (validación temprana):
   - ✅ **Agregar alerta visual** en detalle del cliente si falta archivo de cédula
   - ✅ **Botón prominente** "Subir Cédula" antes de poder crear negociación
   - ✅ **Validar archivo de cédula** ANTES de abrir modal de crear negociación
   - ✅ **Pre-llenar valor negociado** con el valor de la vivienda seleccionada

2. **ALTO IMPACTO - HOY/MAÑANA**:
   - ✅ **Checklist de requisitos visible** (Opción D) en página de negociación
   - ✅ **Wizard de 3 pasos** para cierre financiero (más guiado)
   - ✅ **Templates de fuentes comunes** (Opción C)

3. **MEDIANO PLAZO**:
   - ⚠️ **Evaluar si eliminar tabla de intereses** (requiere análisis de negocio)
   - ✅ **Simplificar modal de crear negociación** (menos campos visibles por defecto)

4. **LARGO PLAZO**:
   - Implementar módulo de abonos
   - Dashboard de negociaciones activas
   - Reportes y analytics

---

## 🚀 ACCIÓN INMEDIATA SUGERIDA

**¿Quieres que implemente el VALIDADOR TEMPRANO de cédula?**

Esto incluiría:
1. Alert banner en detalle del cliente: "⚠️ Falta subir cédula"
2. Botón "Subir Cédula" prominente
3. Deshabilitar botón "Crear Negociación" hasta que se suba
4. O mostrar modal de "Primero sube la cédula" antes de crear negociación

**Esto mejoraría inmediatamente la UX y evitaría frustración del usuario** ✅

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS (PROPUESTA)

### ANTES (Flujo actual):
```
Cliente → Subir cédula → Interés → Negociación →
→ Cierre (agregar fuente 1) → (agregar fuente 2) → ... →
→ Guardar → Activar → Listo
```
**Total: ~15-20 clicks**

### DESPUÉS (Con mejoras):
```
Cliente (con cédula) → Negociación (wizard) →
→ Cierre (template + 3 pasos) → Activar → Listo
```
**Total: ~8-10 clicks**

---

## ❓ PREGUNTAS CLAVE PARA EL USUARIO

1. **¿Dónde y cómo suben actualmente el archivo de la cédula?**
   - ¿Hay un botón visible en detalle del cliente?
   - ¿O se hace desde otro lado?

2. **¿Los "intereses" son realmente necesarios como paso separado?**
   - ¿O podemos ir directo a crear negociación?
   - ¿Un interés es solo "una negociación que aún no está lista"?

3. **¿Qué combinaciones de fuentes de pago son más comunes?**
   - Para crear templates (Cuota + Crédito, Cuota + Crédito + Subsidio, etc.)

4. **¿El descuento en negociaciones es frecuente?**
   - Si es raro, podemos ocultarlo y mostrarlo solo con un botón "Agregar descuento"

5. **¿El "valor negociado" siempre es igual al valor de la vivienda?**
   - Si sí, podemos pre-llenarlo automáticamente

6. **¿En qué momento del proceso real se registran los abonos?**
   - Para diseñar bien esa fase (próximo módulo)

---

## 🔄 PRÓXIMOS PASOS SUGERIDOS

1. **Responder preguntas de negocio** ↑
2. **Decidir qué mejoras implementar**
3. **Crear checklist de requisitos visible** (rápido, alto impacto)
4. **Rediseñar cierre financiero con wizard** (mediano, alto impacto)
5. **Simplificar creación de negociación** (rápido, impacto medio)

---

**¿Qué opción(es) quieres que implemente primero?** 🚀
