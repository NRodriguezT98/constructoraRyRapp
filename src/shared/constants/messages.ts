/**
 * Mensajes y textos de la aplicación
 */

export const MESSAGES = {
    // Errores generales
    ERROR: {
        GENERIC: 'Ha ocurrido un error inesperado',
        NETWORK: 'Error de conexión. Verifica tu internet',
        TIMEOUT: 'La operación ha tardado demasiado',
        UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
        NOT_FOUND: 'El recurso solicitado no fue encontrado',
        VALIDATION: 'Por favor, verifica los datos ingresados',
    },

    // Éxitos
    SUCCESS: {
        CREATED: 'Creado exitosamente',
        UPDATED: 'Actualizado exitosamente',
        DELETED: 'Eliminado exitosamente',
        SAVED: 'Guardado exitosamente',
    },

    // Confirmaciones
    CONFIRM: {
        DELETE: '¿Estás seguro de eliminar este elemento?',
        CANCEL: '¿Estás seguro de cancelar? Los cambios no guardados se perderán',
        SUBMIT: '¿Deseas guardar los cambios?',
    },

    // Estados vacíos
    EMPTY: {
        GENERIC: 'No hay elementos para mostrar',
        SEARCH: 'No se encontraron resultados para tu búsqueda',
        FILTER: 'No hay elementos que coincidan con los filtros aplicados',
    },

    // Carga
    LOADING: {
        GENERIC: 'Cargando...',
        SAVING: 'Guardando...',
        DELETING: 'Eliminando...',
        PROCESSING: 'Procesando...',
    },
} as const

// Placeholders
export const PLACEHOLDERS = {
    SEARCH: 'Buscar...',
    EMAIL: 'correo@ejemplo.com',
    PHONE: '+57 123 456 7890',
    NAME: 'Nombre completo',
    DESCRIPTION: 'Escribe una descripción...',
    SELECT: 'Selecciona una opción',
} as const