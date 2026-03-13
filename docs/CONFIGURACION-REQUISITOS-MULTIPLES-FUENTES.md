# 📋 Configuración de Requisitos para Múltiples Fuentes

## 🎯 Objetivo

Permitir que un mismo requisito (especialmente documentos **COMPARTIDOS**) se configure para múltiples tipos de fuentes **desde la UX**, sin necesidad de hardcodear o duplicar configuraciones.

---

## 🔧 Caso de Uso: Boleta de Registro

### ✅ Configuración Correcta

La **Boleta de Registro** debe ser:
- **Requisito OBLIGATORIO** para 3 fuentes:
  1. Crédito Hipotecario
  2. Subsidio Caja de Compensación
  3. Subsidio Mi Casa Ya

- **Alcance:** `COMPARTIDO_CLIENTE`
  - El cliente sube el documento **UNA SOLA VEZ**
  - Aplica automáticamente para las 3 fuentes
  - No es necesario subir 3 documentos idénticos

---

## 🛠️ Cómo Configurarlo desde la UX

### Paso 1: Ir a Admin → Requisitos Fuentes

Navega a: `http://localhost:3000/admin/requisitos-fuentes`

### Paso 2: Seleccionar una Fuente Base

Selecciona cualquiera de las 3 fuentes (ej: Crédito Hipotecario)

### Paso 3: Crear Nuevo Requisito

Click en **"+ Nuevo Requisito"**

### Paso 4: Configurar Campos

```typescript
// Alcance del Requisito
alcance: 'COMPARTIDO_CLIENTE' // ← IMPORTANTE: Compartido entre fuentes

// Fuentes Aplicables (✅ SELECCIONAR LAS 3)
fuentes_seleccionadas: [
  'Crédito Hipotecario',           // ✅
  'Subsidio Caja de Compensación', // ✅
  'Subsidio Mi Casa Ya'             // ✅
]

// Identificador
paso_identificador: 'boleta_registro'

// Título
titulo: 'Boleta de Registro'

// Descripción
descripcion: 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente'

// Instrucciones
instrucciones: 'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.'

// Nivel de Validación
nivel_validacion: 'DOCUMENTO_OBLIGATORIO' // ← Obligatorio

// Tipo de Documento Sugerido
tipo_documento_sugerido: 'Boleta de Registro'

// Categoría
categoria_documento_requerida: 'escrituras'
```

---

## 💾 Resultado en Base de Datos

Al guardar, se crean **3 registros en `requisitos_fuentes_pago_config`**:

```sql
-- Registro 1: Crédito Hipotecario
INSERT INTO requisitos_fuentes_pago_config (
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  alcance,
  tipo_documento_sugerido,
  categoria_documento_requerida,
  orden,
  activo
) VALUES (
  'Crédito Hipotecario',
  'boleta_registro',
  'Boleta de Registro',
  'Documento expedido por la Oficina de Registro...',
  'Sube la boleta oficial expedida...',
  'DOCUMENTO_OBLIGATORIO',
  'COMPARTIDO_CLIENTE', -- ← CLAVE
  'Boleta de Registro',
  'escrituras',
  2,
  true
);

-- Registro 2: Subsidio Caja (mismos valores, diferente tipo_fuente)
INSERT INTO requisitos_fuentes_pago_config (...) VALUES (
  'Subsidio Caja de Compensación', -- ← Solo cambia esto
  'boleta_registro',
  'Boleta de Registro',
  ...
);

-- Registro 3: Subsidio Mi Casa Ya (mismos valores, diferente tipo_fuente)
INSERT INTO requisitos_fuentes_pago_config (...) VALUES (
  'Subsidio Mi Casa Ya', -- ← Solo cambia esto
  'boleta_registro',
  'Boleta de Registro',
  ...
);
```

---

## 📊 Vista de Documentos Pendientes

La vista `vista_documentos_pendientes_fuentes` agrupa automáticamente:

```sql
-- ✅ ANTES (sin consolidación): Aparecían 3 pendientes
Boleta de Registro - Crédito Hipotecario     [Pendiente]
Boleta de Registro - Subsidio Caja          [Pendiente]
Boleta de Registro - Subsidio Mi Casa Ya    [Pendiente]

-- ✅ DESPUÉS (con alcance COMPARTIDO_CLIENTE): Aparece 1 pendiente
Boleta de Registro                          [Pendiente]
  ↳ Aplica a: Crédito Hipotecario, Subsidio Caja, Subsidio Mi Casa Ya
```

**Query de la vista:**

```sql
SELECT DISTINCT ON (
  CASE
    WHEN rfc.alcance = 'COMPARTIDO_CLIENTE'
    THEN rfc.paso_identificador || '-' || fp.cliente_id
    ELSE rfc.id || '-' || fp.id
  END
)
  gen_random_uuid() AS id,
  fp.cliente_id,
  CASE
    WHEN rfc.alcance = 'COMPARTIDO_CLIENTE' THEN NULL
    ELSE fp.id
  END AS fuente_pago_id,
  rfc.titulo AS tipo_documento,
  ...
FROM fuentes_pago fp
JOIN requisitos_fuentes_pago_config rfc
  ON fp.tipo = rfc.tipo_fuente
LEFT JOIN documentos_cliente dc
  ON dc.cliente_id = fp.cliente_id
  AND dc.categoria = rfc.categoria_documento_requerida
WHERE
  fp.estado = 'Activa'
  AND rfc.activo = true
  AND dc.id IS NULL -- No existe documento
  AND rfc.alcance IN ('ESPECIFICO_FUENTE', 'COMPARTIDO_CLIENTE')
```

---

## 🎨 UI Components

### Banner de Documentos Pendientes

```tsx
// src/modules/clientes/components/documentos-pendientes/SeccionDocumentosPendientes.tsx

<SeccionDocumentosPendientes clienteId={cliente.id} />

// Mostrará:
// ⚠️ Tienes 1 documento pendiente
//   └─ Boleta de Registro [COMPARTIDO] - Subir
```

### Al Subir el Documento

```typescript
// Metadata automática
{
  alcance: 'COMPARTIDO_CLIENTE',
  paso_identificador: 'boleta_registro',
  fuentes_aplicables: [
    'Crédito Hipotecario',
    'Subsidio Caja de Compensación',
    'Subsidio Mi Casa Ya'
  ]
}
```

---

## ✅ Ventajas del Sistema

1. ✅ **UX Simple:** Todo configurable desde admin panel
2. ✅ **No Hardcoding:** No código duro en backend
3. ✅ **Escalable:** Agregar nuevas fuentes es trivial
4. ✅ **Flexible:** Cambiar alcance de requisitos sin migración
5. ✅ **Intuitivo:** UI clara con hints y ejemplos
6. ✅ **Performance:** Vista SQL optimizada con DISTINCT ON

---

## 🚫 Errores Comunes que Evitar

### ❌ Crear 3 requisitos separados con alcance ESPECÍFICO
```typescript
// INCORRECTO
{
  tipo_fuente: 'Crédito Hipotecario',
  alcance: 'ESPECIFICO_FUENTE', // ← MAL
  paso_identificador: 'boleta_registro_credito'
}
{
  tipo_fuente: 'Subsidio Caja',
  alcance: 'ESPECIFICO_FUENTE', // ← MAL
  paso_identificador: 'boleta_registro_subsidio'
}
// Resultado: Cliente debe subir 3 documentos idénticos 😞
```

### ✅ Crear 1 requisito para múltiples fuentes con alcance COMPARTIDO
```typescript
// CORRECTO
{
  fuentes: ['Crédito Hipotecario', 'Subsidio Caja', 'Subsidio Mi Casa Ya'],
  alcance: 'COMPARTIDO_CLIENTE', // ← BIEN
  paso_identificador: 'boleta_registro'
}
// Resultado: Cliente sube 1 solo documento y aplica a todas 🎉
```

---

## 📚 Referencias

- **Vista SQL:** `supabase/migrations/20251218_actualizar_titulo_compartidos.sql`
- **Component:** `src/modules/clientes/components/documentos-pendientes/SeccionDocumentosPendientes.tsx`
- **Admin Page:** `src/app/admin/requisitos-fuentes/page.tsx`
- **Formulario:** `src/modules/requisitos-fuentes/components/RequisitoForm.tsx`
- **Tipos:** `src/modules/requisitos-fuentes/types/index.ts`
- **Hook:** `src/modules/requisitos-fuentes/hooks/useRequisitos.ts`

---

## 🎯 Checklist de Validación

- [ ] Boleta de Registro configurada con `alcance = COMPARTIDO_CLIENTE`
- [ ] Asociada a 3 tipos de fuentes
- [ ] Vista muestra solo 1 pendiente (no 3)
- [ ] Al subir documento, se marca como completado en las 3 fuentes
- [ ] Badge "Compartido entre Fuentes" visible en card del admin
- [ ] Hint informativo en formulario de creación
- [ ] Multiselect de fuentes funcional

---

**✨ Sistema completamente funcional y profesional sin hardcoding** 🎯
