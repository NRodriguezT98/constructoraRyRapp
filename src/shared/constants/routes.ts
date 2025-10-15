/**
 * Configuración de rutas de la aplicación
 */

export interface Route {
    path: string
    label: string
    icon?: string
    description?: string
    requiresAuth?: boolean
}

export interface RouteGroup {
    label: string
    routes: Route[]
}

// Rutas principales
export const ROUTES = {
    HOME: '/',
    PROYECTOS: '/proyectos',
    VIVIENDAS: '/viviendas',
    CLIENTES: '/clientes',
    ABONOS: '/abonos',
    RENUNCIAS: '/renuncias',
    ADMIN: '/admin',
} as const

// Navegación estructurada
export const NAVIGATION: RouteGroup[] = [
    {
        label: 'Principal',
        routes: [
            {
                path: ROUTES.HOME,
                label: 'Inicio',
                icon: 'Home',
                description: 'Panel principal',
            },
        ],
    },
    {
        label: 'Gestión',
        routes: [
            {
                path: ROUTES.PROYECTOS,
                label: 'Proyectos',
                icon: 'Building2',
                description: 'Gestión de proyectos',
            },
            {
                path: ROUTES.VIVIENDAS,
                label: 'Viviendas',
                icon: 'Home',
                description: 'Gestión de viviendas',
            },
            {
                path: ROUTES.CLIENTES,
                label: 'Clientes',
                icon: 'Users',
                description: 'Gestión de clientes',
            },
        ],
    },
    {
        label: 'Finanzas',
        routes: [
            {
                path: ROUTES.ABONOS,
                label: 'Abonos',
                icon: 'DollarSign',
                description: 'Gestión de abonos',
            },
            {
                path: ROUTES.RENUNCIAS,
                label: 'Renuncias',
                icon: 'FileX',
                description: 'Gestión de renuncias',
            },
        ],
    },
    {
        label: 'Administración',
        routes: [
            {
                path: ROUTES.ADMIN,
                label: 'Panel Admin',
                icon: 'Settings',
                description: 'Panel de administración',
                requiresAuth: true,
            },
        ],
    },
]

// Breadcrumbs
export const ROUTE_LABELS: Record<string, string> = {
    [ROUTES.HOME]: 'Inicio',
    [ROUTES.PROYECTOS]: 'Proyectos',
    [ROUTES.VIVIENDAS]: 'Viviendas',
    [ROUTES.CLIENTES]: 'Clientes',
    [ROUTES.ABONOS]: 'Abonos',
    [ROUTES.RENUNCIAS]: 'Renuncias',
    [ROUTES.ADMIN]: 'Administración',
}