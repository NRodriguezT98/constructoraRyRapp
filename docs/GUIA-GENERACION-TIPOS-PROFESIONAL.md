# 🔧 Sistema de Generación de Tipos TypeScript desde Supabase

## 📋 Descripción

Sistema profesional y robusto para generar tipos TypeScript desde el esquema de Supabase con características avanzadas de confiabilidad.

## ✨ Características

- ✅ **Timeout configurado** (60 segundos - previene cuelgues infinitos)
- ✅ **Sistema de reintentos** (3 intentos con backoff exponencial)
- ✅ **Caché automático** (fallback si falla generación)
- ✅ **Validación de conectividad** a Supabase antes de generar
- ✅ **Logs detallados** con colores y timestamps
- ✅ **Supabase CLI local** instalado como dependencia (no npx)
- ✅ **Validación del archivo generado** (estructura + contenido)
- ✅ **Detección de nuevas tablas** específicas

## 🚀 Uso

### Comando Principal (RECOMENDADO)
```bash
npm run types:generate
```

### Comandos Alternativos
```bash
# Usar CLI directamente (sin retry ni timeout)
npm run types:generate:direct

# Sincronizar tipos + validar TypeScript
npm run db:sync
```

## 📂 Archivos Involucrados

```
constructoraRyRapp/
├── package.json                        # Scripts npm
├── scripts/
│   └── generate-types.js              # ⭐ Script profesional
├── src/lib/supabase/
│   └── database.types.ts              # Archivo generado
└── .cache/
    └── database.types.backup.ts       # Backup automático
```

## 🔄 Flujo de Trabajo

1. **Validación de conectividad** → Verifica que Supabase esté accesible
2. **Guardado de caché** → Backup del archivo actual (si existe)
3. **Generación con retry** → Hasta 3 intentos con delays exponenciales
4. **Validación de archivo** → Verifica estructura y contenido
5. **Actualización de caché** → Guarda nueva versión como backup
6. **Logs detallados** → Información de tablas, tamaño, tiempo

## ⚙️ Configuración

Editar `scripts/generate-types.js`:

```javascript
const CONFIG = {
  PROJECT_ID: 'swyjhwgvkfcfdtemkyad',  // Tu project ID
  SCHEMA: 'public',                      // Schema de Supabase
  OUTPUT_FILE: '...',                    // Ruta de salida
  TIMEOUT_MS: 60000,                     // Timeout (60s)
  MAX_RETRIES: 3,                        // Intentos máximos
  RETRY_DELAY_BASE: 2000,                // Delay base (2s)
}
```

## 🛠️ Troubleshooting

### Problema: "Timeout después de 60 segundos"

**Causa:** Red lenta o API de Supabase sobrecargada

**Soluciones:**
1. Verificar conexión a internet
2. Incrementar `TIMEOUT_MS` en configuración
3. Reintentar más tarde (el script reintenta automáticamente)
4. Usar caché: El script automáticamente restaura desde backup

### Problema: "Error al ejecutar comando"

**Causa:** Supabase CLI no instalado correctamente

**Solución:**
```bash
# Reinstalar dependencias
npm install

# Verificar instalación
npx supabase --version
```

### Problema: "Archivo de tipos está vacío"

**Causa:** Problemas con autenticación de Supabase

**Soluciones:**
1. Verificar `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Verificar permisos de proyecto en Supabase Dashboard
3. El script restaurará automáticamente desde caché

### Problema: "No hay caché disponible"

**Causa:** Primera ejecución o caché eliminado

**Solución:**
```bash
# Generar manualmente con CLI directo
npm run types:generate:direct

# O agregar tipos manualmente según migración
# Ver: docs/SISTEMA-VERSIONES-NEGOCIACIONES.md
```

## 📊 Salida Esperada

```bash
[9:51:37] ═══════════════════════════════════════════════════
[9:51:37]    🔧 GENERADOR PROFESIONAL DE TIPOS TYPESCRIPT
[9:51:37] ═══════════════════════════════════════════════════

[9:51:37] → Validando conectividad a Supabase...
[9:51:37] ✓ Conexión a Supabase OK
[9:51:37] → Caché guardado: .cache\database.types.backup.ts
[9:51:37] → Iniciando generación de tipos...
[9:51:37] → Intento 1/3: Generando tipos...
[9:51:39] ✓ Archivo generado: src\lib\supabase\database.types.ts
[9:51:39] → Tamaño: 104.39 KB
[9:51:39] → Tablas detectadas: 37
[9:51:39] ✓ Nuevas tablas detectadas: negociaciones_versiones, descuentos_negociacion
[9:51:39] → Caché guardado: .cache\database.types.backup.ts

[9:51:39] ✓ ✨ Tipos generados exitosamente en 1.62s
```

## 🎯 Ventajas sobre `npx supabase gen types`

| Característica | npx (anterior) | Script Profesional |
|---------------|----------------|-------------------|
| Timeout | ❌ Infinito | ✅ 60s configurable |
| Retry | ❌ No | ✅ 3 intentos |
| Caché | ❌ No | ✅ Automático |
| Validación | ❌ No | ✅ Estructura + contenido |
| CLI local | ❌ Descarga cada vez | ✅ Instalado como dep |
| Logs | ❌ Básicos | ✅ Detallados + colores |
| Backoff | ❌ No | ✅ Exponencial |

## 🔗 Referencias

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Script source**: `scripts/generate-types.js`
- **Package.json**: Scripts en `types:generate`, `db:sync`

## 📝 Notas Importantes

1. **Después de migraciones SQL**: Ejecutar `npm run types:generate`
2. **El script es idempotent**: Puede ejecutarse múltiples veces sin problemas
3. **Caché se actualiza automáticamente**: Siempre hay fallback disponible
4. **Logs con timestamp**: Útil para debugging de problemas de red
5. **Compatible con CI/CD**: Exit codes correctos (0=éxito, 1=error)

## 🚀 Integración en Workflow

```bash
# Después de crear/modificar tablas en Supabase
npm run types:generate

# Validar que TypeScript compile
npm run type-check

# O todo en uno
npm run db:sync
```

## 📌 Ejemplo de Uso Completo

```bash
# 1. Crear migración SQL
node ejecutar-sql.js supabase/migrations/nueva-tabla.sql

# 2. Generar tipos (con retry y caché)
npm run types:generate

# 3. Validar TypeScript
npm run type-check

# 4. Usar los tipos en tu código
import { Database } from '@/lib/supabase/database.types'
type MiTabla = Database['public']['Tables']['mi_tabla']['Row']
```

---

**Última actualización**: 26 de noviembre de 2025
**Versión**: 1.0.0
**Autor**: Sistema de Desarrollo RyR Constructora
