import { GeneratedNarrative, ContentSection } from '@/domain/narratives/blueprint';
import puppeteer from 'puppeteer';
import MarkdownIt from 'markdown-it';
import * as fs from 'fs';

const md = new MarkdownIt();

type AnyNarrative = GeneratedNarrative | (GeneratedNarrative & { content?: string }) | { id: string; content: string };

function sectionsToMarkdown(sections: ContentSection[]): string {
  return sections
    .map((s, i) => `## ${s.subtitulo ?? `Seção ${i + 1}`}\n\n${s.texto ?? ''}`)
    .join('\n\n');
}

function narrativeToMarkdown(n: AnyNarrative): string {
  const anyN = n as any;
  if (typeof anyN.content === 'string' && anyN.content.trim().length > 0) {
    return anyN.content;
  }
  if (Array.isArray(anyN.conteudo)) {
    return sectionsToMarkdown(anyN.conteudo as ContentSection[]);
  }
  return '';
}

export async function createPDF(content: AnyNarrative): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const markdown = narrativeToMarkdown(content);
  const htmlBody = md.render(markdown);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Narrativa ${content.id}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1, h2, h3 { color: #1a365d; }
          img { max-width: 100%; height: auto; }
          .metadata { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
        </style>
      </head>
      <body>
        ${htmlBody}
      </body>
    </html>
  `;

  await page.setContent(html);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

export async function createEPUB(content: AnyNarrative): Promise<Buffer> {
  // Import dinâmico para compatibilidade com SSR/Next
  const { Epub } = await import('epub-gen');
  return new Promise((resolve, reject) => {
    const html = md.render(narrativeToMarkdown(content));
    const options = {
      title: `Narrativa ${content.id}`,
      author: 'Chronoscribe',
      publisher: 'Chronoscribe',
      content: [{ title: 'Conteúdo', data: html }],
    } as any;

    const epub = new Epub(options, 'output.epub');
    epub.promise
      .then(() => {
        const buffer = fs.readFileSync('output.epub');
        fs.unlinkSync('output.epub');
        resolve(buffer);
      })
      .catch(reject);
  });
}

export async function createMOBI(content: AnyNarrative): Promise<Buffer> {
  const epubBuffer = await createEPUB(content);
  return epubBuffer;
}

export async function createDOCX(content: AnyNarrative): Promise<Buffer> {
  // Import dinâmico para compat com ambiente Node/webpack
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const text = narrativeToMarkdown(content);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text, size: 24 })],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
