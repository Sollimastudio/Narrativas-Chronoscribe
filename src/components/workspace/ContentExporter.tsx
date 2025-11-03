import React, { useState } from 'react';
import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import toast from 'react-hot-toast';

interface ContentExporterProps {
  content: GeneratedNarrative;
  format: string;
}

function narrativeToMarkdown(n: GeneratedNarrative): string {
  const sections = Array.isArray(n.conteudo) ? n.conteudo : [];
  return sections
    .map((s: any, i: number) => `## ${s?.subtitulo ?? s?.title ?? `Seção ${i + 1}`}\n\n${s?.texto ?? ''}`)
    .join('\n\n');
}

export function ContentExporter({ content, format }: ContentExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(format);

  const handleExport = async (exportFormat: string) => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/narratives/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          format: exportFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao exportar conteúdo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `narrativa-${content.id}.${getFileExtension(exportFormat)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      // TODO: Adicionar notificação de erro
    } finally {
      setIsExporting(false);
    }
  };

  const getFileExtension = (format: string): string => {
    switch (format) {
      case 'pdf':
        return 'pdf';
      case 'epub':
        return 'epub';
      case 'markdown':
        return 'md';
      case 'kindle':
        return 'mobi';
      case 'word':
        return 'docx';
      default:
        return 'txt';
    }
  };

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: '📄',
      description: 'Documento PDF profissional com formatação completa',
    },
    {
      id: 'epub',
      name: 'EPUB',
      icon: '📱',
      description: 'Ebook para leitores digitais como iPad e Android',
    },
    {
      id: 'kindle',
      name: 'Kindle',
      icon: '📚',
      description: 'Formato MOBI otimizado para Amazon Kindle',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      icon: '📝',
      description: 'Texto formatado em Markdown para fácil edição',
    },
    {
      id: 'word',
      name: 'Word',
      icon: '📎',
      description: 'Documento do Microsoft Word (DOCX)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-amber-400 bg-clip-text text-transparent">
          Exportação
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportFormats.map((exportFormat) => (
          <button
            key={exportFormat.id}
            onClick={() => handleExport(exportFormat.id)}
            disabled={isExporting}
            className="p-4 rounded-lg border border-blue-800 bg-blue-950/50 hover:bg-blue-900/50 transition-colors group relative overflow-hidden"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{exportFormat.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-amber-400">{exportFormat.name}</h3>
                <p className="text-sm text-gray-400">{exportFormat.description}</p>
              </div>
            </div>
            {isExporting && selectedFormat === exportFormat.id && (
              <div className="absolute inset-0 bg-blue-900/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-blue-800 bg-blue-950/50 p-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">
          Compartilhamento Rápido
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/share', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        content,
                        expiresIn: '7d',
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Falha ao gerar link');
                    }

                    const { shareUrl } = await response.json();
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copiado para a área de transferência!');
                  } catch (error) {
                    console.error('Erro ao gerar link:', error);
                    toast.error('Erro ao gerar link de compartilhamento');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-amber-400 transition-colors flex-shrink-0"
              >
                Gerar Link
              </button>
              <button
                onClick={async () => {
                  try {
                    const text = narrativeToMarkdown(content);
                    await navigator.clipboard.writeText(text);
                    toast.success('Texto copiado para a área de transferência!');
                  } catch (error) {
                    console.error('Erro ao copiar:', error);
                    toast.error('Erro ao copiar texto');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-amber-400 transition-colors flex-shrink-0"
              >
                Copiar Texto
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Links de compartilhamento expiram em 7 dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
