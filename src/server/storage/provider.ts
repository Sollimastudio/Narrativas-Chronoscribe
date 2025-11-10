import { Storage } from '@google-cloud/storage';
import { nanoid } from 'nanoid';
import { getGoogleCredentials, env } from '@/config/env';

// Tipos de arquivo suportados e seus mimetypes
export const SUPPORTED_MIMETYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/png': '.png',
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_MIMETYPES;

interface StorageProvider {
  uploadFile(file: File, path?: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
  getSignedUrl(url: string, expiresIn?: number): Promise<string>;
}

class GoogleCloudStorageProvider implements StorageProvider {
  private storage: Storage | null = null;
  private bucket: string | null = null;
  private isAvailable: boolean = false;
  
  constructor() {
    const credentials = getGoogleCredentials();
    if (credentials && env.GOOGLE_STORAGE_BUCKET) {
      try {
        this.storage = new Storage({
          projectId: credentials.project_id,
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
        });
        this.bucket = env.GOOGLE_STORAGE_BUCKET;
        this.isAvailable = true;
        console.log('✅ Storage provider: Google Cloud Storage configurado');
      } catch (error) {
        console.warn('⚠️ Storage provider: Falha ao inicializar:', error);
      }
    } else {
      console.warn('⚠️ Storage provider: Google Cloud Storage não configurado');
    }
  }

  private checkAvailability() {
    if (!this.isAvailable || !this.storage || !this.bucket) {
      throw new Error('Google Cloud Storage não está configurado. Configure as variáveis de ambiente necessárias.');
    }
  }

  private getBucketName(path?: string): string {
    return this.bucket!; // bucket não deve incluir subpastas
  }

  async uploadFile(file: File, path = 'uploads'): Promise<string> {
    this.checkAvailability();
    
    const bucket = this.storage!.bucket(this.getBucketName());
    const extension = SUPPORTED_MIMETYPES[file.type as SupportedMimeType] || '';
    const fileName = `${nanoid()}${extension}`;
    const fullPath = `${path}/${fileName}`;
    const blob = bucket.file(fullPath);

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    return `https://storage.googleapis.com/${this.bucket}/${fullPath}`;
  }

  async deleteFile(url: string): Promise<void> {
    this.checkAvailability();
    
    const prefix = `https://storage.googleapis.com/${this.bucket}/`;
    const filePath = url.replace(prefix, '');
    const file = this.storage!.bucket(this.bucket!).file(filePath);
    await file.delete();
  }

  async getSignedUrl(url: string, expiresIn = 3600): Promise<string> {
    this.checkAvailability();
    
    const prefix = `https://storage.googleapis.com/${this.bucket}/`;
    const filePath = url.replace(prefix, '');
    const file = this.storage!.bucket(this.bucket!).file(filePath);
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });

    return signedUrl;
  }
}

// Singleton instance
export const storageProvider = new GoogleCloudStorageProvider();
