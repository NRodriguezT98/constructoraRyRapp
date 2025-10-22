# 🧪 PLAN DE TESTING E2E - Sistema de Negociaciones

**Fecha**: 2025-10-22
**Estado**: ⏳ PENDIENTE
**Prerequisito**: ✅ Refactorización CierreFinanciero completada

---

## 🎯 OBJETIVO

Validar el flujo completo del sistema de negociaciones después de la refactorización, asegurando que:
1. Las negociaciones se crean correctamente en estado `'Activa'`
2. Las fuentes de pago se configuran sin problemas
3. Los estados de transición funcionan correctamente
4. Los triggers de BD calculan valores automáticamente

---

## 📋 ESCENARIO 1: Flujo Completo Exitoso

### Pre-condiciones
- [ ] Usuario autenticado con rol `admin`
- [ ] Base de datos con esquema actualizado (migración 003)
- [ ] Al menos 1 proyecto con viviendas disponibles

### Pasos del Test

#### 1️⃣ CREAR CLIENTE
```
Acción: Ir a /clientes → "Nuevo Cliente"
Datos:
  - Nombres: "Juan Carlos"
  - Apellidos: "Pérez García"
  - Cédula: "1234567890" (única)
  - Teléfono: "3001234567"
  - Email: "juan.perez@example.com"
  - Dirección: "Calle 123 #45-67"

Resultado Esperado:
  ✅ Cliente creado con estado = 'Interesado'
  ✅ Redirección a /clientes/[id]
  ✅ Card del cliente visible en lista
```

#### 2️⃣ ASIGNAR VIVIENDA
```
Acción: En detalle del cliente → Tab "Negociaciones" → "Nueva Negociación"
Paso 1 - Seleccionar Vivienda:
  - Proyecto: "Torre Vista Hermosa"
  - Vivienda: Casa #101 (estado='Disponible')
  - Confirmar selección

Resultado Esperado:
  ✅ Vivienda seleccionada visible en preview
  ✅ Botón "Siguiente" habilitado
  ✅ Vivienda muestra precio correcto
```

#### 3️⃣ CREAR NEGOCIACIÓN
```
Acción: Paso 2 - Configurar Negociación
Datos:
  - Valor Total: $150.000.000 (autocompletado desde vivienda)
  - Valor Negociado: $145.000.000
  - Descuento: $5.000.000
  - Notas: "Cliente con buen historial crediticio"

Resultado Esperado:
  ✅ Negociación creada con estado = 'Activa' ⭐
  ✅ Cliente cambia a estado = 'Activo' ⭐
  ✅ Vivienda cambia a estado = 'Asignada' ⭐
  ✅ Fecha de negociación = hoy
  ✅ Redirección a detalle de negociación
```

#### 4️⃣ VERIFICAR DETALLE NEGOCIACIÓN
```
Acción: En /clientes/[id]/negociaciones/[negId]
Verificar:
  - Header muestra: "Negociación Activa" con badge verde
  - Valores correctos:
    * Valor Total: $145.000.000
    * Cliente: "Juan Carlos Pérez García"
    * Vivienda: "Casa #101"
  - Timeline muestra estado actual
  - Componente <ConfigurarFuentesPago /> es visible ⭐

Resultado Esperado:
  ✅ Toda la información correcta
  ✅ No hay errores en consola
  ✅ Componente de fuentes renderizado
```

#### 5️⃣ AGREGAR FUENTE: Cuota Inicial
```
Acción: En sección "Configurar Fuentes de Pago"
Datos:
  - Tipo: "Cuota Inicial"
  - Monto: $30.000.000
  - Guardar

Resultado Esperado:
  ✅ Fuente agregada exitosamente
  ✅ Barra de progreso: 20.69% (amarilla)
  ✅ Falta: $115.000.000
  ✅ Card de fuente visible
```

#### 6️⃣ AGREGAR FUENTE: Crédito Hipotecario
```
Acción: Agregar segunda fuente
Datos:
  - Tipo: "Crédito Hipotecario"
  - Banco: "Bancolombia"
  - Monto Aprobado: $80.000.000
  - Número Referencia: "CRED-2024-001"
  - Carta Aprobación: Subir PDF

Resultado Esperado:
  ✅ Fuente agregada
  ✅ Barra de progreso: 75.86% (amarilla)
  ✅ Falta: $35.000.000
  ✅ Documento subido correctamente
  ✅ Link "Ver documento" funciona
```

#### 7️⃣ AGREGAR FUENTE: Subsidio Mi Casa Ya
```
Acción: Agregar tercera fuente
Datos:
  - Tipo: "Subsidio Mi Casa Ya"
  - Monto Aprobado: $25.000.000

Resultado Esperado:
  ✅ Fuente agregada
  ✅ Barra de progreso: 93.10% (amarilla)
  ✅ Falta: $10.000.000
```

#### 8️⃣ AGREGAR FUENTE: Subsidio Caja
```
Acción: Agregar cuarta fuente
Datos:
  - Tipo: "Subsidio Caja Compensación"
  - Entidad: "Comfandi"
  - Monto Aprobado: $10.000.000
  - Carta Aprobación: Subir PDF

Resultado Esperado:
  ✅ Fuente agregada
  ✅ Barra de progreso: 100% (verde) ⭐
  ✅ Diferencia: $0
  ✅ Mensaje: "¡Fuentes de Pago Completas!" ⭐
```

#### 9️⃣ GUARDAR FUENTES
```
Acción: Clic en "Guardar Fuentes"

Resultado Esperado:
  ✅ Loading spinner visible
  ✅ Alert "✅ Fuentes de pago guardadas correctamente"
  ✅ Estado de negociación sigue siendo 'Activa' ⭐
  ✅ Fuentes persisten al recargar página
```

#### 🔟 COMPLETAR NEGOCIACIÓN
```
Acción: Sección "Acciones" → "Completar Negociación"
Confirmación: "¿Confirmar que la negociación está completada (100% pagado)?"

Resultado Esperado:
  ✅ Negociación cambia a estado = 'Completada' ⭐
  ✅ Vivienda cambia a estado = 'Entregada' ⭐
  ✅ Cliente cambia a estado = 'Propietario' ⭐
  ✅ Fecha de completado = hoy ⭐
  ✅ Badge azul "Completada"
  ✅ Botones de acciones desaparecen
```

---

## 📋 ESCENARIO 2: Flujo con Renuncia

### Pre-condiciones
- [ ] Cliente con negociación activa
- [ ] Fuentes de pago configuradas (puede ser parcial)

### Pasos del Test

#### 1️⃣ REGISTRAR RENUNCIA
```
Acción: Sección "Acciones" → "Registrar Renuncia"
Datos:
  - Motivo: "Cliente no consiguió financiación bancaria"

Resultado Esperado:
  ✅ Modal de renuncia se muestra
  ✅ Textarea obligatorio
  ✅ Al confirmar:
    - Negociación cambia a estado = 'Cerrada por Renuncia' ⭐
    - Cliente cambia a estado = 'En Proceso de Renuncia' ⭐
    - Vivienda cambia a estado = 'Disponible' ⭐
    - Registro creado en tabla `renuncias` ⭐
    - Badge gris "Cerrada por Renuncia"
```

#### 2️⃣ VERIFICAR RENUNCIA
```
Acción: En detalle de negociación
Verificar:
  - Estado correcto
  - Motivo visible
  - Fecha de renuncia
  - Botones de acciones desaparecen

Resultado Esperado:
  ✅ Toda información de renuncia visible
  ✅ No se puede editar la negociación
```

---

## 📋 ESCENARIO 3: Validaciones

### Test 3.1: Fuentes Incompletas
```
Situación: Fuentes suman < 100%
Acción: Intentar completar negociación

Resultado Esperado:
  ❌ Botón "Completar Negociación" deshabilitado ⭐
  ⚠️ Mensaje: "Configuración Incompleta"
  ⚠️ Indica cuánto falta
```

### Test 3.2: Fuentes en Exceso
```
Situación: Fuentes suman > 100%
Acción: Agregar fuente que exceda el valor total

Resultado Esperado:
  ⚠️ Barra de progreso roja
  ⚠️ Mensaje: "excede $X"
  ❌ Botón "Completar Negociación" deshabilitado
```

### Test 3.3: Documento Obligatorio
```
Situación: Crédito Hipotecario sin carta de aprobación
Acción: Intentar guardar fuentes

Resultado Esperado:
  ❌ Error: "Crédito Hipotecario requiere carta de aprobación del banco"
  ❌ No se guarda
```

### Test 3.4: Entidad Requerida
```
Situación: Crédito Hipotecario sin seleccionar banco
Acción: Intentar guardar fuentes

Resultado Esperado:
  ❌ Error: "La fuente requiere especificar la entidad"
  ❌ No se guarda
```

### Test 3.5: Múltiples Cuotas Iniciales
```
Situación: Ya existe una "Cuota Inicial"
Acción: Agregar otra "Cuota Inicial"

Resultado Esperado:
  ✅ Permite agregar (múltiples permitidas) ⭐
  ✅ Muestra "Abono #2"
```

### Test 3.6: Duplicar Crédito Hipotecario
```
Situación: Ya existe un "Crédito Hipotecario"
Acción: Agregar otro "Crédito Hipotecario"

Resultado Esperado:
  ❌ Error: "Ya existe una fuente de tipo Crédito Hipotecario"
  ❌ Botón deshabilitado con "Ya agregado"
```

---

## 📋 ESCENARIO 4: Triggers de Base de Datos

### Test 4.1: Constraint - Completada Requiere Fecha
```
Acción: Completar negociación

Verificación en BD:
  SELECT fecha_completado FROM negociaciones WHERE id = '[id]';

Resultado Esperado:
  ✅ fecha_completado IS NOT NULL ⭐
  ✅ fecha_completado = NOW()
```

### Test 4.2: Constraint - Renuncia Requiere Fecha
```
Acción: Registrar renuncia

Verificación en BD:
  SELECT fecha_renuncia FROM negociaciones WHERE id = '[id]';

Resultado Esperado:
  ✅ fecha_renuncia IS NOT NULL ⭐
  ✅ fecha_renuncia = NOW()
```

### Test 4.3: Constraint - Vivienda Asignada Tiene Negociación
```
Situación: Vivienda con estado='Asignada'

Verificación en BD:
  SELECT negociacion_id FROM viviendas WHERE id = '[id]';

Resultado Esperado:
  ✅ negociacion_id IS NOT NULL ⭐
```

### Test 4.4: Cálculo Automático - Valor Descuento
```
Datos:
  - valor_total = $150.000.000
  - valor_negociado = $145.000.000

Verificación en BD:
  SELECT valor_descuento FROM negociaciones WHERE id = '[id]';

Resultado Esperado:
  ✅ valor_descuento = $5.000.000 (calculado automáticamente) ⭐
```

---

## 📋 ESCENARIO 5: Persistencia y Recarga

### Test 5.1: Recarga de Página
```
Acción:
  1. Crear negociación activa
  2. Configurar 2 fuentes de pago
  3. Recargar página (F5)

Resultado Esperado:
  ✅ Negociación mantiene estado 'Activa'
  ✅ 2 fuentes de pago siguen visibles
  ✅ Barra de progreso correcta
  ✅ Documentos subidos siguen disponibles
```

### Test 5.2: Navegación Ida y Vuelta
```
Acción:
  1. Estar en detalle de negociación
  2. Ir a lista de clientes
  3. Volver a detalle de negociación

Resultado Esperado:
  ✅ Datos persisten
  ✅ No se pierde información
  ✅ Loading smooth
```

---

## 🐛 BUGS COMUNES A VERIFICAR

### Bug 1: Estado No Cambia
```
Síntoma: Negociación se crea pero queda en estado null o incorrecto
Verificar:
  - Query de creación incluye estado='Activa'
  - No hay RLS bloqueando el insert
  - Cliente tiene permisos
```

### Bug 2: Fuentes No Persisten
```
Síntoma: Fuentes se agregan pero desaparecen al recargar
Verificar:
  - Insert en tabla fuentes_pago exitoso
  - negociacion_id está correcto
  - RLS permite select
```

### Bug 3: Barra de Progreso No Actualiza
```
Síntoma: Agregar fuente pero barra no cambia
Verificar:
  - calcularTotales() se ejecuta
  - useEffect tiene dependencias correctas [fuentesPago, valorTotal]
  - Porcentaje se calcula correctamente
```

### Bug 4: Documentos No Suben
```
Síntoma: Click en "Subir" pero nada pasa
Verificar:
  - Bucket 'fuentes-pago' existe
  - RLS permite upload
  - Archivo no excede 5MB
  - Tipo de archivo permitido (.pdf, .jpg, .png)
```

### Bug 5: Completar No Funciona
```
Síntoma: Click en "Completar" pero nada pasa
Verificar:
  - puedeCompletarse = true
  - Fuentes suman exactamente 100%
  - No hay constraint bloqueando
  - Trigger set_fecha_completado funciona
```

---

## ✅ CRITERIOS DE ÉXITO

El testing se considera **exitoso** si:

1. ✅ **Flujo Completo**: Crear → Configurar → Completar sin errores
2. ✅ **Estados Correctos**: Todos los estados cambian según lo esperado
3. ✅ **Triggers Funcionan**: Fechas y cálculos automáticos correctos
4. ✅ **Validaciones Funcionan**: No se pueden hacer acciones inválidas
5. ✅ **Persistencia**: Datos se mantienen al recargar
6. ✅ **UI Responsive**: Todo se ve bien en mobile/tablet/desktop
7. ✅ **0 Errores Consola**: No hay warnings ni errores en navegador
8. ✅ **0 Errores BD**: No hay constraint violations

---

## 📊 CHECKLIST FINAL

### Antes de Testing
- [ ] Migración 003 ejecutada
- [ ] Refactorización CierreFinanciero completada
- [ ] 0 errores TypeScript
- [ ] Servidor dev corriendo sin errores

### Durante Testing
- [ ] Escenario 1: Flujo Completo ✅
- [ ] Escenario 2: Flujo con Renuncia ✅
- [ ] Escenario 3: Validaciones ✅
- [ ] Escenario 4: Triggers BD ✅
- [ ] Escenario 5: Persistencia ✅
- [ ] Verificar bugs comunes ✅

### Después de Testing
- [ ] Documentar bugs encontrados
- [ ] Crear issues en GitHub (si aplica)
- [ ] Actualizar este documento con resultados
- [ ] Marcar todo completado en README

---

## 📝 REGISTRO DE RESULTADOS

### Fecha de Testing: __________
### Tester: __________

| Escenario | Estado | Notas |
|-----------|--------|-------|
| Flujo Completo | ⏳ | |
| Flujo Renuncia | ⏳ | |
| Validaciones | ⏳ | |
| Triggers BD | ⏳ | |
| Persistencia | ⏳ | |

### Bugs Encontrados
1. (Ninguno aún)

### Mejoras Sugeridas
1. (Ninguna aún)

---

**🧪 PLAN DE TESTING COMPLETO - LISTO PARA EJECUCIÓN** ✅
