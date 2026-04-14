import { useState } from 'react'

import { toast } from 'sonner'

import { clientesService } from '@/modules/clientes/services/clientes.service'

interface UseReactivarClienteParams {
  clienteUUID: string | null
  onReactivado: () => void
}

export function useReactivarCliente({
  clienteUUID,
  onReactivado,
}: UseReactivarClienteParams) {
  const [modalReactivarAbierto, setModalReactivarAbierto] = useState(false)
  const [verificandoRenuncia, setVerificandoRenuncia] = useState(false)

  const handleReactivarCliente = async () => {
    if (!clienteUUID) return
    setVerificandoRenuncia(true)
    try {
      const resultado =
        await clientesService.verificarRenunciaPendiente(clienteUUID)
      if (resultado.pendiente) {
        toast.error(
          `No se puede reactivar: la renuncia ${resultado.consecutivo} tiene devolución pendiente. Primero debe cerrarse la renuncia.`,
          { duration: 6000 }
        )
        return
      }
      setModalReactivarAbierto(true)
    } catch {
      toast.error('Error al verificar el estado de la renuncia')
    } finally {
      setVerificandoRenuncia(false)
    }
  }

  const handleConfirmarReactivacion = async () => {
    await clientesService.cambiarEstado(clienteUUID ?? '', 'Interesado')
    onReactivado()
  }

  const cerrarModalReactivar = () => setModalReactivarAbierto(false)

  return {
    modalReactivarAbierto,
    verificandoRenuncia,
    handleReactivarCliente,
    handleConfirmarReactivacion,
    cerrarModalReactivar,
  }
}
