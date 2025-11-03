import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFUploaderProps {
  onFilesAccepted: (files: File[]) => void;
  onFileRemove: (fileName: string) => void;
  acceptedFiles: File[];
  isProcessing: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  onFilesAccepted,
  onFileRemove,
  acceptedFiles,
  isProcessing
}) => {
  const onDrop = useCallback((files: File[]) => {
    onFilesAccepted(files);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Solte os arquivos aqui...'
            : 'Arraste e solte PDFs aqui, ou clique para selecionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Aceita múltiplos arquivos PDF
        </p>
      </div>

      <AnimatePresence>
        {acceptedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700">
              Arquivos carregados:
            </h4>
            {acceptedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <FiFile className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <button
                  onClick={() => onFileRemove(file.name)}
                  disabled={isProcessing}
                  className={`
                    p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50
                    transition-colors duration-200
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span>Processando documentos...</span>
        </div>
      )}
    </div>
  );
};
