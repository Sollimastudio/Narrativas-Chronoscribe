import { WorkspaceComponentProps } from './types';
import { useContext } from 'react';
import { WorkflowContext } from '@/contexts/WorkflowContext';
import { Button } from '@/components/ui/button';

export function StyleSelector({ onNext, onBack }: WorkspaceComponentProps) {
  const context = useContext(WorkflowContext);
  
  if (!context) {
    throw new Error('StyleSelector must be used within WorkflowContext');
  }

  const styles = [
    { id: 'professional', title: 'Profissional', icon: '👔', description: 'Tom formal e direto' },
    { id: 'casual', title: 'Casual', icon: '😊', description: 'Tom leve e descontraído' },
    { id: 'academic', title: 'Acadêmico', icon: '🎓', description: 'Tom técnico e detalhado' },
    { id: 'storytelling', title: 'Narrativo', icon: '📖', description: 'Tom envolvente e pessoal' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Escolha o Estilo</h2>
      <p className="text-gray-600">Defina o tom e estilo do seu conteúdo</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {styles.map((style) => (
          <button
            key={style.id}
            className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
            onClick={() => {
              context.dispatch({ type: 'DEFINIR_ESTILO', estilo: style.id });
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{style.icon}</div>
              <div>
                <div className="font-medium">{style.title}</div>
                <div className="text-sm text-gray-600">{style.description}</div>
              </div>
            </div>
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
