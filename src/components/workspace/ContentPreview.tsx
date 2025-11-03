import React from 'react';
import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import { ExportMenu } from './ExportMenu';
import { StyleCustomization } from './StyleCustomization';

interface PreviewProps {
  content: GeneratedNarrative;
  format: string;
}

export function ContentPreview({ content, format }: PreviewProps) {
  const handleExport = async (type: string) => {
    switch (type) {
      case 'copy':
        // TODO: Implementar cópia para clipboard
        break;
      case 'pdf':
        // TODO: Implementar exportação PDF
        break;
      case 'docx':
        // TODO: Implementar exportação DOCX
        break;
      case 'images':
        // TODO: Implementar exportação de imagens
        break;
      case 'slides':
        // TODO: Implementar exportação de slides
        break;
      case 'twitter':
      case 'linkedin':
      case 'facebook':
        // TODO: Implementar compartilhamento em redes sociais
        break;
    }
  };

  const handleStyleChange = (changes: any) => {
    // TODO: Implementar personalização de estilo
  };
  const renderPreview = () => {
    switch (format) {
      case 'blog':
        return (
          <div className="max-w-2xl mx-auto prose prose-blue">
            <h1>{content.titulo}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
              <span>{content.tempoLeitura} min de leitura</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            {content.conteudo.map((section, index) => (
              <div key={index}>
                {section.subtitulo && <h2>{section.subtitulo}</h2>}
                <div dangerouslySetInnerHTML={{ __html: section.texto }} />
              </div>
            ))}
          </div>
        );

      case 'ebook':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <h1 className="text-4xl font-bold mb-4">{content.titulo}</h1>
              {content.subtitulo && (
                <p className="text-xl text-gray-600">{content.subtitulo}</p>
              )}
            </div>
            <div className="prose prose-lg prose-blue max-w-none">
              {content.conteudo.map((section, index) => (
                <div key={index} className="mb-12">
                  {section.subtitulo && (
                    <h2 className="text-2xl font-bold mb-4">{section.subtitulo}</h2>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: section.texto }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'article':
        return (
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1>{content.titulo}</h1>
            {content.subtitulo && (
              <p className="text-xl text-gray-600 mb-8">{content.subtitulo}</p>
            )}
            {content.conteudo.map((section, index) => (
              <div key={index}>
                {section.subtitulo && <h2>{section.subtitulo}</h2>}
                <div dangerouslySetInnerHTML={{ __html: section.texto }} />
              </div>
            ))}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="font-medium text-gray-900 mb-2">Roteiro do Vídeo</h2>
              <p className="text-gray-600 mb-4">
                Duração estimada: {content.tempoLeitura} minutos
              </p>
              {content.conteudo.map((section, index) => (
                <div key={index} className="mb-6">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {`${String(index + 1).padStart(2, '0')}:00`}
                    </span>
                    <div>
                      {section.subtitulo && (
                        <h3 className="font-medium mb-2">{section.subtitulo}</h3>
                      )}
                      <p className="text-gray-600">{section.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'carousel':
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
              <h1 className="text-2xl font-bold mb-2">{content.titulo}</h1>
              {content.subtitulo && <p className="opacity-90">{content.subtitulo}</p>}
            </div>
            <div className="border rounded-b-xl divide-y">
              {content.conteudo.map((section, index) => (
                <div key={index} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Slide {index + 1}/{content.conteudo.length}
                    </span>
                  </div>
                  {section.subtitulo && (
                    <h2 className="text-xl font-semibold">{section.subtitulo}</h2>
                  )}
                  <p className="text-gray-600">{section.texto}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="prose max-w-none">
            <h1>{content.titulo}</h1>
            {content.conteudo.map((section, index) => (
              <div key={index}>
                {section.subtitulo && <h2>{section.subtitulo}</h2>}
                <div dangerouslySetInnerHTML={{ __html: section.texto }} />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-xl p-8 min-h-[600px] overflow-y-auto">
        {renderPreview()}
      </div>
      <ExportMenu format={format} onExport={handleExport} />
      <StyleCustomization format={format} onStyleChange={handleStyleChange} />
    </div>
  );
}
