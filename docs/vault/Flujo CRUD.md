# 🔁 Flujo CRUD

> Patrón estándar de lectura/escritura en todos los módulos

---

## Relaciones

- Patrón usado por → Todos los módulos de [[RyR Constructora]]
- Implementa → [[Separación de Responsabilidades]]
- Usa → [[React Query]], [[Supabase]]
- Define → [[Capas de la Aplicación]]

---

## Lectura (Query)

```mermaid
sequenceDiagram
    participant C as 🖥️ Componente
    participant H as 🧠 Hook
    participant RQ as ⚡ React Query
    participant S as 🔧 Service
    participant DB as 🗄️ Supabase

    C->>H: Render
    H->>RQ: useQuery('key')
    RQ->>S: fetchDatos()
    S->>DB: supabase.from('tabla').select()
    DB-->>S: { data, error }
    S-->>RQ: datos
    RQ-->>H: { data, isLoading }
    H-->>C: Props
```

## Escritura (Mutation)

```mermaid
sequenceDiagram
    participant C as 🖥️ Componente
    participant H as 🧠 Hook
    participant RQ as ⚡ React Query
    participant S as 🔧 Service
    participant DB as 🗄️ Supabase

    C->>H: onClick
    H->>H: sanitizeDTO(datos)
    H->>RQ: useMutation()
    RQ->>S: crearRegistro(dto)
    S->>DB: supabase.from('tabla').insert()
    DB-->>S: resultado
    RQ->>RQ: invalidateQueries()
    RQ-->>H: success
    H-->>C: Toast + refresh
```

---

## Capas involucradas

1. **Componente** → Solo renderiza y captura eventos
2. **Hook** → Sanitiza, orquesta query/mutation
3. **[[React Query]]** → Cache, invalidación, retry
4. **Service** → Llamada directa a [[Supabase]]
5. **[[Base de Datos]]** → PostgreSQL + RLS

#flujo #crud
