import { WorkspaceComponentProps } from './types';
import { useContext } from 'react';
import { WorkflowContext } from '@/contexts/WorkflowContext';
import { Button } from '@/components/ui/button';

export function FormatSelector({ onNext, onBack }: WorkspaceComponentProps) {
  const context = useContext(WorkflowContext);
  
  if (!context) {
    throw new Error('FormatSelector must be used within WorkflowContext');
  }

  const formats = [
    { id: 'blog', title: 'Post de Blog', icon: '📝' },
    { id: 'ebook', title: 'E-book', icon: '📚' },
    { id: 'article', title: 'Artigo', icon: '📰' },
    { id: 'video', title: 'Roteiro de Vídeo', icon: '🎥' },
    { id: 'carousel', title: 'Carrossel', icon: '🎠' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Escolha o Formato</h2>
      <p className="text-gray-600">Selecione o formato do conteúdo que você deseja criar</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {formats.map((format) => (
          <button
            key={format.id}
            className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            onClick={() => {
              context.dispatch({ type: 'DEFINIR_FORMATO', formato: format.id });
            }}
          >
            <div className="text-4xl mb-2">{format.icon}</div>
            <div className="font-medium">{format.title}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
