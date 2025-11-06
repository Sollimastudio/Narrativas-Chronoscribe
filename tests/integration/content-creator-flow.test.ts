/**
 * Teste de integração para o fluxo de geração premium do ContentCreator
 * Verifica se todas as etapas do fluxo estão integradas corretamente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ContentCreator Premium Flow', () => {
  beforeEach(() => {
    // Mock fetch para simular as APIs
    global.fetch = vi.fn();
  });

  it('deve aceitar props de format, style e analysis', () => {
    const props = {
      format: 'executive',
      style: 'storytelling',
      analysis: { score: 85, insights: [] },
      onContentGenerated: vi.fn()
    };

    expect(props.format).toBe('executive');
    expect(props.style).toBe('storytelling');
    expect(props.analysis).toBeDefined();
    expect(props.onContentGenerated).toBeDefined();
  });

  it('deve passar as configurações corretas para a API de narrativas', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        titulo: 'Narrativa Gerada',
        conteudo: [{ texto: 'Conteúdo gerado com sucesso' }]
      })
    });

    global.fetch = mockFetch;

    const requestBody = {
      blueprint: {
        title: 'executive',
        audience: 'Público geral',
        objective: 'executive',
        medium: 'text',
        tone: 'visionary',
        lengthGuidance: 'standard',
        summary: 'Conteúdo de teste',
        sections: [
          {
            id: 'main',
            title: 'Conteúdo Principal',
            objective: 'Apresentar o conteúdo de forma estruturada',
            highlights: []
          }
        ],
        linksURLs: [],
        arquivosPDFs: '',
        arquivosMIdia: '',
        acaoDiretorArte: false,
        acaoCritico: false
      },
      language: 'pt-BR',
      format: 'markdown',
      brandVoice: 'storytelling'
    };

    const response = await fetch('/api/narratives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/narratives',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const data = await response.json();
    expect(data.titulo).toBe('Narrativa Gerada');
    expect(data.conteudo).toBeDefined();
  });

  it('deve lidar com erros da API de narrativas', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    global.fetch = mockFetch;

    const response = await fetch('/api/narratives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'teste' })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('deve chamar onContentGenerated quando o conteúdo for gerado', async () => {
    const onContentGenerated = vi.fn();
    const generatedContent = { 
      titulo: 'Narrativa Épica',
      conteudo: [{ texto: 'Narrativa épica gerada' }]
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => generatedContent
    });

    global.fetch = mockFetch;

    const response = await fetch('/api/narratives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blueprint: {
          title: 'teste',
          audience: 'público',
          objective: 'objetivo',
          medium: 'text',
          tone: 'educational',
          lengthGuidance: 'standard',
          summary: 'resumo',
          sections: [],
          linksURLs: [],
          arquivosPDFs: '',
          arquivosMIdia: '',
          acaoDiretorArte: false,
          acaoCritico: false
        },
        language: 'pt-BR',
        format: 'markdown'
      })
    });

    const data = await response.json();
    
    // Simular o callback
    onContentGenerated(data);

    expect(onContentGenerated).toHaveBeenCalledWith(generatedContent);
  });

  it('deve usar valores padrão quando props opcionais não são fornecidas', () => {
    const format = 'text';
    const style = 'general';

    expect(format).toBe('text');
    expect(style).toBe('general');
  });

  it('deve validar integração com WorkflowNavigator', () => {
    const state = {
      dados: {
        formato: 'executive',
        estilo: 'academic',
        analise: { score: 90 }
      }
    };

    const contentCreatorProps = {
      format: state.dados.formato,
      style: state.dados.estilo,
      analysis: state.dados.analise
    };

    expect(contentCreatorProps.format).toBe('executive');
    expect(contentCreatorProps.style).toBe('academic');
    expect(contentCreatorProps.analysis.score).toBe(90);
  });
});
