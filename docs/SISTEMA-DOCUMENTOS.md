# 📄 Sistema de Gestión Documental Flexible - RyR Constructora

## 🎯 Descripción General

Sistema **completamente flexible** para gestionar documentos de proyectos. El usuario tiene **control total** sobre:
- ✅ **Crear sus propias categorías** (Licencias, Planos, Contratos, etc.)
- ✅ **Nombrar documentos** como quiera
- ✅ **Organizar con etiquetas** personalizadas
- ✅ **Agregar metadata** personalizada
- ✅ **Marcar documentos importantes**
- ✅ **Versionado automático**

## 🏗️ Arquitectura

### **Base de Datos**
- **Tabla 1**: `categorias_documento` - Categorías personalizadas por usuario
- **Tabla 2**: `documentos_proyecto` - Documentos con organización flexible
- **Storage**: Supabase Storage con bucket privado
- **Seguridad**: Row Level Security (RLS)
- **Versionado**: Sistema padre-hijo

### **Estructura de Archivos en Storage**
```
documentos-proyectos/
└── {user_id}/
    └── {proyecto_id}/
        ├── 1234567890-uuid.pdf
        ├── 1234567891-uuid.dwg
        └── 1234567892-uuid.jpg
```
> **Nota**: No hay subcarpetas por categoría. Todo en el mismo nivel para máxima flexibilidad.

## 📋 Características Principales

### ✨ **1. Categorías Personalizadas**
El usuario puede crear categorías con:
- **Nombre personalizado**: "Licencias", "Mis Planos", "Documentos Legales", etc.
- **Color**: Para identificación visual rápida
- **Ícono**: De la librería Lucide Icons
- **Descripción**: Opcional
- **Orden**: Para organizar la lista

**Categorías Sugeridas** (opcionales al crear cuenta):
- 📋 Licencias y Permisos (azul)
- 📐 Planos (púrpura)
- ✍️ Contratos (verde)
- 🧾 Facturas (amarillo)
- 📸 Fotografías (rosa)
- 📊 Informes (índigo)

> El usuario puede ignorarlas, editarlas o crear las suyas desde cero.

### 🏷️ **2. Etiquetas Flexibles**
Cada documento puede tener múltiples etiquetas:
- Sin límite de etiquetas
- Creación dinámica (si no existe, se crea)
- Búsqueda y filtrado por etiquetas
- Etiquetas sugeridas: `Urgente`, `Revisar`, `Aprobado`, `Firmado`, etc.

**Ejemplo de uso**:
```
Documento: "Licencia Municipal 2024"
Etiquetas: ["Urgente", "Renovado", "Original"]
```

### � **3. Títulos Personalizados**
- El usuario nombra sus documentos como quiera
- No hay restricciones ni formatos obligatorios
- Se guarda el nombre original del archivo por si lo necesita

**Ejemplos**:
- "Licencia de Construcción - Proyecto Norte"
- "Plano Arquitectónico Final Rev 3"
- "Contrato con Proveedor ABC - Firmado"

### 🔄 **4. Sistema de Versionado**
- Múltiples versiones del mismo documento
- Marca automática de "versión actual"
- Historial completo de cambios
- No elimina versiones anteriores

### 📊 **5. Metadata Personalizada**
Campo JSONB completamente libre para guardar cualquier dato:

```json
{
  "numero_licencia": "LC-2024-001",
  "entidad": "Alcaldía Municipal",
  "folio": "F-12345",
  "responsable": "Ing. Juan Pérez",
  "notas": "Renovación automática cada 2 años",
  "lo_que_sea": "cualquier dato personalizado"
}
```

### ⭐ **6. Documentos Importantes**
- Checkbox para marcar documentos críticos
- Filtro rápido para ver solo importantes
- Destacados visualmente en la UI

### 📅 **7. Fechas Flexibles**
- **Fecha del documento**: Cuando fue creado originalmente
- **Fecha de vencimiento**: Opcional, solo si aplica
- **Fecha de subida**: Automática

## 🚀 Flujos de Usuario

### **Flujo 1: Primera Vez - Crear Categorías**
1. Usuario entra a "Documentos"
2. Sistema sugiere categorías por defecto
3. Usuario puede:
   - Aceptar todas
   - Seleccionar algunas
   - Crear las suyas propias
4. Click en "Crear Categoría"
5. Elige nombre, color e ícono
6. ¡Listo!

### **Flujo 2: Subir Documento**
1. Click en "Subir Documento"
2. Arrastra archivo o selecciona
3. **Título**: "Licencia Municipal 2024" (personalizado)
```

### **Descargar/Visualizar**
```typescript
// Obtener URL temporal (válida 1 hora)
const url = await DocumentosService.obtenerUrlDescarga(
  documento.url_storage,
  3600
)

// Abrir en nueva pestaña
window.open(url, '_blank')

// O descargar directamente
const blob = await DocumentosService.descargarArchivo(
  documento.url_storage
)
const downloadUrl = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = downloadUrl
a.download = documento.nombre_original
a.click()
3. **Título**: "Licencia Municipal 2024" (personalizado)
4. **Categoría**: Selecciona de su lista (opcional)
5. **Etiquetas**: Agrega las que quiera: "Urgente", "Original"
6. **Descripción**: Opcional
7. **Fecha de vencimiento**: Solo si aplica
8. **Marcar como importante**: Checkbox
9. **Metadata personalizada**: Campos libres
10. ¡Subir!

### **Flujo 3: Organizar Documentos**
1. Vista de documentos del proyecto
2. Puede filtrar por:
   - Categoría
   - Etiquetas
   - Importantes
   - Con vencimiento próximo
   - Búsqueda por título
3. Puede reorganizar categorías (drag & drop)
4. Cambiar colores/íconos de categorías

### **Flujo 4: Nueva Versión**
1. Click en documento existente
2. "Subir nueva versión"
3. Selecciona nuevo archivo
4. **Mantiene**: Título, categoría, etiquetas, metadata
5. **Incrementa**: Versión automáticamente
6. Ver historial de versiones

## 🎨 Componentes de UI

### **1. Gestor de Categorías**
```
┌─────────────────────────────────────┐
│ Mis Categorías                      │
│ ┌─────┬─────────────────────┬─────┐ │
│ │ 📋  │ Licencias (12)      │ ... │ │
│ ├─────┼─────────────────────┼─────┤ │
│ │ 📐  │ Planos (45)         │ ... │ │
│ ├─────┼─────────────────────┼─────┤ │
│ │ ✍️  │ Contratos (8)       │ ... │ │
│ └─────┴─────────────────────┴─────┘ │
│ [+ Nueva Categoría]                 │
└─────────────────────────────────────┘
```

### **2. Subir Documento - Formulario**
```
┌────────────────────────────────────────┐
│ Subir Documento                        │
│ ┌────────────────────────────────────┐ │
│ │ Arrastra archivo o click aquí     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Título *                               │
│ [Licencia de Construcción 2024    ]   │
│                                        │
│ Categoría (opcional)                   │
│ [▼ Licencias y Permisos           ]   │
│                                        │
│ Etiquetas                              │
│ [Urgente] [Original] [+ Agregar]      │
│                                        │
│ Descripción                            │
│ [Licencia principal del proyecto  ]   │
│                                        │
│ Fecha de vencimiento (opcional)        │
│ [📅 31/12/2025                    ]   │
│                                        │
│ ☑ Marcar como importante              │
│                                        │
│ Campos Personalizados +                │
│ [Número de licencia: LC-2024-001  ]   │
│ [Entidad: Alcaldía Municipal      ]   │
│                                        │
│ [Cancelar]           [Subir Archivo]  │
└────────────────────────────────────────┘
```

### **3. Lista de Documentos**
```
Filtros: [📋 Todas] [⭐ Importantes] [🏷️ Etiquetas] [🔍]

┌──────────────────────────────────────────┐
│ 📋 Licencia Municipal 2024               │
│ Licencias y Permisos • PDF • 2.5 MB      │
│ [Urgente] [Original]                     │
│ Vence: 31/12/2025 (en 45 días) ⚠️       │
│ [Ver] [Descargar] [Nueva versión] [...]  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 📐 Plano Arquitectónico Rev 3 ⭐          │
│ Planos • DWG • 15.2 MB                   │
│ [Aprobado] [Final]                       │
│ [Ver] [Descargar] [Nueva versión] [...]  │
└──────────────────────────────────────────┘
```

### **4. Visor de Documento**
```
┌────────────────────────────────────────────┐
│ ← Volver                            [X]    │
│                                            │
│ 📋 Licencia Municipal 2024 ⭐              │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │                                        │ │
│ │    [Preview del PDF aquí]             │ │
│ │                                        │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 📁 Categoría: Licencias y Permisos         │
│ 📏 Tamaño: 2.5 MB                          │
│ 📅 Fecha documento: 15/01/2024             │
│ ⚠️ Vencimiento: 31/12/2025                │
│ 🏷️ [Urgente] [Original] [Firmado]        │
│ 👤 Subido por: Juan Pérez                 │
│                                            │
│ Información adicional:                     │
│ • Número: LC-2024-001                     │
│ • Entidad: Alcaldía Municipal             │
│ • Folio: F-12345                          │
│                                            │
│ Versiones: 3 versiones                     │
│ • v3 (actual) - 15/03/2024                │
│ • v2 - 10/02/2024                         │
│ • v1 - 15/01/2024                         │
│                                            │
│ [Descargar] [Nueva Versión] [Editar]      │
└────────────────────────────────────────────┘
```

## 💡 Ejemplos de Uso Real

### **Ejemplo 1: Constructor con Licencias**
```
Usuario crea categorías:
- "Licencias" (azul, FileCheck)
- "Planos" (púrpura, Drafting)

Sube documentos:
1. "Licencia de Construcción Principal"
   - Categoría: Licencias
   - Etiquetas: [Original, Vigente]
   - Vence: 31/12/2025
   - Metadata: { numero: "LC-2024-001", entidad: "Alcaldía" }

2. "Plano Arquitectónico Manzana A"
   - Categoría: Planos
   - Etiquetas: [Aprobado, Rev3]
   - Sin vencimiento
   - Metadata: { revisor: "Arq. María López", fecha_aprobacion: "15/03/2024" }
```

### **Ejemplo 2: Fotógrafo de Obra**
```
Usuario crea categorías:
- "Avance Semanal" (verde, Camera)
- "Antes y Después" (orange, Images)

Sube documentos:
1. "Avance Semana 12 - Fundaciones"
   - Categoría: Avance Semanal
   - Etiquetas: [Marzo, Fundaciones]
   - Fecha documento: 15/03/2024
   - Metadata: { semana: 12, responsable: "Ing. Pedro" }
```

### **Ejemplo 3: Administrador Flexible**
```
Usuario NO usa categorías, solo etiquetas:

Documentos:
1. "Contrato Principal Firmado"
   - Sin categoría
   - Etiquetas: [Contrato, Firmado, Urgente, 2024]

2. "Factura Proveedor XYZ - Marzo"
   - Sin categoría
   - Etiquetas: [Factura, Pagado, Marzo, Proveedor-XYZ]
```

## 🔍 Búsqueda y Filtros

### **Opciones de Filtrado**:
- ✅ Por categoría
- ✅ Por etiqueta(s) múltiples
- ✅ Por estado (activo, archivado)
- ✅ Solo importantes
- ✅ Con vencimiento próximo
- ✅ Por rango de fechas
- ✅ Búsqueda de texto en título/descripción
- ✅ Por tipo de archivo (PDF, imagen, etc.)
- ✅ Por tamaño

### **Combinaciones Poderosas**:
```
"Mostrar documentos importantes + categoría Licencias + etiqueta Urgente + que venzan en 30 días"
```

## 📊 Dashboard de Documentos

### **Widget de Estadísticas**:
```
┌─────────────────────────────────────┐
│ Documentos del Proyecto             │
│ ┌───────┬───────┬───────┬─────────┐ │
│ │ Total │ 142   │ ⭐ 23  │ ⚠️ 5    │ │
│ └───────┴───────┴───────┴─────────┘ │
│                                     │
│ Por Categoría:                      │
│ 📋 Licencias................ 12     │
│ 📐 Planos................... 45     │
│ ✍️ Contratos................  8     │
│ 📸 Fotos.................... 67     │
│                                     │
│ Alertas:                            │
│ ⚠️ 5 documentos vencen pronto      │
│ 🔴 2 documentos vencidos            │
└─────────────────────────────────────┘
```

## 🎯 Ventajas del Sistema Flexible

### **Para el Usuario**:
✅ **Control total** sobre organización  
✅ **Sin restricciones** de categorías fijas  
✅ **Adaptable** a cualquier tipo de proyecto  
✅ **Búsqueda poderosa** con múltiples criterios  
✅ **Metadata personalizada** para cualquier dato  

### **Para el Desarrollador**:
✅ **Sin cambios en schema** cuando usuario necesita nueva categoría  
✅ **Escalable** a cualquier industria (no solo construcción)  
✅ **Menos validaciones** complejas  
✅ **Código más simple** y mantenible  

## 🚀 Próximos Pasos Recomendados

### **Fase 1: MVP** 
- [ ] UI de categorías (crear, editar, eliminar)
- [ ] Formulario de subida básico
- [ ] Lista de documentos con filtros
- [ ] Visor simple (preview PDFs, imágenes)

### **Fase 2: Mejoras UX**
- [ ] Drag & drop para subir
- [ ] Progreso de subida
- [ ] Preview antes de confirmar
- [ ] Edición inline de metadatos

### **Fase 3: Features Avanzadas**
- [ ] Sistema de versiones UI completo
- [ ] Widget de vencimientos en dashboard
- [ ] Exportar reportes PDF
- [ ] Compartir documentos (URLs temporales)

### **Fase 4: Premium**
- [ ] OCR para PDFs escaneados
- [ ] Thumbnails automáticos
- [ ] Compresión inteligente de imágenes
- [ ] Notificaciones por email/WhatsApp

---

## � Resumen

Este sistema te da **libertad total** para manejar tus documentos como quieras:

✨ **Tú decides** qué categorías crear  
✨ **Tú nombras** los documentos como quieras  
✨ **Tú organizas** con las etiquetas que necesites  
✨ **Tú agregas** la metadata que sea relevante  

**Sin límites, sin restricciones, completamente personalizable** 🎯

¿Te gustaría que implemente la UI ahora?
