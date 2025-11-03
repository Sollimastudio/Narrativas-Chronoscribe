import { useContext } from 'react';
import { WorkflowContext } from '@/contexts/WorkflowContext';
import { KnowledgeInput } from '../workspace/KnowledgeInput';
import { FormatSelector } from '../workspace/FormatSelector';
import { StyleSelector } from '../workspace/StyleSelector';
import { ContentAnalyzer } from '../workspace/ContentAnalyzer';
import { ContentCreator } from '../workspace/ContentCreator';
import { ContentExporter } from '../workspace/ContentExporter';
import { toast } from 'react-hot-toast';
import type { EtapaWorkflow } from '@/domain/narratives/workflow';

const ETAPAS: EtapaWorkflow[] = ['upload', 'formato', 'estilo', 'analise', 'geracao', 'exportacao'];

const ETAPA_LABELS: Record<EtapaWorkflow, string> = {
  upload: 'Upload',
  formato: 'Formato',
  estilo: 'Estilo',
  analise: 'Análise',
  geracao: 'Geração',
  exportacao: 'Exportação',
};

const stepValidation: Record<EtapaWorkflow, (state: any) => boolean> = {
  upload: (state) => state.dados?.arquivos?.length > 0 || state.dados?.links?.length > 0,
  formato: (state) => state.dados?.formato !== null,
  estilo: (state) => state.dados?.estilo !== null,
  analise: (state) => state.dados?.analise !== null,
  geracao: (state) => true, // ContentCreator gerencia internamente
  exportacao: () => true,
};

export function WorkflowNavigator() {
  const context = useContext(WorkflowContext);
  
  if (!context) {
    throw new Error('WorkflowNavigator must be used within WorkflowContext');
  }

  const { state, dispatch } = context;

  const handleNext = () => {
    const currentIndex = ETAPAS.indexOf(state.etapaAtual);
    const validator = stepValidation[state.etapaAtual as EtapaWorkflow];
    
    if (validator && !validator(state)) {
      toast.error('Por favor, complete esta etapa antes de continuar');
      return;
    }

    if (currentIndex < ETAPAS.length - 1) {
      dispatch({ type: 'COMPLETAR_ETAPA', etapa: state.etapaAtual });
      dispatch({ type: 'DEFINIR_ETAPA', etapa: ETAPAS[currentIndex + 1] });
    }
  };

  const handleBack = () => {
    const currentIndex = ETAPAS.indexOf(state.etapaAtual);
    
    if (currentIndex > 0) {
      dispatch({ type: 'DEFINIR_ETAPA', etapa: ETAPAS[currentIndex - 1] });
    }
  };

  const renderStep = () => {
    switch (state.etapaAtual) {
      case 'upload':
        return <KnowledgeInput onNext={handleNext} />;
      case 'formato':
        return <FormatSelector onBack={handleBack} onNext={handleNext} />;
      case 'estilo':
        return <StyleSelector onBack={handleBack} onNext={handleNext} />;
      case 'analise':
        return (
          <ContentAnalyzer 
            content={state.dados.arquivos.join('\n')}
            format={state.dados.formato || ''}
            style={state.dados.estilo || ''}
            onAnalysisComplete={(analysis) => {
              dispatch({ type: 'DEFINIR_ANALISE', analise: analysis });
              handleNext();
            }}
          />
        );
      case 'geracao':
        return (
          <ContentCreator />
        );
      case 'exportacao':
        return (
          state.dados.conteudo ? (
            <ContentExporter 
              content={state.dados.conteudo}
              format={state.dados.formato || ''}
            />
          ) : (
            <div className="text-sm text-gray-500">Nenhum conteúdo gerado ainda.</div>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500">
          {ETAPAS.map((etapa, index) => {
            const isCompleted = state.etapasConcluidas.includes(etapa);
            const isCurrent = state.etapaAtual === etapa;
            
            return (
              <div
                key={etapa}
                className={`flex flex-col items-center ${
                  isCompleted
                    ? 'text-blue-600'
                    : isCurrent
                    ? 'text-blue-400'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden sm:block text-xs">{ETAPA_LABELS[etapa]}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((state.etapasConcluidas.length + (state.etapaAtual !== 'exportacao' ? 1 : 0)) /
                  ETAPAS.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mt-8">{renderStep()}</div>
    </div>
  );
}
