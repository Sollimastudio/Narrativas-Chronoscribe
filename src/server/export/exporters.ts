import { Readable } from 'stream';
import { GeneratedNarrative } from '@/domain/narratives/blueprint';
import mammoth from 'mammoth';
import { Buffer } from 'buffer';
import { unified } from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';

interface ExportOptions {
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
  quality?: 'draft' | 'final';
}

export class ContentExporter {
  constructor(private content: GeneratedNarrative) {}

  private async convertHtmlToMarkdown(html: string): Promise<string> {
    const turndownService = new (require('turndown'))();
    return turndownService.turndown(html);
  }

  private async convertMarkdownToHtml(markdown: string): Promise<string> {
    const result = await unified()
      .use(markdown as any)
      .use(html as any)
      .process(markdown);
    return result.toString();
  }

  async toPDF(options: ExportOptions = {}): Promise<Buffer> {
    // Use dynamic require to avoid type issues in Next.js build
    const PDFDocument = require('pdfkit');
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        autoFirstPage: true,
        margins: { top: 72, left: 72, bottom: 72, right: 72 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Título
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(this.content.titulo, { align: 'center' });

      if (this.content.subtitulo) {
        doc
          .font('Helvetica')
          .fontSize(16)
          .moveDown()
          .text(this.content.subtitulo, { align: 'center' });
      }

      // Metadata
      if (options.includeMetadata) {
        doc
          .moveDown()
          .fontSize(10)
          .text(`Tempo estimado de leitura: ${this.content.tempoLeitura} minutos`, {
            align: 'left',
            color: 'gray',
          });
      }

      if (options.includeTimestamp) {
        doc
          .fontSize(10)
          .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
            align: 'left',
            color: 'gray',
          });
      }

      // Conteúdo
      doc.moveDown().moveDown();
      for (const section of this.content.conteudo) {
        if (section.subtitulo) {
          doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(section.subtitulo)
            .moveDown();
        }

        doc
          .font('Helvetica')
          .fontSize(12)
          .text(section.texto)
          .moveDown()
          .moveDown();
      }

      doc.end();
    });
  }

  async toDOCX(options: ExportOptions = {}): Promise<Buffer> {
    const docx = require('docx');
    const { Document, Paragraph, TextRun, HeadingLevel } = docx;

    const children = [] as any[];

    // Título
    children.push(
      new Paragraph({
        text: this.content.titulo,
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    if (this.content.subtitulo) {
      children.push(
        new Paragraph({
          text: this.content.subtitulo,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
    }

    // Metadata
    if (options.includeMetadata) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Tempo estimado de leitura: ${this.content.tempoLeitura} minutos`,
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    if (options.includeTimestamp) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // Conteúdo
    for (const section of this.content.conteudo) {
      if (section.subtitulo) {
        children.push(
          new Paragraph({
            text: section.subtitulo,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          })
        );
      }

      const paragraphs = section.texto.split('\n\n');
      for (const paragraph of paragraphs) {
        children.push(
          new Paragraph({
            text: paragraph,
            spacing: { after: 200 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    return Buffer.from(await doc.save());
  }

  async toMarkdown(options: ExportOptions = {}): Promise<string> {
    let mk = `# ${this.content.titulo}\n\n`;

    if (this.content.subtitulo) {
      mk += `## ${this.content.subtitulo}\n\n`;
    }

    if (options.includeMetadata) {
      mk += `*Tempo estimado de leitura: ${this.content.tempoLeitura} minutos*\n\n`;
    }

    if (options.includeTimestamp) {
      mk += `*Gerado em: ${new Date().toLocaleString('pt-BR')}*\n\n`;
    }

    for (const section of this.content.conteudo) {
      if (section.subtitulo) {
        mk += `## ${section.subtitulo}\n\n`;
      }
      mk += `${section.texto}\n\n`;
    }

    return mk;
  }

  async toHTML(options: ExportOptions = {}): Promise<string> {
    const mk = await this.toMarkdown(options);
    const result = await unified().use(markdown as any).use(html as any).process(mk);
    return result.toString();
  }
}
