'use client';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ModalSubirCedulaProps {
  clienteId: string;
  clienteNombre: string;
  numeroDocumento: string;
  onSuccess: (url: string) => void;
  onCancel: () => void;
}

export default function ModalSubirCedula({
  clienteId,
  clienteNombre,
  numeroDocumento,
  onSuccess,
  onCancel
}: ModalSubirCedulaProps) {
  const { user } = useAuth();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const validarArchivo = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !extensionesPermitidas.includes(extension)) {
      toast.error('Solo se permiten archivos PDF, JPG o PNG');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('El archivo no puede superar los 5MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validarArchivo(file)) {
      setArchivo(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validarArchivo(file)) {
      setArchivo(file);
    }
  };

  const subirCedula = async () => {
    if (!archivo) return;

    if (!user) {
      toast.error('No hay usuario autenticado');
      return;
    }

    setSubiendo(true);
    setProgreso(0);

    try {
      // 1. Upload a Storage - PATH CONSISTENTE CON POLÍTICAS RLS
      const extension = archivo.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${user.id}/${clienteId}/cedula-${timestamp}.${extension}`;

      console.log('Subiendo cédula a Storage...', { filePath, size: archivo.size, userId: user.id });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-clientes')
        .upload(filePath, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo a Storage:', uploadError);
        throw uploadError;
      }

      console.log('Archivo subido exitosamente:', uploadData);
      setProgreso(50);

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-clientes')
        .getPublicUrl(filePath);

      console.log('URL pública generada:', publicUrl);
      setProgreso(75);

      // 3. Actualizar registro de cliente
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ documento_identidad_url: publicUrl })
        .eq('id', clienteId);

      if (updateError) {
        console.error('Error actualizando cliente:', updateError);
        throw updateError;
      }

      console.log('Cliente actualizado con URL de cédula');
      setProgreso(100);

      toast.success('Cédula subida exitosamente');

      // Esperar un momento para que se vea el progreso completo
      setTimeout(() => {
        onSuccess(publicUrl);
      }, 500);

    } catch (error: any) {
      console.error('Error en proceso de subida:', error);
      toast.error(error.message || 'Error al subir cédula');
      setProgreso(0);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subir Cédula de Ciudadanía
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {clienteNombre} - CC {numeroDocumento}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={subiendo}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Zone */}
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : archivo
                  ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
              } ${subiendo ? 'pointer-events-none opacity-50' : ''}`}
            >
              {archivo ? (
                <div className="text-center p-4">
                  <FileText className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                    {archivo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setArchivo(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2 underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    {dragActive ? 'Suelta el archivo aquí' : 'Click para seleccionar o arrastra aquí'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 5MB)
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={subiendo}
              />
            </label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                La cédula es requerida para crear negociaciones.
                Asegúrate de que sea legible y esté completa.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {subiendo && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Subiendo... {progreso}%
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={subiendo}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={subirCedula}
              disabled={!archivo || subiendo}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {subiendo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir Documento
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
