# Sistema de Validación de Documentos para Fuentes de Pago

## 📋 Descripción General

Sistema automático de validación de documentos para fuentes de pago que utiliza el campo oculto `tipo_documento` para vincular documentos subidos con los pasos de validación requeridos.

**⭐ BENEFICIO PRINCIPAL**: El usuario NO selecciona manualmente el tipo de documento. El sistema lo asigna automáticamente al hacer clic en **"📤 Subir documento"** desde el card de la fuente de pago.

---

## 🎯 ¿Cómo Funciona?

### 1. **Configuración de Requisitos (Admin)**

El administrador define los requisitos de validación por tipo de fuente de pago desde el módulo de **Configuración**.

**Ejemplo: Crédito Hipotecario** requiere 3 documentos:
1. **Carta de aprobación de crédito** (obligatorio)
2. **Boleta de registro** (obligatorio)
3. **Certificado de tradición** (obligatorio)

Cada requisito tiene:
- ✅ **Título**: Nombre descriptivo ("Carta de aprobación de crédito")
- ✅ **Tipo de documento**: Valor técnico para matching (`carta_aprobacion_credito`)
- ✅ **Nivel de validación**: Obligatorio u Opcional
- ✅ **Orden**: Número que define la secuencia

---

### 2. **Creación Automática de Pasos**

Cuando se crea una nueva fuente de pago en el sistema, se ejecuta automáticamente:

```sql
-- Trigger que crea pasos desde la configuración
INSERT INTO pasos_fuente_pago (
  fuente_pago_id,
  tipo_fuente,
  tipo_documento_requerido,
  titulo,
  nivel_validacion,
  orden
)
SELECT
  [nueva_fuente].id,
  [nueva_fuente].tipo,
  config.tipo_documento,
  config.titulo,
  config.nivel_validacion,
  config.orden
FROM requisitos_fuentes_pago_config config
WHERE config.tipo_fuente = [nueva_fuente].tipo
  AND config.activo = true
ORDER BY config.orden
```

**Resultado**: La fuente tiene 3 pasos pendientes (0/3 completados, 0% progreso).

---

### 3. **Visualización en el Card de la Fuente**

El componente **FuentePagoCardConProgreso** muestra:

- 🔵 **Progreso circular**: 0% → 100%
- 📊 **Barra de progreso**: "0/3 pasos completados"
- 📄 **Lista de pasos**:
  - ❌ Carta de aprobación de crédito → [📤 Subir]
  - ❌ Boleta de registro → [📤 Subir]
  - ❌ Certificado de tradición → [📤 Subir]

---

### 4. **Subida de Documento con Metadata Automática**

**✅ MÉTODO CORRECTO (ÚNICO)**: Hacer clic en **"📤 Subir documento"** desde el card de la fuente de pago.

#### ¿Qué pasa al hacer clic?

1. **Se abre un modal** con el formulario `DocumentoUpload`
2. **Se pasan metadatos ocultos**:
   ```typescript
   metadata: {
     tipo_documento: 'carta_aprobacion_credito',  // ← Campo oculto
     fuente_pago_id: 'uuid-de-la-fuente',
     paso_id: 'uuid-del-paso'
   }
   ```

3. **El usuario ve un banner azul** informativo:
   ```
   🔗 Vinculación automática activada
   Este documento se validará como: Carta de aprobación de crédito
   Fuente de pago: [ID de la fuente]
   ```

4. **El usuario completa el formulario normal**:
   - Selecciona archivo (PDF, imagen, etc.)
   - Selecciona categoría (sugerida automáticamente: "Cartas de aprobación")
   - Agrega título (opcional, auto-generado si se deja vacío)

5. **Al subir**:
   - ✅ Se guarda en `documentos_cliente` con `tipo_documento = 'carta_aprobacion_credito'`
   - ✅ El trigger `vincular_documento_a_paso_fuente()` se ejecuta automáticamente
   - ✅ Busca coincidencia: `tipo_documento` + `fuente_pago_id` en metadata
   - ✅ Marca el paso como completado
   - ✅ Actualiza progreso (1/3 pasos, 33%)

---

### 5. **Actualización del Progreso**

El card de la fuente de pago se actualiza en **tiempo real** (React Query):

- 🔵 **Progreso circular**: 0% → 33% → 66% → 100%
- 📊 **Barra de progreso**: "1/3 pasos completados"
- 📄 **Lista actualizada**:
  - ✅ Carta de aprobación de crédito → [👁️ Ver PDF]
  - ❌ Boleta de registro → [📤 Subir]
  - ❌ Certificado de tradición → [📤 Subir]

---

### 6. **Validación Completa**

Cuando todos los pasos obligatorios están completados:

```
✓ Validación completa
Lista para desembolsar
```

El sistema permite registrar desembolsos desde el módulo de **Abonos**.

---

## 🔧 Componentes Técnicos

### Base de Datos

#### Tabla: `documentos_cliente`
```sql
CREATE TABLE documentos_cliente (
  id UUID PRIMARY KEY,
  cliente_id UUID NOT NULL,
  categoria_id UUID NOT NULL,  -- ✅ OBLIGATORIO (UI selecciona)
  titulo VARCHAR(255),
  url_storage TEXT NOT NULL,
  tipo_documento VARCHAR(100),  -- ✅ NULLABLE (campo oculto)
  metadata JSONB,               -- { fuente_pago_id, paso_id }
  -- ...
)
```

**Índices**:
```sql
-- Índice para búsqueda rápida del trigger
CREATE INDEX idx_documentos_cliente_tipo_metadata_fuente
ON documentos_cliente (tipo_documento, (metadata->>'fuente_pago_id'));
```

#### Tabla: `pasos_fuente_pago`
```sql
CREATE TABLE pasos_fuente_pago (
  id UUID PRIMARY KEY,
  fuente_pago_id UUID NOT NULL,
  tipo_fuente VARCHAR(100) NOT NULL,
  tipo_documento_requerido VARCHAR(100),  -- Match con documentos_cliente.tipo_documento
  titulo VARCHAR(255) NOT NULL,
  nivel_validacion nivel_validacion NOT NULL,  -- DOCUMENTO_OBLIGATORIO, DOCUMENTO_OPCIONAL
  orden INTEGER NOT NULL,
  completado BOOLEAN DEFAULT false,
  documento_id UUID,  -- FK a documentos_cliente
  completado_automaticamente BOOLEAN DEFAULT false,
  -- ...
)
```

#### Trigger: Vinculación Automática
```sql
CREATE OR REPLACE FUNCTION vincular_documento_a_paso_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_id UUID;
  v_tipo_doc VARCHAR(100);
  v_paso_id UUID;
BEGIN
  -- Extraer metadata
  v_fuente_id := (NEW.metadata->>'fuente_pago_id')::UUID;
  v_tipo_doc := NEW.tipo_documento;

  IF v_fuente_id IS NOT NULL AND v_tipo_doc IS NOT NULL THEN
    -- Buscar paso pendiente con matching exacto
    SELECT id INTO v_paso_id
    FROM pasos_fuente_pago
    WHERE fuente_pago_id = v_fuente_id
      AND tipo_documento_requerido = v_tipo_doc
      AND completado = false
    LIMIT 1;

    IF v_paso_id IS NOT NULL THEN
      -- Marcar como completado
      UPDATE pasos_fuente_pago
      SET
        completado = true,
        documento_id = NEW.id,
        completado_automaticamente = true,
        fecha_completado = NOW()
      WHERE id = v_paso_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Frontend

#### Hook: `useDocumentoUpload`
```typescript
export function useDocumentoUpload({
  metadata,
  // ...
}: UseDocumentoUploadProps) {
  // Extraer tipo_documento y fuente_pago_id de metadata
  const tipoDocumento = metadata?.tipo_documento
  const fuentePagoId = metadata?.fuente_pago_id

  // Obtener info del catálogo
  const infoTipoDocumento = tipoDocumento
    ? obtenerInfoTipoDocumento(tipoDocumento as TipoDocumentoValidacion)
    : null

  // Auto-seleccionar categoría sugerida
  useEffect(() => {
    if (infoTipoDocumento?.categoria_sugerida && categorias.length > 0) {
      const categoriaSugerida = categorias.find(
        c => c.nombre === infoTipoDocumento.categoria_sugerida
      )
      if (categoriaSugerida) {
        setValue('categoria_id', categoriaSugerida.id)
      }
    }
  }, [infoTipoDocumento, categorias])

  return {
    tipoDocumento,
    infoTipoDocumento,
    fuentePagoId,
    // ...
  }
}
```

#### Componente: `DocumentoUpload`
```tsx
export function DocumentoUpload({ metadata, ...props }) {
  const { tipoDocumento, infoTipoDocumento, fuentePagoId } = useDocumentoUpload({ metadata })

  return (
    <>
      {/* Banner azul de vinculación automática */}
      {tipoDocumento && infoTipoDocumento && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                🔗 Vinculación automática activada
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Este documento se validará como: <strong>{infoTipoDocumento.titulo}</strong>
              </p>
              {fuentePagoId && (
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                  Fuente de pago: {fuentePagoId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario normal... */}
    </>
  )
}
```

#### Componente: `FuentePagoCardConProgreso`
```tsx
export function FuentePagoCardConProgreso({ fuente, clienteId }) {
  const { pasos, progreso } = usePasosFuentePago(fuente.id)
  const [modalSubida, setModalSubida] = useState({ abierto: false, paso: null })

  return (
    <>
      {/* Card con lista de pasos */}
      {pasos.map(paso => (
        <div key={paso.id}>
          {paso.documento_id ? (
            <button onClick={() => verDocumento(paso.documento_id)}>
              👁️ Ver PDF
            </button>
          ) : (
            <button onClick={() => setModalSubida({ abierto: true, paso })}>
              📤 Subir
            </button>
          )}
        </div>
      ))}

      {/* Modal con metadata automática */}
      <Modal isOpen={modalSubida.abierto}>
        <DocumentoUpload
          entidadId={clienteId}
          tipoEntidad="cliente"
          metadata={{
            tipo_documento: modalSubida.paso?.tipo_documento_requerido,
            fuente_pago_id: fuente.id,
            paso_id: modalSubida.paso?.id,
          }}
        />
      </Modal>
    </>
  )
}
```

---

## 📚 Catálogo de Tipos de Documento

Ubicación: `src/modules/documentos/types/tipos-documento.ts`

```typescript
export type TipoDocumentoValidacion =
  | 'boleta_registro'
  | 'certificado_tradicion'
  | 'carta_aprobacion_credito'
  | 'carta_asignacion_subsidio'
  | 'avaluo_vivienda'
  | 'escritura_vivienda'
  | 'minuta_compraventa'
  | 'promesa_compraventa'
  | 'acta_entrega'
  | 'estudio_titulos'

export const TIPOS_DOCUMENTO: Record<TipoDocumentoValidacion, TipoDocumentoInfo> = {
  carta_aprobacion_credito: {
    titulo: 'Carta de aprobación de crédito',
    descripcion: 'Documento emitido por el banco aprobando el crédito hipotecario',
    categoria_sugerida: 'Cartas de aprobación',
    icono: 'FileCheck',
  },
  boleta_registro: {
    titulo: 'Boleta de registro',
    descripcion: 'Documento de registro oficial de la vivienda',
    categoria_sugerida: 'Escrituras Públicas',
    icono: 'FileSignature',
  },
  // ... resto de tipos
}
```

---

## 🧪 Testing End-to-End

### Escenario 1: Crédito Hipotecario

1. **Crear fuente de pago**:
   - Tipo: "Crédito Hipotecario"
   - Monto: $50,000,000
   - Entidad: "Banco de Bogotá"

2. **Verificar pasos creados**:
   ```sql
   SELECT * FROM pasos_fuente_pago WHERE fuente_pago_id = '[uuid]';
   -- 3 rows: carta_aprobacion_credito, boleta_registro, certificado_tradicion
   ```

3. **Subir documento "Carta de aprobación"**:
   - Click en "📤 Subir" del primer paso
   - Ver banner azul con tipo detectado
   - Subir archivo `carta-banco-bogota.pdf`
   - Verificar categoría auto-seleccionada: "Cartas de aprobación"

4. **Verificar vinculación**:
   ```sql
   SELECT * FROM pasos_fuente_pago WHERE fuente_pago_id = '[uuid]' AND completado = true;
   -- 1 row con documento_id NOT NULL
   ```

5. **Repetir para otros pasos** hasta 100%

6. **Verificar estado final**:
   - Card muestra: ✅ "Validación completa"
   - Todos los pasos tienen botón [👁️ Ver PDF]

---

## 🚨 Troubleshooting

### Problema: Documento no se vincula automáticamente

**Causas**:
1. ❌ Usuario NO usó botón "📤 Subir" del card
2. ❌ Usó "Subir documento" general (sin metadata)
3. ❌ `tipo_documento` en metadata NO coincide con `tipo_documento_requerido` del paso

**Solución**:
- SIEMPRE usar botón "📤 Subir" del card de la fuente
- Verificar metadata con:
  ```sql
  SELECT metadata FROM documentos_cliente WHERE id = '[uuid]';
  ```

### Problema: Paso no aparece en el card

**Causas**:
1. ❌ No se ejecutó script de creación de pasos
2. ❌ Fuente creada antes de configurar requisitos

**Solución**:
1. Ejecutar script de población:
   ```bash
   node crear-pasos-fuentes-existentes.js
   ```

2. O crear manualmente:
   ```sql
   INSERT INTO pasos_fuente_pago (...)
   SELECT ... FROM requisitos_fuentes_pago_config
   WHERE tipo_fuente = '[tipo]' AND activo = true;
   ```

### Problema: Progreso no se actualiza

**Causas**:
1. ❌ Cache de React Query desactualizado

**Solución**:
- React Query invalida automáticamente
- Si persiste, refrescar página (F5)

---

## 📝 Notas Importantes

### ✅ Lo que SÍ hace el sistema

- ✅ Vinculación automática por `tipo_documento` exacto
- ✅ Actualización en tiempo real del progreso
- ✅ Trigger de base de datos (no depende de frontend)
- ✅ Índices optimizados para performance
- ✅ Soporte para múltiples documentos del mismo tipo (vincula con primer paso pendiente)

### ❌ Lo que NO hace el sistema

- ❌ NO valida contenido del documento (eso es responsabilidad humana)
- ❌ NO reemplaza revisión manual de documentos
- ❌ NO previene subir documentos incorrectos (si el usuario fuerza otro archivo)
- ❌ NO registra desembolsos (eso se hace en módulo de Abonos)

---

## 🔐 Seguridad

- ✅ **RLS (Row Level Security)** activo en todas las tablas
- ✅ **Solo usuarios autenticados** pueden crear/ver pasos
- ✅ **Triggers protegidos** con validaciones de permisos
- ✅ **Metadata validada** antes de insert (no permite SQL injection)

---

## 📖 Referencias

- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Manual de usuario**: `docs/GUIA-USUARIO-SUBIR-DOCUMENTOS-PENDIENTES.md`
- **Migration**: `supabase/migrations/20251213_agregar_tipo_documento_validacion.sql`
- **Catálogo de tipos**: `src/modules/documentos/types/tipos-documento.ts`

---

## 🎯 Resumen Rápido

| **Paso** | **Acción** | **Resultado** |
|----------|------------|---------------|
| 1 | Admin configura requisitos por tipo de fuente | Tabla `requisitos_fuentes_pago_config` poblada |
| 2 | Usuario crea fuente de pago | Trigger crea pasos automáticamente |
| 3 | Card muestra pasos pendientes (0/3, 0%) | Lista con botones [📤 Subir] |
| 4 | Usuario hace clic en [📤 Subir] | Modal abre con metadata automática |
| 5 | Usuario ve banner azul de vinculación | Confirma tipo de documento detectado |
| 6 | Usuario sube archivo | Trigger vincula y marca paso completo |
| 7 | Card actualiza (1/3, 33%) | Progreso visual + botón [👁️ Ver PDF] |
| 8 | Repite hasta 100% | Estado final: ✅ "Validación completa" |

**🎉 ¡Sistema completamente automatizado con UX contextual y no invasiva!**
