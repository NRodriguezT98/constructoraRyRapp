# 🧪 Test Manual - Funcionalidad "Recordar Usuario"

## ✅ Checklist de Pruebas

### Test 1: Activar "Recordar Usuario" ✅

**Pasos:**
1. Abrir `/login` en el navegador
2. Verificar que campos estén vacíos
3. Ingresar email y contraseña
4. ✅ Marcar checkbox "Recordar mi correo electrónico"
5. Click en "Iniciar Sesión"
6. Login exitoso → redirige

**Resultado Esperado:**
- ✅ Email guardado en localStorage
- ✅ Checkbox marcado

**Verificación en DevTools:**
```javascript
// Abrir Console del navegador (F12)
localStorage.getItem('ryr_remember_email')
// Debería retornar: "tu-email@ejemplo.com"
```

---

### Test 2: Email Pre-cargado en Siguiente Visita ✅

**Pasos:**
1. Cerrar completamente el navegador
2. Reabrir navegador
3. Navegar a `/login`

**Resultado Esperado:**
- ✅ Email pre-cargado automáticamente
- ✅ Checkbox marcado automáticamente
- ✅ Solo falta ingresar contraseña

---

### Test 3: Desactivar "Recordar Usuario" ✅

**Pasos:**
1. Abrir `/login`
2. Email ya está pre-cargado
3. ❌ Desmarcar checkbox "Recordar mi correo electrónico"
4. Ingresar contraseña
5. Click en "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Login exitoso
- ✅ Email ELIMINADO de localStorage

**Verificación en DevTools:**
```javascript
localStorage.getItem('ryr_remember_email')
// Debería retornar: null
```

---

### Test 4: Siguiente Visita SIN Email Guardado ✅

**Pasos:**
1. Cerrar navegador
2. Reabrir navegador
3. Navegar a `/login`

**Resultado Esperado:**
- ✅ Email vacío
- ✅ Checkbox desmarcado

---

### Test 5: Cambiar de Email ✅

**Pasos:**
1. Email A está guardado y pre-cargado
2. Cambiar email a Email B
3. Marcar checkbox
4. Hacer login con Email B

**Resultado Esperado:**
- ✅ Email B guardado en localStorage
- ✅ Email A reemplazado por Email B

**Verificación:**
```javascript
localStorage.getItem('ryr_remember_email')
// Debería retornar: "email-b@ejemplo.com"
```

---

### Test 6: Modo Incógnito (Privado) ⚠️

**Pasos:**
1. Abrir navegador en modo incógnito
2. Navegar a `/login`
3. Ingresar credenciales
4. Marcar checkbox
5. Hacer login

**Resultado Esperado:**
- ✅ Login exitoso
- ⚠️ Email NO persiste (al cerrar ventana incógnita, se borra)

**Nota:** Esto es comportamiento esperado del navegador.

---

### Test 7: Multiple Navegadores ✅

**Pasos:**
1. Marcar checkbox en Chrome
2. Hacer login en Chrome
3. Abrir Firefox
4. Navegar a `/login` en Firefox

**Resultado Esperado:**
- ✅ Chrome: Email guardado
- ✅ Firefox: Email NO aparece (localStorage es por navegador)

---

### Test 8: Limpiar Datos del Navegador 🗑️

**Pasos:**
1. Email guardado en localStorage
2. Limpiar datos de navegación (Settings → Privacy → Clear browsing data)
3. Incluir "Cookies and other site data"
4. Navegar a `/login`

**Resultado Esperado:**
- ✅ Email eliminado
- ✅ Campos vacíos

---

## 🔍 Inspección Técnica

### Verificar localStorage en DevTools

```javascript
// Ver todos los datos guardados
Object.keys(localStorage)

// Ver específicamente el email
localStorage.getItem('ryr_remember_email')

// Eliminar manualmente (para testing)
localStorage.removeItem('ryr_remember_email')

// Ver todo el localStorage
console.table(localStorage)
```

---

## 🎯 Casos Extremos (Edge Cases)

### Caso 1: Email Inválido Guardado
**Escenario:** Email guardado, pero usuario cambió contraseña
**Resultado:** ✅ Email pre-cargado, login falla, checkbox sigue marcado

### Caso 2: localStorage Corrupto
**Escenario:** Dato inválido en localStorage
**Código defensivo:**
```typescript
try {
  const emailGuardado = localStorage.getItem(REMEMBER_EMAIL_KEY)
  if (emailGuardado) setEmail(emailGuardado)
} catch (error) {
  console.error('Error cargando email:', error)
}
```

### Caso 3: Usuario Bloqueado
**Escenario:** Email guardado, pero usuario está bloqueado
**Resultado:** ✅ Email pre-cargado, mensaje de bloqueo, no puede ingresar

---

## 📊 Reporte de Test

**Fecha:** _______________
**Tester:** _______________
**Navegador:** _______________

| Test | Resultado | Notas |
|------|-----------|-------|
| Test 1: Activar "Recordar" | ⬜ Pass / ⬜ Fail | |
| Test 2: Pre-cargar Email | ⬜ Pass / ⬜ Fail | |
| Test 3: Desactivar "Recordar" | ⬜ Pass / ⬜ Fail | |
| Test 4: Sin Email Guardado | ⬜ Pass / ⬜ Fail | |
| Test 5: Cambiar Email | ⬜ Pass / ⬜ Fail | |
| Test 6: Modo Incógnito | ⬜ Pass / ⬜ Fail | |
| Test 7: Multiple Navegadores | ⬜ Pass / ⬜ Fail | |
| Test 8: Limpiar Datos | ⬜ Pass / ⬜ Fail | |

---

## 🐛 Bugs Encontrados

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Aprobación

- [ ] Todos los tests pasaron
- [ ] No se encontraron bugs críticos
- [ ] Funcionalidad lista para producción

**Firma:** _______________
**Fecha:** _______________

---

**Última actualización:** 11 de noviembre de 2025
