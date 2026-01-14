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

  private getBucketName(path?: string): string {
    if (!this.bucket) {
      throw new Error('Google Cloud Storage não configurado');
    }
    return this.bucket; // bucket não deve incluir subpastas
  }

  async uploadFile(file: File, path = 'uploads'): Promise<string> {
    if (!this.storage || !this.bucket) {
      throw new Error('Google Cloud Storage não configurado');
    }

    const bucket = this.storage.bucket(this.getBucketName());
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
    if (!this.storage || !this.bucket) {
      throw new Error('Google Cloud Storage não configurado');
    }

    const prefix = `https://storage.googleapis.com/${this.bucket}/`;
    const filePath = url.replace(prefix, '');
    const file = this.storage.bucket(this.bucket).file(filePath);
    await file.delete();
  }

  async getSignedUrl(url: string, expiresIn = 3600): Promise<string> {
    if (!this.storage || !this.bucket) {
      throw new Error('Google Cloud Storage não configurado');
    }

    const prefix = `https://storage.googleapis.com/${this.bucket}/`;
    const filePath = url.replace(prefix, '');
    const file = this.storage.bucket(this.bucket).file(filePath);
    
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
