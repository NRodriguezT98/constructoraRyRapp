# ✅ Testing de Correcciones en Proceso - Checklist

**Fecha**: 4 de noviembre de 2025
**Ubicación**: Pestaña "Actividad" en Detalle de Cliente
**Referencia**: `FUNCIONALIDAD-CORRECCIONES-PASOS-PROCESO.md`

---

## 📋 Estado Actual

La funcionalidad de correcciones está **implementada** pero **NO testeada**.

---

## 🎯 Plan de Testing

### FASE 1: Verificación de Permisos

#### Test 1.1: Rol Administrador
- [ ] Login como Administrador
- [ ] Ir a Detalle de Cliente → Tab "Actividad"
- [ ] Expandir un paso COMPLETADO
- [ ] ✅ Verificar que aparecen botones "Corregir Fecha" y "Corregir Documento"
- [ ] ✅ Verificar que botones están habilitados

#### Test 1.2: Rol Gerente
- [ ] Login como Gerente
- [ ] Ir a Detalle de Cliente → Tab "Actividad"
- [ ] Expandir un paso COMPLETADO
- [ ] ❌ Verificar que NO aparecen botones de corrección

#### Test 1.3: Rol Vendedor
- [ ] Login como Vendedor
- [ ] Ir a Detalle de Cliente → Tab "Actividad"
- [ ] Expandir un paso COMPLETADO
- [ ] ❌ Verificar que NO aparecen botones de corrección

---

### FASE 2: Modal "Corregir Fecha"

#### Test 2.1: Apertura del Modal
- [ ] Click en botón "Corregir Fecha"
- [ ] ✅ Verificar que modal se abre
- [ ] ✅ Verificar título: "Corregir Fecha de Completado"
- [ ] ✅ Verificar subtítulo muestra nombre del paso
- [ ] ✅ Verificar muestra fecha actual del paso

#### Test 2.2: Validaciones de Fecha
- [ ] Ver campo de nueva fecha
- [ ] ✅ Verificar que tiene valor inicial (fecha actual del paso)
- [ ] ✅ Verificar que muestra restricciones en cuadro azul
- [ ] ⭐ **CRÍTICO**: Cambiar fecha a ANTES de la fecha de inicio de negociación
  - [ ] ❌ Debe mostrar error rojo: "La fecha no puede ser anterior a la fecha de inicio de la negociación (DD/MM/YYYY)"
  - [ ] ❌ Botón "Confirmar" debe estar deshabilitado
  - [ ] 📚 **Ref**: `VALIDACION-FECHA-INICIO-NEGOCIACION.md`
- [ ] Cambiar fecha a ANTES del paso anterior
  - [ ] ❌ Debe mostrar error rojo
  - [ ] ❌ Botón "Confirmar" debe estar deshabilitado
- [ ] Cambiar fecha a DESPUÉS del paso siguiente
  - [ ] ❌ Debe mostrar error rojo
  - [ ] ❌ Botón "Confirmar" debe estar deshabilitado
- [ ] Cambiar fecha a fecha futura
  - [ ] ❌ Debe mostrar error rojo
  - [ ] ❌ Botón "Confirmar" debe estar deshabilitado
- [ ] Cambiar fecha a VÁLIDA (entre paso anterior y siguiente)
  - [ ] ✅ No debe mostrar errores
  - [ ] ✅ Botón "Confirmar" debe habilitarse (si motivo completo)

#### Test 2.3: CASO CRÍTICO - Pasos Posteriores Completados
- [ ] Seleccionar paso 2 cuando paso 3 ya está completado
- [ ] Click en "Corregir Fecha"
- [ ] ⚠️ Debe mostrar banner AMBAR con advertencia
- [ ] ⚠️ Texto debe incluir "Hay X paso(s) posterior(es) completado(s)"
- [ ] ✅ Debe permitir continuar a pesar de advertencia
- [ ] ✅ Botón "Confirmar" debe estar habilitado

#### Test 2.4: Campo Motivo
- [ ] Dejar campo vacío
  - [ ] ❌ Botón "Confirmar" deshabilitado
- [ ] Escribir < 10 caracteres
  - [ ] ❌ Botón "Confirmar" deshabilitado
  - [ ] ✅ Contador muestra "X/10 caracteres mínimo"
- [ ] Escribir ≥ 10 caracteres
  - [ ] ✅ Botón "Confirmar" se habilita

#### Test 2.5: Guardar Corrección
- [ ] Completar fecha válida + motivo válido
- [ ] Click en "Confirmar Corrección"
- [ ] ✅ Debe mostrar "Guardando..."
- [ ] ✅ Debe mostrar toast success "Fecha corregida exitosamente"
- [ ] ✅ Modal debe cerrarse
- [ ] ✅ Timeline debe recargarse automáticamente
- [ ] ✅ Paso debe mostrar nueva fecha

#### Test 2.6: Cancelar
- [ ] Abrir modal
- [ ] Hacer cambios en fecha y motivo
- [ ] Click en "Cancelar"
- [ ] ✅ Modal debe cerrarse
- [ ] ✅ Cambios deben descartarse

---

### FASE 3: Modal "Corregir Documento"

#### Test 3.1: Apertura del Modal
- [ ] Click en botón "Corregir Documento"
- [ ] ✅ Verificar que modal se abre
- [ ] ✅ Verificar título: "Corregir Documentos"
- [ ] ✅ Verificar subtítulo muestra nombre del paso

#### Test 3.2: Validación de Permisos
- [ ] Al abrir modal
- [ ] ✅ Debe llamar a `puedeCorregirDocumentos()`
- [ ] ✅ Debe mostrar permisos correctamente

#### Test 3.3: Advertencia de Pasos Posteriores
- [ ] Seleccionar paso 2 cuando paso 3 ya está completado
- [ ] Click en "Corregir Documento"
- [ ] ⚠️ Debe mostrar banner AMBAR con advertencia
- [ ] ⚠️ Texto debe incluir "Hay X paso(s) posterior(es) completado(s)"
- [ ] ✅ Debe permitir continuar

#### Test 3.4: NO debe mostrar "Validaciones aplicadas"
- [ ] ❌ NO debe aparecer sección de "Validaciones aplicadas"
- [ ] ❌ NO debe mencionar "48 horas"
- [ ] ❌ NO debe mencionar "2 días"

#### Test 3.5: Lista de Documentos
- [ ] ✅ Verificar que muestra todos los documentos del paso
- [ ] ✅ Cada documento debe tener botón "Seleccionar archivo"
- [ ] ✅ Cada documento debe mostrar nombre actual

#### Test 3.6: Habilitar Correcciones
- [ ] Click en "Habilitar Correcciones"
- [ ] ✅ Botones de selección deben habilitarse
- [ ] ✅ Campo de motivo debe aparecer/habilitarse

#### Test 3.7: Seleccionar Nuevo Archivo
- [ ] Click en "Seleccionar archivo" para un documento
- [ ] Elegir archivo válido (.pdf, .jpg, .png, etc.)
- [ ] ✅ Debe mostrar nombre del nuevo archivo
- [ ] ✅ Debe habilitar botón "Guardar"

#### Test 3.8: Campo Motivo
- [ ] Dejar campo vacío
  - [ ] ❌ Botón "Guardar" deshabilitado
- [ ] Escribir < 10 caracteres
  - [ ] ❌ Botón "Guardar" deshabilitado
- [ ] Escribir ≥ 10 caracteres
  - [ ] ✅ Botón "Guardar" se habilita

#### Test 3.9: Guardar Corrección
- [ ] Seleccionar archivo + escribir motivo válido
- [ ] Click en "Guardar Corrección"
- [ ] ✅ Debe mostrar "Guardando..."
- [ ] ✅ Debe subir archivo a Supabase Storage
- [ ] ✅ Debe actualizar registro en BD
- [ ] ✅ Debe mostrar toast success
- [ ] ✅ Modal debe cerrarse
- [ ] ✅ Timeline debe recargarse
- [ ] ✅ Paso debe mostrar nuevo documento

#### Test 3.10: Cancelar
- [ ] Abrir modal
- [ ] Seleccionar archivo y escribir motivo
- [ ] Click en "Cancelar"
- [ ] ✅ Modal debe cerrarse
- [ ] ✅ Cambios deben descartarse

---

### FASE 4: Integración con Timeline

#### Test 4.1: Recarga Automática
- [ ] Completar corrección de fecha
- [ ] ✅ Verificar que `procesoHook.refrescar()` se llama
- [ ] ✅ Verificar que timeline se recarga sin refresh manual
- [ ] ✅ Verificar que datos actualizados se muestran

#### Test 4.2: Estado de Loading
- [ ] Durante corrección
- [ ] ✅ Verificar que botones se deshabilitan
- [ ] ✅ Verificar que se muestra indicador de carga

---

### FASE 5: Casos Edge

#### Test 5.1: Primer Paso (sin dependencias)
- [ ] Corregir fecha del paso 1
- [ ] ✅ Debe permitir cualquier fecha hasta hoy
- [ ] ✅ No debe mostrar restricción de "paso anterior"

#### Test 5.2: Último Paso (sin pasos siguientes)
- [ ] Corregir fecha del último paso completado
- [ ] ✅ Debe permitir fecha desde paso anterior hasta hoy
- [ ] ✅ No debe mostrar advertencia de pasos posteriores

#### Test 5.3: Paso sin Documentos
- [ ] Click en "Corregir Documento" en paso sin documentos
- [ ] ✅ Debe mostrar mensaje apropiado

#### Test 5.4: Conexión Lenta
- [ ] Simular conexión lenta
- [ ] ✅ Verificar que spinners aparecen
- [ ] ✅ Verificar que botones se deshabilitan
- [ ] ✅ Verificar que no hay doble submit

---

## 🐛 Bugs Encontrados

### Bug #1: [Descripción]
**Estado**: 🔴 No resuelto / 🟡 En progreso / ✅ Resuelto
**Descripción**:
**Solución**:
**Commit**:

---

## ✅ Checklist Final

- [ ] Todos los tests de FASE 1 completados
- [ ] Todos los tests de FASE 2 completados
- [ ] Todos los tests de FASE 3 completados
- [ ] Todos los tests de FASE 4 completados
- [ ] Todos los tests de FASE 5 completados
- [ ] Todos los bugs encontrados resueltos
- [ ] Documento actualizado con resultados
- [ ] Marcar como completado en `FUNCIONALIDAD-CORRECCIONES-PASOS-PROCESO.md`

---

**Última actualización**: 4 de noviembre de 2025
**Estado**: 🟡 En progreso
