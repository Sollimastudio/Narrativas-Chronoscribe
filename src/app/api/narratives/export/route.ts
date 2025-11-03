import { NextRequest, NextResponse } from 'next/server';
import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import { createPDF, createEPUB, createMOBI, createDOCX } from '@/server/export/generators';

function narrativeToMarkdown(n: any): string {
  if (typeof n?.content === 'string' && n.content.trim().length > 0) return n.content;
  const sections = Array.isArray(n?.conteudo) ? n.conteudo : [];
  return sections
    .map((s: any, i: number) => `## ${s?.subtitulo ?? `Seção ${i + 1}`}\n\n${s?.texto ?? ''}`)
    .join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const { content, format } = await req.json();

    if (!content || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let exportedContent: Buffer;
    let contentType: string;

    switch (format) {
      case 'pdf':
        exportedContent = await createPDF(content);
        contentType = 'application/pdf';
        break;
      case 'epub':
        exportedContent = await createEPUB(content);
        contentType = 'application/epub+zip';
        break;
      case 'kindle':
        exportedContent = await createMOBI(content);
        contentType = 'application/x-mobipocket-ebook';
        break;
      case 'word':
        exportedContent = await createDOCX(content);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'markdown':
        // Retorna Markdown gerado a partir de conteudo
        const md = narrativeToMarkdown(content);
        return new NextResponse(md, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="narrativa-${content.id}.md"`,
          },
        });
      default:
        return NextResponse.json(
          { error: 'Formato não suportado' },
          { status: 400 }
        );
    }

    // NextResponse aceita ReadableStream/Blob/ArrayBuffer/TypedArray
    const body = new Uint8Array(exportedContent);
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="narrativa-${content.id}.${format}"`,
      },
    });
  } catch (error) {
    console.error('[/api/narratives/export]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
