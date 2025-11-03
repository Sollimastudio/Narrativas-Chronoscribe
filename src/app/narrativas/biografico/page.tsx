'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { pdfProcessor } from '@/server/narrative/pdf-processor';

export default function BiograficoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Adicione pelo menos um arquivo PDF');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const fragments = await pdfProcessor.processFragments(files);
      
      setAnalysisResult({
        totalFragments: fragments.length,
        fragments: fragments.slice(0, 5), // Mostrar apenas os primeiros 5
        tipos: {
          cronologico: fragments.filter(f => f.tipo === 'cronologico').length,
          emocional: fragments.filter(f => f.tipo === 'emocional').length,
          contexto: fragments.filter(f => f.tipo === 'contexto').length,
          desconhecido: fragments.filter(f => f.tipo === 'desconhecido').length,
        }
      });
    } catch (err) {
      setError('Erro ao analisar documentos. Tente novamente.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8 text-white md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500">
            Compositor de Drama Biográfico
          </h1>
          <p className="text-gray-300 text-lg">
            Faça upload de seus PDFs para criar uma narrativa biográfica envolvente
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
            >
              <FiAlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`
              relative p-12 border-2 border-dashed rounded-xl cursor-pointer
              transition-all duration-300
              ${isDragActive 
                ? 'border-yellow-400 bg-yellow-400/10 scale-105' 
                : 'border-gray-600 hover:border-yellow-400/50 hover:bg-gray-800/30'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0
                }}
                className="p-6 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 shadow-lg"
              >
                <FiUpload className="text-yellow-400" size={48} />
              </motion.div>
              
              <div>
                <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                  {isDragActive ? 'Solte seus arquivos aqui!' : 'Upload de Documentos'}
                </h3>
                <p className="text-gray-400">
                  Arraste PDFs aqui ou clique para selecionar
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Suporta múltiplos arquivos PDF
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <FiCheck className="text-green-400" />
                Arquivos Carregados ({files.length})
              </h3>
              
              <div className="space-y-3">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded bg-yellow-400/10">
                        <FiFile className="text-yellow-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 truncate font-medium">{file.name}</p>
                        <p className="text-gray-500 text-sm">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors ml-2"
                      aria-label="Remover arquivo"
                    >
                      <FiX size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => setFiles([])}
                  className="px-6 py-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors font-medium"
                >
                  Limpar Todos
                </button>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg font-bold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg hover:shadow-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analisando...' : 'Analisar Documentos'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">
                Resultado da Análise
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {analysisResult.totalFragments}
                  </div>
                  <div className="text-gray-400 text-sm">Total de Fragmentos</div>
                </div>
                
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {analysisResult.tipos.cronologico}
                  </div>
                  <div className="text-gray-400 text-sm">Cronológicos</div>
                </div>
                
                <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/30">
                  <div className="text-3xl font-bold text-pink-400 mb-1">
                    {analysisResult.tipos.emocional}
                  </div>
                  <div className="text-gray-400 text-sm">Emocionais</div>
                </div>
                
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {analysisResult.tipos.contexto}
                  </div>
                  <div className="text-gray-400 text-sm">Contexto</div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black rounded-lg font-bold hover:from-green-300 hover:to-emerald-400 transition-all shadow-lg"
                >
                  Gerar Narrativa Completa
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
