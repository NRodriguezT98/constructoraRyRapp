// 🧪 Script de Testing: Rate Limiting por Email

// ============================================
// TEST 1: LIMPIAR Y PREPARAR
// ============================================

console.clear()
console.log('🧹 Limpiando localStorage...')
localStorage.clear()
console.log('✅ localStorage limpio')
console.log('🔄 Refrescando página...')
location.reload()

// ============================================
// TEST 2: PROBAR EMAIL 1 (test@test.com)
// ============================================

/*
1. Después del reload, intentar login 5 veces:
   - Email: test@test.com
   - Password: incorrecta123

2. Observar:
   - Intento 1-2: Mensaje rojo normal
   - Intento 3-4: Mensaje amarillo "Te quedan X intentos"
   - Intento 5: Mensaje rojo "Cuenta bloqueada por 15 minutos"

3. Verificar localStorage:
*/

console.log('📊 Estado después de 5 intentos con test@test.com:')
console.log('Intentos:', JSON.parse(localStorage.getItem('login_intentos_por_email') || '{}'))
console.log('Bloqueos:', JSON.parse(localStorage.getItem('login_bloqueo_por_email') || '{}'))

// Esperado:
// Intentos: { "test@test.com": 5 }
// Bloqueos: { "test@test.com": 1729123456789 }

// ============================================
// TEST 3: PROBAR EMAIL 2 (otro@test.com)
// ============================================

/*
SIN LIMPIAR localStorage ni refrescar, probar con otro email:
   - Email: otro@test.com
   - Password: incorrecta456

Intentar 3 veces (no 5, para ver la diferencia)

Observar:
   - otro@test.com NO está bloqueado (independiente)
   - test@test.com sigue bloqueado

Verificar localStorage:
*/

console.log('📊 Estado después de 3 intentos con otro@test.com:')
console.log('Intentos:', JSON.parse(localStorage.getItem('login_intentos_por_email') || '{}'))
console.log('Bloqueos:', JSON.parse(localStorage.getItem('login_bloqueo_por_email') || '{}'))

// Esperado:
// Intentos: { "test@test.com": 5, "otro@test.com": 3 }
// Bloqueos: { "test@test.com": 1729123456789, "otro@test.com": null }

// ============================================
// TEST 4: VERIFICAR INDEPENDENCIA
// ============================================

/*
1. Intentar con test@test.com nuevamente
   → Debe mostrar "Cuenta bloqueada"

2. Intentar con otro@test.com
   → Debe permitir intentos (tiene 2 restantes)

✅ Confirmado: Rate limiting funciona por email
*/

// ============================================
// TEST 5: LOGIN EXITOSO RESETEA SOLO ESE EMAIL
// ============================================

/*
1. Limpiar bloqueo de test@test.com:
*/

const bloqueos = JSON.parse(localStorage.getItem('login_bloqueo_por_email') || '{}')
delete bloqueos['test@test.com']
localStorage.setItem('login_bloqueo_por_email', JSON.stringify(bloqueos))

const intentos = JSON.parse(localStorage.getItem('login_intentos_por_email') || '{}')
delete intentos['test@test.com']
localStorage.setItem('login_intentos_por_email', JSON.stringify(intentos))

location.reload()

/*
2. Hacer login exitoso con test@test.com y credenciales correctas

3. Verificar localStorage:
*/

console.log('📊 Estado después de login exitoso con test@test.com:')
console.log('Intentos:', JSON.parse(localStorage.getItem('login_intentos_por_email') || '{}'))
console.log('Bloqueos:', JSON.parse(localStorage.getItem('login_bloqueo_por_email') || '{}'))

// Esperado:
// Intentos: { "otro@test.com": 3 }  ← test@test.com desapareció
// Bloqueos: { "otro@test.com": null }  ← test@test.com desapareció

// ============================================
// TEST 6: VERIFICAR AUDIT LOGS
// ============================================

/*
En Supabase Dashboard:
1. Table Editor → audit_log_seguridad
2. Filtrar por test@test.com y otro@test.com
3. Verificar eventos:
   - login_fallido con intentos_restantes en metadata
   - cuenta_bloqueada con minutos_bloqueo: 15
   - login_exitoso (si hiciste login correcto)

SQL Query:
*/

const sqlQuery = `
SELECT
  tipo,
  usuario_email,
  metadata->>'intentos_restantes' as intentos,
  fecha_evento
FROM audit_log_seguridad
WHERE usuario_email IN ('test@test.com', 'otro@test.com')
ORDER BY fecha_evento DESC
LIMIT 20;
`

console.log('🔍 Query SQL para verificar audit logs:')
console.log(sqlQuery)

// ============================================
// ✅ TESTS COMPLETADOS
// ============================================

console.log('\n✅ Todos los tests están listos')
console.log('📝 Sigue las instrucciones arriba paso a paso')
console.log('🎯 Confirma que cada email tiene su propio contador independiente')
