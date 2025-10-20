# 🚀 Quick Start - RyR Constructora

> **Objetivo**: Estar desarrollando en 45 minutos

---

## ⏱️ Timeline

| Tiempo | Tarea | Resultado |
|--------|-------|-----------|
| **5 min** | Verificar preparación | Sabes qué falta |
| **30-45 min** | Configurar Supabase | DB funcional |
| **5 min** | Verificar ambiente | Servidor corriendo |
| **LISTO** | ¡Desarrollar! | 🎉 |

---

## 📋 Paso 1: Verificar Preparación (5 min)

### 1.1 Lee el estado actual

```bash
# Abre este archivo
code LISTO-PARA-DESARROLLAR.md
```

**¿Qué verás?**
- ✅ Lo que ya está listo (arquitectura, tooling, docs)
- ⚠️ Lo que falta (Supabase configuración)
- 📊 Puntuación: 68.75% de preparación

### 1.2 Checklist rápido

- [ ] Node.js instalado (verifica: `node --version`)
- [ ] npm instalado (verifica: `npm --version`)
- [ ] Dependencias instaladas (`node_modules/` existe)
- [ ] `.env.local` existe (si no, créalo desde `.env.example`)

---

## 🗄️ Paso 2: Configurar Supabase (30-45 min)

### 2.1 Abre la guía detallada

```bash
code docs/SUPABASE-SETUP-RAPIDO.md
```

### 2.2 Resumen de pasos

1. **Crear cuenta Supabase** (5 min)
   - Ir a https://supabase.com
   - Registrarse gratis
   - Crear nuevo proyecto

2. **Copiar credenciales** (2 min)
   - Copiar `SUPABASE_URL`
   - Copiar `SUPABASE_ANON_KEY`
   - Pegar en `.env.local`

3. **Ejecutar schema.sql** (10 min)
   - Abrir SQL Editor en Supabase
   - Pegar contenido de `supabase/schema.sql`
   - Ejecutar script
   - Verificar 8 tablas creadas

4. **Configurar Storage** (5 min)
   - Ejecutar `supabase/storage-setup.sql`
   - Crear bucket `documentos-proyectos`
   - Configurar políticas públicas

5. **Aplicar políticas RLS** (5 min)
   - Ejecutar `supabase/rls-policies.sql`
   - Verificar políticas en cada tabla

6. **Verificar conexión** (3 min)
   ```bash
   npm run dev
   ```
   - Abrir http://localhost:3000
   - No debe haber errores de conexión

---

## ✅ Paso 3: Verificar Ambiente (5 min)

### 3.1 Servidor corriendo

```bash
npm run dev
```

**Debe mostrar**:
```
▲ Next.js 15.5.5
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

### 3.2 Sin errores críticos

Abre http://localhost:3000 y verifica:
- [ ] Página carga correctamente
- [ ] No hay errores en consola (F12)
- [ ] Sidebar se ve bien
- [ ] Puedes navegar entre páginas

### 3.3 Base de datos conectada

```bash
# Abre el navegador en:
http://localhost:3000/proyectos
```

- [ ] No hay error de conexión
- [ ] Se muestra la lista vacía (o con datos si cargaste ejemplos)

---

## 🎉 Paso 4: ¡Listo para Desarrollar!

### Primera tarea sugerida: Crear un módulo

```bash
# Lee el template de módulos
code MODULE_TEMPLATE.md

# Mira el ejemplo de módulo completo
code src/modules/proyectos/
```

### Comandos útiles

```bash
# Desarrollo
npm run dev          # Servidor desarrollo (puerto 3000)

# Calidad de código
npm run format       # Formatear todo el código
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript

# Base de datos
npm run db:types     # Regenerar tipos de Supabase

# Git
# (pre-commit hook automático: format + lint + type-check)
```

---

## 📚 Documentación Clave

| Documento | Cuándo usarlo |
|-----------|---------------|
| **[LISTO-PARA-DESARROLLAR.md](./LISTO-PARA-DESARROLLAR.md)** | Estado del proyecto |
| **[docs/SUPABASE-SETUP-RAPIDO.md](./docs/SUPABASE-SETUP-RAPIDO.md)** | Configurar DB paso a paso |
| **[MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md)** | Crear nuevo módulo |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Entender arquitectura |
| **[docs/GUIA-ESTILOS.md](./docs/GUIA-ESTILOS.md)** | Código limpio y estilos |

---

## 🆘 Problemas Comunes

### "next no se reconoce como comando"

```bash
npm install
```

### "Error connecting to Supabase"

1. Verifica `.env.local` existe
2. Verifica credenciales correctas
3. Verifica proyecto Supabase activo
4. Reinicia servidor (`npm run dev`)

### Errores TypeScript al compilar

```bash
# Regenera tipos de Supabase
npm run db:types

# Si persisten, revisa:
npm run type-check
```

### Pre-commit hook falla

```bash
# Formatear código
npm run format

# Arreglar problemas de linting
npm run lint

# Verificar tipos
npm run type-check
```

---

## 🎯 Siguiente Paso

Una vez que tengas todo funcionando:

1. **Lee la arquitectura**
   ```bash
   code ARCHITECTURE.md
   ```

2. **Estudia el módulo de ejemplo**
   ```bash
   code src/modules/proyectos/
   ```

3. **Crea tu primer módulo**
   ```bash
   code MODULE_TEMPLATE.md
   ```

---

## 📊 Métricas de Éxito

Estás listo cuando:

- ✅ Servidor corre sin errores
- ✅ Base de datos conectada
- ✅ Puedes navegar la app
- ✅ Pre-commit hooks funcionan
- ✅ Entiendes la estructura de módulos

---

**¡Bienvenido al proyecto! 🎉**

Si tienes dudas, revisa [DOCS_INDEX.md](./DOCS_INDEX.md) para encontrar la documentación que necesites.
