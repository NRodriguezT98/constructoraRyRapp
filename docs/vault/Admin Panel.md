# 🔧 Admin Panel

> Panel de administración y configuración del sistema
> **Ruta**: `/admin`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Gestiona → [[Usuarios]]
- Configura → [[Configuración]]
- Configura → [[Requisitos de Fuentes]]
- Controla eliminación de → [[Documentos]]

---

## Sub-rutas

| Ruta | Función |
|------|---------|
| `/admin/categorias-sistema` | Categorías de documentos |
| `/admin/configuracion` | Configuración general |
| `/admin/entidades-financieras` | Bancos y entidades |
| `/admin/fuentes-pago` | Gestión de fuentes |
| `/admin/fuentes-pago-hub` | Hub central de fuentes |
| `/admin/tipos-fuentes-pago` | Tipos de [[Fuentes de Pago]] |
| `/admin/requisitos-fuentes` | [[Requisitos de Fuentes]] |

---

## Estructura

```
src/modules/admin/
├── components/
├── hooks/
├── procesos/
└── services/
    └── categorias-sistema.service.ts
```

#módulo #admin
