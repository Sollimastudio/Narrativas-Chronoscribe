import { Storage } from '@google-cloud/storage';
import { BadRequestError, ProviderError } from '@/utils/errors';
import { getGoogleCredentials, env } from '@/config/env';

class StorageService {
  private storage: Storage | null = null;
  private bucket: string | null = null;

  private initStorage() {
    if (!this.storage) {
      const credentials = getGoogleCredentials();
      this.storage = new Storage({
        projectId: credentials.project_id,
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
      });
      if (!env.GOOGLE_STORAGE_BUCKET) {
        throw new Error('GOOGLE_STORAGE_BUCKET não configurado');
      }
      this.bucket = env.GOOGLE_STORAGE_BUCKET;
    }
    return { storage: this.storage, bucket: this.bucket! };
  }

  async uploadPDF(file: Buffer, fileName: string): Promise<string> {
    if (!file || !fileName) {
      throw new BadRequestError('Arquivo ou nome não fornecidos');
    }

    const { storage, bucket: bucketName } = this.initStorage();
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(`pdfs/${fileName}`);
    
    try {
      await blob.save(file, {
        contentType: 'application/pdf',
        metadata: { cacheControl: 'public, max-age=31536000' },
      });

      return `https://storage.googleapis.com/${bucketName}/pdfs/${fileName}`;
    } catch (error) {
      throw new ProviderError('GoogleStorage', 'Falha no upload do arquivo');
    }
  }

  async downloadPDF(fileName: string): Promise<Buffer> {
    if (!fileName) {
      throw new BadRequestError('Nome do arquivo não fornecido');
    }

    const { storage, bucket: bucketName } = this.initStorage();
    const bucket = storage.bucket(bucketName);
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