# 🗑️ Guía para Limpiar Base de Datos

## 📋 Descripción

Scripts para eliminar **TODOS los datos** de la base de datos de RyR Constructora manteniendo la estructura intacta.

## ⚠️ ADVERTENCIA CRÍTICA

- ✋ **Esta acción es IRREVERSIBLE**
- 🔥 Se eliminarán **TODOS los datos** de todas las tablas
- 📊 Los IDs se reiniciarán desde 1
- ✅ Se mantendrá: estructura, triggers, RLS, funciones

---

## 🚀 Método 1: Script PowerShell (Recomendado)

### Uso Básico

```powershell
# Ejecutar con confirmación interactiva
.\limpiar-base-datos.ps1

# Ejecutar sin confirmación (usar con EXTREMO cuidado)
.\limpiar-base-datos.ps1 -Force
```

### Qué hace el script:

1. ✅ Verifica que existe el archivo SQL
2. ⚠️ Muestra advertencias claras
3. 🔐 Solicita confirmación (escribir "LIMPIAR")
4. 🚀 Ejecuta el script SQL
5. ✅ Verifica que la limpieza fue exitosa

---

## 🌐 Método 2: Supabase Dashboard (Alternativo)

Si el script PowerShell no funciona:

### Paso 1: Abrir SQL Editor

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `swyjhwgvkfcfdtemkyad`
3. Click en **SQL Editor** en el menú lateral

### Paso 2: Copiar Script

```powershell
# Copiar el contenido al portapapeles
Get-Content .\supabase\migrations\limpiar-datos-completo.sql | Set-Clipboard
```

O abre el archivo manualmente:
```
supabase/migrations/limpiar-datos-completo.sql
```

### Paso 3: Ejecutar

1. Pega el contenido en el editor SQL
2. ⚠️ **LEE LAS ADVERTENCIAS** que muestra el script
3. Click en **Run** (▶️)
4. Espera a que termine (verás mensajes en la consola)

---

## 📊 Qué se Elimina

### Nivel 4: Datos Dependientes
- ✅ `abonos_historial` - Historial de modificaciones
- ✅ `procesos_negociacion` - Pasos del workflow
- ✅ `documentos_cliente` - Documentos subidos
- ✅ `documentos_proyecto` - Documentos de proyectos
- ✅ `audit_log_seguridad` - Logs de auditoría

### Nivel 3: Datos de Negociaciones
- ✅ `fuentes_pago` - Configuración de pagos
- ✅ `abonos` - Pagos realizados
- ✅ `renuncias` - Renuncias registradas

### Nivel 2: Negociaciones
- ✅ `negociaciones` - Todas las negociaciones

### Nivel 1: Asignaciones
- ✅ `cliente_intereses` - Intereses de clientes
- ✅ `viviendas` - Viviendas (se mantiene estructura)
- ✅ `manzanas` - Manzanas (se mantiene estructura)

### Nivel 0: Datos Base
- ✅ `clientes` - Todos los clientes
- ✅ `proyectos` - Todos los proyectos
- ✅ `categorias_documento` - Categorías de documentos
- ✅ `plantillas_proceso` - Plantillas de workflow
- ✅ `configuracion_recargos` - Configuración de recargos

**Total: 17 tablas limpiadas**

---

## 🔧 Qué se Mantiene

- ✅ **Estructura de tablas** (CREATE TABLE)
- ✅ **Columnas y tipos de datos**
- ✅ **Foreign Keys y Constraints**
- ✅ **Triggers** (actualización de estados, etc.)
- ✅ **Funciones** (calcular_porcentaje_pagado, etc.)
- ✅ **Políticas RLS** (seguridad)
- ✅ **Índices** (performance)

---

## 📝 Verificación Post-Limpieza

El script automáticamente verifica:

```sql
✅ LIMPIEZA COMPLETADA EXITOSAMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Verificación de tablas vacías:
   • Clientes: 0 registros
   • Proyectos: 0 registros
   • Negociaciones: 0 registros
   • Viviendas: 0 registros
   • Abonos: 0 registros

✨ Base de datos limpia y lista para datos frescos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Secuencias de IDs reiniciadas a 1
🔧 Triggers reactivados correctamente
```

### Verificación Manual

Puedes verificar en SQL Editor:

```sql
-- Contar registros en tablas principales
SELECT
  'clientes' as tabla, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'proyectos', COUNT(*) FROM proyectos
UNION ALL
SELECT 'viviendas', COUNT(*) FROM viviendas
UNION ALL
SELECT 'negociaciones', COUNT(*) FROM negociaciones
UNION ALL
SELECT 'abonos', COUNT(*) FROM abonos;
```

**Resultado esperado**: Todas deben mostrar `0 registros`

---

## 🎯 Próximos Pasos Después de Limpiar

### 1. Insertar Configuración Base (OBLIGATORIO) ⚠️

Después de limpiar la base de datos, debes insertar las configuraciones esenciales:

**Opción A: SQL Editor (Recomendado)**
```powershell
# Copiar el script al portapapeles
Get-Content .\supabase\migrations\insertar-datos-configuracion-base.sql | Set-Clipboard
```

1. Ve a Supabase Dashboard → SQL Editor
2. Pega el contenido
3. Ejecuta (Run)

**¿Qué inserta?**
- ✅ Gastos notariales (default: $5,000,000)

---

### 2. Crear Datos de Prueba Frescos

```bash
# Orden recomendado:
1. Crear proyectos
2. Crear manzanas en proyectos
3. Crear viviendas en manzanas
4. Crear clientes
5. Crear negociaciones (asigna viviendas automáticamente)
6. Configurar fuentes de pago
7. Registrar abonos
```

### 3. Testing E2E

Seguir el plan completo en:
```
docs/PLAN-TESTING-E2E-NEGOCIACIONES.md
```

### 4. Verificar Triggers

Los triggers deben funcionar automáticamente:
- ✅ Cambio de estado de cliente al crear negociación
- ✅ Asignación automática de vivienda
- ✅ Cálculo de porcentaje pagado
- ✅ Actualización de total_abonado

---

## 🚨 Troubleshooting

### Error: "permission denied"

**Causa**: No tienes permisos de administrador en Supabase

**Solución**: Usa el método del Dashboard (Método 2)

---

### Error: "relation does not exist"

**Causa**: Alguna tabla no existe en tu base de datos

**Solución**:
1. Verifica que todas las migraciones se ejecutaron
2. Revisa `supabase/migrations/`
3. Ejecuta migraciones faltantes

---

### Script se queda "colgado"

**Causa**: Hay transacciones activas bloqueando las tablas

**Solución**:
```sql
-- Terminar conexiones activas (Dashboard → SQL Editor)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

-- Luego ejecuta de nuevo el script de limpieza
```

---

### No se eliminan todos los datos

**Causa**: RLS podría estar bloqueando la eliminación

**Solución**: El script ya desactiva triggers temporalmente. Si persiste:

```sql
-- Deshabilitar RLS temporalmente (solo para limpieza)
ALTER TABLE negociaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
-- ... (hacer para todas las tablas)

-- Ejecutar TRUNCATE

-- REACTIVAR RLS (¡MUY IMPORTANTE!)
ALTER TABLE negociaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- ... (hacer para todas las tablas)
```

---

## 📚 Archivos Relacionados

- **Script SQL**: `supabase/migrations/limpiar-datos-completo.sql`
- **Script PowerShell**: `limpiar-base-datos.ps1`
- **Schema Reference**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Testing Plan**: `docs/PLAN-TESTING-E2E-NEGOCIACIONES.md`

---

## 🔐 Seguridad

- ✅ Script requiere confirmación explícita
- ✅ Muestra advertencias claras
- ✅ Espera 3 segundos antes de ejecutar
- ✅ Verifica resultado automáticamente
- ⚠️ **NO ejecutar en producción sin backup**

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa esta guía completa
2. Verifica logs en Supabase Dashboard
3. Usa el método alternativo (Dashboard)
4. Consulta `DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

**Última actualización**: 2025-10-22
**Versión**: 1.0.0
