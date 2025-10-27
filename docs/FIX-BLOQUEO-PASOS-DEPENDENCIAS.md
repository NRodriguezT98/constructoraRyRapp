# 🔧 FIX: Sistema de Bloqueo de Pasos - Dependencias

## 🐛 Problema Identificado

El sistema de bloqueo de pasos **NO funcionaba** porque las dependencias se guardaban con **IDs de plantilla** (ejemplo: `"paso_01"`, `"paso_02"`) en lugar de los **UUIDs reales** de las instancias creadas en `procesos_negociacion`.

### Ejemplo del Problema:
```
Plantilla:
- Paso 1 (id: "paso_01")
- Paso 2 (id: "paso_02", depende_de: ["paso_01"])

Al crear instancia:
- Paso 1 (id: "abc-123-uuid")
- Paso 2 (id: "def-456-uuid", depende_de: ["paso_01"]) ❌ NO EXISTE!
```

---

## ✅ Solución Implementada

### 1️⃣ **Corregido `procesos.service.ts`**

La función `crearProcesoDesdePlantilla()` ahora:

1. Crea las instancias SIN dependencias
2. Genera un mapa: `{ "paso_01": "uuid-real", "paso_02": "uuid-real" }`
3. Actualiza cada paso con los UUIDs reales de las dependencias

```typescript
// Mapeo de IDs
const mapeoIds: { [key: string]: string } = {}
pasosFiltrados.forEach((paso, index) => {
  mapeoIds[paso.id] = data[index].id // paso_01 → abc-123-uuid
})

// Actualizar dependencias
const dependenciasReales = paso.condiciones.dependeDe
  .map(idPlantilla => mapeoIds[idPlantilla]) // paso_01 → abc-123-uuid
  .filter(Boolean)
```

### 2️⃣ **Corregido `timeline-proceso.tsx`**

La función de desarrollo `handleRecargarPlantilla()` ahora usa la misma lógica de mapeo.

---

## 🚀 Cómo Aplicar el Fix

### Opción A: Para Nuevas Negociaciones ✅

Las nuevas negociaciones que se creen desde ahora **ya funcionarán correctamente** con el bloqueo de pasos.

### Opción B: Para Negociaciones Existentes

Si ya tienes negociaciones con pasos creados, necesitas ejecutar la migración SQL:

#### **1. Abrir Supabase SQL Editor**
```
https://supabase.com/dashboard/project/[tu-proyecto]/sql
```

#### **2. Copiar y ejecutar el script:**
```bash
# Ubicación del archivo
d:\constructoraRyRapp\supabase\migrations\fix_dependencias_pasos_procesos.sql
```

#### **3. Ejecutar la migración**
- Copia el contenido del archivo
- Pégalo en el SQL Editor
- Click en "Run"

#### **4. Verificar resultados**

El script mostrará logs como:
```
🔄 Procesando negociación: abc-123
  📌 Paso: Promesa Firmada (orden 2)
     Dependencias actuales: {paso_01}
     ✓ Dependencia mapeada: def-456-uuid
     ✅ Dependencias actualizadas: {def-456-uuid}
```

Al final mostrará una tabla con los pasos y sus dependencias corregidas.

---

## 🧪 Cómo Probar que Funciona

### 1. **Crear una nueva negociación**
   - Ir a Clientes → Seleccionar cliente
   - Crear nueva negociación

### 2. **Ir a la pestaña "Actividad"**
   - Click en el cliente
   - Tab "Actividad"

### 3. **Verificar el bloqueo visual**
   ✅ Paso 1 debe aparecer **disponible** (sin candado)
   ✅ Paso 2 debe aparecer **bloqueado** con:
   - Badge: "🔒 Bloqueado"
   - Mensaje: "Debes completar primero: Paso 1..."
   - Opacidad reducida
   - No se puede expandir

### 4. **Completar Paso 1**
   - Expandir Paso 1
   - Click "Iniciar Paso"
   - Subir documentos requeridos
   - Click "Marcar Completado"

### 5. **Verificar desbloqueo automático**
   ✅ Paso 2 debe **desbloquearse automáticamente**
   ✅ Badge cambia de "🔒 Bloqueado" a "Pendiente"
   ✅ Opacidad vuelve a 100%
   ✅ Ahora se puede expandir y diligenciar

---

## 🔍 Verificación en Base de Datos

### Ver dependencias actuales:
```sql
SELECT
  pn.orden,
  pn.nombre,
  pn.depende_de,
  (
    SELECT string_agg(pn2.orden || '. ' || pn2.nombre, ', ')
    FROM procesos_negociacion pn2
    WHERE pn2.id = ANY(pn.depende_de)
  ) as "dependencias_nombres"
FROM procesos_negociacion pn
WHERE pn.negociacion_id = 'TU_NEGOCIACION_ID'
ORDER BY pn.orden;
```

### Resultado esperado:
```
orden | nombre                    | depende_de              | dependencias_nombres
------|---------------------------|-------------------------|---------------------
1     | Promesa Enviada           | NULL                    | NULL
2     | Promesa Firmada           | {abc-123-uuid}          | 1. Promesa Enviada
3     | Envío Documentación       | {def-456-uuid}          | 2. Promesa Firmada
```

---

## 📝 Notas Importantes

1. **Los pasos existentes NO se actualizan automáticamente**
   - Necesitas ejecutar la migración SQL
   - O usar el botón "🔧 DEV: Recargar Plantilla" (solo en desarrollo)

2. **El botón de Recargar Plantilla está en modo desarrollo**
   - Solo visible si `NEXT_PUBLIC_DEV_MODE=true`
   - Elimina todos los pasos y los recrea desde la plantilla
   - **NO elimina los documentos subidos**

3. **Dependencias múltiples funcionan correctamente**
   ```
   Paso 4 depende de [Paso 2, Paso 3]
   → Paso 4 se desbloquea cuando AMBOS se completan
   ```

4. **Pasos omitidos también desbloquean**
   ```
   Paso 2 depende de Paso 1
   Paso 1 se OMITE
   → Paso 2 se desbloquea igual
   ```

---

## 🎯 Resultado Final

✅ Sistema de bloqueo **100% funcional**
✅ Dependencias se mapean correctamente
✅ Orden de pasos garantizado
✅ UX clara y visual
✅ Mensajes informativos
✅ Validación robusta

---

## 🆘 Troubleshooting

### Problema: Los pasos siguen apareciendo desbloqueados

**Causa:** Las dependencias no se mapearon correctamente.

**Solución:**
1. Ejecutar la migración SQL
2. Refrescar la página
3. Verificar en BD con la query de verificación

### Problema: Error al ejecutar la migración

**Causa:** Puede haber IDs inválidos en `depende_de`.

**Solución:**
```sql
-- Limpiar dependencias inválidas
UPDATE procesos_negociacion
SET depende_de = NULL
WHERE depende_de IS NOT NULL;

-- Luego ejecutar la migración de nuevo
```

### Problema: El botón "Recargar Plantilla" no aparece

**Causa:** No está en modo desarrollo.

**Solución:**
```bash
# .env.local
NEXT_PUBLIC_DEV_MODE=true
```

---

## 📚 Archivos Modificados

- ✅ `src/modules/admin/procesos/services/procesos.service.ts`
- ✅ `src/modules/admin/procesos/components/timeline-proceso.tsx`
- ✅ `src/modules/admin/procesos/hooks/useProcesoNegociacion.ts`
- ✅ `supabase/migrations/fix_dependencias_pasos_procesos.sql`
- ✅ `docs/SISTEMA-BLOQUEO-PASOS-PROCESOS.md`
- ✅ `docs/FIX-BLOQUEO-PASOS-DEPENDENCIAS.md` (este archivo)

---

**✅ Fix completo y probado**
**📅 Fecha:** 2025-10-27
