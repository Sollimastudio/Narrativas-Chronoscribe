import { WorkspaceComponentProps } from './types';
import { useContext, useCallback, useState } from 'react';
import { WorkflowContext } from '@/contexts/WorkflowContext';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { XIcon, LinkIcon, FileIcon, Loader2Icon } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
  url?: string;
}

export function KnowledgeInput({ onNext }: WorkspaceComponentProps) {
  const context = useContext(WorkflowContext);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  if (!context) {
    throw new Error('KnowledgeInput must be used within WorkflowContext');
  }

  const uploadToStorage = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch('/api/storage', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro no upload');
    }

    const data = await response.json();
    return data.files;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      // Cria previews locais
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      
      // Upload para o storage
      const uploadedFiles = await uploadToStorage(acceptedFiles);
      
      setFiles(prev => [...prev, ...newFiles]);
      context.dispatch({ 
        type: 'ADICIONAR_ARQUIVOS', 
        arquivos: uploadedFiles.map((f: any) => f.url)
      });
      
      toast.success('Arquivos adicionados com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setIsUploading(false);
    }
  }, [context]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10485760, // 10MB
  });

  const addLink = () => {
    if (!newLink) return;
    
    try {
      new URL(newLink); // Valida se é uma URL válida
      setLinks(prev => [...prev, newLink]);
      context.dispatch({ type: 'ADICIONAR_LINKS', links: [newLink] });
      setNewLink('');
      toast.success('Link adicionado com sucesso!');
    } catch {
      toast.error('Por favor, insira uma URL válida');
    }
  };

  const removeFile = async (index: number) => {
    const file = files[index];
    
    try {
      // Remove o arquivo do storage
      await fetch('/api/storage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: file.url }),
      });

      // Remove o preview local
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }

      // Atualiza o estado
      const remainingFiles = files.filter((_, i) => i !== index);
      setFiles(remainingFiles);
      context.dispatch({
        type: 'ADICIONAR_ARQUIVOS',
        arquivos: remainingFiles
          .map(f => f.url)
          .filter((url): url is string => url !== undefined)
      });

      toast.success('Arquivo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover arquivo');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    // TODO: Atualizar no contexto
  };

  const handleNext = () => {
    if (files.length === 0 && links.length === 0) {
      toast.error('Adicione pelo menos um arquivo ou link para continuar');
      return;
    }
    onNext?.();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Adicionar Conhecimento</h2>
        <p className="text-gray-600">Upload de PDFs, documentos e links para análise</p>
      </div>

      {/* Área de Drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          {isUploading ? (
            <Loader2Icon className="h-12 w-12 mx-auto animate-spin text-blue-500" />
          ) : (
            <FileIcon className="h-12 w-12 mx-auto text-gray-400" />
          )}
          <p className="text-gray-600">
            {isDragActive
              ? 'Solte os arquivos aqui...'
              : 'Arraste e solte PDFs ou documentos aqui, ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-500">
            PDF, DOC, DOCX ou TXT até 10MB
          </p>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Arquivos ({files.length})</h3>
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de Links */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Cole um link aqui..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
            />
          </div>
          <Button onClick={addLink} variant="outline">
            <LinkIcon className="h-4 w-4 mr-2" />
            Adicionar Link
          </Button>
        </div>

        {/* Lista de Links */}
        {links.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Links ({links.length})</h3>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
              {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <LinkIcon className="h-6 w-6 text-gray-400" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate max-w-md"
                    >
                      {link}
                    </a>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleNext}
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            'Próximo'
          )}
        </Button>
      </div>
    </div>
  );
}
