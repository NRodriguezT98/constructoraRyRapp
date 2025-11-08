# 🏗️ Decisión de Arquitectura: Sistema de Documentos

**Fecha**: 7 de Noviembre de 2025
**Arquitecto**: GitHub Copilot
**Revisión con**: Usuario (Desarrollador Principal)

---

## 🎯 **DECISIÓN FINAL: SIMPLIFICAR A CATEGORÍAS PLANAS**

### ✅ **Razones para Eliminar Carpetas Jerárquicas**

1. **Principio YAGNI** (You Aren't Gonna Need It)
   - No hay evidencia de que los usuarios necesiten jerarquías complejas
   - 90% de los documentos caben en categorías simples

2. **Principio KISS** (Keep It Simple, Stupid)
   - Menos código = Menos bugs
   - Menos mantenimiento = Más tiempo para features de valor

3. **ROI (Retorno de Inversión)**
   - Sistema de carpetas: 500+ líneas de código
   - Categorías simples: 50 líneas de código
   - **Ratio 10:1 de complejidad vs valor**

4. **User Experience**
   - Los usuarios NO quieren pensar en jerarquías
   - Solo quieren: "Subir certificado" → Listo

---

## 📋 **PLAN DE SIMPLIFICACIÓN**

### **PASO 1: Mantener Solo Categorías**

```sql
-- ✅ MANTENER (Simple)
CREATE TABLE categorias_documento (
  id UUID PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  modulo VARCHAR(50) NOT NULL,  -- 'viviendas', 'proyectos', 'clientes'
  color VARCHAR(7),              -- Hex color
  icono VARCHAR(50),             -- Lucide icon name
  es_sistema BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0
);

-- ❌ ELIMINAR (Complejo)
DROP TABLE carpetas_documentos_viviendas;
```

### **PASO 2: Tabla de Documentos Simplificada**

```sql
CREATE TABLE documentos_vivienda (
  id UUID PRIMARY KEY,
  vivienda_id UUID NOT NULL,
  categoria_id UUID REFERENCES categorias_documento(id),

  -- Metadata
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,

  -- Storage
  archivo_url TEXT NOT NULL,
  archivo_nombre VARCHAR(500),
  archivo_size BIGINT,
  archivo_mime_type VARCHAR(100),

  -- Versionado simple
  version INTEGER DEFAULT 1,
  version_anterior_id UUID REFERENCES documentos_vivienda(id),

  -- Auditoría
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **PASO 3: Categorías Predefinidas por Módulo**

```typescript
// src/modules/viviendas/constants/categorias.ts
export const CATEGORIAS_VIVIENDA = [
  { nombre: 'Certificados', color: '#3B82F6', icono: 'award' },
  { nombre: 'Escrituras', color: '#EF4444', icono: 'file-text' },
  { nombre: 'Planos', color: '#10B981', icono: 'compass' },
  { nombre: 'Contratos', color: '#F59E0B', icono: 'file-signature' },
  { nombre: 'Fotografías', color: '#8B5CF6', icono: 'camera' },
  { nombre: 'Presupuestos', color: '#EC4899', icono: 'calculator' },
] as const

// src/modules/proyectos/constants/categorias.ts
export const CATEGORIAS_PROYECTO = [
  { nombre: 'Permisos', color: '#3B82F6', icono: 'shield-check' },
  { nombre: 'Estudios Técnicos', color: '#10B981', icono: 'clipboard' },
  { nombre: 'Contratos Proveedores', color: '#F59E0B', icono: 'users' },
] as const
```

---

## 🎨 **UI SIMPLIFICADA**

### **Vista de Lista con Filtros**

```tsx
export function DocumentosVivienda({ viviendaId }: Props) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null)
  const { documentos, isLoading } = useDocumentosVivienda(viviendaId)

  const documentosFiltrados = categoriaSeleccionada
    ? documentos.filter(d => d.categoria_id === categoriaSeleccionada)
    : documentos

  return (
    <div>
      {/* Chips de Categorías */}
      <div className="flex gap-2 mb-4">
        <Chip onClick={() => setCategoriaSeleccionada(null)}>
          Todos ({documentos.length})
        </Chip>
        {CATEGORIAS_VIVIENDA.map(cat => (
          <Chip
            key={cat.nombre}
            color={cat.color}
            onClick={() => setCategoriaSeleccionada(cat.id)}
          >
            <Icon name={cat.icono} />
            {cat.nombre} ({contarPorCategoria(cat.id)})
          </Chip>
        ))}
      </div>

      {/* Lista de Documentos */}
      <div className="grid gap-3">
        {documentosFiltrados.map(doc => (
          <DocumentoCard key={doc.id} documento={doc} />
        ))}
      </div>
    </div>
  )
}
```

---

## 🔧 **CÓDIGO A ELIMINAR**

### Archivos a Borrar:
- ❌ `supabase/migrations/20241107_crear_carpetas_documentos_viviendas.sql`
- ❌ `src/modules/viviendas/services/carpetas-vivienda.service.ts`
- ❌ `src/modules/viviendas/hooks/useCarpetasVivienda.ts`
- ❌ `src/modules/viviendas/components/documentos/carpeta-documentos.tsx`
- ❌ `src/modules/viviendas/components/documentos/crear-carpeta-modal.tsx`
- ❌ `docs/SISTEMA-CARPETAS-DOCUMENTOS-VIVIENDAS.md`
- ❌ Scripts: `test-carpetas-vivienda.js`, `crear-carpetas-todas-viviendas.js`, `migrar-documentos-carpetas.js`

### Código a Simplificar:
- 🔧 `documentos-lista-vivienda.tsx` → Remover toggle de vistas, solo mostrar lista
- 🔧 `useDocumentosVivienda.ts` → Remover lógica de carpetas
- 🔧 Service layer → Simplificar a CRUD básico

**Resultado**: De **~1500 líneas** a **~300 líneas** (80% reducción)

---

## 📊 **COMPARACIÓN DE COMPLEJIDAD**

| Aspecto | Sistema Actual (Carpetas) | Propuesta (Categorías) |
|---------|--------------------------|------------------------|
| **Líneas de código** | ~1500 | ~300 |
| **Tablas DB** | 3 (documentos + carpetas + categorías) | 2 (documentos + categorías) |
| **Funciones SQL** | 5+ (crear carpetas, validar jerarquía, etc.) | 0 |
| **Componentes React** | 8+ | 3 |
| **Complejidad mental** | Alta (recursión, árbol) | Baja (lista plana) |
| **Tiempo desarrollo** | 3-4 días | 1 día |
| **Bugs potenciales** | Alto (ciclos, jerarquía) | Bajo |

---

## 🚀 **BENEFICIOS INMEDIATOS**

### 1. **Desarrollo Más Rápido**
```
Sistema Actual:
  Feature Nueva → 2 días (validar carpetas, jerarquía, etc.)

Sistema Simplificado:
  Feature Nueva → 4 horas (solo agregar categoría)
```

### 2. **Menos Bugs**
- ❌ Sin ciclos en jerarquía
- ❌ Sin problemas de recursión
- ❌ Sin drag & drop complejo

### 3. **Mejor Performance**
```sql
-- Sistema Actual (Recursivo)
WITH RECURSIVE carpetas_arbol AS (
  SELECT * FROM carpetas WHERE carpeta_padre_id IS NULL
  UNION ALL
  SELECT c.* FROM carpetas c
  JOIN carpetas_arbol ca ON c.carpeta_padre_id = ca.id
)
SELECT * FROM carpetas_arbol;  -- 😱 Slow

-- Sistema Simplificado (1 query)
SELECT * FROM documentos_vivienda
WHERE vivienda_id = $1
ORDER BY categoria_id, created_at DESC;  -- ⚡ Fast
```

### 4. **UI Más Intuitiva**
```
Usuario dice: "Necesito subir un certificado"

Sistema Actual:
  1. ¿En qué carpeta? (confusión)
  2. ¿Creo nueva carpeta? (duda)
  3. ¿Es subcarpeta? (complicación)

Sistema Simplificado:
  1. Click "Subir certificado" → Listo ✅
```

---

## ⚠️ **CUÁNDO SÍ USAR CARPETAS**

Solo implementar jerarquía si:
- ✅ Tienes > 100 documentos por vivienda
- ✅ Los usuarios **explícitamente piden** carpetas
- ✅ Tienes tiempo para mantener complejidad
- ✅ Necesitas organización tipo Google Drive

**Pregunta clave**: ¿Tus usuarios son **desarrolladores** o **constructores**?
- Desarrolladores → Les gustan las jerarquías
- Constructores → Prefieren simplicidad

---

## 🎯 **CONCLUSIÓN**

### **RECOMENDACIÓN FINAL:**

```diff
- Sistema de carpetas jerárquicas (500+ líneas)
+ Sistema de categorías planas (50 líneas)
```

**Por qué:**
1. **YAGNI**: No lo necesitas ahora
2. **KISS**: Más simple = Mejor
3. **ROI**: 10x menos código, mismo valor
4. **UX**: Usuarios prefieren simplicidad

**Próximos pasos:**
1. Validar con 2-3 usuarios reales
2. Si confirman necesidad simple → Implementar categorías
3. Si realmente necesitan jerarquía → Reconsiderar

---

## 📚 **Recursos Adicionales**

- [YAGNI Principle](https://martinfowler.com/bliki/Yagni.html)
- [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- [Occam's Razor](https://en.wikipedia.org/wiki/Occam%27s_razor)

---

**¿Mi respuesta como arquitecto?**

> "Elimina las carpetas. Usa categorías. Lanza rápido. Itera con feedback real."

**¿Por qué?**

> "El mejor código es el que no escribes. La mejor feature es la que los usuarios realmente usan."
