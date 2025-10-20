# 🚨 DECISIÓN CRÍTICA: Flujo de Negociaciones

## TU SOLICITUD

> "Necesitamos que en el momento en el que empezamos a configurar la negociación ahí mismo debemos dejar de una vez el cierre financiero configurado. Si creamos negociaciones pero nunca las cerramos se nos puede llenar de muchas negociaciones que no se cerraron. La idea es que una vez vayamos a establecer una negociación es porque vamos a generar ya un vínculo de un cliente con una vivienda y va a quedar configurado ya para recibir abonos."

---

## 📊 RESUMEN EJECUTIVO

### Flujo ACTUAL ❌
```
1. Click "Crear Negociación"
2. Llenar: Cliente + Vivienda + Valor
3. Se guarda en DB con estado "En Proceso"
4. Usuario debe ir aparte a "Configurar Cierre Financiero"
5. Usuario debe agregar fuentes de pago manualmente
6. Si el usuario se olvida → Negociación incompleta
```

### Flujo PROPUESTO ✅
```
1. Click "Crear Negociación"
2. PASO 1: Cliente + Vivienda + Valor
3. PASO 2: Configurar Fuentes de Pago (OBLIGATORIO)
   ├─ Cuota Inicial (obligatoria)
   ├─ Crédito Hipotecario (opcional)
   ├─ Subsidio Mi Casa Ya (opcional)
   └─ Subsidio Caja (opcional)

   ⚠️ Validación: Suma de fuentes = Valor total

4. PASO 3: Revisión y confirmación
5. Se guarda TODO junto:
   ├─ Negociación con estado "Cierre Financiero"
   ├─ Todas las fuentes de pago configuradas
   └─ Vivienda marcada como "reservada"

6. ✅ Listo para recibir abonos inmediatamente
```

---

## ❓ PREGUNTAS CLAVE PARA TI

### 1️⃣ **Fuentes de Pago Típicas**

**Pregunta**: ¿Cuáles son las fuentes de pago que usualmente manejan en sus ventas?

He identificado 4 en el código:
- ✅ **Cuota Inicial** (siempre)
- ✅ **Crédito Hipotecario** (banco)
- ✅ **Subsidio Mi Casa Ya** (gobierno)
- ✅ **Subsidio Caja Compensación** (caja)

**¿Es correcto?** ¿Hay otras fuentes que debamos considerar?

---

### 2️⃣ **Validación Estricta**

**Propuesta**: NO permitir crear la negociación si la suma de fuentes ≠ valor total

**Ejemplo**:
```
Vivienda: $120,000,000
Descuento: -$5,000,000
─────────────────────────
Valor Total: $115,000,000

Fuentes configuradas:
├─ Cuota Inicial: $20,000,000
├─ Crédito Hipotecario: $95,000,000
─────────────────────────
Total Fuentes: $115,000,000 ✅ PERMITE CREAR

Si el usuario pone:
├─ Cuota Inicial: $20,000,000
├─ Crédito Hipotecario: $90,000,000
─────────────────────────
Total Fuentes: $110,000,000 ❌ NO PERMITE CREAR
(Faltan $5,000,000)
```

**¿De acuerdo con esta validación estricta?**

---

### 3️⃣ **Cuota Inicial Mínima**

**Pregunta**: ¿Hay un porcentaje mínimo para la cuota inicial?

Opciones:
- A) No hay mínimo (puede ser cualquier valor > 0)
- B) Mínimo 10% del valor total
- C) Mínimo 20% del valor total
- D) Otro: __________%

**Tu preferencia**: [ ]

---

### 4️⃣ **Documentos en Creación**

**Pregunta**: ¿Requieres subir documentos al CREAR la negociación o pueden agregarse después?

**Documentos posibles**:
- Carta de aprobación de crédito
- Carta de asignación de subsidio
- Promesa de compraventa
- Evidencia de envío de correo

**Opciones**:
- A) Documentos opcionales al crear (pueden subirse después)
- B) Carta de crédito OBLIGATORIA si tiene crédito hipotecario
- C) Todas las cartas de subsidio OBLIGATORIAS si tiene subsidios

**Tu preferencia**: [ ]

---

### 5️⃣ **Diseño del Modal**

**Opción A: Stepper Lineal** (mi propuesta)
```
[1. Info Básica] → [2. Fuentes] → [3. Revisión]
```
- ✅ Proceso guiado paso a paso
- ✅ Usuario no se pierde
- ✅ Validación por etapa
- ❌ Más clicks para completar

**Opción B: Formulario Largo con Secciones**
```
┌─────────────────────────────┐
│ Info Básica                  │
├─────────────────────────────┤
│ Fuentes de Pago              │
├─────────────────────────────┤
│ [Botón Crear]                │
└─────────────────────────────┘
```
- ✅ Todo en una pantalla
- ✅ Menos clicks
- ❌ Puede ser abrumador
- ❌ Scroll largo

**Tu preferencia**: [ ] A (Stepper)  [ ] B (Formulario largo)

---

### 6️⃣ **Estado Inicial de la Negociación**

**Pregunta**: Después de crear con cierre financiero configurado, ¿cuál debe ser el estado?

**Opciones**:
- A) `"Cierre Financiero"` (indica que está configurado pero sin abonos)
- B) `"Activa"` (lista para recibir abonos)
- C) `"Pendiente"` (esperando primer abono)

**Mi recomendación**: **A** → Cambiar a "Activa" cuando se reciba el primer abono

**Tu preferencia**: [ ]

---

### 7️⃣ **Negociaciones Existentes**

**Pregunta**: ¿Qué hacemos con negociaciones que ya están en "En Proceso" sin fuentes de pago?

**Opciones**:
- A) Dejarlas tal cual, solo las nuevas siguen el nuevo flujo
- B) Marcarlas como "Incompletas" para que admin las complete
- C) Crear automáticamente una fuente genérica con el valor total
- D) Eliminarlas (si son de prueba)

**Tu preferencia**: [ ]

---

### 8️⃣ **Edición Posterior**

**Pregunta**: Si después de crear necesitan modificar las fuentes de pago, ¿debería ser posible?

**Escenario**:
```
Cliente tenía:
- Cuota: $20M
- Crédito: $100M

Banco rechazó el crédito. Ahora será:
- Cuota: $40M
- Crédito: $80M
```

**Opciones**:
- A) No se puede modificar (crear nueva negociación)
- B) Se puede modificar SOLO si no hay abonos registrados
- C) Se puede modificar siempre (con auditoría)

**Tu preferencia**: [ ]

---

## ✅ PRÓXIMOS PASOS

Una vez confirmes:

1. **Respuestas a las 8 preguntas** ☝
2. Creo los componentes base (Stepper, Cards)
3. Rediseño el modal completo
4. Actualizo la lógica (hook + servicio)
5. Testing exhaustivo
6. Deploy

**Tiempo estimado**: 6-8 horas de desarrollo

---

## 📝 TU RESPUESTA

Por favor copia esto y llena:

```
1. Fuentes de pago: [✅ Correcto / ❌ Falta: _______]
2. Validación estricta (suma = total): [✅ Sí / ❌ No]
3. Cuota inicial mínima: [A/B/C/D: ___]
4. Documentos en creación: [A/B/C]
5. Diseño del modal: [A/B]
6. Estado inicial: [A/B/C]
7. Negociaciones existentes: [A/B/C/D]
8. Edición posterior: [A/B/C]

Comentarios adicionales:
_______________________________
```

---

**¿Listo para que empiece?** 🚀
