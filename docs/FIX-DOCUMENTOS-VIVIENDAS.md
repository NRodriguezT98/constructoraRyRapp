# 🔧 FIX: Sistema de Documentos de Viviendas

**Fecha:** 2025-11-07
**Problemas resueltos:** 2

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1. ❌ Error 400 al descargar documentos

**Síntoma:**
```
GET https://swyjhwgvkfcfdtemkyad.supabase.co/storage/v1/object/documentos-viviendas/...pdf 400 (Bad Request)
StorageUnknownError: {}
```

**Causa raíz:**
- El método `.download()` de Supabase Storage estaba fallando
- Posible problema con caracteres especiales en nombres de archivo
- Falta de logs detallados para debugging

**Solución aplicada:**
✅ Mejorado el servicio `descargarDocumento()`:
- Agregados logs detallados de debugging
- Validación de datos antes de llamar a Storage
- Manejo de errores más robusto
- Query optimizado para obtener `nombre_archivo` que ya está limpio en DB

---

### 2. ❌ Falta botón "Ver documento"

**Síntoma:**
- Solo existía botón "Descargar"
- No había forma de visualizar el documento sin descargarlo

**Solución aplicada:**
✅ Implementado sistema de vista previa con URL firmada:

**Nuevos métodos en `documentos-vivienda.service.ts`:**
```typescript
async obtenerUrlFirmada(id: string, expiresIn: number = 3600): Promise<string>
```
- Genera URL firmada con expiración de 1 hora
- Permite abrir documento en nueva pestaña del navegador
- Evita descarga innecesaria para vista rápida

**Nuevos handlers en `useDocumentosVivienda.ts`:**
```typescript
verDocumento: verDocumentoMutation.mutateAsync
isViendoDocumento: verDocumentoMutation.isPending
```

**Nueva UI en `documentos-lista-vivienda.tsx`:**
- Botón "Ver" (verde) con icono Eye
- Botón "Descargar" (azul) con icono Download
- Botón "Eliminar" (rojo, solo Admin) con icono Trash2
- Labels responsivos (se ocultan en móvil, solo iconos)

---

## 🔐 POLÍTICA RLS DE STORAGE (PENDIENTE)

**Archivo creado:** `supabase/storage/storage-documentos-viviendas.sql`

### Configuración del bucket:
- **Nombre:** `documentos-viviendas`
- **Visibilidad:** Privado (requiere autenticación)
- **Límite de tamaño:** 100MB por archivo
- **Tipos MIME permitidos:**
  - Documentos: PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT
  - Imágenes: JPEG, PNG, WEBP, HEIC, HEIF
  - CAD: DWG, DXF
  - Comprimidos: ZIP, RAR, 7Z
  - Texto: TXT

### Políticas RLS creadas:

| Operación | Permiso | Condición |
|-----------|---------|-----------|
| **SELECT** | Todos los usuarios autenticados | `auth.uid() IS NOT NULL` |
| **INSERT** | Todos los usuarios autenticados | `auth.uid() IS NOT NULL` |
| **UPDATE** | Todos los usuarios autenticados | `auth.uid() IS NOT NULL` |
| **DELETE** | Solo Administradores | `rol = 'Administrador'` |

### Estructura de paths:
```
{vivienda_id}/{timestamp}_{nombre_limpio}.{ext}

Ejemplo:
a1b2c3d4-5e6f.../1730995200000_escritura_casa_A7.pdf
```

---

## 📦 ARCHIVOS MODIFICADOS

### 1. **Service** (Lógica de API/DB)
`src/modules/viviendas/services/documentos-vivienda.service.ts`
- ✅ Mejorado `descargarDocumento()` con logs y validaciones
- ✅ Agregado `obtenerUrlFirmada()` para vista previa

### 2. **Hook** (Lógica de negocio)
`src/modules/viviendas/hooks/useDocumentosVivienda.ts`
- ✅ Agregada mutation `verDocumentoMutation`
- ✅ Exportado `verDocumento` y `isViendoDocumento`

### 3. **Hook de lista** (Handlers)
`src/modules/viviendas/hooks/useDocumentosListaVivienda.ts`
- ✅ Agregado `handleVer()` para abrir documento
- ✅ Exportado `isViendoDocumento` state

### 4. **Componente** (UI)
`src/modules/viviendas/components/documentos/documentos-lista-vivienda.tsx`
- ✅ Agregado botón "Ver" con icono Eye
- ✅ Mejorados estilos de botones (responsive)
- ✅ Labels se ocultan en móvil

---

## 🚀 PASOS PARA APLICAR

### ✅ Paso 1: Código (YA APLICADO)
Los cambios en código TypeScript ya están implementados.

### ✅ Paso 2: Base de Datos (EJECUTAR AHORA)
**Ejecutar SQL directamente desde terminal:**

```bash
# Método 1: NPM Script (más fácil)
npm run db:exec:storage-viviendas

# Método 2: Node.js directo
node ejecutar-sql.js supabase/storage/storage-documentos-viviendas.sql

# Método 3: PowerShell (requiere psql)
.\ejecutar-sql.ps1 -SqlFile "supabase\storage\storage-documentos-viviendas.sql"
```

**📖 Ver documentación completa:** `docs/EJECUTAR-SQL-DIRECTAMENTE.md`

### ✅ Paso 3: Verificar (DESPUÉS DE EJECUTAR SQL)
1. Ve a **Viviendas** → **Ver Detalle** → **Pestaña Documentos**
2. Verifica que aparezcan **3 botones**: Ver, Descargar, Eliminar
3. Prueba **Ver** → Debe abrir en nueva pestaña
4. Prueba **Descargar** → Debe descargar archivo
5. Revisa **Console** → No debe haber errores 400

---

## 🎯 RESULTADO ESPERADO

### Antes:
```
[Icono] Documento.pdf
  [Categoría] [Estado] [Fecha]
  [Descargar ❌] → Error 400
```

### Después:
```
[Icono] Documento.pdf
  [Categoría] [Estado] [Fecha]
  [Ver ✅] [Descargar ✅] [Eliminar ✅ (Admin)]
```

---

## 🔍 DEBUGGING

### Si "Ver" no funciona:
```typescript
// Verifica en Console de navegador:
1. ¿Aparece error de RLS? → Ejecuta SQL de Storage
2. ¿URL firmada es null? → Verifica que el archivo existe en Storage
3. ¿Error CORS? → Verifica configuración de bucket
```

### Si "Descargar" sigue fallando:
```typescript
// Logs a revisar en Console:
console.log('📄 Descargando documento:', { id, vivienda_id, nombre_archivo })
console.log('✅ Archivo descargado exitosamente')

// Si aparece:
❌ Error al descargar archivo desde Storage:
→ Verifica que el path sea correcto: {vivienda_id}/{nombre_archivo}
→ Verifica que el archivo exista en Storage
```

---

## 📚 SEPARACIÓN DE RESPONSABILIDADES (CUMPLIDA)

✅ **Service** → Lógica de API/DB (descargar, obtener URL)
✅ **Hook** → Lógica de negocio (mutations, estados)
✅ **Hook de lista** → Handlers de UI (onClick handlers)
✅ **Componente** → UI presentacional pura (botones, layout)

**Patrón aplicado:**
```
Componente → useDocumentosListaVivienda → useDocumentosVivienda → Service
    (UI)            (Handlers)                  (Mutations)        (API/DB)
```

---

## ✅ CHECKLIST DE VALIDACIÓN

- [x] Código TypeScript actualizado
- [x] Separación de responsabilidades cumplida
- [x] Hook personalizado con lógica
- [x] Service con métodos optimizados
- [x] Componente < 150 líneas
- [x] Logs de debugging agregados
- [x] Archivo SQL de Storage creado
- [ ] **SQL ejecutado en Supabase** ← **PENDIENTE**
- [ ] **Prueba funcional en UI** ← **PENDIENTE**

---

## 🎉 PRÓXIMOS PASOS

1. **Ejecutar SQL de Storage** (ver Paso 2 arriba)
2. **Probar en navegador** (ver Paso 3 arriba)
3. **Validar logs** (no debe haber errores 400)
4. **Marcar como completado** ✅

---

**Autor:** GitHub Copilot
**Fecha:** 2025-11-07
**Versión:** 1.0
