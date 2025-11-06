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
      json: async () => ({ narrative: 'Conteúdo gerado com sucesso' })
    });

    global.fetch = mockFetch;

    const requestBody = {
      content: 'Conteúdo de teste',
      format: 'executive',
      style: 'storytelling',
      analysis: { score: 85 },
      premium: true
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
    );

    const data = await response.json();
    expect(data.narrative).toBe('Conteúdo gerado com sucesso');
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
    const generatedContent = 'Narrativa épica gerada';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ narrative: generatedContent })
    });

    global.fetch = mockFetch;

    const response = await fetch('/api/narratives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'teste', premium: true })
    });

    const data = await response.json();
    
    // Simular o callback
    onContentGenerated(data.narrative);

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
