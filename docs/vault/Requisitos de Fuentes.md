# 📝 Requisitos de Fuentes

> Documentos y requisitos requeridos por cada tipo de fuente de pago
> **Ruta**: `/admin/requisitos-fuentes`

---

## Relaciones

- Pertenece a → [[RyR Constructora]]
- Define requisitos para → [[Fuentes de Pago]]
- Genera → [[Documentos]] pendientes
- Configurado desde → [[Admin Panel]]
- Usa plantillas de → [[Configuración]]

---

## Estructura

```
src/modules/requisitos-fuentes/
├── components/
├── hooks/
├── services/
├── styles/
└── types/
```

---

## Alcance de Documentos

| Alcance | Descripción |
|---------|-------------|
| `ESPECIFICO_FUENTE` | Un documento por cada fuente (ej: Carta de Aprobación) |
| `COMPARTIDO_CLIENTE` | Un documento para el cliente (ej: Boleta de Registro) |

#módulo #financiero #requisitos
