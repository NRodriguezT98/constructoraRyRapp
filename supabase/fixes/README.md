# 🔧 Scripts SQL - Correcciones

Esta carpeta contiene scripts SQL para correcciones específicas.

## 📋 Archivos

- **eliminar-campo-es-documento-identidad.sql** - Elimina campo obsoleto `es_documento_identidad`
- **fix-rls-categorias.sql** - Corrige políticas RLS de la tabla categorías
- **fix-storage-rls-policies.sql** - Corrige políticas RLS de storage

## ⚠️ Uso

**IMPORTANTE**: Estos scripts deben ejecutarse con cuidado:

1. Revisar el contenido del script antes de ejecutar
2. Hacer backup si es necesario
3. Ejecutar en desarrollo primero
4. Validar resultados antes de aplicar en producción

## 🎯 Ejecución

Para ejecutar estos scripts:
```sql
-- Desde Supabase SQL Editor
-- Copiar y pegar el contenido del archivo
```

## 📚 Ver también

- `/docs/fixes` - Documentación de las correcciones
- `/supabase/verification` - Scripts de verificación
