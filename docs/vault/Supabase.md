# ☁️ Supabase

> Backend-as-a-Service (BaaS) que provee toda la infraestructura

---

## Relaciones

- Backend de → [[RyR Constructora]]
- Provee → [[Base de Datos]] (PostgreSQL)
- Provee → [[Storage]] (archivos)
- Provee → [[Autenticación]]
- Parte del → [[Stack Tecnológico]]

---

## Clientes en el Proyecto

| Cliente | Archivo | Uso |
|---------|---------|-----|
| Browser | `src/lib/supabase/client.ts` | CSR, singleton con SSR cookies |
| Server | `src/lib/supabase/server.ts` | SSR, Server Components |
| Admin | `src/lib/supabase/admin.ts` | Permisos elevados |
| Middleware | `src/lib/supabase/middleware.ts` | Verificación de sesión |

---

## Tipos Auto-generados

```bash
npm run types:generate
# → src/lib/supabase/database.types.ts
```

Provee autocomplete completo de tablas y columnas en [[TypeScript]].

#tecnología #backend
