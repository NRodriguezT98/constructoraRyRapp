/**
 * Tipos generados para Supabase
 * Estos tipos coinciden con el esquema de la base de datos
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            proyectos: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string
                    ubicacion: string
                    fecha_inicio: string
                    fecha_fin_estimada: string
                    presupuesto: number
                    estado: 'en_planificacion' | 'en_construccion' | 'completado' | 'pausado'
                    progreso: number
                    responsable: string
                    telefono: string
                    email: string
                    fecha_creacion: string
                    fecha_actualizacion: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    descripcion: string
                    ubicacion: string
                    fecha_inicio: string
                    fecha_fin_estimada: string
                    presupuesto: number
                    estado?: 'en_planificacion' | 'en_construccion' | 'completado' | 'pausado'
                    progreso?: number
                    responsable: string
                    telefono: string
                    email: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                    user_id?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    descripcion?: string
                    ubicacion?: string
                    fecha_inicio?: string
                    fecha_fin_estimada?: string
                    presupuesto?: number
                    estado?: 'en_planificacion' | 'en_construccion' | 'completado' | 'pausado'
                    progreso?: number
                    responsable?: string
                    telefono?: string
                    email?: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                    user_id?: string
                }
            }
            manzanas: {
                Row: {
                    id: string
                    proyecto_id: string
                    nombre: string
                    numero_viviendas: number
                    fecha_creacion: string
                }
                Insert: {
                    id?: string
                    proyecto_id: string
                    nombre: string
                    numero_viviendas: number
                    fecha_creacion?: string
                }
                Update: {
                    id?: string
                    proyecto_id?: string
                    nombre?: string
                    numero_viviendas?: number
                    fecha_creacion?: string
                }
            }
            viviendas: {
                Row: {
                    id: string
                    manzana_id: string
                    numero: string
                    estado: 'disponible' | 'reservada' | 'vendida'
                    precio: number
                    area: number
                    cliente_id: string | null
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    manzana_id: string
                    numero: string
                    estado?: 'disponible' | 'reservada' | 'vendida'
                    precio: number
                    area: number
                    cliente_id?: string | null
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    manzana_id?: string
                    numero?: string
                    estado?: 'disponible' | 'reservada' | 'vendida'
                    precio?: number
                    area?: number
                    cliente_id?: string | null
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
            }
            clientes: {
                Row: {
                    id: string
                    nombre: string
                    apellido: string
                    documento_tipo: string
                    documento_numero: string
                    email: string
                    telefono: string
                    direccion: string
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    apellido: string
                    documento_tipo: string
                    documento_numero: string
                    email: string
                    telefono: string
                    direccion: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    apellido?: string
                    documento_tipo?: string
                    documento_numero?: string
                    email?: string
                    telefono?: string
                    direccion?: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
            }
            abonos: {
                Row: {
                    id: string
                    vivienda_id: string
                    cliente_id: string
                    monto: number
                    fecha_abono: string
                    metodo_pago: string
                    comprobante: string | null
                    observaciones: string | null
                    fecha_creacion: string
                }
                Insert: {
                    id?: string
                    vivienda_id: string
                    cliente_id: string
                    monto: number
                    fecha_abono: string
                    metodo_pago: string
                    comprobante?: string | null
                    observaciones?: string | null
                    fecha_creacion?: string
                }
                Update: {
                    id?: string
                    vivienda_id?: string
                    cliente_id?: string
                    monto?: number
                    fecha_abono?: string
                    metodo_pago?: string
                    comprobante?: string | null
                    observaciones?: string | null
                    fecha_creacion?: string
                }
            }
            renuncias: {
                Row: {
                    id: string
                    vivienda_id: string
                    cliente_id: string
                    motivo: string
                    fecha_renuncia: string
                    monto_devolucion: number
                    estado: 'pendiente' | 'aprobada' | 'rechazada'
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    vivienda_id: string
                    cliente_id: string
                    motivo: string
                    fecha_renuncia: string
                    monto_devolucion: number
                    estado?: 'pendiente' | 'aprobada' | 'rechazada'
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    vivienda_id?: string
                    cliente_id?: string
                    motivo?: string
                    fecha_renuncia?: string
                    monto_devolucion?: number
                    estado?: 'pendiente' | 'aprobada' | 'rechazada'
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
