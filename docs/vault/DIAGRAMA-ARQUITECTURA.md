# 🏗️ RyR Constructora - Diagrama de Arquitectura

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Client)"]
        NextApp["Next.js 15<br/>App Router"]
        ReactQuery["React Query<br/>Cache & Sync"]
        Zustand["Zustand<br/>Stores"]
        FramerMotion["Framer Motion<br/>Animaciones"]
    end

    subgraph Supabase["☁️ Supabase (Backend)"]
        Auth["🔐 Supabase Auth"]
        DB["🗄️ PostgreSQL"]
        Storage["📦 Supabase Storage"]
        RLS["🛡️ Row Level Security"]
        Realtime["⚡ Realtime"]
    end

    NextApp -->|SSR/CSR| ReactQuery
    NextApp --> Zustand
    NextApp --> FramerMotion
    ReactQuery -->|Queries & Mutations| Auth
    ReactQuery -->|CRUD| DB
    ReactQuery -->|Upload/Download| Storage
    DB --- RLS
    DB --- Realtime
    Realtime -.->|Subscriptions| ReactQuery

    style Browser fill:#1e293b,stroke:#38bdf8,color:#f1f5f9
    style Supabase fill:#1e293b,stroke:#22c55e,color:#f1f5f9
    style NextApp fill:#0f172a,stroke:#38bdf8,color:#38bdf8
    style ReactQuery fill:#0f172a,stroke:#ef4444,color:#ef4444
    style Zustand fill:#0f172a,stroke:#a855f7,color:#a855f7
    style FramerMotion fill:#0f172a,stroke:#f59e0b,color:#f59e0b
    style Auth fill:#064e3b,stroke:#22c55e,color:#22c55e
    style DB fill:#064e3b,stroke:#22c55e,color:#22c55e
    style Storage fill:#064e3b,stroke:#22c55e,color:#22c55e
    style RLS fill:#064e3b,stroke:#22c55e,color:#22c55e
    style Realtime fill:#064e3b,stroke:#22c55e,color:#22c55e
```

---

## 2. Stack Tecnológico

```mermaid
mindmap
  root((RyR Constructora))
    Frontend
      Next.js 15 App Router
      React 19
      TypeScript 5.9
      Tailwind CSS 3
      Framer Motion
    State
      React Query v5
      Zustand v5
      React Context
    Forms
      React Hook Form
      Zod v4 Validation
      Sanitización Custom
    Backend
      Supabase PostgreSQL
      Supabase Auth SSR
      Supabase Storage
      Row Level Security
    UI
      Radix UI + shadcn
      Lucide Icons
      Sonner Toasts
      Dark Mode
    Docs
      React PDF Renderer
      date-fns
```

---

## 3. Módulos del Sistema (Domain-Driven Design)

```mermaid
graph LR
    subgraph Core["🏢 Módulos Core"]
        Proyectos["🏗️ Proyectos<br/><small>Gestión de obras</small>"]
        Viviendas["🏠 Viviendas<br/><small>Propiedades</small>"]
        Clientes["👥 Clientes<br/><small>Gestión integral</small>"]
    end

    subgraph Financiero["💰 Módulos Financieros"]
        FuentesPago["💳 Fuentes de Pago<br/><small>Financiamiento</small>"]
        Abonos["💵 Abonos<br/><small>Pagos y cuotas</small>"]
        Negociaciones["📋 Negociaciones<br/><small>Acuerdos</small>"]
    end

    subgraph Soporte["📂 Módulos de Soporte"]
        Documentos["📄 Documentos<br/><small>Versionado</small>"]
        Auditorias["🔍 Auditorías<br/><small>Trazabilidad</small>"]
        ReqFuentes["📝 Requisitos<br/><small>Por fuente</small>"]
    end

    subgraph Admin["⚙️ Administración"]
        AdminPanel["🔧 Admin Panel"]
        Usuarios["👤 Usuarios"]
        Config["⚙️ Configuración<br/><small>Entidades, tipos</small>"]
    end

    Proyectos --> Viviendas
    Viviendas --> Clientes
    Clientes --> Negociaciones
    Negociaciones --> FuentesPago
    FuentesPago --> Abonos
    FuentesPago --> ReqFuentes
    Clientes --> Documentos
    Viviendas --> Documentos
    Proyectos --> Documentos
    Auditorias -.->|Registra cambios| Core
    Auditorias -.->|Registra cambios| Financiero
    Config --> FuentesPago
    Config --> ReqFuentes
    AdminPanel --> Usuarios
    AdminPanel --> Config

    style Core fill:#064e3b,stroke:#22c55e,color:#f1f5f9
    style Financiero fill:#1e1b4b,stroke:#818cf8,color:#f1f5f9
    style Soporte fill:#7c2d12,stroke:#fb923c,color:#f1f5f9
    style Admin fill:#1e293b,stroke:#94a3b8,color:#f1f5f9
```

---

## 4. Estructura Interna de un Módulo (Patrón Estándar)

```mermaid
graph TD
    subgraph Modulo["📦 src/modules/[modulo]/"]
        Page["🖥️ Page<br/><small>Orquestador</small>"]

        subgraph Components["components/"]
            UI1["ComponenteA.tsx<br/><small>UI Presentacional</small>"]
            UI2["ComponenteB.tsx<br/><small>UI Presentacional</small>"]
            Styles1["*.styles.ts<br/><small>Tailwind centralizado</small>"]
            Modals["modals/<br/><small>Diálogos</small>"]
            Tabs["tabs/<br/><small>Pestañas</small>"]
        end

        subgraph Hooks["hooks/"]
            Hook1["useModulo.ts<br/><small>Lógica principal</small>"]
            Hook2["useComponente.ts<br/><small>Lógica específica</small>"]
            QueryH["useModuloQuery.ts<br/><small>React Query</small>"]
        end

        subgraph Services["services/"]
            Svc1["modulo.service.ts<br/><small>CRUD Supabase</small>"]
            Svc2["modulo-storage.service.ts<br/><small>Archivos</small>"]
        end

        subgraph Types["types/"]
            T1["index.ts<br/><small>Interfaces & Types</small>"]
        end

        subgraph Utils["utils/"]
            U1["sanitize.utils.ts"]
            U2["helpers.ts"]
        end

        Store["store/<br/><small>Zustand (opcional)</small>"]
    end

    Page --> UI1
    Page --> UI2
    UI1 --> Hook1
    UI2 --> Hook2
    Hook1 --> QueryH
    Hook2 --> QueryH
    QueryH --> Svc1
    Hook1 --> Svc2
    Svc1 --> T1
    Hook1 --> U1

    style Page fill:#1e40af,stroke:#60a5fa,color:#f1f5f9
    style Components fill:#0f172a,stroke:#38bdf8,color:#38bdf8
    style Hooks fill:#0f172a,stroke:#a855f7,color:#a855f7
    style Services fill:#0f172a,stroke:#22c55e,color:#22c55e
    style Types fill:#0f172a,stroke:#f59e0b,color:#f59e0b
    style Utils fill:#0f172a,stroke:#f97316,color:#f97316
```

---

## 5. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant Login as Login Page
    participant Auth as Auth Context
    participant SB as Supabase Auth
    participant MW as Middleware SSR
    participant App as Protected App

    U->>Login: Ingresa credenciales
    Login->>SB: signInWithPassword()
    SB-->>Login: Session + Cookies
    Login->>Auth: setUser(session)
    Auth->>App: Redirige a Dashboard

    Note over MW: En cada request SSR
    MW->>SB: Verifica cookie de sesión
    SB-->>MW: Session válida/inválida

    alt Sesión válida
        MW->>App: Permite acceso
    else Sesión inválida
        MW->>Login: Redirige a login
    end

    Note over App: Monitoreo continuo
    App->>App: IdleTimerProvider<br/>SessionInterceptor
    App-->>Login: Auto-logout por inactividad
```

---

## 6. Flujo de Datos (CRUD típico)

```mermaid
sequenceDiagram
    participant C as 🖥️ Componente<br/>(UI pura)
    participant H as 🧠 Hook<br/>(Lógica)
    participant RQ as ⚡ React Query<br/>(Cache)
    participant S as 🔧 Service<br/>(API)
    participant SB as 🗄️ Supabase<br/>(PostgreSQL)

    Note over C,SB: LECTURA (Query)
    C->>H: Render → usa hook
    H->>RQ: useQuery('key')
    RQ->>S: fetchDatos()
    S->>SB: supabase.from('tabla').select()
    SB-->>S: { data, error }
    S-->>RQ: datos transformados
    RQ-->>H: { data, isLoading }
    H-->>C: Props para renderizar

    Note over C,SB: ESCRITURA (Mutation)
    C->>H: onClick → handler
    H->>H: sanitizeDTO(datos)
    H->>RQ: useMutation()
    RQ->>S: crearRegistro(dto)
    S->>SB: supabase.from('tabla').insert()
    SB-->>S: { data, error }
    S-->>RQ: resultado
    RQ->>RQ: invalidateQueries()
    RQ-->>H: { success }
    H-->>C: Toast + UI update
```

---

## 7. Rutas de la Aplicación (App Router)

```mermaid
graph TD
    subgraph Public["🌐 Rutas Públicas"]
        LoginPage["/login"]
        ResetPwd["/reset-password"]
    end

    subgraph Dashboard["📊 Dashboard (Protegido)"]
        Home["/ <br/><small>Dashboard Home</small>"]

        subgraph Gestion["Gestión Principal"]
            RP["/proyectos"]
            RPD["/proyectos/[id]"]
            RV["/viviendas"]
            RVN["/viviendas/nueva"]
            RVD["/viviendas/[slug]"]
            RC["/clientes"]
            RCD["/clientes/[id]"]
        end

        subgraph Finance["Financiero"]
            RA["/abonos"]
            RN["/renuncias"]
        end

        subgraph Docs["Documentos"]
            RDoc["/documentos"]
            RAud["/auditorias"]
            RRep["/reportes"]
        end

        subgraph AdminRoutes["Administración"]
            RAdm["/admin"]
            RCat["/admin/categorias-sistema"]
            RConf["/admin/configuracion"]
            REnt["/admin/entidades-financieras"]
            RFP["/admin/fuentes-pago"]
            RFPH["/admin/fuentes-pago-hub"]
            RTF["/admin/tipos-fuentes-pago"]
            RReq["/admin/requisitos-fuentes"]
        end
    end

    LoginPage -->|Auth OK| Home
    Home --> Gestion
    Home --> Finance
    Home --> Docs
    Home --> AdminRoutes
    RP --> RPD
    RV --> RVN
    RV --> RVD
    RC --> RCD
    RAdm --> RCat
    RAdm --> RConf
    RAdm --> REnt
    RAdm --> RFP
    RAdm --> RFPH
    RAdm --> RTF
    RAdm --> RReq

    style Public fill:#7f1d1d,stroke:#ef4444,color:#f1f5f9
    style Dashboard fill:#0f172a,stroke:#38bdf8,color:#38bdf8
    style Gestion fill:#064e3b,stroke:#22c55e,color:#22c55e
    style Finance fill:#1e1b4b,stroke:#818cf8,color:#818cf8
    style Docs fill:#7c2d12,stroke:#fb923c,color:#fb923c
    style AdminRoutes fill:#1e293b,stroke:#94a3b8,color:#94a3b8
```

---

## 8. Sistema de Documentos

```mermaid
graph TD
    subgraph Upload["📤 Subida de Documento"]
        Form["Formulario Upload"]
        Sanitize["Sanitización"]
        StorageUp["Supabase Storage<br/><small>Upload archivo</small>"]
        DBInsert["PostgreSQL<br/><small>Insert metadata</small>"]
    end

    subgraph Versioning["📋 Versionado"]
        V1["v1 - Original"]
        V2["v2 - Reemplazo"]
        V3["v3 - Actualización"]
        Audit["Audit Log<br/><small>Registro cambios</small>"]
    end

    subgraph Pending["⏳ Docs Pendientes"]
        Vista["vista_documentos_<br/>pendientes_fuentes"]
        Banner["Banner UI<br/><small>Notificación</small>"]
        AutoLink["Vinculación<br/>Automática"]
    end

    Form --> Sanitize
    Sanitize --> StorageUp
    StorageUp --> DBInsert
    DBInsert --> V1
    V1 -.-> V2 -.-> V3
    V2 --> Audit
    V3 --> Audit
    DBInsert --> AutoLink
    AutoLink --> Vista
    Vista --> Banner

    style Upload fill:#1e40af,stroke:#60a5fa,color:#f1f5f9
    style Versioning fill:#4c1d95,stroke:#a78bfa,color:#f1f5f9
    style Pending fill:#92400e,stroke:#fbbf24,color:#f1f5f9
```

---

## 9. Sistema de Theming Modular

```mermaid
graph LR
    subgraph Config["⚙️ module-themes.ts"]
        Themes["moduleThemes"]
    end

    subgraph Modules["🎨 Temas por Módulo"]
        P["🟢 Proyectos<br/><small>green/emerald/teal</small>"]
        V["🟠 Viviendas<br/><small>orange/amber/yellow</small>"]
        C["🔵 Clientes<br/><small>cyan/blue/indigo</small>"]
        N["🟣 Negociaciones<br/><small>pink/purple/indigo</small>"]
        A["🔵 Abonos<br/><small>blue/indigo/purple</small>"]
        D["🔴 Documentos<br/><small>red/rose/pink</small>"]
        Au["🟣 Auditorías<br/><small>blue/indigo/purple</small>"]
    end

    subgraph Component["🧩 Componente Genérico"]
        Prop["moduleName prop"]
        Dynamic["Estilos dinámicos<br/><small>getStyles(moduleName)</small>"]
    end

    Themes --> P
    Themes --> V
    Themes --> C
    Themes --> N
    Themes --> A
    Themes --> D
    Themes --> Au

    Prop --> Dynamic
    P --> Dynamic
    V --> Dynamic
    C --> Dynamic

    style Config fill:#1e293b,stroke:#94a3b8,color:#f1f5f9
    style Modules fill:#0f172a,stroke:#f59e0b,color:#f59e0b
    style Component fill:#064e3b,stroke:#22c55e,color:#f1f5f9
```

---

## 10. Esquema de Base de Datos (Entidades Principales)

```mermaid
erDiagram
    PROYECTOS ||--o{ VIVIENDAS : "tiene"
    VIVIENDAS ||--o{ NEGOCIACIONES : "asignada en"
    CLIENTES ||--o{ NEGOCIACIONES : "negocia"
    NEGOCIACIONES ||--o{ FUENTES_PAGO : "financiada por"
    FUENTES_PAGO ||--o{ ABONOS : "recibe pagos"
    FUENTES_PAGO }o--|| TIPOS_FUENTES_PAGO : "es tipo"
    FUENTES_PAGO }o--o| ENTIDADES_FINANCIERAS : "entidad"
    CLIENTES ||--o{ DOCUMENTOS_PROYECTO : "tiene docs"
    VIVIENDAS ||--o{ DOCUMENTOS_PROYECTO : "tiene docs"
    PROYECTOS ||--o{ DOCUMENTOS_PROYECTO : "tiene docs"
    DOCUMENTOS_PROYECTO ||--o{ VERSIONES_DOCUMENTO : "versionado"
    TIPOS_FUENTES_PAGO ||--o{ REQUISITOS_FUENTES : "requiere"
    USUARIOS ||--o{ AUDIT_LOG : "genera"

    PROYECTOS {
        uuid id PK
        text nombre
        text estado
        text ubicacion
        numeric presupuesto
    }

    VIVIENDAS {
        uuid id PK
        uuid proyecto_id FK
        text manzana
        text numero_lote
        text estado
        numeric valor_base
    }

    CLIENTES {
        uuid id PK
        text nombres
        text apellidos
        text cedula
        text telefono
        text email
    }

    NEGOCIACIONES {
        uuid id PK
        uuid cliente_id FK
        uuid vivienda_id FK
        text estado
        numeric valor_negociacion
    }

    FUENTES_PAGO {
        uuid id PK
        uuid negociacion_id FK
        text tipo_fuente
        text estado
        numeric monto
    }

    ABONOS {
        uuid id PK
        uuid fuente_pago_id FK
        numeric monto
        date fecha_abono
        text estado
    }

    DOCUMENTOS_PROYECTO {
        uuid id PK
        text titulo
        text categoria
        text url_storage
        date fecha_documento
    }

    AUDIT_LOG {
        uuid id PK
        uuid usuario_id FK
        text accion
        text modulo
        jsonb metadata
    }
```

---

## 11. Flujo de Negociación Completo

```mermaid
flowchart TD
    Start([🏁 Inicio]) --> SelectClient[Seleccionar/Crear Cliente]
    SelectClient --> SelectViv[Asignar Vivienda]
    SelectViv --> CreateNeg[Crear Negociación]
    CreateNeg --> ConfigFuentes[Configurar Fuentes de Pago]

    ConfigFuentes --> CI[💳 Cuota Inicial]
    ConfigFuentes --> CH[🏦 Crédito Hipotecario]
    ConfigFuentes --> CC[🏗️ Crédito Constructora]
    ConfigFuentes --> Sub[📋 Subsidio]
    ConfigFuentes --> Otros[➕ Otras fuentes...]

    CI --> Reqs{¿Requisitos<br/>completos?}
    CH --> Reqs
    CC --> Reqs
    Sub --> Reqs
    Otros --> Reqs

    Reqs -->|No| DocsPend[📄 Documentos Pendientes<br/><small>Banner + Notificación</small>]
    DocsPend --> SubirDocs[Subir Documentos]
    SubirDocs --> AutoLink[🔗 Vinculación Automática]
    AutoLink --> Reqs

    Reqs -->|Sí| Abonos[💵 Registrar Abonos]
    Abonos --> CheckSaldo{¿Saldo<br/>cubierto?}
    CheckSaldo -->|No| Abonos
    CheckSaldo -->|Sí| Desembolso[✅ Desembolso]
    Desembolso --> Escritura[📜 Escrituración]
    Escritura --> Done([🎉 Completado])

    style Start fill:#22c55e,stroke:#16a34a,color:white
    style Done fill:#22c55e,stroke:#16a34a,color:white
    style DocsPend fill:#f59e0b,stroke:#d97706,color:white
    style Desembolso fill:#3b82f6,stroke:#2563eb,color:white
    style Escritura fill:#8b5cf6,stroke:#7c3aed,color:white
```

---

## 12. Capas de la Aplicación

```mermaid
graph TB
    subgraph L1["Capa 1: Presentación"]
        Pages["Pages<br/><small>src/app/*/page.tsx</small>"]
        Components["Componentes<br/><small>*.tsx < 150 líneas</small>"]
        Styles["Estilos<br/><small>*.styles.ts</small>"]
    end

    subgraph L2["Capa 2: Lógica de Negocio"]
        Hooks2["Hooks<br/><small>use*.ts</small>"]
        Stores2["Stores<br/><small>Zustand</small>"]
        Contexts2["Contexts<br/><small>Auth, UnsavedChanges</small>"]
    end

    subgraph L3["Capa 3: Acceso a Datos"]
        Services3["Services<br/><small>*.service.ts</small>"]
        ReactQuery3["React Query<br/><small>Cache + Sync</small>"]
    end

    subgraph L4["Capa 4: Infraestructura"]
        SupaClient["Supabase Client<br/><small>client.ts / server.ts</small>"]
        TypesGen["Types Generados<br/><small>database.types.ts</small>"]
        Utils4["Utilidades<br/><small>date, sanitize, etc.</small>"]
    end

    subgraph L5["Capa 5: Base de Datos"]
        PG["PostgreSQL<br/><small>Tablas + Vistas + RLS</small>"]
        SStorage["Storage<br/><small>Buckets de archivos</small>"]
        SAuth["Auth<br/><small>Usuarios + Sesiones</small>"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5

    style L1 fill:#1e40af,stroke:#3b82f6,color:#f1f5f9
    style L2 fill:#6d28d9,stroke:#8b5cf6,color:#f1f5f9
    style L3 fill:#047857,stroke:#10b981,color:#f1f5f9
    style L4 fill:#92400e,stroke:#f59e0b,color:#f1f5f9
    style L5 fill:#1e293b,stroke:#64748b,color:#f1f5f9
```

---

## 13. Recursos Compartidos

```mermaid
graph TD
    subgraph Shared["src/shared/"]
        subgraph SComp["components/"]
            Layout["layout/<br/><small>ModuleContainer, Card,<br/>Button, Badge, States</small>"]
            Modals["modals/<br/><small>Confirm, Alert, Prompt</small>"]
            Forms["forms/<br/><small>FormInput, MoneyInput,<br/>ModernSelect</small>"]
            Table["table/<br/><small>DataTable</small>"]
        end

        subgraph SConfig["config/"]
            Themes["module-themes.ts<br/><small>Colores por módulo</small>"]
            Nav["navigation.config.ts<br/><small>Menú lateral</small>"]
        end

        subgraph SHooks["hooks/"]
            Debounce["useDebounce"]
            Pagination["usePagination"]
            ClickOut["useClickOutside"]
            FormCh["useFormChanges"]
            Others["+ 8 más"]
        end

        subgraph SUtils["utils/"]
            DateU["date.utils.ts"]
            SanitizeU["sanitize.utils.ts"]
        end
    end

    Layout -->|usado por| M1["Todos los módulos"]
    Themes -->|theming| M1
    Forms -->|formularios| M1
    SHooks -->|lógica reutilizable| M1

    style Shared fill:#0f172a,stroke:#38bdf8,color:#38bdf8
    style SComp fill:#1e293b,stroke:#60a5fa,color:#60a5fa
    style SConfig fill:#1e293b,stroke:#f59e0b,color:#f59e0b
    style SHooks fill:#1e293b,stroke:#a855f7,color:#a855f7
    style SUtils fill:#1e293b,stroke:#22c55e,color:#22c55e
```

---

## 📌 Notas

- **Obsidian**: Todos los diagramas usan `mermaid` y se renderizan nativamente en Obsidian
- **Patrón DDD**: Cada módulo encapsula componentes, hooks, services, types y utils
- **Separación estricta**: UI (< 150 líneas) → Hooks (lógica) → Services (DB) → Types
- **43+ servicios** distribuidos en 12 módulos
- **Theming dinámico** con `moduleThemes[moduleName]` en componentes compartidos
- **Tipos auto-generados** desde el schema real de Supabase con `npm run types:generate`
