# 🔒 Sistema de Categorías con UUIDs Fijos - Módulo Clientes

## 🎯 Objetivo

Garantizar que las 6 categorías predefinidas del módulo **Clientes** existan **SIEMPRE** con los **mismos UUIDs**, sin importar si se eliminan accidentalmente o si el sistema se instala en un nuevo entorno.

---

## ⚠️ ¿Por qué UUIDs Fijos?

### Problema Original:
- **Triggers de base de datos** usan UUIDs específicos (ej: documentos pendientes)
- **Lógica de negocio** depende de categorías específicas (ej: Carta de Aprobación)
- **Si una categoría se elimina y se recrea** → UUID diferente → **Triggers fallan**

### Solución:
- **UUIDs predefinidos en código** (extraídos de BD real)
- **Auto-seeding automático** al entrar a Documentos
- **Recreación con mismo UUID** si se elimina

---

## 📋 Categorías del Sistema (UUIDs Fijos)

| #  | Nombre | UUID | Usado en |
|----|--------|------|----------|
| 1️⃣ | **Documentos de Identidad** | `b795b842-f035-42ce-9ab9-7fef2e1c5f24` | Validación cédula, banner documento requerido |
| 2️⃣ | **Certificados de Tradición** | `bd49740e-d46d-43c8-973f-196f1418765c` | Verificación propiedad |
| 3️⃣ | **Escrituras Públicas** | `a82ca714-b191-4976-a089-66c031ff1496` | Proceso legal, minuta |
| 4️⃣ | **Documentos del Proceso** | `4898e798-c188-4f02-bfcf-b2b15be48e34` | **Cartas de aprobación**, promesas, actas, trigger documentos pendientes |
| 5️⃣ | **Gastos Notariales** | `f84ec757-2f11-4245-a487-5091176feec5` | Avalúos, paz y salvos |
| 6️⃣ | **Otros Documentos** | `f50f53d6-c1d8-4c42-9993-fddc2f8f5ade` | Genéricos, fotos |

---

## 🏗️ Arquitectura del Sistema

### 1️⃣ **Constantes con UUIDs Fijos**
```typescript
// src/modules/clientes/constants/categorias-sistema-clientes.constants.ts

export const CATEGORIAS_SISTEMA_CLIENTES = [
  {
    id: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24',  // ⚠️ UUID FIJO
    nombre: 'Documentos de Identidad',
    descripcion: 'Cédula del cliente...',
    color: 'green',
    icono: 'IdCard',
    orden: 1,
    es_sistema: true,
    modulos_permitidos: ['clientes']
  },
  // ... resto de categorías
]

export const CATEGORIA_IDS = {
  DOCUMENTOS_IDENTIDAD: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
  DOCUMENTOS_PROCESO: '4898e798-c188-4f02-bfcf-b2b15be48e34',  // ← Usado en triggers
  // ...
}
```

### 2️⃣ **Hook de Auto-Seeding**
```typescript
// src/modules/clientes/hooks/useCategoriasSistemaClientes.ts

export function useCategoriasSistemaClientes() {
  const verificarYCrear = async () => {
    // 1. Obtener categorías existentes
    const existentes = await supabase
      .from('categorias_documento')
      .select('id')
      .in('id', CATEGORIAS_SISTEMA_CLIENTES.map(c => c.id))

    // 2. Identificar faltantes
    const faltantes = CATEGORIAS_SISTEMA_CLIENTES.filter(
      c => !existentes.includes(c.id)
    )

    // 3. Crear con UUIDs fijos
    if (faltantes.length > 0) {
      await supabase.from('categorias_documento').insert(
        faltantes.map(cat => ({
          id: cat.id,  // ⚠️ UUID FIJO (no auto-generado)
          ...cat
        }))
      )
    }
  }

  return { verificarYCrear }
}
```

### 3️⃣ **Integración Automática**
```typescript
// src/app/clientes/[id]/tabs/documentos-tab.tsx

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const { verificarYCrear } = useCategoriasSistemaClientes()

  useEffect(() => {
    verificarYCrear()  // ✅ Se ejecuta automáticamente al entrar
  }, [verificarYCrear])

  // ... resto del componente
}
```

---

## 🔄 Flujo de Verificación

```
Usuario entra a /clientes/[id] → Tab Documentos
              ↓
    useCategoriasSistemaClientes()
              ↓
    Query: SELECT id WHERE id IN (uuid1, uuid2, ...)
              ↓
  ¿Faltan categorías? ───NO──→ Continuar normal
              │
             SÍ
              ↓
    INSERT categorías faltantes
    con UUIDs FIJOS predefinidos
              ↓
          ✅ Listo
```

---

## 🛡️ Protección en Base de Datos

### Constraint de Integridad
```sql
-- Prevenir eliminación accidental de categorías del sistema
ALTER TABLE categorias_documento
ADD CONSTRAINT proteger_categorias_sistema
CHECK (
  es_sistema = false OR  -- Permitir borrar categorías de usuario
  id NOT IN (            -- Pero NO las del sistema
    'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
    'bd49740e-d46d-43c8-973f-196f1418765c',
    'a82ca714-b191-4976-a089-66c031ff1496',
    '4898e798-c188-4f02-bfcf-b2b15be48e34',
    'f84ec757-2f11-4245-a487-5091176feec5',
    'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'
  )
);
```

---

## 📊 Ejemplo de Uso en Código

### Usar ID tipado en trigger
```typescript
import { CATEGORIA_IDS } from '@/modules/clientes/constants/categorias-sistema-clientes.constants'

// En lugar de hardcodear UUID:
const categoriaId = CATEGORIA_IDS.DOCUMENTOS_PROCESO  // ✅ Type-safe

await supabase.from('documentos_pendientes').insert({
  categoria_id: categoriaId,  // ✅ UUID correcto garantizado
  // ...
})
```

### Verificar si documento es de cierta categoría
```typescript
import { CATEGORIA_IDS } from '@/modules/clientes/constants/categorias-sistema-clientes.constants'

const esCartaAprobacion = documento.categoria_id === CATEGORIA_IDS.DOCUMENTOS_PROCESO
```

---

## ✅ Ventajas del Sistema

1. ✅ **Triggers funcionan siempre** (UUIDs consistentes)
2. ✅ **No errores de FK** al crear documentos pendientes
3. ✅ **Portable entre entornos** (dev, staging, prod)
4. ✅ **Auto-recuperación** si se eliminan categorías
5. ✅ **Type-safe** con constantes tipadas
6. ✅ **Zero-config** para usuarios (automático)

---

## 🔧 Mantenimiento

### Agregar nueva categoría del sistema:

1. **Generar UUID fijo**:
   ```bash
   node -e "console.log(require('crypto').randomUUID())"
   ```

2. **Agregar a constantes**:
   ```typescript
   export const CATEGORIAS_SISTEMA_CLIENTES = [
     // ... existentes
     {
       id: 'nuevo-uuid-generado',  // ⚠️ NUNCA cambiar después
       nombre: 'Nueva Categoría',
       // ...
     }
   ]
   ```

3. **Agregar a CATEGORIA_IDS**:
   ```typescript
   export const CATEGORIA_IDS = {
     // ... existentes
     NUEVA_CATEGORIA: 'nuevo-uuid-generado'
   }
   ```

4. **Agregar a constraint de BD** (opcional pero recomendado)

---

## 📚 Referencias

- **Constantes**: `src/modules/clientes/constants/categorias-sistema-clientes.constants.ts`
- **Hook**: `src/modules/clientes/hooks/useCategoriasSistemaClientes.ts`
- **Integración**: `src/app/clientes/[id]/tabs/documentos-tab.tsx`
- **Script extracción**: `extraer-categorias-clientes.js`

---

**✅ Sistema implementado**: 4 de diciembre de 2025
**📌 UUIDs extraídos**: Desde base de datos en producción
**⚠️ CRÍTICO**: NO modificar UUIDs una vez en producción
