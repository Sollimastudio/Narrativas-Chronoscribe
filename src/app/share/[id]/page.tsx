import { prisma } from '@/server/prisma/client';
import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import { notFound } from 'next/navigation';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSharedContent(id: string): Promise<GeneratedNarrative | null> {
  const share = await prisma.contentShare.findUnique({
    where: { id },
  });

  if (!share) return null;

  // Verifica se o compartilhamento expirou
  if (share.expiresAt < new Date()) {
    await prisma.contentShare.delete({
      where: { id },
    });
    return null;
  }

  return JSON.parse(share.content);
}

function sectionsToMarkdown(n: GeneratedNarrative): string {
  try {
    return (n.conteudo || [])
      .map((s, i) => `## ${s.subtitulo ?? `Seção ${i + 1}`}\n\n${s.texto ?? ''}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const content = await getSharedContent(id);

  if (!content) {
    notFound();
  }

  const html = md.render(sectionsToMarkdown(content as GeneratedNarrative));

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-gray-900 to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-lg border border-blue-800 bg-blue-950/50 p-6">
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>

          {content.analisePreditiva && (
            <div className="rounded-lg border border-blue-800 bg-blue-950/50 p-6">
              <h2 className="text-xl font-bold text-amber-400 mb-4">
                Análise Preditiva
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-400">
                    Sugestões Críticas
                  </h3>
                  <p className="mt-2 text-gray-300">
                    {content.analisePreditiva.sugestoesCriticas}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-400">
                    Potencial de Viralização
                  </h3>
                  <p className="mt-2 text-gray-300">
                    {content.analisePreditiva.sugestoesViralizacao}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(content.promptImagem || content.promptCarrossel) && (
            <div className="rounded-lg border border-blue-800 bg-blue-950/50 p-6">
              <h2 className="text-xl font-bold text-amber-400 mb-4">
                Recursos Visuais Sugeridos
              </h2>
              <div className="space-y-4">
                {content.promptImagem && (
                  <div>
                    <h3 className="text-lg font-medium text-blue-400">
                      Sugestão de Imagem
                    </h3>
                    <p className="mt-2 text-gray-300">{content.promptImagem}</p>
                  </div>
                )}
                {content.promptCarrossel && (
                  <div>
                    <h3 className="text-lg font-medium text-blue-400">
                      Sugestões para Carrossel
                    </h3>
                    <div className="mt-2 space-y-2">
                      {content.promptCarrossel.map((prompt, index) => (
                        <p key={index} className="text-gray-300">
                          {prompt}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
