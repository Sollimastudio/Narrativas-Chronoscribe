import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { env, getGoogleCredentials } from '@/config/env';
import fs from 'fs/promises';
import path from 'path';
import * as mammoth from 'mammoth';

export const runtime = 'nodejs';

async function loadPdfJs() {
  // @ts-ignore
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjs as any;
}

// Initialize Google Cloud Storage using service account credentials (optional)
let storage: Storage | null = null;
let bucket: any = null;

try {
  const credentials = getGoogleCredentials();
  if (credentials && env.GOOGLE_STORAGE_BUCKET) {
    storage = new Storage({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
    bucket = storage.bucket(env.GOOGLE_STORAGE_BUCKET);
    console.log('✅ Upload route: Google Cloud Storage configurado');
  } else {
    console.warn('⚠️ Upload route: Google Cloud Storage não configurado. Usando armazenamento local.');
  }
} catch (error) {
  console.warn('⚠️ Upload route: Falha ao inicializar Google Cloud Storage:', error);
}

async function extractFromPdf(input: ArrayBuffer | Buffer): Promise<string> {
  const data = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const pdfjsLib = await loadPdfJs();
  // @ts-ignore - node build
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const max = pdf.numPages;
  let full = '';
  for (let p = 1; p <= max; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str ?? '').join(' ');
    full += text + '\n\n';
  }
  return full.trim();
}

async function extractFromDocx(input: ArrayBuffer | Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const res = await mammoth.extractRawText({ buffer });
  return (res.value ?? '').trim();
}

async function extractText(file: File, buffer: Buffer): Promise<string> {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();

  try {
    if (name.endsWith('.pdf') || type.includes('pdf')) {
      return await extractFromPdf(buffer);
    }
    if (name.endsWith('.docx') || type.includes('officedocument.wordprocessingml.document')) {
      return await extractFromDocx(buffer);
    }
    if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) {
      return buffer.toString('utf8');
    }
  } catch (e) {
    console.warn('[upload] extraction failed for', file.name, e);
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Suporte a múltiplos arquivos (formData.getAll)
    const incoming = formData.getAll('file').filter(Boolean) as File[];
    const single = formData.get('file') as File | null;
    const files: File[] = incoming.length > 0 ? incoming : (single ? [single] : []);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const uploadOne = async (file: File) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filename = `${Date.now()}-${safeName}`;

      // Extrai texto quando possível
      const extractedText = await extractText(file, buffer);

      // Try Google Cloud Storage first if available
      if (bucket) {
        try {
          const blob = bucket.file(filename);
          const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.type || 'application/octet-stream',
            metadata: { contentType: file.type || 'application/octet-stream' },
          });

          await new Promise((resolve, reject) => {
            blobStream.on('finish', resolve);
            blobStream.on('error', (err: Error) => {
              console.error('GCS Upload Error:', err);
              reject(new Error('Could not upload the file.'));
            });
            blobStream.end(buffer);
          });

          // Make file public (optional). Comment out if you want private uploads.
          try {
            await blob.makePublic();
          } catch (e) {
            console.warn('Failed to make file public. Check bucket ACL policies.');
          }

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          return { success: true, url: publicUrl, name: filename, type: file.type, extractedText };
        } catch (cloudErr) {
          console.warn('Falling back to local upload due to cloud error:', cloudErr);
        }
      }

      // Fallback to local storage
      if (process.env.NODE_ENV === 'development' || !bucket) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const localPath = path.join(uploadsDir, filename);
        await fs.writeFile(localPath, buffer);
        const localUrl = `/uploads/${filename}`;
        return { success: true, url: localUrl, name: filename, type: file.type, extractedText, local: true };
      }

      throw new Error('Upload failed and no fallback available.');
    };

    const results = await Promise.all(files.map(uploadOne));

    const extractedCombinedText = results.map(r => r.extractedText || '').filter(Boolean).join('\n\n').trim();

    // Compat: se apenas um arquivo, manter campos de topo; sempre retornar files[]
    if (results.length === 1) {
      const [r] = results;
      return NextResponse.json({ success: true, url: r.url, name: r.name, files: results, extractedCombinedText });
    }

    return NextResponse.json({ success: true, files: results, extractedCombinedText });
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
