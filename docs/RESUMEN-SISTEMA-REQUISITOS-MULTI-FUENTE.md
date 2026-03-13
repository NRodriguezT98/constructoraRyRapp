# ✅ RESUMEN: Sistema de Requisitos Multi-Fuente sin Hardcoding

## 🎯 Problema Identificado

1. **Nombres hardcodeados** en array `TIPOS_FUENTE`
2. **Inconsistencias** de nombres: "Subsidio Caja de Compensación" vs "Subsidio Caja Compensación"
3. **Service consultaba tabla incorrecta**: `fuentes_pago.tipo` (datos libres) en lugar de `tipos_fuentes_pago` (catálogo oficial)
4. **Requisitos duplicados** por nombres inconsistentes

---

## ✅ Soluciones Implementadas

### 1. Service Corregido
**Archivo:** `src/modules/requisitos-fuentes/services/requisitos.service.ts`

```typescript
// ✅ ANTES: Consultaba fuentes_pago.tipo (texto libre con errores)
async obtenerTiposFuente() {
  const { data } = await supabase.from('fuentes_pago').select('tipo')
  // ... agrupaba manualmente con Map
}

// ✅ DESPUÉS: Consulta tipos_fuentes_pago (catálogo oficial)
async obtenerTiposFuente() {
  const { data: tiposCatalogo } = await supabase
    .from('tipos_fuentes_pago')  // ← Fuente única de verdad
    .select('id, nombre, orden')
    .eq('activo', true)
    .order('orden', { ascending: true })
}
```

**Beneficio:** Siempre usa nombres oficiales del catálogo, sin variaciones.

---

### 2. Tipos TypeScript Estandarizados
**Archivo:** `src/modules/requisitos-fuentes/types/index.ts`

```typescript
// ❌ ANTES: Array hardcodeado con duplicados
export const TIPOS_FUENTE = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja de Compensación',  // Con "de"
  'Subsidio Caja Compensación',     // Sin "de" - DUPLICADO
] as const

// ✅ DESPUÉS: Deprecado, se carga dinámicamente
export const TIPOS_FUENTE_DEPRECADO = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación',  // Nombre oficial del catálogo
] as const
// Usar: useTiposFuente() hook para cargar dinámicamente
```

---

### 3. Base de Datos Estandarizada

**Script:** `supabase/fix-eliminar-duplicados-subsidio.sql`

```sql
-- Desactivar requisitos con nombre INCORRECTO (con "de")
UPDATE requisitos_fuentes_pago_config
SET activo = false
WHERE tipo_fuente = 'Subsidio Caja de Compensación';

-- Solo queda: "Subsidio Caja Compensación" (nombre oficial)
```

**Resultado:**
- ✅ Solo nombres oficiales en `requisitos_fuentes_pago_config`
- ✅ No más duplicados
- ✅ Coincidencia exacta con `tipos_fuentes_pago.nombre`

---

### 4. Campos Corregidos

**Cambios en múltiples archivos:**
- `categoria_documento_requerida` → `categoria_documento` (nombre real en BD)
- Interfaces TypeScript actualizadas
- Formularios corregidos

---

## 📊 Catálogo Oficial (tipos_fuentes_pago)

```
1. Cuota Inicial
2. Crédito Hipotecario
3. Subsidio Mi Casa Ya
4. Subsidio Caja Compensación  ← Nombre oficial (sin "de")
```

---

## 🚀 Flujo Completo Ahora

### Agregar Nuevo Tipo de Fuente

**Paso 1:** Insertar en catálogo
```sql
INSERT INTO tipos_fuentes_pago (
  nombre, codigo, descripcion, orden, activo
) VALUES (
  'Leasing Habitacional',
  'leasing_habitacional',
  'Arrendamiento financiero',
  5,
  true
);
```

**Paso 2:** Recargar admin de requisitos
- El nuevo tipo **aparece automáticamente** en el selector
- No hay código hardcodeado que actualizar
- No hay deploy necesario

**Paso 3:** Configurar requisitos
- Seleccionar "Leasing Habitacional"
- Agregar requisitos (Boleta, Carta, etc.)
- Configurar alcance (ESPECÍFICO vs COMPARTIDO)
- Seleccionar múltiples fuentes si el requisito aplica a varias

---

## ✅ Ventajas del Sistema

1. **Sin Hardcoding:** Tipos cargados dinámicamente desde BD
2. **Escalable:** Agregar tipos sin tocar código
3. **Consistente:** Una fuente única de verdad (`tipos_fuentes_pago`)
4. **Multi-Fuente:** Un requisito puede aplicar a varias fuentes con alcance COMPARTIDO
5. **Profesional:** Separación clara entre catálogo y casos reales

---

## 🎨 UX Mejorada

### Formulario de Requisito

**Nuevos campos:**

1. **Alcance del Requisito**
   - `ESPECIFICO_FUENTE`: Cliente sube documento diferente para cada fuente
   - `COMPARTIDO_CLIENTE`: Cliente sube documento UNA vez, aplica a todas

2. **Fuentes Aplicables (Multi-select)**
   - Checkbox por cada tipo de fuente
   - Selección múltiple
   - Hint dinámico según alcance

**Ejemplo:**
```
Alcance: COMPARTIDO_CLIENTE
Fuentes: [✓] Crédito Hipotecario
         [✓] Subsidio Caja Compensación
         [✓] Subsidio Mi Casa Ya

💡 El cliente sube el documento UNA sola vez
   y aplica para todas las fuentes seleccionadas
```

---

## 📚 Archivos Modificados

### Backend/Lógica
- `src/modules/requisitos-fuentes/services/requisitos.service.ts` ✅
- `src/modules/requisitos-fuentes/hooks/useRequisitos.ts` ✅
- `src/modules/requisitos-fuentes/types/index.ts` ✅

### Frontend/UI
- `src/modules/requisitos-fuentes/components/RequisitoForm.tsx` ✅
- `src/modules/requisitos-fuentes/components/RequisitoCard.tsx` ✅
- `src/app/admin/requisitos-fuentes/page.tsx` ✅

### Base de Datos
- `supabase/fix-eliminar-duplicados-subsidio.sql` ✅
- `supabase/estandarizar-nombres-fuentes.sql` ✅

---

## 🧪 Testing

**Verificar en Admin:**
1. Ir a `/admin/requisitos-fuentes`
2. Ver selector de tipos → Debe mostrar solo 4 tipos oficiales
3. Crear requisito nuevo
4. Seleccionar alcance COMPARTIDO
5. Marcar múltiples fuentes
6. Guardar → Debe crear un requisito por cada fuente seleccionada

**Verificar en Clientes:**
1. Ir a cliente con 3 fuentes (Crédito, Subsidio Caja, Mi Casa Ya)
2. Tab Documentos → Ver banner de pendientes
3. Boleta de Registro debe aparecer **UNA sola vez** (no 3)
4. Subir documento → Debe marcarse como completado en las 3 fuentes

---

## ✅ Checklist Final

- [x] Service consulta `tipos_fuentes_pago` (no `fuentes_pago`)
- [x] Array hardcodeado deprecado
- [x] Nombres estandarizados en BD
- [x] Duplicados eliminados
- [x] Campos corregidos (`categoria_documento`)
- [x] Formulario con multi-select de fuentes
- [x] Badge "Compartido entre Fuentes" en cards
- [x] TypeScript actualizado
- [x] Documentación creada

---

**Sistema 100% dinámico y profesional sin hardcoding** 🎯
