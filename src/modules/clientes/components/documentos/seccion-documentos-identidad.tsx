'use client';

import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ModalSubirCedula from '../modals/modal-subir-cedula';

interface SeccionDocumentosIdentidadProps {
  clienteId: string;
  clienteNombre: string;
  numeroDocumento: string;
  documentoIdentidadUrl: string | null;
  onActualizar: (url: string | null) => void;
}

export default function SeccionDocumentosIdentidad({
  clienteId,
  clienteNombre,
  numeroDocumento,
  documentoIdentidadUrl,
  onActualizar
}: SeccionDocumentosIdentidadProps) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const tieneCedula = !!documentoIdentidadUrl;

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar la cédula? Esto bloqueará la creación de negociaciones hasta que subas una nueva.')) {
      return;
    }

    setEliminando(true);
    try {
      console.log('Eliminando cédula del cliente...', clienteId);

      // Eliminar de Storage (opcional - el archivo queda pero no es accesible)
      if (documentoIdentidadUrl) {
        const filePath = documentoIdentidadUrl.split('/').slice(-2).join('/'); // Extrae la ruta relativa
        console.log('Intentando eliminar archivo de Storage:', filePath);

        const { error: deleteError } = await supabase.storage
          .from('documentos-clientes')
          .remove([filePath]);

        if (deleteError) {
          console.warn('No se pudo eliminar archivo de Storage:', deleteError);
          // No lanzamos error, continuamos con limpiar el campo
        }
      }

      // Limpiar campo en cliente
      const { error } = await supabase
        .from('clientes')
        .update({ documento_identidad_url: null })
        .eq('id', clienteId);

      if (error) {
        console.error('Error actualizando cliente:', error);
        throw error;
      }

      console.log('Cédula eliminada exitosamente');
      onActualizar(null);
      toast.success('Cédula eliminada');

    } catch (error: any) {
      console.error('Error eliminando cédula:', error);
      toast.error(error.message || 'Error al eliminar cédula');
    } finally {
      setEliminando(false);
    }
  };

  const handleVerDocumento = () => {
    if (documentoIdentidadUrl) {
      window.open(documentoIdentidadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getNombreArchivo = () => {
    if (!documentoIdentidadUrl) return '';
    const parts = documentoIdentidadUrl.split('/');
    return parts[parts.length - 1];
  };

  return (
    <>
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentos de Identidad (Requeridos)
          </h3>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              La cédula de ciudadanía es requerida para iniciar procesos de negociación.
            </p>
          </div>
        </div>

        {/* Card de Cédula */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-xl p-6 transition-all ${
            tieneCedula
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
              : 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <FileText className={`w-5 h-5 flex-shrink-0 ${
                  tieneCedula ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`} />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Cédula de Ciudadanía
                </h4>
                {tieneCedula ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                )}
              </div>

              {tieneCedula ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Documento cargado
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="break-all">{getNombreArchivo()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    El cliente puede iniciar negociaciones
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      No subida
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Requerido para iniciar negociaciones
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-end">
              {tieneCedula ? (
                <>
                  <button
                    onClick={handleVerDocumento}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => setMostrarModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                    title="Reemplazar documento"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reemplazar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={eliminando}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-4 h-4" />
                    {eliminando ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMostrarModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Subir Cédula de Ciudadanía
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Subida */}
      {mostrarModal && (
        <ModalSubirCedula
          clienteId={clienteId}
          clienteNombre={clienteNombre}
          numeroDocumento={numeroDocumento}
          onSuccess={(url) => {
            console.log('Cédula subida exitosamente, actualizando UI...', url);
            onActualizar(url);
            setMostrarModal(false);
          }}
          onCancel={() => setMostrarModal(false)}
        />
      )}
    </>
  );
}
