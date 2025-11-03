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
        throw new Error('Falha na análise do conteúdo');
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-950 rounded-lg p-6 border border-blue-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-100">
          Análise Estratégica do Conteúdo
        </h2>

        {!analysis && !isAnalyzing && (
          <button
            onClick={startAnalysis}
            className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-lg
                     border border-blue-700 transition-all duration-200 ease-in-out
                     flex items-center justify-center space-x-2"
          >
            <span>Iniciar Análise Estratégica</span>
          </button>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="mt-4 text-blue-100">Analisando seu conteúdo...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="bg-blue-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Resumo</h3>
              <p className="text-blue-100">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pontos-Chave</h3>
                <ul className="list-disc list-inside text-blue-100">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pontos Fortes</h3>
                <ul className="list-disc list-inside text-blue-100">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Sugestões de Melhoria</h3>
                <ul className="list-disc list-inside text-blue-100">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Público-Alvo</h3>
                <ul className="list-disc list-inside text-blue-100">
                  {analysis.targetAudience.map((audience, index) => (
                    <li key={index}>{audience}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Potencial de Mercado</h3>
              <p className="text-blue-100">{analysis.marketPotential}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
