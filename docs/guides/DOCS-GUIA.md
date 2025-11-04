# 📁 Guía de Archivos de Documentación

## ✅ Documentación Actualizada y Organizada

**✨ TODO está ahora en carpetas organizadas:**

```
docs/
├── INDEX.md                    ⭐⭐⭐ ÍNDICE MAESTRO
├── 01-setup/                  # Configuración inicial (10 archivos)
├── 02-arquitectura/           # Arquitectura (8 archivos)
├── 03-modulos/                # Por módulo (30+ archivos)
├── 04-fixes/                  # Correcciones (40+ archivos)
├── 05-migraciones/            # Migraciones (15+ archivos)
├── 06-testing/                # Testing (8+ archivos)
├── 07-seguridad/              # Seguridad (10+ archivos)
├── 08-guias/                  # Guías (20+ archivos)
└── 09-resumen/                # Resúmenes (10+ archivos)

supabase/
├── INDEX.md                    ⭐⭐⭐ ÍNDICE SQL
├── migrations/                # Migraciones versionadas (5 archivos)
├── schemas/                   # Esquemas (12 archivos)
├── policies/                  # RLS (6 archivos)
├── functions/                 # Funciones (2 archivos)
├── storage/                   # Storage (3 archivos)
├── verification/              # Verificación (10 archivos)
└── archive/                   # Obsoletos (20+ archivos)
```

## 📖 Cómo Usar

### Para Desarrolladores Nuevos:
1. Lee `docs/INDEX.md` primero
2. Sigue `docs/01-setup/` para configurar
3. Estudia `docs/02-arquitectura/` para entender estructura
4. Consulta `docs/DATABASE-SCHEMA-REFERENCE.md` siempre

### Para SQL:
1. Lee `supabase/INDEX.md` primero
2. Usa `supabase/schemas/` para ver esquemas
3. Usa `supabase/verification/` para verificar
4. Crea migraciones en `supabase/migrations/`

## 🗑️ Archivos en Raíz (Obsoletos)

Todos los archivos `.md` que estaban en la raíz del proyecto fueron movidos a `docs/`.
Todos los archivos `.sql` sueltos fueron organizados en `supabase/`.

**Si encuentras archivos `.md` o `.sql` sueltos en la raíz:**
- ❌ NO los uses
- ✅ Busca su versión actualizada en `docs/` o `supabase/`
- ✅ Consulta los índices `INDEX.md`

## 🔍 Búsqueda Rápida

| Necesito... | Ver... |
|-------------|--------|
| Índice completo de docs | `docs/INDEX.md` |
| Índice de SQL | `supabase/INDEX.md` |
| Configurar proyecto | `docs/01-setup/` |
| Arquitectura | `docs/02-arquitectura/` |
| Módulo específico | `docs/03-modulos/` |
| Corregir error | `docs/04-fixes/` |
| Migrar datos | `docs/05-migraciones/` |
| Testing | `docs/06-testing/` |
| Seguridad | `docs/07-seguridad/` |
| Guías | `docs/08-guias/` |
| Resúmenes | `docs/09-resumen/` |
| Schema DB | `docs/DATABASE-SCHEMA-REFERENCE.md` |
| Checklist desarrollo | `docs/DESARROLLO-CHECKLIST.md` |

---

**Última organización**: Octubre 20, 2025
**Mantenido por**: Equipo de desarrollo RyR
