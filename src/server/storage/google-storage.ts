import { Storage } from '@google-cloud/storage';
import { BadRequestError, ProviderError } from '@/utils/errors';
import { getGoogleCredentials, env } from '@/config/env';

class StorageService {
  private storage: Storage | null = null;
  private bucket: string | null = null;

  constructor() {
    try {
      const credentials = getGoogleCredentials();
      if (credentials && env.GOOGLE_STORAGE_BUCKET) {
        this.storage = new Storage({
          projectId: credentials.project_id,
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
        });
        this.bucket = env.GOOGLE_STORAGE_BUCKET;
      }
    } catch (error) {
      console.warn('Google Cloud Storage não configurado:', error);
    }
  }

  async uploadPDF(file: Buffer, fileName: string): Promise<string> {
    if (!file || !fileName) {
      throw new BadRequestError('Arquivo ou nome não fornecidos');
    }

    if (!this.storage || !this.bucket) {
      throw new ProviderError('GoogleStorage', 'Google Cloud Storage não configurado');
    }

    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(`pdfs/${fileName}`);
    
    try {
      await blob.save(file, {
        contentType: 'application/pdf',
        metadata: { cacheControl: 'public, max-age=31536000' },
      });

      return `https://storage.googleapis.com/${this.bucket}/pdfs/${fileName}`;
    } catch (error) {
      throw new ProviderError('GoogleStorage', 'Falha no upload do arquivo');
    }
  }

  async downloadPDF(fileName: string): Promise<Buffer> {
    if (!fileName) {
      throw new BadRequestError('Nome do arquivo não fornecido');
    }

    if (!this.storage || !this.bucket) {
      throw new ProviderError('GoogleStorage', 'Google Cloud Storage não configurado');
    }

    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(`pdfs/${fileName}`);

    try {
      const [exists] = await blob.exists();
      if (!exists) {
        throw new BadRequestError('PDF não encontrado');
      }

      const [content] = await blob.download();
      return content;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new ProviderError('GoogleStorage', 'Falha ao baixar o arquivo');
    }
  }
}

export const storageService = new StorageService();