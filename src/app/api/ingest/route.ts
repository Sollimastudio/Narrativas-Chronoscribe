import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import { JSDOM } from 'jsdom';

export const runtime = 'nodejs';

async function loadPdfJs() {
  // usa build legacy para compatibilidade com webpack do Next em ambiente server
  // @ts-ignore
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjs as any;
}

async function extractFromPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  // @ts-ignore
  const loadingTask = pdfjsLib.getDocument({ data: Buffer.from(buffer) });
  const pdf = await loadingTask.promise;
  const max = pdf.numPages;
  let full = '';
  for (let p = 1; p <= max; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str ?? '').join(' ');
    full += text + '\n\n';
  }
  return full;
}

async function extractFromDocx(buffer: ArrayBuffer): Promise<string> {
  const res = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return res.value ?? '';
}

async function extractFromHtml(html: string): Promise<string> {
  const dom = new JSDOM(html);
  const text = dom.window.document.body?.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
}

async function fetchAndExtract(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ctype = res.headers.get('content-type') || '';

  if (ctype.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
    const buf = await res.arrayBuffer();
    return extractFromPdf(buf);
  }
  if (
    ctype.includes('officedocument.wordprocessingml.document') ||
    url.toLowerCase().endsWith('.docx')
  ) {
    const buf = await res.arrayBuffer();
    return extractFromDocx(buf);
  }
  if (ctype.includes('text/html') || url.startsWith('http')) {
    const html = await res.text();
    return extractFromHtml(html);
  }
  // Fallback: texto simples
  return await res.text();
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls[] é obrigatório' }, { status: 400 });
    }

    const texts = await Promise.all(
      urls.map(async (u: string) => {
        try {
          return await fetchAndExtract(u);
        } catch (e) {
          console.warn('[ingest] falha em', u, e);
          return '';
        }
      })
    );

    const combined = texts.filter(Boolean).join('\n\n').trim();
    return NextResponse.json({ content: combined });
  } catch (e) {
    console.error('[api/ingest] erro', e);
    return NextResponse.json({ error: 'Falha ao ingerir conteúdo' }, { status: 500 });
  }
}
