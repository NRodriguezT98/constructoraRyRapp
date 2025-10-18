# ✅ CHECKLIST: Solucionar Error 401 en Negociaciones

## 🎯 Objetivo
Aplicar políticas RLS para que usuarios autenticados puedan crear negociaciones.

---

## 📝 PASOS A SEGUIR

### ✅ Paso 1: Preparar el SQL
- [ ] Abrir archivo: `supabase/EJECUTAR-ESTE-SQL-AHORA.sql` ✅ (ya está abierto)
- [ ] Seleccionar TODO el contenido (`Ctrl + A`)
- [ ] Copiar (`Ctrl + C`)

---

### ✅ Paso 2: Ir a Supabase Dashboard
- [ ] Abrir navegador
- [ ] Ir a: https://supabase.com/dashboard
- [ ] Login (si no estás logueado)
- [ ] Seleccionar proyecto: **constructoraRyR**

---

### ✅ Paso 3: Abrir SQL Editor
- [ ] Click en menú lateral: **"SQL Editor"** 📝
- [ ] Click en botón verde: **"New query"**
- [ ] Pegar el SQL copiado (`Ctrl + V`)

---

### ✅ Paso 4: Ejecutar SQL
- [ ] Click en botón **"Run"** (esquina superior derecha)
- [ ] O presionar: `Ctrl + Enter`
- [ ] Esperar 2-3 segundos

---

### ✅ Paso 5: Verificar Resultado
En la pestaña **"Results"** deberías ver:

```
✅ Success. No rows returned

(Esto es NORMAL porque son comandos DROP/CREATE)
```

Y al final, la query SELECT debería mostrar:

```
4 rows

Política                                                | Comando | Permisiva
------------------------------------------------------- | ------- | ---------
Usuarios autenticados pueden crear negociaciones       | INSERT  | PERMISSIVE
Usuarios autenticados pueden actualizar negociaciones  | UPDATE  | PERMISSIVE
Usuarios autenticados pueden eliminar negociaciones    | DELETE  | PERMISSIVE
Usuarios autenticados pueden ver negociaciones         | SELECT  | PERMISSIVE
```

**Si ves estas 4 filas = ✅ ÉXITO**

---

### ✅ Paso 6: Probar en la Aplicación
- [ ] Volver a tu aplicación
- [ ] Presionar `F5` para recargar
- [ ] Abrir modal "Registrar nuevo interés"
- [ ] Completar formulario:
  - [ ] Seleccionar **Proyecto**
  - [ ] Seleccionar **Vivienda**
  - [ ] Ingresar **Valor Negociado** (ej: 122000000)
  - [ ] Click en **"Guardar"**

---

### ✅ Paso 7: Confirmar que Funciona

#### ✅ Señales de ÉXITO:
- ✅ Modal se cierra automáticamente
- ✅ Aparece notificación verde: "Interés registrado exitosamente"
- ✅ Lista de negociaciones se actualiza
- ✅ NO aparece error en consola

#### ❌ Si aún falla:
- ❌ Error 401 en consola
- ❌ Modal no se cierra
- ❌ Mensaje de error

**Acción**: Captura pantalla del error y avísame.

---

## 🕐 Tiempo Estimado
- **Paso 1-3**: 2 minutos
- **Paso 4-5**: 1 minuto
- **Paso 6-7**: 2 minutos
- **TOTAL**: ⏱️ **5 minutos**

---

## 📸 Capturas de Pantalla Útiles

### 1. SQL Editor en Supabase
```
┌─────────────────────────────────────────┐
│ SQL Editor                              │
├─────────────────────────────────────────┤
│ [New query] ← Click aquí               │
│                                         │
│ -- Pegar el SQL aquí                   │
│                                         │
│                         [Run] ← Click   │
└─────────────────────────────────────────┘
```

### 2. Resultado Esperado
```
┌─────────────────────────────────────────┐
│ Results                                 │
├─────────────────────────────────────────┤
│ ✅ Success. No rows returned            │
│ ✅ Success. No rows returned            │
│ ✅ 4 rows                                │
│                                         │
│ Tabla con 4 políticas ↓                 │
└─────────────────────────────────────────┘
```

---

## 💡 Tips

- ✅ Asegúrate de copiar **TODO** el SQL (desde el primer `--` hasta el último `;`)
- ✅ Si ves errores de "policy already exists", está bien (significa que ya estaban)
- ✅ Lo importante es que al final veas las 4 políticas
- ✅ Si estás nervioso, puedes ejecutar línea por línea (pero no es necesario)

---

## 🆘 Ayuda Rápida

### Error: "permission denied for table pg_policies"
**Solución**: Asegúrate de estar en el proyecto correcto de Supabase.

### Error: "relation negociaciones does not exist"
**Solución**: Verifica que ejecutaste el schema de negociaciones antes.

### Veo las 4 políticas pero sigue error 401
**Solución**:
1. Verifica que estás **logueado** en la app
2. Abre DevTools → Application → Local Storage
3. Busca: `sb-<project>-auth-token`
4. Si no existe = No estás logueado

---

## ✅ FIN

Cuando veas las 4 políticas y el formulario funcione:

**🎉 ¡COMPLETADO! 🎉**

Ya puedes:
- ✅ Registrar intereses
- ✅ Crear negociaciones
- ✅ Ver valores formateados en COP
- ✅ Usar el sistema completamente

---

**¿Listo para empezar?** ⚡
**Marca cada checkbox ✅ conforme avances**
