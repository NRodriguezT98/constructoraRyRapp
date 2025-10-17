# 🚀 IMPLEMENTACIÓN COMPLETA: Sistema de Documentos para Clientes

## ⚠️ IMPORTANTE: Orden de Ejecución

**PASO 1**: Ejecutar SQL en Supabase
**PASO 2**: Regenerar tipos TypeScript
**PASO 3**: Implementar código frontend

---

## 📋 PASO 1: Ejecutar SQL en Supabase (5 min)

### 1.1 Abrir Supabase Dashboard

```
https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
```

### 1.2 Ir a SQL Editor

- Click en "SQL Editor" en el menú lateral
- Click en "New query"

### 1.3 Ejecutar el siguiente SQL

```sql
-- ============================================
-- CREAR TABLA documentos_cliente
-- ============================================

CREATE TABLE IF NOT EXISTS public.documentos_cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias_documento(id) ON DELETE SET NULL,

  -- Información del documento
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,

  -- Información del archivo
  nombre_archivo VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  url_storage TEXT NOT NULL,

  -- Organización
  etiquetas TEXT[],

  -- Sistema de versionado
  version INTEGER NOT NULL DEFAULT 1,
  es_version_actual BOOLEAN NOT NULL DEFAULT TRUE,
  documento_padre_id UUID REFERENCES public.documentos_cliente(id) ON DELETE SET NULL,

  -- Estado y metadata
  estado VARCHAR(50) NOT NULL DEFAULT 'activo',
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  subido_por TEXT NOT NULL,
  fecha_documento TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  es_importante BOOLEAN DEFAULT FALSE,

  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_docs_cliente_cliente_id ON public.documentos_cliente(cliente_id);
CREATE INDEX idx_docs_cliente_categoria_id ON public.documentos_cliente(categoria_id);
CREATE INDEX idx_docs_cliente_estado ON public.documentos_cliente(estado);
CREATE INDEX idx_docs_cliente_fecha_vencimiento ON public.documentos_cliente(fecha_vencimiento);
CREATE INDEX idx_docs_cliente_documento_padre_id ON public.documentos_cliente(documento_padre_id);
CREATE INDEX idx_docs_cliente_etiquetas ON public.documentos_cliente USING gin(etiquetas);
CREATE INDEX idx_docs_cliente_importante ON public.documentos_cliente(es_importante);

-- Trigger
CREATE TRIGGER update_documentos_cliente_fecha_actualizacion
  BEFORE UPDATE ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.documentos_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus documentos de clientes"
  ON public.documentos_cliente FOR SELECT
  USING (auth.uid()::text = subido_por);

CREATE POLICY "Los usuarios pueden crear documentos de sus clientes"
  ON public.documentos_cliente FOR INSERT
  WITH CHECK (auth.uid()::text = subido_por);

CREATE POLICY "Los usuarios pueden actualizar sus documentos de clientes"
  ON public.documentos_cliente FOR UPDATE
  USING (auth.uid()::text = subido_por)
  WITH CHECK (auth.uid()::text = subido_por);

CREATE POLICY "Los usuarios pueden eliminar sus documentos de clientes"
  ON public.documentos_cliente FOR DELETE
  USING (auth.uid()::text = subido_por);
```

### 1.4 Click en "Run" (o Ctrl+Enter)

Deberías ver:
```
Success. No rows returned.
```

---

## 📋 PASO 2: Regenerar Tipos TypeScript (2 min)

### 2.1 Abrir terminal en VS Code

### 2.2 Ejecutar comando PowerShell

```powershell
.\obtener-tipos-supabase.ps1
```

O manualmente:
```powershell
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
```

### 2.3 Verificar que se creó el tipo

Abrir `src/lib/supabase/database.types.ts` y buscar `documentos_cliente`:

```typescript
export interface Database {
  public: {
    Tables: {
      documentos_cliente: {
        Row: {
          id: string
          cliente_id: string
          // ...etc
        }
      }
    }
  }
}
```

✅ **Si lo encuentras, los tipos están actualizados**

---

## 📋 PASO 3: Crear Componentes Frontend (1 hora)

### Archivos ya creados ✅

- ✅ `src/modules/clientes/documentos/types/index.ts`
- ✅ `src/modules/clientes/documentos/services/documentos-cliente.service.ts` (con errores temporales - se arreglan tras regenerar tipos)
- ✅ `supabase/documentos-cliente-schema.sql`

### Archivos pendientes por crear

1. **Store Zustand**
   - `src/modules/clientes/documentos/store/documentos-cliente.store.ts`

2. **Hooks**
   - `src/modules/clientes/documentos/hooks/useDocumentosCliente.ts`
   - `src/modules/clientes/documentos/hooks/useDocumentoUploadCliente.ts`
   - `src/modules/clientes/documentos/hooks/index.ts`

3. **Componentes**
   - `src/modules/clientes/documentos/components/upload/documento-upload-cliente.tsx`
   - `src/modules/clientes/documentos/components/lista/documentos-lista-cliente.tsx`
   - `src/modules/clientes/documentos/components/lista/documento-card-cliente.tsx`
   - `src/modules/clientes/documentos/components/lista/documentos-filtros-cliente.tsx`
   - `src/modules/clientes/documentos/components/index.ts`

4. **Modales en Cliente Detalle**
   - Modificar `src/app/clientes/[id]/cliente-detalle-client.tsx`
   - Modificar `src/app/clientes/[id]/tabs/documentos-tab.tsx`

---

## 🎯 Siguiente Acción Inmediata

**¿Qué quieres hacer primero?**

**Opción A**: Ejecutar SQL en Supabase ahora mismo
- Te guío paso a paso en el dashboard
- Tarda 2 minutos
- Necesario para continuar

**Opción B**: Continuar creando archivos (con errores temporales)
- Los errores TypeScript se arreglan después
- Podemos crear todo el código ahora
- Lo probamos tras ejecutar SQL

**Opción C**: Ver un resumen de lo que ya tenemos
- Revisar archivos creados
- Evaluar si necesitamos algo más

---

## 📊 Estado Actual

### ✅ Completado (30%)

- [x] Plan de implementación completo
- [x] SQL de base de datos
- [x] Tipos TypeScript
- [x] Service layer (documentos-cliente.service.ts)

### ⏳ Pendiente (70%)

- [ ] Ejecutar SQL en Supabase
- [ ] Regenerar tipos
- [ ] Store Zustand
- [ ] Hooks personalizados
- [ ] Componentes de upload
- [ ] Componentes de lista
- [ ] Integración con tab
- [ ] Testing

---

## 💡 Recomendación

**Ir por Opción A**:

1. Ejecutar SQL (5 min)
2. Regenerar tipos (2 min)
3. Continuar con componentes (45 min)
4. Testing completo (20 min)

**Total estimado**: 1 hora 12 minutos

---

**¿Qué prefieres hacer?**
