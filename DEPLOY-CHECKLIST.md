# ✅ CHECKLIST POST-DEPLOY - Vercel

## 🎯 TAREAS OBLIGATORIAS (Hacer en orden)

### 1. ⏳ ESPERAR BUILD (EN PROGRESO)
- [ ] **Esperar a que termine el build** (~2-5 minutos)
- [ ] **URL de inspección**: https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app/6Lixd5cektddyhqGJg93D869WqAX
- [ ] **URL de producción**: https://constructora-ryr-p4xy4ot63-nrodriguezs-projects-47abf0d6.vercel.app

---

### 2. 🔑 CONFIGURAR VARIABLES DE ENTORNO

**Pasos:**
1. [ ] Ir a: https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app/settings/environment-variables

2. [ ] **Agregar variable #1**:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://swyjhwgvkfcfdtemkyad.supabase.co`
   - **Environments**: ☑ Production ☑ Preview ☑ Development

3. [ ] **Agregar variable #2**:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: (obtener de Supabase Dashboard → Settings → API → `anon public` key)
   - **Environments**: ☑ Production ☑ Preview ☑ Development

4. [ ] **Redeploy** para aplicar cambios:
   ```bash
   vercel --prod
   ```

---

### 3. 🔒 CONFIGURAR SUPABASE

**Pasos:**
1. [ ] Ir a: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/auth/url-configuration

2. [ ] **Site URL**: `https://constructora-ryr-p4xy4ot63-nrodriguezs-projects-47abf0d6.vercel.app`

3. [ ] **Redirect URLs** (agregar cada uno en línea separada):
   ```
   https://constructora-ryr-p4xy4ot63-nrodriguezs-projects-47abf0d6.vercel.app/**
   https://constructora-ryr-app.vercel.app/**
   https://constructora-ryr-*.vercel.app/**
   http://localhost:3000/**
   ```

4. [ ] **Guardar cambios**

---

### 4. 🧪 TESTING EN PRODUCCIÓN

**Tests obligatorios:**

#### Login/Autenticación
- [ ] Ir a `/login`
- [ ] Probar login con credenciales
- [ ] Verificar que redirija al dashboard

#### Proyectos
- [ ] Ir a `/proyectos`
- [ ] Verificar que carguen proyectos
- [ ] Verificar imágenes de portada

#### Documentos
- [ ] Ir a un proyecto
- [ ] Verificar que carguen documentos
- [ ] Subir un documento de prueba
- [ ] Verificar que se suba correctamente

#### Papelera (TU MÓDULO NUEVO)
- [ ] Ir a `/documentos/papelera`
- [ ] Eliminar un documento
- [ ] Verificar que aparezca inmediatamente en papelera
- [ ] Restaurar versión selectiva (ej: v1, v3, v6)
- [ ] Verificar numeración híbrida ("Versión 2 (orig. v3)")
- [ ] Verificar botón "Ver" abre documento
- [ ] Verificar color scheme rosa/rojo
- [ ] Verificar versiones NO seleccionadas quedan en papelera

#### Responsive
- [ ] Probar en móvil (Chrome DevTools → Toggle Device)
- [ ] Probar en tablet
- [ ] Probar dark mode (☀️/🌙)

---

### 5. ⚡ OPTIMIZACIONES OPCIONALES

- [ ] **Custom Domain**:
  - Vercel Dashboard → Settings → Domains → Add Domain
  - Configurar DNS según instrucciones

- [ ] **Analytics**:
  - Vercel Dashboard → Analytics → Enable

- [ ] **Monitoring**:
  - Integrar Sentry o LogRocket para errores

- [ ] **SEO**:
  - Verificar meta tags
  - Configurar sitemap.xml

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### ❌ "Invalid API key"
```bash
# Verificar que NEXT_PUBLIC_SUPABASE_ANON_KEY esté configurada
# Redeploy: vercel --prod
```

### ❌ "Failed to fetch"
```bash
# Verificar URLs permitidas en Supabase
# Verificar NEXT_PUBLIC_SUPABASE_URL
```

### ❌ Error 500
```bash
# Ver logs en tiempo real:
vercel logs https://constructora-ryr-p4xy4ot63-nrodriguezs-projects-47abf0d6.vercel.app

# O en el dashboard:
# https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app/logs
```

### ❌ Build failed
```bash
# Ver logs detallados:
# https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app/6Lixd5cektddyhqGJg93D869WqAX
```

---

## 📌 COMANDOS ÚTILES

```bash
# Ver estado del proyecto
vercel inspect

# Lista de deployments
vercel ls

# Ver logs en tiempo real
vercel logs <url>

# Redeploy
vercel --prod

# Eliminar deployment
vercel rm <deployment-url>
```

---

## ✅ CUANDO TODO FUNCIONE

1. [ ] **Actualizar README.md** con URL de producción
2. [ ] **Compartir URL** con stakeholders
3. [ ] **Documentar cualquier issue** encontrado
4. [ ] **Reactivar ESLint** en `next.config.js`:
   ```javascript
   eslint: {
     ignoreDuringBuilds: false, // Volver a activar
   }
   ```
5. [ ] **Arreglar warnings de ESLint** antes del próximo deploy

---

## 🎉 LISTO PARA PRODUCCIÓN

**URL principal**: https://constructora-ryr-p4xy4ot63-nrodriguezs-projects-47abf0d6.vercel.app

**Dashboard Vercel**: https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app

**Supabase Dashboard**: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
