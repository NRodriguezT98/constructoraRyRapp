# 🔐 Configuración de Permisos RLS - Módulo de Recargos

## ⚠️ Error 403 - Solución

El error que ves:
```
swyjhwgvkfcfdtemkyad.supabase.co/rest/v1/configuracion_recargos?select=*:1
Failed to load resource: the server responded with a status of 403 ()
```

**Significa que la tabla `configuracion_recargos` no tiene políticas RLS configuradas.**

---

## 🚀 Solución Rápida (Opción 1 - Recomendada)

### Ejecutar SQL directamente en Supabase Dashboard:

1. **Ir a Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/editor

2. **Abrir SQL Editor**:
   - Click en "SQL Editor" en el menú lateral

3. **Copiar y pegar el siguiente SQL**:

```sql
-- Habilitar RLS
ALTER TABLE configuracion_recargos ENABLE ROW LEVEL SECURITY;

-- SELECT: Todos los usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer configuracion_recargos"
ON configuracion_recargos
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Solo administradores pueden crear
CREATE POLICY "Solo administradores pueden crear configuracion_recargos"
ON configuracion_recargos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- UPDATE: Solo administradores pueden actualizar
CREATE POLICY "Solo administradores pueden actualizar configuracion_recargos"
ON configuracion_recargos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- DELETE: Solo administradores pueden eliminar
CREATE POLICY "Solo administradores pueden eliminar configuracion_recargos"
ON configuracion_recargos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);
```

4. **Ejecutar (RUN)**

5. **Verificar**:
   - Refrescar la página de la aplicación
   - El módulo de Recargos debería funcionar correctamente

---

## 🔧 Solución Alternativa (Opción 2)

### Usar script PowerShell:

1. Ejecutar en PowerShell:
   ```powershell
   .\aplicar-rls-recargos.ps1
   ```

2. El script copiará el SQL al portapapeles

3. Pegar en Supabase SQL Editor

---

## 📋 Políticas Aplicadas

| Operación | Permiso | Condición |
|-----------|---------|-----------|
| **SELECT** | ✅ Todos los usuarios autenticados | Pueden leer todos los recargos |
| **INSERT** | ⚠️ Solo Administradores | Rol = 'Administrador' |
| **UPDATE** | ⚠️ Solo Administradores | Rol = 'Administrador' |
| **DELETE** | ⚠️ Solo Administradores | Rol = 'Administrador' |

---

## ✅ Verificación

Después de aplicar las políticas, verificar ejecutando en SQL Editor:

```sql
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'configuracion_recargos'
ORDER BY policyname;
```

Deberías ver 4 políticas:
1. `Solo administradores pueden actualizar configuracion_recargos` (UPDATE)
2. `Solo administradores pueden crear configuracion_recargos` (INSERT)
3. `Solo administradores pueden eliminar configuracion_recargos` (DELETE)
4. `Usuarios autenticados pueden leer configuracion_recargos` (SELECT)

---

## 🎯 Resultado Esperado

**Antes**:
```
❌ Error 403 - Forbidden
❌ No se pueden leer recargos
❌ No se pueden crear recargos
```

**Después**:
```
✅ Tabla de recargos carga correctamente
✅ Usuarios autenticados pueden ver recargos
✅ Administradores pueden crear/editar/eliminar
```

---

## 📞 Soporte

Si el error persiste después de aplicar las políticas:

1. Verificar que el usuario actual tiene rol 'Administrador'
2. Verificar que la sesión de Supabase está activa
3. Revisar la consola del navegador para más detalles del error

---

## 🔄 Actualización del Módulo

**Cambios aplicados**:
- ✅ Nombre cambiado de "Configuración" a "Recargos"
- ✅ Sidebar actualizado: "Recargos" en lugar de "Configuración"
- ✅ Todos los textos de la UI actualizados
- ✅ Políticas RLS creadas y documentadas
