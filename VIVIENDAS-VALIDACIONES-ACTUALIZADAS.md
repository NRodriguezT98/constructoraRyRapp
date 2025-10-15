# ✅ Validaciones Mejoradas - Módulo Viviendas

## 📊 Resumen de Cambios

Se han implementado validaciones específicas y detalladas para cada campo del formulario de viviendas, siguiendo los formatos reales de los documentos inmobiliarios en Colombia.

---

## 🎯 Cambios Realizados

### 1. Constantes Actualizadas (`constants/index.ts`)

✅ **Nuevos Límites**:
```typescript
VIVIENDA_LIMITES = {
  MATRICULA_MIN: 7,         // Mínimo: 373-1234
  MATRICULA_MAX: 20,        // Flexible para formatos largos
  NOMENCLATURA_MIN: 5,
  NOMENCLATURA_MAX: 150,
  AREA_DECIMALES: 2,        // Máximo 2 decimales
  LINDERO_MIN: 10,
  LINDERO_MAX: 500,
}
```

✅ **Expresiones Regulares Nuevas**:
```typescript
REGEX_PATTERNS = {
  // Linderos: letras, números, espacios, comas, puntos, paréntesis, punto y coma, acentos
  LINDERO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.()\-;]+$/,

  // Matrícula: 373-123456 (números y guiones)
  MATRICULA: /^[0-9\-]+$/,

  // Nomenclatura: Calle 4A Sur # 4 - 05
  NOMENCLATURA: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#.\-]+$/,

  // Área: 61.00 (máximo 2 decimales)
  AREA: /^\d+(\.\d{1,2})?$/,

  // Valor base: solo enteros (sin decimales)
  VALOR_BASE: /^\d+$/,
}
```

✅ **Placeholders Actualizados**:
```typescript
PLACEHOLDERS = {
  LINDERO: 'Ej: Por el Norte con la Calle 123',
  MATRICULA: 'Ej: 373-123456',
  NOMENCLATURA: 'Ej: Calle 4A Sur # 4 - 05',
  AREA: 'Ej: 61.00',
  VALOR: 'Ej: 150000000',
}
```

### 2. Utilidades Nuevas (`utils/index.ts`)

✅ **5 Funciones de Validación Específicas**:

1. `validarLindero(valor: string): string | null`
   - Valida caracteres permitidos
   - Verifica longitud 10-500
   - Retorna mensaje de error o null

2. `validarMatricula(valor: string): string | null`
   - Formato: 373-123456
   - Solo números y guiones
   - Longitud 7-20 caracteres

3. `validarNomenclatura(valor: string): string | null`
   - Formato: Calle 4A Sur # 4 - 05
   - Permite #, -, puntos, espacios
   - Longitud 5-150 caracteres

4. `validarArea(valor: number | string, tipo: 'lote' | 'construida'): string | null`
   - Máximo 2 decimales
   - Rango 1-10,000 m²
   - Mensajes específicos por tipo

5. `validarValorBase(valor: number | string): string | null`
   - Solo números enteros
   - Rango $1M - $1,000M
   - Sin decimales ni separadores

### 3. Hook Actualizado (`useViviendaForm.ts`)

✅ **Validaciones por Paso**:

```typescript
// Paso 2: Linderos
validarPasoLinderos() {
  validarLindero(lindero_norte)
  validarLindero(lindero_sur)
  validarLindero(lindero_oriente)
  validarLindero(lindero_occidente)
}

// Paso 3: Legal
validarPasoLegal() {
  validarMatricula(matricula_inmobiliaria)
  validarNomenclatura(nomenclatura)
  validarArea(area_lote, 'lote')
  validarArea(area_construida, 'construida')
  validar tipo_vivienda seleccionado
}

// Paso 4: Financiero
validarPasoFinanciero() {
  validarValorBase(valor_base)
  validar recargo_esquinera si es_esquinera === true
}
```

### 4. SQL Schema Actualizado (`viviendas-extended-schema.sql`)

✅ **Constraints Mejorados**:

```sql
-- Linderos: 10-500 caracteres
lindero_norte TEXT CHECK (length(lindero_norte) >= 10 AND length(lindero_norte) <= 500)

-- Matrícula: 7-20 caracteres
matricula_inmobiliaria VARCHAR(20) CHECK (length(matricula_inmobiliaria) >= 7)

-- Nomenclatura: 5-150 caracteres
nomenclatura VARCHAR(150) CHECK (length(nomenclatura) >= 5)

-- Áreas: 1-10,000 m², máximo 2 decimales
area_lote NUMERIC(10, 2) CHECK (area_lote >= 1 AND area_lote <= 10000)
area_construida NUMERIC(10, 2) CHECK (area_construida >= 1 AND area_construida <= 10000)

-- Valores financieros: BIGINT (enteros), sin decimales
valor_base BIGINT NOT NULL DEFAULT 0 CHECK (valor_base >= 1000000)
recargo_esquinera BIGINT DEFAULT 0
gastos_notariales BIGINT DEFAULT 5000000
valor_total BIGINT GENERATED ALWAYS AS (valor_base + gastos_notariales + recargo_esquinera) STORED
```

✅ **Cambios de Tipo**:
- ❌ `NUMERIC(15, 2)` (con decimales)
- ✅ `BIGINT` (sin decimales) para valores monetarios

### 5. Componente Legal Mejorado (`paso-legal.tsx`)

✅ **Inputs con Sufijo m²**:

```tsx
<div className="relative">
  <input
    type="number"
    step="0.01"
    value={areaLote}
    onChange={...}
    className="pr-12" // Espacio para sufijo
  />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
    m²
  </span>
</div>
```

---

## 📋 Archivos Modificados

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `constants/index.ts` | Regex patterns, límites, placeholders | ~250 |
| `utils/index.ts` | 5 funciones de validación | ~305 |
| `hooks/useViviendaForm.ts` | Validaciones por paso | ~420 |
| `viviendas-extended-schema.sql` | Constraints SQL, tipos BIGINT | ~194 |
| `paso-legal.tsx` | Sufijos m² en áreas | ~250 |

**Total**: 5 archivos modificados

---

## ✅ Validaciones Implementadas

### Por Campo

| Campo | Validación Frontend | Validación Backend | Formato UI |
|-------|-------------------|-------------------|-----------|
| **Linderos (4x)** | Regex + longitud 10-500 | CHECK length | Textarea |
| **Matrícula** | Regex números-guiones, 7-20 chars | CHECK length >=7 | Input text |
| **Nomenclatura** | Regex direcciones, 5-150 chars | CHECK length >=5 | Input text |
| **Área Lote** | Regex 2 decimales, 1-10000 | CHECK range + NUMERIC(10,2) | Input + "m²" |
| **Área Construida** | Regex 2 decimales, 1-10000 | CHECK range + NUMERIC(10,2) | Input + "m²" |
| **Tipo Vivienda** | Required select | CHECK IN enum | Select |
| **Valor Base** | Regex enteros, 1M-1000M | CHECK >= 1M + BIGINT | Input + "$" |
| **Esquinera** | Boolean toggle | BOOLEAN | Toggle |
| **Recargo Esquinera** | Required if toggle ON | BIGINT | Select |
| **Certificado PDF** | Type + size (10MB) | TEXT (URL) | File upload |

---

## 🎨 UX Mejoradas

### Antes

```
Área del Lote (m²)
[ 61.00          ]
```

### Ahora

```
Área del Lote
[ 61.00       m² ]
```

✅ **Ventajas**:
- El sufijo "m²" es visual, no se puede editar
- El input solo acepta números
- Formato más limpio y profesional

---

## 🧪 Testing Sugerido

### Casos de Prueba

1. **Linderos**:
   - ✅ "Por el Norte con Calle 123"
   - ❌ "Norte" (muy corto)
   - ❌ "Norte@123" (caracteres especiales)

2. **Matrícula**:
   - ✅ "373-123456"
   - ❌ "123" (muy corto)
   - ❌ "373/123456" (barra no permitida)

3. **Nomenclatura**:
   - ✅ "Calle 4A Sur # 4 - 05"
   - ❌ "C1" (muy corto)
   - ❌ "Calle @ 123" (@ no permitido)

4. **Áreas**:
   - ✅ 61.00
   - ✅ 61 (se interpreta como 61.00)
   - ❌ 61,00 (coma en lugar de punto)
   - ❌ 61.123 (más de 2 decimales)

5. **Valor Base**:
   - ✅ 150000000
   - ❌ 150000000.50 (decimales no permitidos)
   - ❌ 500000 (menor al mínimo)

---

## 📝 Documentación Creada

📄 **`docs/VIVIENDAS-VALIDACIONES.md`** (~400 líneas)

Incluye:
- ✅ Validaciones por campo
- ✅ Regex patterns explicados
- ✅ Ejemplos válidos e inválidos
- ✅ Mensajes de error
- ✅ Constraints SQL
- ✅ Checklist completo
- ✅ Flujo de validación
- ✅ Referencias a archivos

---

## 🚀 Próximos Pasos

### Recomendado

1. **Ejecutar SQL actualizado**:
   ```sql
   -- En Supabase SQL Editor
   -- Ejecutar: supabase/viviendas-extended-schema.sql
   ```

2. **Regenerar tipos de TypeScript**:
   ```powershell
   npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
   ```

3. **Probar el formulario**:
   - Navegar a `/viviendas`
   - Intentar crear vivienda con datos inválidos
   - Verificar mensajes de error

4. **Verificar en DB**:
   - Intentar insertar datos inválidos directamente en SQL
   - Confirmar que los constraints funcionan

---

## ✨ Beneficios

### Validación Robusta
- ✅ Doble capa: Frontend + Backend
- ✅ Mensajes específicos y descriptivos
- ✅ Prevención de datos inconsistentes

### Mejor UX
- ✅ Formateo automático (COP, m²)
- ✅ Placeholders con ejemplos reales
- ✅ Feedback visual inmediato

### Código Limpio
- ✅ Funciones reutilizables
- ✅ Constantes centralizadas
- ✅ TypeScript estricto
- ✅ Separación de responsabilidades

### Mantenibilidad
- ✅ Fácil ajustar límites
- ✅ Regex documentados
- ✅ Un solo lugar para cambiar validaciones

---

## 🎯 Cumplimiento

✅ **Reglas de Oro**:
- Separación de responsabilidades
- Lógica en hooks/utils
- Componentes presentacionales
- Estilos centralizados
- TypeScript estricto (0 `any`)

✅ **Arquitectura**:
- Constants → Definiciones
- Utils → Funciones puras
- Hooks → Lógica de negocio
- Components → UI
- SQL → Constraints de DB

---

## 📚 Referencias

- **Documentación Completa**: `docs/VIVIENDAS-VALIDACIONES.md`
- **Constantes**: `src/modules/viviendas/constants/index.ts`
- **Utilidades**: `src/modules/viviendas/utils/index.ts`
- **Hook**: `src/modules/viviendas/hooks/useViviendaForm.ts`
- **SQL**: `supabase/viviendas-extended-schema.sql`
