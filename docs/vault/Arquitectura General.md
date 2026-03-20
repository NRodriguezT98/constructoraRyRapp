# 🏛️ Arquitectura General

> Visión de alto nivel del sistema RyR Constructora

---

## Relaciones

- Describe → [[RyR Constructora]]
- Implementa → [[Stack Tecnológico]]
- Organiza → [[Patrón de Módulos]]
- Define → [[Capas de la Aplicación]]
- Aplica → [[Separación de Responsabilidades]]

---

## Diagrama

```mermaid
graph TB
    subgraph Cliente["🌐 Browser"]
        NextApp["Next.js 15 App Router"]
        RQ["React Query Cache"]
        ZS["Zustand Stores"]
    end

    subgraph Backend["☁️ Supabase"]
        Auth["🔐 Auth"]
        DB["🗄️ PostgreSQL + RLS"]
        ST["📦 Storage"]
    end

    NextApp --> RQ --> DB
    NextApp --> Auth
    RQ --> ST
```

---

## Principios

1. **Domain-Driven Design** → Módulos por dominio de negocio
2. **[[Separación de Responsabilidades]]** → UI / Lógica / Datos estricta
3. **Type Safety** → [[TypeScript]] end-to-end con tipos auto-generados
4. **Theming Modular** → [[Sistema de Theming]] con colores por módulo
5. **Sanitización** → Datos validados antes de BD

#arquitectura
