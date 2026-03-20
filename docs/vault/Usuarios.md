# 👤 Usuarios

> Gestión de usuarios, roles y permisos
> **Ruta**: Dentro de [[Admin Panel]]

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Gestionado por → [[Admin Panel]]
- Genera → [[Auditorías]]
- Se autentica via → [[Autenticación]]

---

## Estructura

```
src/modules/usuarios/
├── components/
├── hooks/
├── services/
├── styles/
└── types/
```

---

## Datos Clave

- Autenticación manejada por [[Supabase]] Auth
- Roles y permisos controlados con RLS en [[Base de Datos]]

#módulo #admin #usuarios
