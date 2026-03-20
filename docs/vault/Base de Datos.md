# 🗄️ Base de Datos

> PostgreSQL gestionada por [[Supabase]]

---

## Relaciones

- Parte de → [[RyR Constructora]]
- Hospedada en → [[Supabase]]
- Tipos generados para → [[TypeScript]]
- Accedida por → Todos los services de módulos

---

## Tablas Principales

| Tabla | Módulo | Descripción |
|-------|--------|-------------|
| `proyectos` | [[Proyectos]] | Obras de construcción |
| `viviendas` | [[Viviendas]] | Propiedades y lotes |
| `clientes` | [[Clientes]] | Datos de clientes |
| `negociaciones` | [[Negociaciones]] | Acuerdos comerciales |
| `fuentes_pago` | [[Fuentes de Pago]] | Fuentes de financiamiento |
| `tipos_fuentes_pago` | [[Configuración]] | Catálogo de tipos |
| `entidades_financieras` | [[Configuración]] | Bancos y entidades |
| `abonos` | [[Abonos]] | Pagos realizados |
| `documentos_proyecto` | [[Documentos]] | Metadata de documentos |
| `versiones_documento` | [[Documentos]] | Historial de versiones |
| `audit_log` | [[Auditorías]] | Registro de cambios |
| `usuarios` | [[Usuarios]] | Usuarios del sistema |

---

## Vistas

| Vista | Función |
|-------|---------|
| `vista_documentos_pendientes_fuentes` | Docs pendientes calculados en tiempo real |

---

## Seguridad

- **RLS** (Row Level Security) en todas las tablas
- **Triggers** para auditoría automática
- **Funciones SQL** para lógica de negocio

---

## Sincronización de Tipos

```bash
npm run types:generate   # Genera tipos desde schema
npm run type-check       # Valida TypeScript
npm run db:sync          # Genera + valida
```

Tipos generados en `src/lib/supabase/database.types.ts`

---

## Ejecutar SQL

```bash
npm run db:exec <archivo.sql>    # Ejecutar migración
node ejecutar-sql.js <archivo>   # Alternativa directa
```

#infraestructura #base-de-datos
