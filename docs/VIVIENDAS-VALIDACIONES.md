# Validaciones del Módulo Viviendas

## 📋 Resumen

Este documento describe todas las validaciones implementadas en el módulo de Viviendas, incluyendo formatos, restricciones y mensajes de error.

---

## 🔍 Validaciones por Campo

### 1. Linderos (4 campos)

**Campos**: `lindero_norte`, `lindero_sur`, `lindero_oriente`, `lindero_occidente`

**Caracteres Permitidos**:
- Letras (a-z, A-Z)
- Letras con acentos (á, é, í, ó, ú, Á, É, Í, Ó, Ú, ñ, Ñ)
- Números (0-9)
- Espacios
- Comas (,)
- Puntos (.)
- Paréntesis ( )
- Guiones (-)
- Punto y coma (;)

**Restricciones**:
- Mínimo: 10 caracteres
- Máximo: 500 caracteres
- Obligatorio

**Regex**: `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.()\-;]+$/`

**Ejemplo Válido**: `Por el Norte con la Calle 123, lote de 10 metros`

**Mensajes de Error**:
- ❌ "Este campo es obligatorio"
- ❌ "Mínimo 10 caracteres"
- ❌ "Máximo 500 caracteres"
- ❌ "Solo se permiten letras, números, espacios, comas, puntos, paréntesis y punto y coma"

---

### 2. Matrícula Inmobiliaria

**Campo**: `matricula_inmobiliaria`

**Caracteres Permitidos**:
- Números (0-9)
- Guiones (-)

**Restricciones**:
- Mínimo: 7 caracteres
- Máximo: 20 caracteres
- Obligatorio

**Regex**: `/^[0-9\-]+$/`

**Ejemplo Válido**: `373-123456`

**Mensajes de Error**:
- ❌ "La matrícula inmobiliaria es obligatoria"
- ❌ "Mínimo 7 caracteres"
- ❌ "Máximo 20 caracteres"
- ❌ "Solo se permiten números y guiones (Ej: 373-123456)"

**Placeholder**: `Ej: 373-123456`

---

### 3. Nomenclatura

**Campo**: `nomenclatura`

**Caracteres Permitidos**:
- Letras (a-z, A-Z)
- Letras con acentos (á, é, í, ó, ú, ñ)
- Números (0-9)
- Espacios
- Numeral (#)
- Puntos (.)
- Guiones (-)

**Restricciones**:
- Mínimo: 5 caracteres
- Máximo: 150 caracteres
- Obligatorio

**Regex**: `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#.\-]+$/`

**Ejemplo Válido**: `Calle 4A Sur # 4 - 05`

**Mensajes de Error**:
- ❌ "La nomenclatura es obligatoria"
- ❌ "Mínimo 5 caracteres"
- ❌ "Máximo 150 caracteres"
- ❌ "Solo se permiten letras, números, #, -, espacios y puntos"

**Placeholder**: `Ej: Calle 4A Sur # 4 - 05`

---

### 4. Área del Lote

**Campo**: `area_lote`

**Formato**:
- Números con hasta 2 decimales
- Separador decimal: punto (.)
- NO se incluye "m²" en el input (se muestra automáticamente)

**Restricciones**:
- Mínimo: 1 m²
- Máximo: 10,000 m²
- Obligatorio

**Regex**: `/^\d+(\.\d{1,2})?$/`

**Ejemplo Válido**: `61.00` (se muestra como "61.00 m²")

**Mensajes de Error**:
- ❌ "El área del lote es obligatoria"
- ❌ "Solo se permiten números con hasta 2 decimales (Ej: 61.00)"
- ❌ "El área mínima es 1 m²"
- ❌ "El área máxima es 10,000 m²"

**Placeholder**: `Ej: 61.00`

**UI**: Input con sufijo "m²" fijo a la derecha

---

### 5. Área Construida

**Campo**: `area_construida`

**Formato**:
- Números con hasta 2 decimales
- Separador decimal: punto (.)
- NO se incluye "m²" en el input (se muestra automáticamente)

**Restricciones**:
- Mínimo: 1 m²
- Máximo: 10,000 m²
- Obligatorio

**Regex**: `/^\d+(\.\d{1,2})?$/`

**Ejemplo Válido**: `41.00` (se muestra como "41.00 m²")

**Mensajes de Error**:
- ❌ "El área construida es obligatoria"
- ❌ "Solo se permiten números con hasta 2 decimales (Ej: 61.00)"
- ❌ "El área mínima es 1 m²"
- ❌ "El área máxima es 10,000 m²"

**Placeholder**: `Ej: 61.00`

**UI**: Input con sufijo "m²" fijo a la derecha

---

### 6. Valor Base de la Casa

**Campo**: `valor_base`

**Formato**:
- Solo números enteros
- SIN decimales
- SIN puntos
- SIN comas
- Se formatea automáticamente en COP al mostrar

**Restricciones**:
- Mínimo: $1.000.000 COP
- Máximo: $1.000.000.000 COP
- Obligatorio

**Regex**: `/^\d+$/`

**Ejemplo Válido**: `150000000` (se muestra como "$150.000.000")

**Mensajes de Error**:
- ❌ "El valor base es obligatorio"
- ❌ "Solo se permiten números enteros (sin decimales ni puntos)"
- ❌ "El valor mínimo es $1.000.000"
- ❌ "El valor máximo es $1.000.000.000"

**Placeholder**: `Ej: 150000000`

**UI**: Input con prefijo "$" y formateo automático en tiempo real

---

### 7. Tipo de Vivienda

**Campo**: `tipo_vivienda`

**Valores Permitidos**:
- `"Regular"`
- `"Irregular"`

**Restricciones**:
- Obligatorio (select sin opción por defecto)

**Mensajes de Error**:
- ❌ "El tipo de vivienda es requerido"

**UI**: Select obligatorio (sin opción vacía predeterminada)

---

### 8. Casa Esquinera

**Campo**: `es_esquinera`

**Tipo**: Boolean (toggle)

**Valores**:
- `true`: Sí es esquinera (muestra select de recargo)
- `false`: No es esquinera (oculta select de recargo)

**Comportamiento**:
- Si `es_esquinera === true` → el select de recargo es obligatorio
- Si `es_esquinera === false` → el recargo se resetea a 0

**Mensajes de Error**:
- ❌ "Debe seleccionar el recargo para casa esquinera" (solo si toggle activo y sin selección)

---

### 9. Recargo Esquinera

**Campo**: `recargo_esquinera`

**Valores Disponibles** (desde configuración):
- $5.000.000 COP
- $10.000.000 COP

**Restricciones**:
- Obligatorio solo si `es_esquinera === true`
- Solo números enteros (BIGINT en DB)

**UI**: Select que solo aparece si el toggle está activo

---

### 10. Certificado de Tradición y Libertad

**Campo**: `certificado_tradicion_url` (archivo PDF)

**Restricciones**:
- Tipo: Solo PDF
- Tamaño máximo: 10 MB
- Opcional

**Mensajes de Error**:
- ❌ "El archivo debe ser un PDF"
- ❌ "El archivo no debe superar 10MB"

---

## 🗄️ Validaciones en Base de Datos

### Constraints SQL

```sql
-- Linderos: longitud 10-500 caracteres
ALTER TABLE viviendas ADD CONSTRAINT lindero_norte_length
  CHECK (length(lindero_norte) >= 10 AND length(lindero_norte) <= 500);

-- Matrícula: longitud mínima 7 caracteres
ALTER TABLE viviendas ADD CONSTRAINT matricula_length
  CHECK (length(matricula_inmobiliaria) >= 7);

-- Nomenclatura: longitud mínima 5 caracteres
ALTER TABLE viviendas ADD CONSTRAINT nomenclatura_length
  CHECK (length(nomenclatura) >= 5);

-- Áreas: rango 1-10000 m², máximo 2 decimales
ALTER TABLE viviendas ADD CONSTRAINT area_lote_range
  CHECK (area_lote >= 1 AND area_lote <= 10000);
ALTER TABLE viviendas ADD CONSTRAINT area_construida_range
  CHECK (area_construida >= 1 AND area_construida <= 10000);

-- Tipo de vivienda: enum
ALTER TABLE viviendas ADD CONSTRAINT tipo_vivienda_enum
  CHECK (tipo_vivienda IN ('Regular', 'Irregular'));

-- Valor base: mínimo 1M, solo enteros (BIGINT)
ALTER TABLE viviendas ADD CONSTRAINT valor_base_min
  CHECK (valor_base >= 1000000);
```

### Tipos de Datos

| Campo | Tipo SQL | Decimales |
|-------|----------|-----------|
| `lindero_norte` | TEXT | N/A |
| `lindero_sur` | TEXT | N/A |
| `lindero_oriente` | TEXT | N/A |
| `lindero_occidente` | TEXT | N/A |
| `matricula_inmobiliaria` | VARCHAR(20) | N/A |
| `nomenclatura` | VARCHAR(150) | N/A |
| `area_lote` | NUMERIC(10,2) | 2 |
| `area_construida` | NUMERIC(10,2) | 2 |
| `tipo_vivienda` | VARCHAR(20) | N/A |
| `valor_base` | BIGINT | 0 |
| `recargo_esquinera` | BIGINT | 0 |
| `gastos_notariales` | BIGINT | 0 |
| `valor_total` | BIGINT (GENERATED) | 0 |

---

## ✅ Checklist de Validación

### Frontend (TypeScript)

- [x] Regex patterns para cada campo
- [x] Funciones de validación específicas
- [x] Mensajes de error descriptivos
- [x] Validación en tiempo real (onChange)
- [x] Validación por paso (paso a paso)
- [x] Formateo automático (COP, áreas con m²)
- [x] Restricciones min/max en inputs
- [x] Tipos TypeScript estrictos

### Backend (Supabase)

- [x] Constraints SQL en todos los campos
- [x] Tipos de datos apropiados
- [x] Checks de rango y longitud
- [x] Enums para campos cerrados
- [x] Valor total calculado automáticamente

### UX

- [x] Placeholders con ejemplos
- [x] Labels descriptivos
- [x] Sufijos visuales (m², $)
- [x] Errores inline bajo cada campo
- [x] Validación progresiva (no bloquea hasta avanzar)
- [x] Feedback visual (rojo en error)

---

## 🔄 Flujo de Validación

1. **Input del Usuario** → Escribe en el campo
2. **Formateo** → Se aplica formato visual (COP, m²)
3. **onChange** → Se actualiza el estado
4. **Al Avanzar Paso** → Se ejecuta validación completa
5. **Mostrar Errores** → Mensajes inline específicos
6. **Bloquear Avance** → No permite continuar si hay errores
7. **Submit Final** → Validación completa antes de enviar a DB
8. **DB Constraint** → Última capa de validación

---

## 📝 Ejemplos de Uso

### Ejemplo Completo de Vivienda Válida

```typescript
{
  // Ubicación
  proyecto_id: "uuid-proyecto",
  manzana_id: "uuid-manzana",
  numero: "1",

  // Linderos (10-500 caracteres cada uno)
  lindero_norte: "Por el Norte con la Calle 123, lote de 10 metros",
  lindero_sur: "Por el Sur con el lote número 5, en línea recta de 10m",
  lindero_oriente: "Por el Oriente con la Carrera 45 (vía pública)",
  lindero_occidente: "Por el Occidente con el lote 3 del señor García",

  // Legal
  matricula_inmobiliaria: "373-123456",
  nomenclatura: "Calle 4A Sur # 4 - 05",
  area_lote: 61.00,           // m²
  area_construida: 41.00,     // m²
  tipo_vivienda: "Regular",   // o "Irregular"

  // Financiero
  valor_base: 150000000,      // $150.000.000
  es_esquinera: true,
  recargo_esquinera: 5000000, // $5.000.000

  // Opcional
  certificado_tradicion_url: "https://storage.supabase.co/..."
}
```

---

## 🚨 Casos de Error Comunes

### Linderos

```typescript
❌ "Norte"                    // Muy corto (< 10 caracteres)
❌ "Norte@123"                // Caracter especial no permitido
✅ "Por el Norte con Calle 1" // Válido
```

### Matrícula

```typescript
❌ "123"                      // Muy corto (< 7 caracteres)
❌ "373/123456"               // Barra no permitida
✅ "373-123456"               // Válido
```

### Nomenclatura

```typescript
❌ "C1"                       // Muy corto (< 5 caracteres)
❌ "Calle 1 @ 2"              // @ no permitido
✅ "Calle 4A Sur # 4 - 05"    // Válido
```

### Áreas

```typescript
❌ "61,00"                    // Coma en lugar de punto
❌ "61.123"                   // Más de 2 decimales
✅ "61.00"                    // Válido
✅ "61"                       // Válido (se interpreta como 61.00)
```

### Valor Base

```typescript
❌ 150000000.50               // Decimales no permitidos
❌ "150.000.000"              // String formateado (usar número)
✅ 150000000                  // Válido
```

---

## 🎯 Responsabilidades

| Validación | Dónde | Archivo |
|------------|-------|---------|
| Regex Patterns | Constants | `constants/index.ts` |
| Funciones Validación | Utils | `utils/index.ts` |
| Validación por Paso | Hook | `hooks/useViviendaForm.ts` |
| Formateo Visual | Componentes | `components/paso-*.tsx` |
| Constraints DB | SQL | `supabase/viviendas-extended-schema.sql` |

---

## 📚 Referencias

- **Constantes**: `src/modules/viviendas/constants/index.ts`
- **Utilidades**: `src/modules/viviendas/utils/index.ts`
- **Hook Principal**: `src/modules/viviendas/hooks/useViviendaForm.ts`
- **SQL Schema**: `supabase/viviendas-extended-schema.sql`
