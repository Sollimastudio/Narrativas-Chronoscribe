/**
 * Estilos Narrativos - Framework Sol Lima
 * Arsenal de modelos de linguagem e estrutura para criação de conteúdo visceral
 */

export interface NarrativeStyle {
  id: string;
  name: string;
  description: string;
  structure?: string;
  application?: string;
  keywords?: string[];
}

export const narrativeStyles: NarrativeStyle[] = [
  {
    id: 'tensao-respiro',
    name: 'Tensão/Respiro',
    description: 'O Método Tensão → Respiro. Estrutura em 4 fases para máximo engajamento emocional.',
    structure: 'Tensão (Expor a dor crua) → Pergunta Reflexiva (Quebra de crença) → Respiro Poético (Metáfora sensorial) → Chamada à Ação Emocional (Venda da Transformação)',
    application: 'Ideal para conteúdos de transformação pessoal, desenvolvimento e vendas emocionais. Expõe a dor antes de oferecer a ressignificação.',
    keywords: ['dor', 'transformação', 'ressignificação', 'metáfora', 'emocional'],
  },
  {
    id: 'estilo-rompante',
    name: 'Estilo Rompante',
    description: 'Frases curtas, diretas, afiadas e provocativas. Escrita visceral e inesquecível.',
    structure: 'Sentenças de impacto. Sem rodeios. Direto ao ponto. Cada frase é uma experiência sensorial.',
    application: 'Perfeito para reels, carrosséis, headlines, hooks e conteúdo de retenção alta. Prende atenção imediatamente.',
    keywords: ['impacto', 'direto', 'visceral', 'provocativo', 'retenção'],
  },
  {
    id: 'meta-modelo-quebra',
    name: 'Meta-Modelo da Quebra',
    description: 'Usa perguntas que obrigam o leitor a questionar suas verdades.',
    structure: 'Perguntas provocativas como: "Quem disse isso?", "E se fosse diferente?", "Por que você acredita nisso?"',
    application: 'Excelente para conteúdo educacional, mentorias, VSLs e artigos que desafiam crenças limitantes.',
    keywords: ['pergunta', 'reflexão', 'quebra', 'crença', 'transformação'],
  },
  {
    id: 'paleta-sombra-luz',
    name: 'Paleta Sombra e Luz',
    description: 'Usa metáforas sensoriais e contraste de cores (preto, dourado, bege, branco) para gerar profundidade.',
    structure: 'Contraste entre sombra (dor/problema) e luz (solução/esperança) através de imagens vívidas da infância e memórias sensoriais.',
    application: 'Ideal para livros, ebooks, podcasts e conteúdo narrativo longo. Cria conexão profunda e memorável.',
    keywords: ['metáfora', 'sensorial', 'contraste', 'memória', 'profundidade'],
  },
  {
    id: 'verbos-poder',
    name: 'Verbos de Ação e Poder',
    description: 'Prioriza verbos que geram movimento e transformação imediata.',
    structure: 'Uso estratégico de: Transforme, Ressignifique, Liberte, Rompa, Acesse, Reescreva, Descubra, Libere.',
    application: 'Poderoso para CTAs, títulos, subtítulos e qualquer conteúdo que precise gerar ação imediata.',
    keywords: ['transforme', 'ressignifique', 'liberte', 'rompa', 'ação'],
  },
];

export const contentTypes = [
  { id: 'livro', name: 'Livro (300+ páginas)', description: 'Estrutura best-seller com distribuição cronológica inteligente' },
  { id: 'ebook', name: 'Ebook Completo', description: 'Versão digital otimizada para leitura rápida e engajamento' },
  { id: 'reels', name: 'Reels/Carrossel', description: 'Conteúdo viral para TikTok, Instagram, Facebook com hooks poderosos' },
  { id: 'videos-legendas', name: 'Vídeos + Legendas', description: 'Scripts para YouTube (shorts/longos) com legendas inteligentes' },
  { id: 'mentorias', name: 'Mentorias/VSLs', description: 'Roteiros de mentoria e Video Sales Letters com estrutura visceral' },
  { id: 'podcasts', name: 'Podcasts', description: 'Roteiros para episódios com ganchos narrativos e retenção alta' },
  { id: 'artigos-seo', name: 'Artigos SEO', description: 'Conteúdo otimizado para search engines com estrutura engajante' },
];

export const objectives = [
  { id: 'vendas', name: 'Vendas', description: 'Estrutura focada em conversão e fechamento' },
  { id: 'engajamento', name: 'Engajamento', description: 'Maximizar interações, comentários e compartilhamentos' },
  { id: 'crescimento', name: 'Crescimento/Seguidores', description: 'Estratégias virais para crescimento de audiência' },
  { id: 'reconhecimento', name: 'Reconhecimento', description: 'Posicionamento de autoridade e marca pessoal' },
  { id: 'lancamentos', name: 'Lançamentos', description: 'Estrutura de pré-lançamento, lançamento e pós-venda' },
];
