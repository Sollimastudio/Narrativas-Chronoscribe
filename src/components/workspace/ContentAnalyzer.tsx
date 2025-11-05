import { useState } from 'react';
import type { DadosAnaliticos } from '@/domain/narratives/workflow';

interface ContentAnalysisResultUI {
  summary: string;
  keyPoints: string[];
  strengths: string[];
  improvements: string[];
  targetAudience: string[];
  marketPotential: string;
}

interface ContentAnalyzerProps {
  content: string;
  format: string;
  style: string;
  onAnalysisComplete: (analysis: DadosAnaliticos) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function ContentAnalyzer({
  content,
  format,
  style,
  onAnalysisComplete
}: ContentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysisResultUI | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format, topic: style })
      });

      if (!response.ok) {
        // Usar dados mock quando API falha (ex: OpenAI não configurada)
        console.warn('API de análise falhou, usando dados de demonstração');
        const mockData = generateMockAnalysis(format, style);
        setAnalysis(mockData.ui);
        onAnalysisComplete(mockData.data);
        return;
      }

      const data: DadosAnaliticos = await response.json();
      // Mapear DadosAnaliticos -> ContentAnalysisResultUI para exibir no UI atual
      const mapped: ContentAnalysisResultUI = {
        summary: `Score emocional: ${data?.insightsConteudo?.pontuacaoEmocional ?? 0}. SEO oportunidade: ${data?.insightsConteudo?.metricasSEO?.oportunidade ?? 0}.`,
        keyPoints: data?.recomendacoesEstrategicas?.ganchos ?? [],
        strengths: data?.analiseCompetitiva?.posicaoMercado?.angulosUnicos ?? [],
        improvements: data?.analiseCompetitiva?.lacunas ?? [],
        targetAudience: Object.keys(data?.insightsAudiencia?.demografia?.idade ?? {}),
        marketPotential: `Tendências: ${(data?.tendenciasMercado?.tendencias?.[0]?.topico ?? '—')} / Crescimento médio: ${(data?.tendenciasMercado?.tendencias?.[0]?.crescimento ?? 0)}%`
      };

      setAnalysis(mapped);
      onAnalysisComplete(data);
    } catch (error) {
      console.error('Erro durante a análise:', error);
      // Fallback para dados mock em caso de erro
      const mockData = generateMockAnalysis(format, style);
      setAnalysis(mockData.ui);
      onAnalysisComplete(mockData.data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função para gerar análise mock quando API não está disponível
  const generateMockAnalysis = (format: string, style: string) => {
    const ui: ContentAnalysisResultUI = {
      summary: `Análise demonstrativa para ${format}. Score emocional: 85/100. Potencial de engajamento: Alto.`,
      keyPoints: [
        'Estrutura narrativa bem definida com arcos claros',
        'Uso estratégico de tensão e respiro emocional',
        'Ganchos viscerais identificados em pontos-chave',
        'Linguagem adaptada ao público-alvo'
      ],
      strengths: [
        'Forte apelo emocional com elementos viscerais',
        'Metáforas sensoriais bem aplicadas',
        'Ritmo narrativo adequado para retenção',
        'Quebras de crença estratégicas'
      ],
      improvements: [
        'Adicionar mais exemplos concretos em seções teóricas',
        'Reforçar chamadas à ação em momentos-chave',
        'Expandir contexto histórico/cronológico',
        'Incluir mais dados de validação social'
      ],
      targetAudience: [
        '25-45 anos interessados em desenvolvimento',
        'Empreendedores buscando posicionamento',
        'Creators que querem escalar conteúdo',
        'Profissionais em transição de carreira'
      ],
      marketPotential: 'Tendência: Conteúdo visceral e autêntico / Crescimento médio: 127% no último trimestre'
    };

    const data: DadosAnaliticos = {
      insightsConteudo: {
        pontuacaoEmocional: 85,
        pontuacaoLegibilidade: 78,
        metricasSEO: {
          oportunidade: 92,
          palavrasChave: ['narrativas', 'estratégia', 'conteúdo visceral'],
          densidadePalavraChave: 2.3
        }
      },
      recomendacoesEstrategicas: {
        ganchos: ui.keyPoints,
        otimizacoes: ui.improvements
      },
      analiseCompetitiva: {
        posicaoMercado: {
          angulosUnicos: ui.strengths
        },
        lacunas: ui.improvements
      },
      insightsAudiencia: {
        demografia: {
          idade: { '25-34': 35, '35-44': 45, '45-54': 20 }
        }
      },
      tendenciasMercado: {
        tendencias: [
          { topico: 'Conteúdo visceral e autêntico', crescimento: 127, categoria: 'marketing' }
        ]
      }
    };

    return { ui, data };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-950/80 rounded-lg p-6 border-2 border-yellow-600/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400 text-glow">
          🎯 Análise Estratégica do Conteúdo
        </h2>

        {!analysis && !isAnalyzing && (
          <div className="space-y-3">
            <button
              onClick={startAnalysis}
              className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-500 text-blue-950 font-bold rounded-lg
                       border-2 border-yellow-400 transition-all duration-200 ease-in-out
                       flex items-center justify-center space-x-2 button-glow"
            >
              <span>✨ Iniciar Análise Estratégica</span>
            </button>
            <p className="text-sm text-yellow-400/70 text-center">
              💡 A análise usará dados demonstrativos se a API não estiver configurada
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
            <p className="mt-4 text-yellow-400 font-semibold">⏳ Analisando seu conteúdo...</p>
            <p className="mt-2 text-yellow-400/60 text-sm">Isso pode levar alguns segundos</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📊 Resumo</h3>
              <p className="text-yellow-100">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">🎯 Pontos-Chave</h3>
                <ul className="list-disc list-inside text-yellow-100 space-y-1">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">✨ Pontos Fortes</h3>
                <ul className="list-disc list-inside text-yellow-100 space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">🔧 Sugestões de Melhoria</h3>
                <ul className="list-disc list-inside text-yellow-100 space-y-1">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">👥 Público-Alvo</h3>
                <ul className="list-disc list-inside text-yellow-100 space-y-1">
                  {analysis.targetAudience.map((audience, index) => (
                    <li key={index}>{audience}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-900/50 p-4 rounded-lg border border-yellow-600/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">📈 Potencial de Mercado</h3>
              <p className="text-yellow-100">{analysis.marketPotential}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
