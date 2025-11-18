# 🎨 Guía Visual de Auditoría de Documentos

## 📋 Tabla de Contenido

1. [Marcar Versión como Errónea](#1️⃣-marcar-versión-como-errónea)
2. [Marcar Versión como Obsoleta](#2️⃣-marcar-versión-como-obsoleta)
3. [Restaurar Estado de Versión](#3️⃣-restaurar-estado-de-versión)
4. [Reemplazo de Archivo](#4️⃣-reemplazo-de-archivo)

---

## 1️⃣ Marcar Versión como Errónea

### Cuándo se usa
Cuando una versión de documento contiene **información incorrecta** y debe ser marcada para que no se use.

### UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ Versión Marcada como Errónea                            │
│ Esta versión contiene información incorrecta y no debe     │
│ ser utilizada                                              │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Rojo/Ámbar (bg-red-50, border-red-200)

┌────────────────────────────────────────────────────────────┐
│ 📄 Documento Afectado                                      │
│ ┌──────────────────┬──────────────────┐                   │
│ │ Título           │ Versión          │                   │
│ │ Permiso obra     │ Versión 1        │                   │
│ ├──────────────────┼──────────────────┤                   │
│ │ Categoría        │ Estado Anterior  │                   │
│ │ Permisos, Lic... │ [Válida]         │                   │
│ └──────────────────┴──────────────────┘                   │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Blanco (bg-white, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ ⚠️ Motivo del Marcado                                      │
│ "Se subió el documento equivocado con datos antiguos"      │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Ámbar (bg-amber-50, border-amber-200)

┌────────────────────────────────────────────────────────────┐
│ ✅ Versión Correcta                                        │
│ La versión correcta que reemplaza este error está          │
│ identificada con ID: [abc-123-def]                         │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Verde (bg-green-50, border-green-200)
  ↓ Solo aparece si hay versión correcta

┌────────────────────────────────────────────────────────────┐
│ 👤 Nicolás Rodríguez              🕐 15-nov-2025, 11:06 AM │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Gris claro (bg-gray-50)
```

### Datos Capturados

```typescript
{
  tipo_operacion: 'MARCAR_VERSION_ERRONEA',
  motivo_cambio: 'Se subió el documento equivocado con datos antiguos',
  documento: {
    id: 'uuid',
    titulo: 'Permiso de obra',
    version: 1,
    categoria: 'Permisos, Licencias y Certificados',
    estado_anterior: 'valida',
    estado_nuevo: 'erronea',
    es_version_actual: true
  },
  version_correcta: {
    id: 'uuid-version-correcta',
    titulo: 'Permiso de obra (corregido)'
  }
}
```

---

## 2️⃣ Marcar Versión como Obsoleta

### Cuándo se usa
Cuando una versión ya no es **relevante** y ha sido **reemplazada** por una más actualizada.

### UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ 📦 Versión Marcada como Obsoleta                           │
│ Esta versión ya no es relevante y ha sido reemplazada      │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Gris (bg-gray-50, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ 📄 Documento                                               │
│ ┌──────────────────┬──────────────────┐                   │
│ │ Título           │ Versión          │                   │
│ │ Plano eléctrico  │ Versión 2        │                   │
│ └──────────────────┴──────────────────┘                   │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Blanco (bg-white, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ Razón de Obsolescencia                                     │
│ "Existe una versión más actualizada (v3) que incluye       │
│ correcciones importantes en el circuito principal"         │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Gris (bg-gray-50, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ 👤 Nicolás Rodríguez              🕐 15-nov-2025, 11:06 AM │
└────────────────────────────────────────────────────────────┘
```

### Datos Capturados

```typescript
{
  tipo_operacion: 'MARCAR_VERSION_OBSOLETA',
  razon_obsolescencia: 'Existe una versión más actualizada...',
  documento: {
    id: 'uuid',
    titulo: 'Plano eléctrico',
    version: 2,
    categoria: 'Planos y Diseños',
    estado_anterior: 'valida',
    estado_nuevo: 'obsoleta'
  }
}
```

---

## 3️⃣ Restaurar Estado de Versión

### Cuándo se usa
Cuando una versión marcada como **errónea u obsoleta** se necesita **restaurar a válida** (ej: se marcó por error).

### UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ ♻️ Estado Restaurado a Válido                              │
│ La versión ha sido restaurada y ahora es válida para uso   │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Verde (bg-green-50, border-green-200)

┌────────────────────────────────────────────────────────────┐
│ 📄 Documento                                               │
│ ┌──────────────────┬──────────────────┐                   │
│ │ Título           │ Versión          │                   │
│ │ Certificado ISO  │ Versión 1        │                   │
│ └──────────────────┴──────────────────┘                   │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Blanco (bg-white, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ Detalles de Restauración                                   │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Estado anterior:           [Errónea]                   │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Motivo original:                                       │ │
│ │ "Se subió documento equivocado"                        │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Azul claro (bg-blue-50, border-blue-200)

┌────────────────────────────────────────────────────────────┐
│ 👤 Nicolás Rodríguez              🕐 15-nov-2025, 11:06 AM │
└────────────────────────────────────────────────────────────┘
```

### Datos Capturados

```typescript
{
  tipo_operacion: 'RESTAURAR_ESTADO_VERSION',
  documento: {
    id: 'uuid',
    titulo: 'Certificado ISO',
    version: 1,
    categoria: 'Permisos, Licencias y Certificados',
    estado_anterior: 'erronea',
    estado_nuevo: 'valida'
  },
  restauracion: {
    razon: 'Restauración manual de estado a Válido',
    desde_estado: 'erronea',
    motivo_original: 'Se subió documento equivocado',
    fecha_restauracion: '2025-11-15T11:06:00.000Z'
  }
}
```

---

## 4️⃣ Reemplazo de Archivo

### Cuándo se usa
Cuando se **sustituye el archivo físico** de un documento manteniendo la misma versión.

### UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ 🔄 Archivo Reemplazado                                     │
│ El contenido del documento fue actualizado con un nuevo    │
│ archivo                                                    │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Azul (bg-blue-50, border-blue-200)

┌────────────────────────────────────────────────────────────┐
│ ⚠️ Justificación                                           │
│ "Se detectó error en página 3, se corrigió y se volvió a   │
│ subir el mismo documento con la corrección"                │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Ámbar (bg-amber-50, border-amber-200)

┌──────────────────────────┬──────────────────────────┐
│ ❌ Archivo Original       │ ✅ Archivo Nuevo         │
│ ┌──────────────────────┐ │ ┌──────────────────────┐ │
│ │ Nombre:              │ │ │ Nombre:              │ │
│ │ contrato-v1.pdf      │ │ │ contrato-v1-fix.pdf  │ │
│ ├──────────────────────┤ │ ├──────────────────────┤ │
│ │ Tamaño:              │ │ │ Tamaño:              │ │
│ │ 2.5 MB               │ │ │ 2.7 MB               │ │
│ ├──────────────────────┤ │ ├──────────────────────┤ │
│ │ 📥 Descargar backup  │ │ │ 📥 Descargar actual  │ │
│ └──────────────────────┘ │ └──────────────────────┘ │
└──────────────────────────┴──────────────────────────┘
  ↓ Original: Rojo (bg-red-50)    Nuevo: Verde (bg-green-50)

┌────────────────────────────────────────────────────────────┐
│ Comparación                                                │
│ ┌─────────────┬─────────────┬─────────────────────┐       │
│ │ Diferencia  │ Cambio      │ Horas transcurridas │       │
│ │ +0.2 MB     │ +8%         │ 2h                  │       │
│ └─────────────┴─────────────┴─────────────────────┘       │
└────────────────────────────────────────────────────────────┘
  ↓ Color: Gris (bg-gray-50, border-gray-200)

┌────────────────────────────────────────────────────────────┐
│ 👤 Nicolás Rodríguez              🕐 15-nov-2025, 11:06 AM │
└────────────────────────────────────────────────────────────┘
```

### Datos Capturados

```typescript
{
  tipo_operacion: 'REEMPLAZO_ARCHIVO',
  motivo_reemplazo: 'Se detectó error en página 3...',
  archivo_original: {
    nombre: 'contrato-v1.pdf',
    tamano_bytes: 2621440,
    tamano_mb: 2.5,
    tipo: 'application/pdf',
    url_backup: 'https://...signedURL...',
    path_backup: 'backups/reemplazos/...'
  },
  archivo_nuevo: {
    nombre: 'contrato-v1-fix.pdf',
    tamano_bytes: 2831155,
    tamano_mb: 2.7,
    tipo: 'application/pdf',
    url_actual: 'https://...signedURL...'
  },
  comparacion: {
    diferencia_bytes: 209715,
    diferencia_mb: 0.2,
    porcentaje_cambio: 8
  },
  tiempo: {
    fecha_creacion_original: '2025-11-15T09:00:00.000Z',
    fecha_reemplazo: '2025-11-15T11:06:00.000Z',
    horas_transcurridas: 2,
    dentro_ventana_48h: true
  }
}
```

---

## 🎨 Paleta de Colores

### Errónea (Rojo/Ámbar)
```css
bg-red-50 dark:bg-red-950/20
border-red-200 dark:border-red-800
text-red-900 dark:text-red-100
```

### Obsoleta (Gris)
```css
bg-gray-50 dark:bg-gray-900/50
border-gray-200 dark:border-gray-700
text-gray-900 dark:text-white
```

### Restaurar (Verde)
```css
bg-green-50 dark:bg-green-950/20
border-green-200 dark:border-green-800
text-green-900 dark:text-green-100
```

### Reemplazo (Azul)
```css
bg-blue-50 dark:bg-blue-950/20
border-blue-200 dark:border-blue-800
text-blue-900 dark:text-blue-100
```

---

## 🧩 Componentes Reutilizables

### Card de Información
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-4 h-4 text-gray-500" />
    <h4 className="font-semibold text-gray-900 dark:text-white">Título</h4>
  </div>
  {/* Contenido */}
</div>
```

### Grid de Información
```tsx
<div className="grid grid-cols-2 gap-3">
  <div>
    <p className="text-xs text-gray-500 dark:text-gray-400">Label</p>
    <p className="font-medium text-gray-900 dark:text-white">Valor</p>
  </div>
</div>
```

### Footer Usuario/Fecha
```tsx
<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
  <div className="flex items-center gap-2">
    <User className="w-4 h-4 text-gray-500" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Realizado por</p>
      <p className="font-medium text-gray-900 dark:text-white text-sm">{usuario}</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4 text-gray-500" />
    <div className="text-right">
      <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
      <p className="font-medium text-gray-900 dark:text-white text-sm">{fecha}</p>
    </div>
  </div>
</div>
```

---

## 📏 Dimensiones Estándar

- **Headers**: `p-4`, `text-lg`, `font-semibold`
- **Cards**: `p-4`, `rounded-lg`, `border`
- **Iconos grandes**: `w-10 h-10` (headers)
- **Iconos pequeños**: `w-4 h-4` (secciones)
- **Spacing**: `space-y-4` entre secciones
- **Grid gaps**: `gap-3` (pequeño), `gap-4` (estándar)
- **Text sizes**: `text-xs` (labels), `text-sm` (valores), `text-lg` (títulos)

---

## ✅ Checklist de Diseño

Al crear nuevos tipos de operaciones, asegurar:

- [ ] Color temático según tipo de acción
- [ ] Icono contextual en header
- [ ] Información del documento siempre presente
- [ ] Motivo/justificación destacado
- [ ] Usuario y fecha en footer
- [ ] Dark mode completo
- [ ] Responsive (grid-cols-1 sm:grid-cols-2)
- [ ] Links funcionales (si aplica)
- [ ] Estadísticas visuales (si aplica)

---

**Diseño coherente + Información completa = UX profesional** ✨
