export interface PDFFragment {
  texto: string;
  tipo: 'cronologico' | 'emocional' | 'contexto' | 'desconhecido';
  confianca: number;
  pagina?: number;
}

export class PDFProcessor {
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Conversão básica de PDF para texto (simplificada)
      const decoder = new TextDecoder('utf-8');
      let text = decoder.decode(uint8Array);
      
      // Limpar caracteres de controle e manter apenas texto legível
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      
      return text;
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
      return '';
    }
  }

  async processFragments(files: File[]): Promise<PDFFragment[]> {
    const fragments: PDFFragment[] = [];

    for (const file of files) {
      const texto = await this.extractText(file);
      
      if (texto) {
        const fragment: PDFFragment = {
          texto,
          tipo: this.detectFragmentType(texto),
          confianca: 0.8,
          pagina: 1,
        };
        
        fragments.push(fragment);
      }
    }

    return fragments;
  }

  private detectFragmentType(texto: string): PDFFragment['tipo'] {
    const textoLower = texto.toLowerCase();
    
    // Detectar cronológico
    if (/\d{4}|data|ano|mês|dia|quando|época/.test(textoLower)) {
      return 'cronologico';
    }
    
    // Detectar emocional
    if (/sentiu|emoção|amor|medo|alegria|tristeza|raiva|paixão/.test(textoLower)) {
      return 'emocional';
    }
    
    // Detectar contexto
    if (/contexto|situação|ambiente|lugar|local|cenário/.test(textoLower)) {
      return 'contexto';
    }
    
    return 'desconhecido';
  }
}

export const pdfProcessor = new PDFProcessor();
