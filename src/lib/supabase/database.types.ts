export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abonos_historial: {
        Row: {
          comprobante_url: string | null
          fecha_abono: string
          fecha_actualizacion: string
          fecha_creacion: string
          fuente_pago_id: string
          id: string
          metodo_pago: string
          monto: number
          negociacion_id: string
          notas: string | null
          numero_referencia: string | null
          usuario_registro: string | null
        }
        Insert: {
          comprobante_url?: string | null
          fecha_abono: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          fuente_pago_id: string
          id?: string
          metodo_pago: string
          monto: number
          negociacion_id: string
          notas?: string | null
          numero_referencia?: string | null
          usuario_registro?: string | null
        }
        Update: {
          comprobante_url?: string | null
          fecha_abono?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          fuente_pago_id?: string
          id?: string
          metodo_pago?: string
          monto?: number
          negociacion_id?: string
          notas?: string | null
          numero_referencia?: string | null
          usuario_registro?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abonos_historial_fuente_pago_id_fkey"
            columns: ["fuente_pago_id"]
            isOneToOne: false
            referencedRelation: "fuentes_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accion: string
          cambios_especificos: Json | null
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          fecha_evento: string
          id: string
          ip_address: unknown
          metadata: Json | null
          modulo: string | null
          registro_id: string
          tabla: string
          user_agent: string | null
          usuario_email: string
          usuario_id: string | null
          usuario_nombres: string | null
          usuario_rol: string | null
        }
        Insert: {
          accion: string
          cambios_especificos?: Json | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          fecha_evento?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          modulo?: string | null
          registro_id: string
          tabla: string
          user_agent?: string | null
          usuario_email: string
          usuario_id?: string | null
          usuario_nombres?: string | null
          usuario_rol?: string | null
        }
        Update: {
          accion?: string
          cambios_especificos?: Json | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          fecha_evento?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          modulo?: string | null
          registro_id?: string
          tabla?: string
          user_agent?: string | null
          usuario_email?: string
          usuario_id?: string | null
          usuario_nombres?: string | null
          usuario_rol?: string | null
        }
        Relationships: []
      }
      audit_log_seguridad: {
        Row: {
          ciudad: string | null
          fecha_evento: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          pais: string | null
          tipo: string
          user_agent: string | null
          usuario_email: string
          usuario_id: string | null
        }
        Insert: {
          ciudad?: string | null
          fecha_evento?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          pais?: string | null
          tipo: string
          user_agent?: string | null
          usuario_email: string
          usuario_id?: string | null
        }
        Update: {
          ciudad?: string | null
          fecha_evento?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          pais?: string | null
          tipo?: string
          user_agent?: string | null
          usuario_email?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      categorias_documento: {
        Row: {
          color: string | null
          descripcion: string | null
          es_global: boolean
          es_sistema: boolean | null
          fecha_creacion: string | null
          icono: string | null
          id: string
          modulos_permitidos: string[]
          nombre: string
          orden: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          descripcion?: string | null
          es_global?: boolean
          es_sistema?: boolean | null
          fecha_creacion?: string | null
          icono?: string | null
          id?: string
          modulos_permitidos?: string[]
          nombre: string
          orden?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          descripcion?: string | null
          es_global?: boolean
          es_sistema?: boolean | null
          fecha_creacion?: string | null
          icono?: string | null
          id?: string
          modulos_permitidos?: string[]
          nombre?: string
          orden?: number | null
          user_id?: string
        }
        Relationships: []
      }
      cliente_intereses: {
        Row: {
          cliente_id: string
          estado: string
          fecha_actualizacion: string
          fecha_conversion: string | null
          fecha_interes: string
          fecha_ultimo_contacto: string | null
          id: string
          motivo_descarte: string | null
          negociacion_id: string | null
          notas: string | null
          origen: string | null
          prioridad: string | null
          proximo_seguimiento: string | null
          proyecto_id: string
          usuario_creacion: string | null
          valor_estimado: number | null
          vivienda_id: string | null
        }
        Insert: {
          cliente_id: string
          estado?: string
          fecha_actualizacion?: string
          fecha_conversion?: string | null
          fecha_interes?: string
          fecha_ultimo_contacto?: string | null
          id?: string
          motivo_descarte?: string | null
          negociacion_id?: string | null
          notas?: string | null
          origen?: string | null
          prioridad?: string | null
          proximo_seguimiento?: string | null
          proyecto_id: string
          usuario_creacion?: string | null
          valor_estimado?: number | null
          vivienda_id?: string | null
        }
        Update: {
          cliente_id?: string
          estado?: string
          fecha_actualizacion?: string
          fecha_conversion?: string | null
          fecha_interes?: string
          fecha_ultimo_contacto?: string | null
          id?: string
          motivo_descarte?: string | null
          negociacion_id?: string | null
          notas?: string | null
          origen?: string | null
          prioridad?: string | null
          proximo_seguimiento?: string | null
          proyecto_id?: string
          usuario_creacion?: string | null
          valor_estimado?: number | null
          vivienda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          apellidos: string
          ciudad: string | null
          departamento: string | null
          direccion: string | null
          documento_identidad_titulo: string | null
          documento_identidad_url: string | null
          email: string | null
          estado: string
          estado_civil: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion: string
          fecha_creacion: string
          fecha_nacimiento: string | null
          id: string
          nombre_completo: string | null
          nombres: string
          notas: string | null
          numero_documento: string
          telefono: string | null
          telefono_alternativo: string | null
          tipo_documento: string
          usuario_creacion: string | null
        }
        Insert: {
          apellidos: string
          ciudad?: string | null
          departamento?: string | null
          direccion?: string | null
          documento_identidad_titulo?: string | null
          documento_identidad_url?: string | null
          email?: string | null
          estado?: string
          estado_civil?: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_nacimiento?: string | null
          id?: string
          nombre_completo?: string | null
          nombres: string
          notas?: string | null
          numero_documento: string
          telefono?: string | null
          telefono_alternativo?: string | null
          tipo_documento?: string
          usuario_creacion?: string | null
        }
        Update: {
          apellidos?: string
          ciudad?: string | null
          departamento?: string | null
          direccion?: string | null
          documento_identidad_titulo?: string | null
          documento_identidad_url?: string | null
          email?: string | null
          estado?: string
          estado_civil?: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_nacimiento?: string | null
          id?: string
          nombre_completo?: string | null
          nombres?: string
          notas?: string | null
          numero_documento?: string
          telefono?: string | null
          telefono_alternativo?: string | null
          tipo_documento?: string
          usuario_creacion?: string | null
        }
        Relationships: []
      }
      configuracion_recargos: {
        Row: {
          activo: boolean | null
          descripcion: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
          tipo: string
          valor: number
        }
        Insert: {
          activo?: boolean | null
          descripcion?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
          tipo: string
          valor: number
        }
        Update: {
          activo?: boolean | null
          descripcion?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      descuentos_negociacion: {
        Row: {
          aplicado_en: string | null
          aplicado_por: string | null
          id: string
          monto: number
          motivo: string
          negociacion_version_id: string
          porcentaje: number | null
          tipo_descuento: string
        }
        Insert: {
          aplicado_en?: string | null
          aplicado_por?: string | null
          id?: string
          monto: number
          motivo: string
          negociacion_version_id: string
          porcentaje?: number | null
          tipo_descuento: string
        }
        Update: {
          aplicado_en?: string | null
          aplicado_por?: string | null
          id?: string
          monto?: number
          motivo?: string
          negociacion_version_id?: string
          porcentaje?: number | null
          tipo_descuento?: string
        }
        Relationships: [
          {
            foreignKeyName: "descuentos_negociacion_negociacion_version_id_fkey"
            columns: ["negociacion_version_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_versiones"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_reemplazos_admin: {
        Row: {
          admin_id: string
          archivo_anterior: string
          archivo_nuevo: string
          documento_id: string
          fecha_reemplazo: string | null
          hash_anterior: string | null
          hash_nuevo: string | null
          id: string
          ip_origen: unknown
          justificacion: string
          ruta_anterior: string
          ruta_nueva: string
          tamano_anterior: number
          tamano_nuevo: number
          user_agent: string | null
          version_afectada: number
        }
        Insert: {
          admin_id: string
          archivo_anterior: string
          archivo_nuevo: string
          documento_id: string
          fecha_reemplazo?: string | null
          hash_anterior?: string | null
          hash_nuevo?: string | null
          id?: string
          ip_origen?: unknown
          justificacion: string
          ruta_anterior: string
          ruta_nueva: string
          tamano_anterior: number
          tamano_nuevo: number
          user_agent?: string | null
          version_afectada: number
        }
        Update: {
          admin_id?: string
          archivo_anterior?: string
          archivo_nuevo?: string
          documento_id?: string
          fecha_reemplazo?: string | null
          hash_anterior?: string | null
          hash_nuevo?: string | null
          id?: string
          ip_origen?: unknown
          justificacion?: string
          ruta_anterior?: string
          ruta_nueva?: string
          tamano_anterior?: number
          tamano_nuevo?: number
          user_agent?: string | null
          version_afectada?: number
        }
        Relationships: [
          {
            foreignKeyName: "documento_reemplazos_admin_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_reemplazos_admin_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_reemplazos_admin_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_cliente: {
        Row: {
          categoria_id: string | null
          cliente_id: string
          descripcion: string | null
          documento_padre_id: string | null
          es_documento_identidad: boolean
          es_importante: boolean | null
          es_version_actual: boolean
          estado: string
          etiquetas: string[] | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_documento: string | null
          fecha_vencimiento: string | null
          id: string
          metadata: Json | null
          nombre_archivo: string
          nombre_original: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version: number
        }
        Insert: {
          categoria_id?: string | null
          cliente_id: string
          descripcion?: string | null
          documento_padre_id?: string | null
          es_documento_identidad?: boolean
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          etiquetas?: string[] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          nombre_archivo: string
          nombre_original: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version?: number
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string
          descripcion?: string | null
          documento_padre_id?: string | null
          es_documento_identidad?: boolean
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          etiquetas?: string[] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          nombre_archivo?: string
          nombre_original?: string
          subido_por?: string
          tamano_bytes?: number
          tipo_mime?: string
          titulo?: string
          url_storage?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "documentos_cliente_documento_padre_id_fkey"
            columns: ["documento_padre_id"]
            isOneToOne: false
            referencedRelation: "documentos_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_cliente_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_cliente_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_pendientes: {
        Row: {
          categoria_id: string
          cliente_id: string
          completado_por: string | null
          estado: string | null
          fecha_completado: string | null
          fecha_creacion: string | null
          fecha_limite: string | null
          fuente_pago_id: string
          id: string
          metadata: Json | null
          prioridad: string | null
          recordatorios_enviados: number | null
          tipo_documento: string
          ultima_notificacion: string | null
        }
        Insert: {
          categoria_id: string
          cliente_id: string
          completado_por?: string | null
          estado?: string | null
          fecha_completado?: string | null
          fecha_creacion?: string | null
          fecha_limite?: string | null
          fuente_pago_id: string
          id?: string
          metadata?: Json | null
          prioridad?: string | null
          recordatorios_enviados?: number | null
          tipo_documento: string
          ultima_notificacion?: string | null
        }
        Update: {
          categoria_id?: string
          cliente_id?: string
          completado_por?: string | null
          estado?: string | null
          fecha_completado?: string | null
          fecha_creacion?: string | null
          fecha_limite?: string | null
          fuente_pago_id?: string
          id?: string
          metadata?: Json | null
          prioridad?: string | null
          recordatorios_enviados?: number | null
          tipo_documento?: string
          ultima_notificacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "documentos_pendientes_completado_por_fkey"
            columns: ["completado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_pendientes_completado_por_fkey"
            columns: ["completado_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_pendientes_fuente_pago_id_fkey"
            columns: ["fuente_pago_id"]
            isOneToOne: false
            referencedRelation: "fuentes_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_proyecto: {
        Row: {
          categoria_id: string | null
          descripcion: string | null
          documento_padre_id: string | null
          es_importante: boolean | null
          es_version_actual: boolean
          estado: string
          estado_version: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_documento: string | null
          fecha_vencimiento: string | null
          id: string
          metadata: Json | null
          motivo_estado: string | null
          nombre_archivo: string
          nombre_original: string
          proyecto_id: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version: number
          version_corrige_a: string | null
        }
        Insert: {
          categoria_id?: string | null
          descripcion?: string | null
          documento_padre_id?: string | null
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          estado_version?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_estado?: string | null
          nombre_archivo: string
          nombre_original: string
          proyecto_id: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version?: number
          version_corrige_a?: string | null
        }
        Update: {
          categoria_id?: string | null
          descripcion?: string | null
          documento_padre_id?: string | null
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          estado_version?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_estado?: string | null
          nombre_archivo?: string
          nombre_original?: string
          proyecto_id?: string
          subido_por?: string
          tamano_bytes?: number
          tipo_mime?: string
          titulo?: string
          url_storage?: string
          version?: number
          version_corrige_a?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_proyecto_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_proyecto_documento_padre_id_fkey"
            columns: ["documento_padre_id"]
            isOneToOne: false
            referencedRelation: "documentos_proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_proyecto_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_proyecto_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "documentos_proyecto_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "documentos_proyecto_version_corrige_a_fkey"
            columns: ["version_corrige_a"]
            isOneToOne: false
            referencedRelation: "documentos_proyecto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_proyecto_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_proyecto_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_vivienda: {
        Row: {
          categoria_id: string | null
          descripcion: string | null
          documento_padre_id: string | null
          es_importante: boolean | null
          es_version_actual: boolean
          estado: string
          estado_version: string | null
          etiquetas: string[] | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_documento: string | null
          fecha_vencimiento: string | null
          id: string
          metadata: Json | null
          motivo_estado: string | null
          nombre_archivo: string
          nombre_original: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version: number
          version_corrige_a: string | null
          vivienda_id: string
        }
        Insert: {
          categoria_id?: string | null
          descripcion?: string | null
          documento_padre_id?: string | null
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          estado_version?: string | null
          etiquetas?: string[] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_estado?: string | null
          nombre_archivo: string
          nombre_original: string
          subido_por: string
          tamano_bytes: number
          tipo_mime: string
          titulo: string
          url_storage: string
          version?: number
          version_corrige_a?: string | null
          vivienda_id: string
        }
        Update: {
          categoria_id?: string | null
          descripcion?: string | null
          documento_padre_id?: string | null
          es_importante?: boolean | null
          es_version_actual?: boolean
          estado?: string
          estado_version?: string | null
          etiquetas?: string[] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_documento?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_estado?: string | null
          nombre_archivo?: string
          nombre_original?: string
          subido_por?: string
          tamano_bytes?: number
          tipo_mime?: string
          titulo?: string
          url_storage?: string
          version?: number
          version_corrige_a?: string | null
          vivienda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_vivienda_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_documento_padre_id_fkey"
            columns: ["documento_padre_id"]
            isOneToOne: false
            referencedRelation: "documentos_vivienda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_documento_padre_id_fkey"
            columns: ["documento_padre_id"]
            isOneToOne: false
            referencedRelation: "vista_documentos_vivienda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_version_corrige_a_fkey"
            columns: ["version_corrige_a"]
            isOneToOne: false
            referencedRelation: "documentos_vivienda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_version_corrige_a_fkey"
            columns: ["version_corrige_a"]
            isOneToOne: false
            referencedRelation: "vista_documentos_vivienda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_vivienda_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_vivienda_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      fuentes_pago: {
        Row: {
          carta_aprobacion_url: string | null
          carta_asignacion_url: string | null
          entidad: string | null
          estado: string
          estado_documentacion: string | null
          fecha_acta: string | null
          fecha_actualizacion: string
          fecha_completado: string | null
          fecha_creacion: string
          fecha_resolucion: string | null
          id: string
          monto_aprobado: number
          monto_recibido: number | null
          negociacion_id: string
          numero_referencia: string | null
          permite_multiples_abonos: boolean
          porcentaje_completado: number | null
          saldo_pendiente: number | null
          tipo: string
        }
        Insert: {
          carta_aprobacion_url?: string | null
          carta_asignacion_url?: string | null
          entidad?: string | null
          estado?: string
          estado_documentacion?: string | null
          fecha_acta?: string | null
          fecha_actualizacion?: string
          fecha_completado?: string | null
          fecha_creacion?: string
          fecha_resolucion?: string | null
          id?: string
          monto_aprobado: number
          monto_recibido?: number | null
          negociacion_id: string
          numero_referencia?: string | null
          permite_multiples_abonos?: boolean
          porcentaje_completado?: number | null
          saldo_pendiente?: number | null
          tipo: string
        }
        Update: {
          carta_aprobacion_url?: string | null
          carta_asignacion_url?: string | null
          entidad?: string | null
          estado?: string
          estado_documentacion?: string | null
          fecha_acta?: string | null
          fecha_actualizacion?: string
          fecha_completado?: string | null
          fecha_creacion?: string
          fecha_resolucion?: string | null
          id?: string
          monto_aprobado?: number
          monto_recibido?: number | null
          negociacion_id?: string
          numero_referencia?: string | null
          permite_multiples_abonos?: boolean
          porcentaje_completado?: number | null
          saldo_pendiente?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuentes_pago_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuentes_pago_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuentes_pago_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      manzanas: {
        Row: {
          fecha_creacion: string | null
          id: string
          nombre: string
          numero_viviendas: number
          proyecto_id: string
        }
        Insert: {
          fecha_creacion?: string | null
          id?: string
          nombre: string
          numero_viviendas: number
          proyecto_id: string
        }
        Update: {
          fecha_creacion?: string | null
          id?: string
          nombre?: string
          numero_viviendas?: number
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      negociaciones: {
        Row: {
          cliente_id: string
          descuento_aplicado: number | null
          escritura_url: string | null
          estado: string
          evidencia_envio_correo_url: string | null
          fecha_actualizacion: string
          fecha_completada: string | null
          fecha_creacion: string
          fecha_negociacion: string
          fecha_renuncia_efectiva: string | null
          id: string
          notas: string | null
          otros_documentos: Json | null
          porcentaje_pagado: number | null
          promesa_compraventa_url: string | null
          promesa_firmada_url: string | null
          saldo_pendiente: number | null
          total_abonado: number | null
          total_fuentes_pago: number | null
          usuario_creacion: string | null
          valor_negociado: number
          valor_total: number | null
          vivienda_id: string
        }
        Insert: {
          cliente_id: string
          descuento_aplicado?: number | null
          escritura_url?: string | null
          estado?: string
          evidencia_envio_correo_url?: string | null
          fecha_actualizacion?: string
          fecha_completada?: string | null
          fecha_creacion?: string
          fecha_negociacion?: string
          fecha_renuncia_efectiva?: string | null
          id?: string
          notas?: string | null
          otros_documentos?: Json | null
          porcentaje_pagado?: number | null
          promesa_compraventa_url?: string | null
          promesa_firmada_url?: string | null
          saldo_pendiente?: number | null
          total_abonado?: number | null
          total_fuentes_pago?: number | null
          usuario_creacion?: string | null
          valor_negociado: number
          valor_total?: number | null
          vivienda_id: string
        }
        Update: {
          cliente_id?: string
          descuento_aplicado?: number | null
          escritura_url?: string | null
          estado?: string
          evidencia_envio_correo_url?: string | null
          fecha_actualizacion?: string
          fecha_completada?: string | null
          fecha_creacion?: string
          fecha_negociacion?: string
          fecha_renuncia_efectiva?: string | null
          id?: string
          notas?: string | null
          otros_documentos?: Json | null
          porcentaje_pagado?: number | null
          promesa_compraventa_url?: string | null
          promesa_firmada_url?: string | null
          saldo_pendiente?: number | null
          total_abonado?: number | null
          total_fuentes_pago?: number | null
          usuario_creacion?: string | null
          valor_negociado?: number
          valor_total?: number | null
          vivienda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      negociaciones_versiones: {
        Row: {
          creado_en: string | null
          creado_por: string | null
          descuento_aplicado: number | null
          es_version_activa: boolean | null
          fuentes_pago: Json
          id: string
          motivo_cambio: string
          negociacion_id: string
          tipo_cambio: string
          valor_total: number
          valor_vivienda: number
          version: number
        }
        Insert: {
          creado_en?: string | null
          creado_por?: string | null
          descuento_aplicado?: number | null
          es_version_activa?: boolean | null
          fuentes_pago?: Json
          id?: string
          motivo_cambio: string
          negociacion_id: string
          tipo_cambio: string
          valor_total: number
          valor_vivienda: number
          version: number
        }
        Update: {
          creado_en?: string | null
          creado_por?: string | null
          descuento_aplicado?: number | null
          es_version_activa?: boolean | null
          fuentes_pago?: Json
          id?: string
          motivo_cambio?: string
          negociacion_id?: string
          tipo_cambio?: string
          valor_total?: number
          valor_vivienda?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "negociaciones_versiones_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_versiones_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_versiones_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      permisos_rol: {
        Row: {
          accion: string
          actualizado_en: string | null
          actualizado_por: string | null
          creado_en: string | null
          descripcion: string | null
          id: string
          modulo: string
          permitido: boolean
          rol: string
        }
        Insert: {
          accion: string
          actualizado_en?: string | null
          actualizado_por?: string | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          modulo: string
          permitido?: boolean
          rol: string
        }
        Update: {
          accion?: string
          actualizado_en?: string | null
          actualizado_por?: string | null
          creado_en?: string | null
          descripcion?: string | null
          id?: string
          modulo?: string
          permitido?: boolean
          rol?: string
        }
        Relationships: []
      }
      plantillas_proceso: {
        Row: {
          activo: boolean
          descripcion: string | null
          es_predeterminado: boolean
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          nombre: string
          pasos: Json
          usuario_creacion: string | null
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          es_predeterminado?: boolean
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre: string
          pasos: Json
          usuario_creacion?: string | null
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          es_predeterminado?: boolean
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre?: string
          pasos?: Json
          usuario_creacion?: string | null
        }
        Relationships: []
      }
      procesos_negociacion: {
        Row: {
          depende_de: string[] | null
          descripcion: string | null
          documentos_requeridos: Json | null
          documentos_urls: Json | null
          es_obligatorio: boolean
          estado: string
          fecha_actualizacion: string
          fecha_completado: string | null
          fecha_creacion: string
          fecha_inicio: string | null
          fecha_limite: string | null
          id: string
          motivo_omision: string | null
          negociacion_id: string
          nombre: string
          notas: string | null
          orden: number
          permite_omitir: boolean
          usuario_completo: string | null
        }
        Insert: {
          depende_de?: string[] | null
          descripcion?: string | null
          documentos_requeridos?: Json | null
          documentos_urls?: Json | null
          es_obligatorio?: boolean
          estado?: string
          fecha_actualizacion?: string
          fecha_completado?: string | null
          fecha_creacion?: string
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          motivo_omision?: string | null
          negociacion_id: string
          nombre: string
          notas?: string | null
          orden?: number
          permite_omitir?: boolean
          usuario_completo?: string | null
        }
        Update: {
          depende_de?: string[] | null
          descripcion?: string | null
          documentos_requeridos?: Json | null
          documentos_urls?: Json | null
          es_obligatorio?: boolean
          estado?: string
          fecha_actualizacion?: string
          fecha_completado?: string | null
          fecha_creacion?: string
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          motivo_omision?: string | null
          negociacion_id?: string
          nombre?: string
          notas?: string | null
          orden?: number
          permite_omitir?: boolean
          usuario_completo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procesos_negociacion_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procesos_negociacion_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procesos_negociacion_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          archivado: boolean
          descripcion: string
          estado: string
          fecha_actualizacion: string | null
          fecha_archivado: string | null
          fecha_creacion: string | null
          fecha_fin_estimada: string | null
          fecha_inicio: string | null
          id: string
          motivo_archivo: string | null
          nombre: string
          presupuesto: number
          progreso: number
          ubicacion: string
          user_id: string | null
        }
        Insert: {
          archivado?: boolean
          descripcion: string
          estado?: string
          fecha_actualizacion?: string | null
          fecha_archivado?: string | null
          fecha_creacion?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          motivo_archivo?: string | null
          nombre: string
          presupuesto?: number
          progreso?: number
          ubicacion: string
          user_id?: string | null
        }
        Update: {
          archivado?: boolean
          descripcion?: string
          estado?: string
          fecha_actualizacion?: string | null
          fecha_archivado?: string | null
          fecha_creacion?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          motivo_archivo?: string | null
          nombre?: string
          presupuesto?: number
          progreso?: number
          ubicacion?: string
          user_id?: string | null
        }
        Relationships: []
      }
      renuncias: {
        Row: {
          abonos_snapshot: Json | null
          cliente_id: string
          comprobante_devolucion_url: string | null
          estado: string
          fecha_actualizacion: string | null
          fecha_cancelacion: string | null
          fecha_cierre: string | null
          fecha_creacion: string | null
          fecha_devolucion: string | null
          fecha_renuncia: string
          id: string
          metodo_devolucion: string | null
          monto_a_devolver: number
          motivo: string
          motivo_cancelacion: string | null
          negociacion_id: string | null
          numero_comprobante: string | null
          requiere_devolucion: boolean
          usuario_cancelacion: string | null
          usuario_cierre: string | null
          usuario_registro: string | null
          vivienda_id: string
          vivienda_valor_snapshot: number | null
        }
        Insert: {
          abonos_snapshot?: Json | null
          cliente_id: string
          comprobante_devolucion_url?: string | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_cancelacion?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          fecha_devolucion?: string | null
          fecha_renuncia: string
          id?: string
          metodo_devolucion?: string | null
          monto_a_devolver?: number
          motivo: string
          motivo_cancelacion?: string | null
          negociacion_id?: string | null
          numero_comprobante?: string | null
          requiere_devolucion?: boolean
          usuario_cancelacion?: string | null
          usuario_cierre?: string | null
          usuario_registro?: string | null
          vivienda_id: string
          vivienda_valor_snapshot?: number | null
        }
        Update: {
          abonos_snapshot?: Json | null
          cliente_id?: string
          comprobante_devolucion_url?: string | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_cancelacion?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          fecha_devolucion?: string | null
          fecha_renuncia?: string
          id?: string
          metodo_devolucion?: string | null
          monto_a_devolver?: number
          motivo?: string
          motivo_cancelacion?: string | null
          negociacion_id?: string | null
          numero_comprobante?: string | null
          requiere_devolucion?: boolean
          usuario_cancelacion?: string | null
          usuario_cierre?: string | null
          usuario_registro?: string | null
          vivienda_id?: string
          vivienda_valor_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "renuncias_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renuncias_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renuncias_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renuncias_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "renuncias_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "renuncias_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renuncias_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          apellidos: string
          avatar_url: string | null
          bloqueado_hasta: string | null
          creado_por: string | null
          debe_cambiar_password: boolean
          email: string
          estado: Database["public"]["Enums"]["estado_usuario"]
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          intentos_fallidos: number
          nombres: string
          preferencias: Json | null
          rol: Database["public"]["Enums"]["rol_usuario"]
          telefono: string | null
          ultimo_acceso: string | null
        }
        Insert: {
          apellidos: string
          avatar_url?: string | null
          bloqueado_hasta?: string | null
          creado_por?: string | null
          debe_cambiar_password?: boolean
          email: string
          estado?: Database["public"]["Enums"]["estado_usuario"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          id: string
          intentos_fallidos?: number
          nombres: string
          preferencias?: Json | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
          telefono?: string | null
          ultimo_acceso?: string | null
        }
        Update: {
          apellidos?: string
          avatar_url?: string | null
          bloqueado_hasta?: string | null
          creado_por?: string | null
          debe_cambiar_password?: boolean
          email?: string
          estado?: Database["public"]["Enums"]["estado_usuario"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          intentos_fallidos?: number
          nombres?: string
          preferencias?: Json | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
          telefono?: string | null
          ultimo_acceso?: string | null
        }
        Relationships: []
      }
      viviendas: {
        Row: {
          area: number
          area_construida: number | null
          area_lote: number | null
          certificado_tradicion_url: string | null
          cliente_id: string | null
          contador_desactivaciones: number | null
          es_esquinera: boolean | null
          estado: string
          fecha_actualizacion: string | null
          fecha_asignacion: string | null
          fecha_creacion: string | null
          fecha_entrega: string | null
          fecha_inactivacion: string | null
          fecha_reactivacion: string | null
          gastos_notariales: number | null
          id: string
          inactivada_por: string | null
          lindero_norte: string | null
          lindero_occidente: string | null
          lindero_oriente: string | null
          lindero_sur: string | null
          manzana_id: string
          matricula_inmobiliaria: string | null
          motivo_inactivacion: string | null
          motivo_reactivacion: string | null
          negociacion_id: string | null
          nomenclatura: string | null
          numero: string
          reactivada_por: string | null
          recargo_esquinera: number | null
          tipo_vivienda: string | null
          valor_base: number
          valor_total: number | null
        }
        Insert: {
          area: number
          area_construida?: number | null
          area_lote?: number | null
          certificado_tradicion_url?: string | null
          cliente_id?: string | null
          contador_desactivaciones?: number | null
          es_esquinera?: boolean | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_asignacion?: string | null
          fecha_creacion?: string | null
          fecha_entrega?: string | null
          fecha_inactivacion?: string | null
          fecha_reactivacion?: string | null
          gastos_notariales?: number | null
          id?: string
          inactivada_por?: string | null
          lindero_norte?: string | null
          lindero_occidente?: string | null
          lindero_oriente?: string | null
          lindero_sur?: string | null
          manzana_id: string
          matricula_inmobiliaria?: string | null
          motivo_inactivacion?: string | null
          motivo_reactivacion?: string | null
          negociacion_id?: string | null
          nomenclatura?: string | null
          numero: string
          reactivada_por?: string | null
          recargo_esquinera?: number | null
          tipo_vivienda?: string | null
          valor_base?: number
          valor_total?: number | null
        }
        Update: {
          area?: number
          area_construida?: number | null
          area_lote?: number | null
          certificado_tradicion_url?: string | null
          cliente_id?: string | null
          contador_desactivaciones?: number | null
          es_esquinera?: boolean | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_asignacion?: string | null
          fecha_creacion?: string | null
          fecha_entrega?: string | null
          fecha_inactivacion?: string | null
          fecha_reactivacion?: string | null
          gastos_notariales?: number | null
          id?: string
          inactivada_por?: string | null
          lindero_norte?: string | null
          lindero_occidente?: string | null
          lindero_oriente?: string | null
          lindero_sur?: string | null
          manzana_id?: string
          matricula_inmobiliaria?: string | null
          motivo_inactivacion?: string | null
          motivo_reactivacion?: string | null
          negociacion_id?: string | null
          nomenclatura?: string | null
          numero?: string
          reactivada_por?: string | null
          recargo_esquinera?: number | null
          tipo_vivienda?: string | null
          valor_base?: number
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "viviendas_inactivada_por_fkey"
            columns: ["inactivada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_inactivada_por_fkey"
            columns: ["inactivada_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "manzanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["manzana_id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_manzanas_disponibilidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_reactivada_por_fkey"
            columns: ["reactivada_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_reactivada_por_fkey"
            columns: ["reactivada_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      viviendas_historial_estados: {
        Row: {
          created_at: string | null
          estado_anterior: string
          estado_nuevo: string
          fecha_cambio: string | null
          id: string
          metadata: Json | null
          motivo: string
          usuario_id: string | null
          vivienda_id: string
        }
        Insert: {
          created_at?: string | null
          estado_anterior: string
          estado_nuevo: string
          fecha_cambio?: string | null
          id?: string
          metadata?: Json | null
          motivo: string
          usuario_id?: string | null
          vivienda_id: string
        }
        Update: {
          created_at?: string | null
          estado_anterior?: string
          estado_nuevo?: string
          fecha_cambio?: string | null
          id?: string
          metadata?: Json | null
          motivo?: string
          usuario_id?: string | null
          vivienda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viviendas_historial_estados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_estados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_estados_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "viviendas_historial_estados_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "viviendas_historial_estados_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_estados_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      viviendas_historial_matriculas: {
        Row: {
          abonos_snapshot: Json | null
          created_at: string | null
          documentos_snapshot: Json | null
          fecha_cambio: string | null
          id: string
          matricula_anterior: string
          matricula_nueva: string
          motivo: string
          negociaciones_snapshot: Json | null
          nivel_riesgo: string | null
          usuario_id: string | null
          vivienda_id: string
        }
        Insert: {
          abonos_snapshot?: Json | null
          created_at?: string | null
          documentos_snapshot?: Json | null
          fecha_cambio?: string | null
          id?: string
          matricula_anterior: string
          matricula_nueva: string
          motivo: string
          negociaciones_snapshot?: Json | null
          nivel_riesgo?: string | null
          usuario_id?: string | null
          vivienda_id: string
        }
        Update: {
          abonos_snapshot?: Json | null
          created_at?: string | null
          documentos_snapshot?: Json | null
          fecha_cambio?: string | null
          id?: string
          matricula_anterior?: string
          matricula_nueva?: string
          motivo?: string
          negociaciones_snapshot?: Json | null
          nivel_riesgo?: string | null
          usuario_id?: string | null
          vivienda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viviendas_historial_matriculas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_matriculas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_matriculas_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "viviendas_historial_matriculas_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "viviendas_historial_matriculas_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_historial_matriculas_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      intereses_completos: {
        Row: {
          cliente_apellido: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          dias_desde_interes: number | null
          estado: string | null
          fecha_actualizacion: string | null
          fecha_conversion: string | null
          fecha_interes: string | null
          fecha_ultimo_contacto: string | null
          id: string | null
          manzana_nombre: string | null
          motivo_descarte: string | null
          negociacion_id: string | null
          nombre_completo: string | null
          notas: string | null
          origen: string | null
          prioridad: string | null
          proximo_seguimiento: string | null
          proyecto_estado: string | null
          proyecto_id: string | null
          proyecto_nombre: string | null
          seguimiento_urgente: boolean | null
          usuario_creacion: string | null
          valor_estimado: number | null
          vivienda_estado: string | null
          vivienda_id: string | null
          vivienda_numero: string | null
          vivienda_valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "cliente_intereses_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_intereses_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      negociaciones_con_version_actual: {
        Row: {
          cliente_id: string | null
          descuento_aplicado: number | null
          escritura_url: string | null
          estado: string | null
          evidencia_envio_correo_url: string | null
          fecha_actualizacion: string | null
          fecha_completada: string | null
          fecha_creacion: string | null
          fecha_negociacion: string | null
          fecha_renuncia_efectiva: string | null
          fecha_ultima_version: string | null
          fuentes_pago_actual: Json | null
          id: string | null
          modificado_por_nombre: string | null
          notas: string | null
          otros_documentos: Json | null
          porcentaje_pagado: number | null
          promesa_compraventa_url: string | null
          promesa_firmada_url: string | null
          saldo_pendiente: number | null
          total_abonado: number | null
          total_fuentes_pago: number | null
          ultimo_motivo_cambio: string | null
          ultimo_tipo_cambio: string | null
          usuario_creacion: string | null
          valor_negociado: number | null
          valor_total: number | null
          version_actual: number | null
          vivienda_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_renuncias_pendientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_clientes_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["cliente_id_data"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negociaciones_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
        ]
      }
      v_auditoria_por_modulo: {
        Row: {
          modulo: string | null
          primer_evento: string | null
          total_actualizaciones: number | null
          total_creaciones: number | null
          total_eliminaciones: number | null
          total_eventos: number | null
          ultimo_evento: string | null
          usuarios_activos: number | null
        }
        Relationships: []
      }
      v_negociaciones_completas: {
        Row: {
          cliente_documento: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          estado_cliente: string | null
          estado_negociacion: string | null
          estado_renuncia: string | null
          estado_vivienda: string | null
          fecha_completada: string | null
          fecha_creacion: string | null
          fecha_entrega: string | null
          fecha_renuncia: string | null
          fecha_renuncia_efectiva: string | null
          id: string | null
          monto_a_devolver: number | null
          proyecto_id: string | null
          proyecto_nombre: string | null
          renuncia_id: string | null
          requiere_devolucion: boolean | null
          saldo_pendiente: number | null
          valor_total: number | null
          vivienda_id: string | null
          vivienda_numero: string | null
          vivienda_valor: number | null
        }
        Relationships: []
      }
      v_reemplazos_admin: {
        Row: {
          admin_email: string | null
          admin_nombre: string | null
          archivo_anterior: string | null
          archivo_nuevo: string | null
          diferencia_tamano: string | null
          documento_id: string | null
          documento_titulo: string | null
          fecha_reemplazo: string | null
          id: string | null
          ip_origen: unknown
          justificacion: string | null
          tamano_anterior: number | null
          tamano_nuevo: number | null
          version_afectada: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_reemplazos_admin_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_proyecto"
            referencedColumns: ["id"]
          },
        ]
      }
      v_renuncias_pendientes: {
        Row: {
          cliente_documento: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          dias_pendiente: number | null
          fecha_renuncia: string | null
          id: string | null
          monto_a_devolver: number | null
          motivo: string | null
          negociacion_valor_total: number | null
          proyecto_nombre: string | null
          vivienda_numero: string | null
        }
        Relationships: []
      }
      vista_abonos_completos: {
        Row: {
          cliente_apellidos: string | null
          cliente_id: string | null
          cliente_nombres: string | null
          cliente_numero_documento: string | null
          comprobante_url: string | null
          fecha_abono: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fuente_pago_id: string | null
          fuente_pago_tipo: string | null
          id: string | null
          manzana_id: string | null
          manzana_nombre: string | null
          metodo_pago: string | null
          monto: number | null
          negociacion_estado: string | null
          negociacion_id: string | null
          notas: string | null
          numero_referencia: string | null
          proyecto_id: string | null
          proyecto_nombre: string | null
          usuario_registro: string | null
          vivienda_id: string | null
          vivienda_numero: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abonos_historial_fuente_pago_id_fkey"
            columns: ["fuente_pago_id"]
            isOneToOne: false
            referencedRelation: "fuentes_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonos_historial_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      vista_clientes_resumen: {
        Row: {
          apellidos: string | null
          ciudad: string | null
          departamento: string | null
          direccion: string | null
          documento_identidad_titulo: string | null
          documento_identidad_url: string | null
          email: string | null
          estado: string | null
          estado_civil: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_nacimiento: string | null
          id: string | null
          negociaciones_activas: number | null
          negociaciones_completadas: number | null
          nombre_completo: string | null
          nombres: string | null
          notas: string | null
          numero_documento: string | null
          telefono: string | null
          tiene_documento_identidad: boolean | null
          tipo_documento: string | null
          total_intereses: number | null
          total_negociaciones: number | null
        }
        Insert: {
          apellidos?: string | null
          ciudad?: string | null
          departamento?: string | null
          direccion?: string | null
          documento_identidad_titulo?: string | null
          documento_identidad_url?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_nacimiento?: string | null
          id?: string | null
          negociaciones_activas?: never
          negociaciones_completadas?: never
          nombre_completo?: never
          nombres?: string | null
          notas?: string | null
          numero_documento?: string | null
          telefono?: string | null
          tiene_documento_identidad?: never
          tipo_documento?: string | null
          total_intereses?: never
          total_negociaciones?: never
        }
        Update: {
          apellidos?: string | null
          ciudad?: string | null
          departamento?: string | null
          direccion?: string | null
          documento_identidad_titulo?: string | null
          documento_identidad_url?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_enum"] | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_nacimiento?: string | null
          id?: string | null
          negociaciones_activas?: never
          negociaciones_completadas?: never
          nombre_completo?: never
          nombres?: string | null
          notas?: string | null
          numero_documento?: string | null
          telefono?: string | null
          tiene_documento_identidad?: never
          tipo_documento?: string | null
          total_intereses?: never
          total_negociaciones?: never
        }
        Relationships: []
      }
      vista_documentos_vivienda: {
        Row: {
          categoria_color: string | null
          categoria_es_sistema: boolean | null
          categoria_icono: string | null
          categoria_id: string | null
          categoria_nombre: string | null
          descripcion: string | null
          es_importante: boolean | null
          es_version_actual: boolean | null
          estado: string | null
          etiquetas: string[] | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_documento: string | null
          fecha_vencimiento: string | null
          id: string | null
          manzana_id: string | null
          manzana_nombre: string | null
          nombre_archivo: string | null
          nombre_original: string | null
          proyecto_id: string | null
          proyecto_nombre: string | null
          subido_por: string | null
          tamano_bytes: number | null
          tipo_mime: string | null
          titulo: string | null
          url_storage: string | null
          version: number | null
          vivienda_id: string | null
          vivienda_numero: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_vivienda_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_documento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["vivienda_id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "vista_viviendas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_vivienda_vivienda_id_fkey"
            columns: ["vivienda_id"]
            isOneToOne: false
            referencedRelation: "viviendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_vivienda_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_vivienda_subido_por"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "vista_usuarios_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "manzanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["manzana_id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_manzanas_disponibilidad"
            referencedColumns: ["id"]
          },
        ]
      }
      vista_manzanas_disponibilidad: {
        Row: {
          id: string | null
          nombre: string | null
          proyecto_id: string | null
          tiene_disponibles: boolean | null
          total_viviendas: number | null
          viviendas_creadas: number | null
          viviendas_disponibles: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      vista_usuarios_completos: {
        Row: {
          apellidos: string | null
          avatar_url: string | null
          bloqueado_hasta: string | null
          creado_por_nombre: string | null
          debe_cambiar_password: boolean | null
          email: string | null
          estado: Database["public"]["Enums"]["estado_usuario"] | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_registro_auth: string | null
          id: string | null
          intentos_fallidos: number | null
          nombre_completo: string | null
          nombres: string | null
          rol: Database["public"]["Enums"]["rol_usuario"] | null
          telefono: string | null
          ultimo_acceso: string | null
          ultimo_login_auth: string | null
        }
        Relationships: []
      }
      vista_viviendas_completas: {
        Row: {
          area: number | null
          area_construida: number | null
          area_lote: number | null
          cantidad_abonos: number | null
          certificado_tradicion_url: string | null
          cliente_apellidos: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_id_data: string | null
          cliente_nombres: string | null
          cliente_telefono: string | null
          es_esquinera: boolean | null
          estado: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          gastos_notariales: number | null
          id: string | null
          lindero_norte: string | null
          lindero_occidente: string | null
          lindero_oriente: string | null
          lindero_sur: string | null
          manzana_id: string | null
          manzana_nombre: string | null
          matricula_inmobiliaria: string | null
          negociacion_id: string | null
          nomenclatura: string | null
          numero: string | null
          porcentaje_pagado: number | null
          proyecto_estado: string | null
          proyecto_id: string | null
          proyecto_nombre: string | null
          recargo_esquinera: number | null
          saldo_pendiente: number | null
          tipo_vivienda: string | null
          total_abonado: number | null
          valor_base: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "manzanas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["proyecto_id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "manzanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_abonos_completos"
            referencedColumns: ["manzana_id"]
          },
          {
            foreignKeyName: "viviendas_manzana_id_fkey"
            columns: ["manzana_id"]
            isOneToOne: false
            referencedRelation: "vista_manzanas_disponibilidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "negociaciones_con_version_actual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viviendas_negociacion_id_fkey"
            columns: ["negociacion_id"]
            isOneToOne: false
            referencedRelation: "v_negociaciones_completas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calcular_cambios_json: {
        Args: { datos_antes: Json; datos_despues: Json }
        Returns: Json
      }
      calcular_nivel_riesgo_matricula: {
        Args: {
          p_negociacion_firmada: boolean
          p_tiene_abonos: boolean
          p_tiene_negociaciones: boolean
          p_vivienda_id: string
        }
        Returns: string
      }
      categoria_aplica_a_modulo: {
        Args: { p_categoria_id: string; p_modulo: string }
        Returns: boolean
      }
      convertir_interes_a_negociacion: {
        Args: {
          p_descuento?: number
          p_interes_id: string
          p_valor_negociado: number
        }
        Returns: string
      }
      crear_categorias_clientes_default: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      crear_categorias_proyectos_default: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      crear_categorias_viviendas_default: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      crear_nueva_version_negociacion: {
        Args: {
          p_descuento_aplicado: number
          p_fuentes_pago: Json
          p_motivo_cambio: string
          p_negociacion_id: string
          p_tipo_cambio: string
          p_valor_total: number
          p_valor_vivienda: number
        }
        Returns: string
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      detectar_eliminaciones_masivas: {
        Args: { p_dias?: number; p_umbral?: number }
        Returns: {
          fecha: string
          tabla: string
          total_eliminaciones: number
          usuario_email: string
        }[]
      }
      es_admin: { Args: { p_user_id: string }; Returns: boolean }
      exec_sql: { Args: { sql_query: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      limpiar_logs_antiguos: {
        Args: { dias_retencion?: number }
        Returns: number
      }
      marcar_interes_convertido: {
        Args: { p_cliente_id: string; p_vivienda_id: string }
        Returns: undefined
      }
      obtener_actividad_usuario: {
        Args: { p_dias?: number; p_limit?: number; p_usuario_id: string }
        Returns: {
          accion: string
          fecha_evento: string
          id: string
          metadata: Json
          modulo: string
          registro_id: string
          tabla: string
        }[]
      }
      obtener_categoria_sistema_vivienda: {
        Args: { p_nombre_categoria: string }
        Returns: string
      }
      obtener_historial_registro: {
        Args: { p_limit?: number; p_registro_id: string; p_tabla: string }
        Returns: {
          accion: string
          cambios_especificos: Json
          fecha_evento: string
          id: string
          metadata: Json
          usuario_email: string
          usuario_rol: string
        }[]
      }
      obtener_resumen_seguridad: {
        Args: { p_usuario_email: string }
        Returns: {
          ips_distintas: number
          total_bloqueos: number
          total_logins_exitosos: number
          total_logins_fallidos: number
          ultimo_login: string
        }[]
      }
      obtener_siguiente_numero_vivienda: {
        Args: { p_manzana_id: string }
        Returns: number
      }
      obtener_snapshot_abonos: {
        Args: { p_negociacion_id: string }
        Returns: Json
      }
      obtener_viviendas_disponibles_manzana: {
        Args: { p_manzana_id: string }
        Returns: number
      }
      registrar_interes_inicial: {
        Args: {
          p_cliente_id: string
          p_notas?: string
          p_proyecto_id: string
          p_vivienda_id?: string
        }
        Returns: string
      }
      tiene_permiso: {
        Args: { p_accion: string; p_modulo: string; p_usuario_id: string }
        Returns: boolean
      }
      tiene_rol: {
        Args: {
          p_roles: Database["public"]["Enums"]["rol_usuario"][]
          p_user_id: string
        }
        Returns: boolean
      }
      validar_cancelacion_renuncia: {
        Args: { p_renuncia_id: string }
        Returns: {
          mensaje_error: string
          precio_igual: boolean
          puede_cancelar: boolean
          vivienda_disponible: boolean
        }[]
      }
      validar_password_admin: {
        Args: { p_password: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      estado_civil_enum: "Soltero(a)" | "Casado(a)" | "Unión libre" | "Viudo(a)"
      estado_usuario: "Activo" | "Inactivo" | "Bloqueado"
      rol_usuario:
        | "Administrador"
        | "Gerente"
        | "Vendedor"
        | "Contador"
        | "Supervisor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_civil_enum: ["Soltero(a)", "Casado(a)", "Unión libre", "Viudo(a)"],
      estado_usuario: ["Activo", "Inactivo", "Bloqueado"],
      rol_usuario: [
        "Administrador",
        "Gerente",
        "Vendedor",
        "Contador",
        "Supervisor",
      ],
    },
  },
} as const
