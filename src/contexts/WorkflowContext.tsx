import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  EstadoWorkflow,
  AcaoWorkflow,
  estadoInicialWorkflow,
  EtapaWorkflow,
} from '@/domain/narratives/workflow';

export const WorkflowContext = createContext<{
  state: EstadoWorkflow;
  dispatch: React.Dispatch<AcaoWorkflow>;
} | null>(null);

function workflowReducer(state: EstadoWorkflow, action: AcaoWorkflow): EstadoWorkflow {
  switch (action.type) {
    case 'DEFINIR_ETAPA':
      return { ...state, etapaAtual: action.etapa };
    case 'COMPLETAR_ETAPA':
      return { ...state, etapasConcluidas: [...state.etapasConcluidas, action.etapa] };
    case 'DEFINIR_PROJETO':
      return { ...state, projetoId: action.projetoId };
    case 'ADICIONAR_ARQUIVOS':
      return { ...state, dados: { ...state.dados, arquivos: [...state.dados.arquivos, ...action.arquivos] } };
    case 'ADICIONAR_LINKS':
      return { ...state, dados: { ...state.dados, links: [...state.dados.links, ...action.links] } };
    case 'DEFINIR_FORMATO':
      return { ...state, dados: { ...state.dados, formato: action.formato } };
    case 'DEFINIR_ESTILO':
      return { ...state, dados: { ...state.dados, estilo: action.estilo } };
    case 'DEFINIR_ANALISE':
      return { ...state, dados: { ...state.dados, analise: action.analise } };
    case 'DEFINIR_CONTEUDO':
      return { ...state, dados: { ...state.dados, conteudo: action.conteudo } };
    case 'RESETAR':
      return estadoInicialWorkflow;
    default:
      return state;
  }
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, estadoInicialWorkflow);

  return <WorkflowContext.Provider value={{ state, dispatch }}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

export function useWorkflowNavigation() {
  const { state, dispatch } = useWorkflow();

  const steps: EtapaWorkflow[] = ['upload', 'formato', 'estilo', 'analise', 'geracao', 'exportacao'];

  const canProceed = () => {
    switch (state.etapaAtual) {
      case 'upload':
        return state.dados.arquivos.length > 0 || state.dados.links.length > 0;
      case 'formato':
        return !!state.dados.formato;
      case 'estilo':
        return !!state.dados.estilo;
      case 'analise':
        return !!state.dados.analise;
      case 'geracao':
        return !!state.dados.conteudo;
      case 'exportacao':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(state.etapaAtual);
    if (currentIndex < steps.length - 1 && canProceed()) {
      dispatch({ type: 'COMPLETAR_ETAPA', etapa: state.etapaAtual });
      dispatch({ type: 'DEFINIR_ETAPA', etapa: steps[currentIndex + 1] });
    }
  };

  const previousStep = () => {
    const currentIndex = steps.indexOf(state.etapaAtual);
    if (currentIndex > 0) {
      dispatch({ type: 'DEFINIR_ETAPA', etapa: steps[currentIndex - 1] });
    }
  };

  const goToStep = (etapa: EtapaWorkflow) => {
    const targetIndex = steps.indexOf(etapa);
    const currentIndex = steps.indexOf(state.etapaAtual);
    if (targetIndex > currentIndex && !canProceed()) return false;
    dispatch({ type: 'DEFINIR_ETAPA', etapa });
    return true;
  };

  return {
    canProceed,
    nextStep,
    previousStep,
    goToStep,
    currentStep: state.etapaAtual,
    completedSteps: state.etapasConcluidas,
    steps,
  };
}
