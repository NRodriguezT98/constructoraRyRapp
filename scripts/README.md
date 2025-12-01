# 📁 Scripts Administrativos - RyR Constructora

Scripts de utilidad para desarrollo y mantenimiento del proyecto.

## 🔧 Scripts Disponibles

### 🔍 Análisis y Corrección de Errores TypeScript

#### `analyze-typescript-errors.js` ⭐ NUEVO

Analiza errores de TypeScript y genera reportes organizados.

**Uso:**
```bash
npm run errors:analyze
```

**Genera:**
- `.reports/typescript-errors-YYYY-MM-DD.json` (datos completos)
- `.reports/typescript-errors-YYYY-MM-DD.md` (reporte legible)
- `.reports/typescript-errors-summary.txt` (resumen rápido)

**Características:**
- 📊 Agrupa errores por archivo, módulo, código
- 🎯 Identifica errores críticos vs warnings
- 📈 Genera estadísticas y prioridades
- 📄 Exporta reportes en JSON/Markdown

---

#### `fix-typescript-errors.js` ⭐ NUEVO

Corrige automáticamente errores TypeScript comunes.

**Uso:**
```bash
npm run errors:fix              # Preview (dry-run)
npm run errors:fix:apply        # Aplicar correcciones
npm run errors:fix -- --filter=documentos --apply  # Solo un módulo
```

**Características:**
- 🔧 Corrige imports faltantes automáticamente
- 🔍 Modo dry-run para preview de cambios
- 💾 Backups automáticos (`.backups/YYYY-MM-DD/`)
- ✅ Reporta qué se corrigió y qué requiere manual

**Workflow completo:**
```bash
npm run errors:analyze          # 1. Analizar
npm run errors:fix              # 2. Preview
npm run errors:fix:apply        # 3. Aplicar
npm run type-check              # 4. Verificar
```

**Documentación completa:** `docs/MANEJO-ERRORES-TYPESCRIPT-MASIVOS.md` ⭐

---

### 🎨 Generación de Tipos Supabase

#### `generate-types.js` ⭐ PROFESIONAL

Genera tipos TypeScript desde el schema de Supabase con características avanzadas.

**Uso:**
```bash
npm run types:generate
```

**Características:**
- ✅ Timeout de 60s (previene cuelgues)
- ✅ 3 reintentos con backoff exponencial
- ✅ Sistema de caché automático
- ✅ Validación de conectividad
- ✅ Logs detallados con colores

**Documentación completa:** `docs/GUIA-GENERACION-TIPOS-PROFESIONAL.md`

---

## 📚 Documentación Relacionada

- `docs/MANEJO-ERRORES-TYPESCRIPT-MASIVOS.md` ⭐ NUEVO - Manejo profesional de errores masivos
- `docs/GUIA-GENERACION-TIPOS-PROFESIONAL.md` - Guía completa del sistema de tipos
- `docs/EJECUTAR-SQL-DIRECTAMENTE.md` - Ejecución de scripts SQL
- `docs/SISTEMA-SINCRONIZACION-SCHEMA-DB.md` - Sincronización de schema

## 🔗 Scripts npm Relacionados

```bash
# Errores TypeScript
npm run errors:analyze           # Analizar errores
npm run errors:fix               # Preview correcciones
npm run errors:fix:apply         # Aplicar correcciones

# Tipos Supabase
npm run types:generate           # Generar tipos (RECOMENDADO)
npm run types:generate:direct    # Usar CLI directo (sin retry)
npm run db:sync                  # Generar + validar TypeScript

# SQL y Validación
npm run db:exec                  # Ejecutar SQL
npm run type-check               # Validar TypeScript
```
