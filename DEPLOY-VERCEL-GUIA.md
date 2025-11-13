# 🚀 GUÍA DE DEPLOY EN VERCEL - RyR Constructora

## ✅ ESTADO ACTUAL

Tu aplicación se está desplegando en Vercel:
- **URL de Inspección**: https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app/
- **URL de Producción** (cuando termine): `https://constructora-ryr-app-XXXXX.vercel.app`

---

## 📋 PASOS SIGUIENTES (OBLIGATORIOS)

### 🔑 **PASO 1: Configurar Variables de Entorno**

1. **Ir al Dashboard de Vercel**:
   - https://vercel.com/nrodriguezs-projects-47abf0d6/constructora-ryr-app

2. **Settings → Environment Variables**

3. **Agregar estas variables**:
   ```
   Nombre: NEXT_PUBLIC_SUPABASE_URL
   Valor: https://swyjhwgvkfcfdtemkyad.supabase.co
   ☑ Production ☑ Preview ☑ Development

   Nombre: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valor: [TU ANON KEY DE SUPABASE]
   ☑ Production ☑ Preview ☑ Development
   ```

4. **Obtener tu ANON_KEY de Supabase**:
   - Dashboard Supabase → Settings → API
   - Copiar el `anon` `public` key

---

### 🔒 **PASO 2: Configurar Supabase para permitir tu dominio**

1. **Ir a Supabase Dashboard**:
   - https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad

2. **Authentication → URL Configuration**

3. **Agregar URLs permitidas**:
   ```
   Site URL: https://constructora-ryr-app.vercel.app

   Redirect URLs (agregar línea por línea):
   https://constructora-ryr-app.vercel.app/**
   https://constructora-ryr-app-*.vercel.app/**
   http://localhost:3000/**
   ```

---

### 🔄 **PASO 3: Re-deploy con variables configuradas**

Una vez configuradas las variables de entorno:

```bash
# Hacer nuevo deploy de producción
vercel --prod
```

---

## 🌐 DOMINIOS

### **Dominio actual (Vercel gratuito)**:
- `https://constructora-ryr-app.vercel.app` (principal)
- `https://constructora-ryr-app-XXXXX.vercel.app` (preview por deploy)

### **Dominio personalizado (opcional)**:
Si tienes un dominio propio (ej: `constructoraryr.com`):

1. **Vercel Dashboard → Settings → Domains**
2. **Add Domain** → Escribe tu dominio
3. **Configurar DNS** según instrucciones de Vercel

---

## 🛠️ COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
vercel logs https://constructora-ryr-app.vercel.app

# Lista de deploys
vercel ls

# Hacer deploy de producción
vercel --prod

# Hacer deploy de preview (testing)
vercel

# Ver información del proyecto
vercel inspect
```

---

## 📊 VERIFICACIÓN POST-DEPLOY

Cuando el deploy termine, verifica:

1. ✅ **Login funciona**
   - Ir a `/login`
   - Probar credenciales

2. ✅ **Supabase conecta**
   - Ir a `/proyectos`
   - Verificar que carguen datos

3. ✅ **Storage funciona**
   - Subir un documento
   - Verificar que se suba correctamente

4. ✅ **Responsive**
   - Probar en móvil
   - Probar en tablet

---

## ⚠️ PROBLEMAS COMUNES

### **Error: "Invalid API key"**
- ✅ Verificar que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté configurada
- ✅ Re-deploy: `vercel --prod`

### **Error: "Failed to fetch"**
- ✅ Verificar URLs permitidas en Supabase
- ✅ Verificar que `NEXT_PUBLIC_SUPABASE_URL` sea correcta

### **Error 500 en producción**
- ✅ Ver logs: `vercel logs <url>`
- ✅ Verificar variables de entorno

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ **Configurar dominio personalizado**
2. ✅ **Configurar Analytics de Vercel**
3. ✅ **Configurar alertas de errores** (Sentry)
4. ✅ **Configurar backups de Supabase**
5. ✅ **Configurar CI/CD con GitHub Actions**

---

## 📞 SOPORTE

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**¡Tu aplicación está lista para producción!** 🚀
