# ✅ Validación de Matrícula Inmobiliaria Única

## 📋 Resumen de Implementación

Se implementó la validación de unicidad de matrícula inmobiliaria en el módulo de viviendas para evitar duplicados.

## 🔧 Cambios Realizados

### 1. **Service Layer** (`viviendas.service.ts`)

#### Método `crear()` - ANTES:
```typescript
async crear(formData: ViviendaFormData): Promise<Vivienda> {
  // ❌ NO validaba matrícula única
  // Insertaba directamente
  const { data, error } = await supabase.from('viviendas').insert(...)
}
```

#### Método `crear()` - DESPUÉS:
```typescript
async crear(formData: ViviendaFormData): Promise<Vivienda> {
  // ✅ VALIDA matrícula única ANTES de insertar
  const esUnica = await this.verificarMatriculaUnica(formData.matricula_inmobiliaria)
  if (!esUnica) {
    throw new Error(`La matrícula inmobiliaria "${formData.matricula_inmobiliaria}" ya está registrada en otra vivienda.`)
  }

  // Luego inserta...
}
```

#### Método `actualizar()` - DESPUÉS:
```typescript
async actualizar(id: string, formData: Partial<ViviendaFormData>): Promise<Vivienda> {
  // ✅ VALIDA matrícula única ANTES de actualizar (excluyendo la vivienda actual)
  if (formData.matricula_inmobiliaria !== undefined) {
    const esUnica = await this.verificarMatriculaUnica(formData.matricula_inmobiliaria, id)
    if (!esUnica) {
      throw new Error(`La matrícula inmobiliaria "${formData.matricula_inmobiliaria}" ya está registrada en otra vivienda.`)
    }
  }

  // Luego actualiza...
}
```

### 2. **Hook Layer** (`useNuevaVivienda.ts`)

#### ANTES:
```typescript
} catch (error) {
  console.error('❌ Error al crear vivienda:', error)
  // ❌ NO mostraba mensaje al usuario
}
```

#### DESPUÉS:
```typescript
} catch (error) {
  console.error('❌ Error al crear vivienda:', error)

  // ✅ Muestra error inline en el campo del formulario
  if (error instanceof Error && error.message.includes('matrícula inmobiliaria')) {
    setError('matricula_inmobiliaria', {
      type: 'manual',
      message: error.message
    })
    // Volver al paso 3 donde está el campo de matrícula
    setPasoActual(3)
  }
}
```

## 🗄️ Constraint de Base de Datos

La base de datos YA tenía implementado el constraint de unicidad:

```sql
-- Archivo: supabase/schemas/viviendas-extended-schema.sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_matricula_inmobiliaria_unica
ON public.viviendas(matricula_inmobiliaria)
WHERE matricula_inmobiliaria IS NOT NULL;
```

**Problema anterior**: El constraint de BD rechazaba la inserción DESPUÉS de enviar todos los datos, mostrando error técnico.

**Solución actual**: Validación en FRONTEND antes de enviar → mensaje inline en el campo del formulario.

## 🎯 Flujo de Validación

### Crear Nueva Vivienda:
```
1. Usuario llena formulario con matrícula "373-123456"
2. Usuario presiona "Crear Vivienda"
3. Hook llama a viviendasService.crear()
4. Service ejecuta verificarMatriculaUnica("373-123456")
   ├─ Si existe → throw Error("La matrícula... ya está registrada")
   │  └─ Hook captura error → setError('matricula_inmobiliaria', {...})
   │     └─ Formulario vuelve al paso 3
   │        └─ Usuario ve error rojo bajo el campo
   │           └─ Puede corregir sin perder datos
   │
   └─ Si NO existe → Continúa con inserción
      └─ Success → Redirección a /viviendas
```

### Editar Vivienda Existente:
```
1. Usuario edita matrícula de vivienda ID="abc-123"
2. Cambia de "373-111111" a "373-222222"
3. Service ejecuta verificarMatriculaUnica("373-222222", "abc-123")
   ├─ Query: SELECT * WHERE matricula='373-222222' AND id != 'abc-123'
   │
   ├─ Si encuentra coincidencia → Error (duplicado en OTRA vivienda)
   │
   └─ Si NO encuentra → OK (cambio válido)
```

## 🧪 Casos de Prueba

### ✅ Caso 1: Crear vivienda con matrícula nueva
```typescript
// Matrícula: "373-999999" (NO existe en BD)
// Resultado esperado: ✅ Creación exitosa
```

### ❌ Caso 2: Crear vivienda con matrícula duplicada
```typescript
// Matrícula: "373-123456" (YA existe en BD)
// Resultado esperado:
// - ❌ Error inline: "La matrícula inmobiliaria '373-123456' ya está registrada..."
// - � Formulario vuelve al paso 3
// - � Mensaje de error bajo el campo
// - 📝 Todos los datos conservados
```

### ✅ Caso 3: Editar vivienda SIN cambiar matrícula
```typescript
// Vivienda actual: matrícula="373-123456"
// Usuario edita otros campos (área, linderos, etc.)
// NO toca el campo matrícula
// Resultado esperado: ✅ Actualización exitosa (no se valida matrícula)
```

### ✅ Caso 4: Editar vivienda cambiando a matrícula nueva
```typescript
// Vivienda actual: matrícula="373-123456"
// Usuario cambia a: matrícula="373-999999" (NO existe en otras viviendas)
// Resultado esperado: ✅ Actualización exitosa
```

### ❌ Caso 5: Editar vivienda con matrícula duplicada
```typescript
// Vivienda actual: ID="abc", matrícula="373-111111"
// Usuario cambia a: matrícula="373-222222"
// Pero "373-222222" YA existe en vivienda ID="xyz"
// Resultado esperado:
// - ❌ Error inline bajo el campo
// - � Mensaje descriptivo
```

## 📊 Logs de Depuración

Al crear/editar vivienda, verás en consola:

```
🏗️ [CREAR VIVIENDA] Iniciando creación...
🔍 [CREAR VIVIENDA] Validando unicidad de matrícula: 373-123456
✅ [CREAR VIVIENDA] Matrícula única validada
📤 [CREAR VIVIENDA] Subiendo certificado a Storage...
...
```

Si hay duplicado:
```
🏗️ [CREAR VIVIENDA] Iniciando creación...
🔍 [CREAR VIVIENDA] Validando unicidad de matrícula: 373-123456
❌ [CREAR VIVIENDA] Matrícula duplicada: 373-123456
❌ [NUEVA VIVIENDA] Error al crear vivienda: Error: La matrícula inmobiliaria "373-123456" ya está registrada en otra vivienda.
```

## 🔐 Seguridad en Capas

1. **Frontend (Hook)**: Validación con error inline en formulario
2. **Backend (Service)**: Validación programática antes de BD
3. **Base de Datos**: Constraint UNIQUE como última línea de defensa

**Ventaja**: Si alguien intenta crear duplicado via API directa (sin pasar por el hook), el constraint de BD lo rechazará.

## ✨ Beneficios

- ✅ **UX consistente**: Errores se muestran donde el usuario espera (en el campo)
- ✅ **Navegación automática**: Vuelve al paso 3 donde está el error
- ✅ **Mensajes claros**: "La matrícula X ya está registrada" (no error técnico)
- ✅ **Validación temprana**: Evita llamadas innecesarias a BD
- ✅ **Datos preservados**: Formulario no se limpia al encontrar error
- ✅ **Seguridad**: Triple capa de validación
- ✅ **Auditable**: Logs detallados en consola

## 📝 Cómo Se Ve en la UI

Cuando hay error de matrícula duplicada:

1. **Formulario vuelve automáticamente al Paso 3** (Información Legal)
2. **Campo de matrícula muestra borde rojo**
3. **Mensaje de error bajo el campo**:
   ```
   ⚠️ La matrícula inmobiliaria "373-123456" ya está registrada en otra vivienda.
   ```
4. **Todos los demás campos conservan sus valores**
5. **Usuario puede corregir la matrícula y continuar**
