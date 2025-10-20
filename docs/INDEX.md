# 📚 Índice de Documentación - RyR Constructora

> **Sistema de Gestión Administrativa - Documentación Completa**

## 🗂️ Estructura de Documentación

### 📁 01-setup (Configuración Inicial)
Documentación para poner en marcha el proyecto.

- `QUICK-START.md` - Inicio rápido
- `QUICK-START-TESTING.md` - Pruebas iniciales
- `SUPABASE_SETUP.md` - Configuración de Supabase
- `SUPABASE-COMPLETO.md` - Setup completo de Supabase
- `SUPABASE-CHECKLIST.md` - Checklist de configuración
- `SETUP-STORAGE-BUCKET.md` - Configurar almacenamiento
- `LISTO-PARA-DESARROLLAR.md` - Ambiente listo
- `COMO-EJECUTAR-MIGRACION-SQL.md` - Ejecutar migraciones
- `EJECUTAR-SQL-PASO-A-PASO.md` - SQL paso a paso
- `GUIA-ULTRA-RAPIDA.md` - Guía express

### 📁 02-arquitectura (Arquitectura del Sistema)
Diseño y estructura del proyecto.

- `ARCHITECTURE.md` ⭐ - Arquitectura general
- `DESIGN_SYSTEM.md` - Sistema de diseño
- `ESTRUCTURA.md` - Estructura de carpetas
- `CONFIRMACION_ARQUITECTURA.md` - Confirmación de arquitectura
- `SHARED_INFRASTRUCTURE.md` - Infraestructura compartida
- `MODULE_TEMPLATE.md` - Template de módulos
- `DOCS_INDEX.md` - Índice antiguo
- `PROJECT_INDEX.md` - Índice de proyecto

### 📁 03-modulos (Documentación por Módulo)
Implementación específica de cada módulo.

**Clientes:**
- `MODULO-CLIENTES-*.md` - Progreso y completado
- `IMPLEMENTACION-CLIENTE-DETALLE-TABS.md`
- `DETALLE-CLIENTE-COMPLETO.md`
- `FORMULARIO-CLIENTES-COMPLETADO.md`
- `FORMULARIO-MODERNO-CLIENTES.md`

**Negociaciones:**
- `MODULO-NEGOCIACIONES-*.md` - Implementación completa
- `SISTEMA-INTERESES-CLIENTES.md`
- `RESUMEN-SISTEMA-NEGOCIACIONES.md`

**Viviendas:**
- `MODULO-VIVIENDAS-*.md` - Implementación y finalización

**Documentos:**
- `SISTEMA-DOCUMENTOS-*.md` - Sistema completo
- `SISTEMA-CATEGORIAS-FLEXIBLES.md`

**UX/UI:**
- `UX-CATEGORIAS-CLIENTES-INLINE.md`
- `MEJORAS-*.md` - Mejoras visuales
- `PROGRESO-*.md` - Progreso de implementación

### 📁 04-fixes (Correcciones y Soluciones)
Soluciones a problemas específicos.

- `FIX-*.md` - Correcciones diversas
- `FIXES-*.md` - Múltiples fixes
- `SOLUCION-*.md` - Soluciones implementadas
- `DEBUG-*.md` - Debugging
- `CORRECCION-*.md` - Correcciones

### 📁 05-migraciones (Migraciones y Refactorización)
Cambios estructurales y migraciones.

- `REFACTORIZACION-*.md` - Refactorizaciones
- `MIGRACION-*.md` - Migraciones de datos
- `REDISENO-*.md` - Rediseños
- `AJUSTE-*.md` - Ajustes

### 📁 06-testing (Pruebas y Validaciones)
Testing y validaciones.

- `TESTING-*.md` - Pruebas
- `TEST-*.md` - Tests específicos
- `VALIDACION-*.md` - Validaciones
- `VALIDACIONES-*.md` - Sistema de validaciones
- `VIVIENDAS-VALIDACIONES-*.md` - Validaciones de viviendas

### 📁 07-seguridad (Seguridad y RLS)
Implementación de seguridad.

- `SEGURIDAD-*.md` - Seguridad general
- `ACTIVAR-SEGURIDAD.md` - Activar seguridad
- `PROTECCION-*.md` - Protección de rutas
- `RATE-LIMITING-*.md` - Rate limiting
- `CHECKLIST-RLS-*.md` - Checklist de RLS
- `DESHABILITAR-REGISTRO-PUBLICO.md`
- `CONTROL-*.md` - Control de acceso

### 📁 08-guias (Guías de Uso)
Guías prácticas y propuestas.

- `GUIA-*.md` - Guías diversas
- `PLAN-*.md` - Planes de implementación
- `PROPUESTA-*.md` - Propuestas de diseño
- `DECISION-*.md` - Decisiones tomadas
- `ANALISIS-*.md` - Análisis de flujos
- `INSTRUCCIONES-*.md` - Instrucciones
- `FLUJO-*.md` - Flujos de trabajo
- `REGLAS-*.md` - Reglas de negocio

### 📁 09-resumen (Resúmenes y Auditorías)
Resúmenes de sesiones y auditorías.

- `RESUMEN-*.md` - Resúmenes de sesiones
- `AUDITORIA-*.md` - Auditorías de código
- `OPTIMIZATION_SUMMARY.md` - Resumen de optimizaciones
- `RESUMEN_EJECUTIVO.md` ⭐ - Resumen ejecutivo

### 📁 Raíz /docs
Documentos principales y críticos.

- `DATABASE-SCHEMA-REFERENCE.md` ⭐⭐⭐ - **FUENTE ÚNICA DE VERDAD**
- `DESARROLLO-CHECKLIST.md` ⭐⭐ - **OBLIGATORIO ANTES DE DESARROLLAR**
- `GUIA-ESTILOS.md` ⭐ - Guía de estilos
- `AUTH-SETUP.md` - Setup de autenticación
- `ROADMAP.md` - Hoja de ruta
- `CHECKLIST.md` - Checklist general
- `TODO-CRITICO.md` - TODOs críticos
- `PENDIENTES-*.md` - Pendientes
- `APLICACION-100-LISTA.md` - Estado del proyecto

---

## 🗄️ SQL - Estructura Supabase

### 📁 supabase/migrations
Migraciones versionadas (NO MOVER).

### 📁 supabase/schemas
Definiciones de esquemas de base de datos.

- `schema.sql` - Schema principal
- `*-schema.sql` - Schemas específicos
- `categorias-*.sql` - Categorías

### 📁 supabase/policies
Políticas de Row Level Security (RLS).

- `rls-policies.sql` - Políticas principales
- `*-rls.sql` - Políticas específicas
- `fix-rls-*.sql` - Correcciones de RLS
- `storage-policies.sql` - Políticas de storage

### 📁 supabase/functions
Funciones SQL y triggers.

- `funcion-*.sql` - Funciones
- `audit-*.sql` - Auditoría

### 📁 supabase/storage
Configuración de almacenamiento.

- `storage-*.sql` - Storage setup
- `create-storage-*.sql` - Crear buckets

### 📁 supabase/verification
Scripts de verificación y queries.

- `verificar-*.sql` - Verificaciones
- `VERIFICAR-*.sql` - Verificaciones mayúsculas
- `listar-*.sql` - Listados
- `QUERIES-*.sql` - Queries de verificación
- `DIAGNOSTICO.sql` - Diagnóstico

### 📁 supabase/archive
SQL obsoletos o en desuso.

---

## 🎯 Documentos Críticos (LEER SIEMPRE)

### 🔴 CRÍTICA MÁXIMA
1. **`DATABASE-SCHEMA-REFERENCE.md`** - Fuente única de verdad para nombres de campos
2. **`DESARROLLO-CHECKLIST.md`** - Obligatorio antes de escribir código

### 🟡 IMPORTANTE
3. **`GUIA-ESTILOS.md`** - Convenciones de código
4. **`ARCHITECTURE.md`** - Arquitectura del sistema
5. **`MODULE_TEMPLATE.md`** - Template para nuevos módulos

### 🟢 REFERENCIA
6. **`RESUMEN_EJECUTIVO.md`** - Visión general del proyecto
7. **`ROADMAP.md`** - Próximos pasos
8. **`CHECKLIST.md`** - Checklist general

---

## 📖 Cómo Usar Esta Documentación

### Para Desarrolladores Nuevos:
1. **Leer**: `docs/01-setup/QUICK-START.md`
2. **Configurar**: `docs/01-setup/SUPABASE-COMPLETO.md`
3. **Estudiar**: `docs/02-arquitectura/ARCHITECTURE.md`
4. **Consultar siempre**: `docs/DATABASE-SCHEMA-REFERENCE.md`

### Antes de Desarrollar:
1. ✅ Leer `DATABASE-SCHEMA-REFERENCE.md`
2. ✅ Revisar `DESARROLLO-CHECKLIST.md`
3. ✅ Consultar `GUIA-ESTILOS.md`
4. ✅ Ver ejemplo en `src/modules/proyectos/`

### Para Resolver Problemas:
1. Buscar en `docs/04-fixes/`
2. Consultar `docs/07-seguridad/` si es relacionado con permisos
3. Revisar `supabase/verification/` para queries de diagnóstico

---

## 🔄 Mantenimiento

- **Actualizar**: Este índice cuando se agreguen nuevos documentos
- **Archivar**: Mover documentos obsoletos a `docs/archive/`
- **Limpiar**: Eliminar documentos duplicados
- **Consolidar**: Unir documentos similares

---

**Última actualización**: Octubre 20, 2025
**Mantenido por**: Equipo de desarrollo RyR
