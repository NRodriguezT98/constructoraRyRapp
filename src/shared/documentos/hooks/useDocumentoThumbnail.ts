/**
 * Hook para generar la URL de thumbnail firmada de una imagen en Supabase Storage.
 * Encapsula la llamada directa a supabase.storage y desacopla el componente de la BD.
 */
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import type { TipoEntidad } from '../types/entidad.types'

const BUCKET_MAP: Record<TipoEntidad, string> = {
  proyecto: 'documentos-proyectos',
  vivienda: 'documentos-viviendas',
  cliente: 'documentos-clientes',
}

interface UseDocumentoThumbnailProps {
  esImagen: boolean
  urlStorage: string | null | undefined
  tipoEntidad: TipoEntidad
}

export function useDocumentoThumbnail({
  esImagen,
  urlStorage,
  tipoEntidad,
}: UseDocumentoThumbnailProps): string | null {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!esImagen || !urlStorage) return
    const bucket = BUCKET_MAP[tipoEntidad] ?? 'documentos-proyectos'
    supabase.storage
      .from(bucket)
      .createSignedUrl(urlStorage, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setThumbnailUrl(data.signedUrl)
      })
  }, [esImagen, urlStorage, tipoEntidad])

  return thumbnailUrl
}
