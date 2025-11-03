import { GeneratedNarrative } from '@/domain/narratives/blueprint';

interface ShareMetadata {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export class SocialShare {
  constructor(private content: GeneratedNarrative, private baseUrl: string) {}

  private getMetadata(): ShareMetadata {
    return {
      title: this.content.titulo,
      description: this.content.subtitulo || this.content.conteudo[0]?.texto.slice(0, 200) + '...',
      url: `${this.baseUrl}/share/${this.content.id}`,
      image: this.content.promptImagem, // Se houver uma imagem gerada
    };
  }

  getTwitterShareUrl(): string {
    const metadata = this.getMetadata();
    const params = new URLSearchParams({
      text: `${metadata.title}\n\n${metadata.description}`,
      url: metadata.url,
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  getLinkedInShareUrl(): string {
    const metadata = this.getMetadata();
    const params = new URLSearchParams({
      url: metadata.url,
      title: metadata.title,
      summary: metadata.description,
      source: 'Chronoscribe',
    });
    return `https://www.linkedin.com/shareArticle?mini=true&${params.toString()}`;
  }

  getFacebookShareUrl(): string {
    const metadata = this.getMetadata();
    const params = new URLSearchParams({
      u: metadata.url,
    });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  getWhatsAppShareUrl(): string {
    const metadata = this.getMetadata();
    const text = `${metadata.title}\n\n${metadata.description}\n\n${metadata.url}`;
    const params = new URLSearchParams({
      text,
    });
    return `https://wa.me/?${params.toString()}`;
  }

  getTelegramShareUrl(): string {
    const metadata = this.getMetadata();
    const params = new URLSearchParams({
      url: metadata.url,
      text: `${metadata.title}\n\n${metadata.description}`,
    });
    return `https://t.me/share/url?${params.toString()}`;
  }

  getEmailShareUrl(): string {
    const metadata = this.getMetadata();
    const params = new URLSearchParams({
      subject: metadata.title,
      body: `${metadata.description}\n\nLeia mais em: ${metadata.url}`,
    });
    return `mailto:?${params.toString()}`;
  }

  // Gera um código de incorporação para blogs/sites
  getEmbedCode(): string {
    const metadata = this.getMetadata();
    return `<iframe
      src="${metadata.url}/embed"
      width="100%"
      height="500"
      frameborder="0"
      allowfullscreen
    ></iframe>`;
  }

  // Gera uma versão curta para compartilhamento
  async getShortUrl(): Promise<string> {
    const metadata = this.getMetadata();
    // TODO: Integrar com um serviço de encurtamento de URLs
    return metadata.url;
  }

  // Gera QR Code para compartilhamento offline
  async getQRCode(): Promise<string> {
    const metadata = this.getMetadata();
    const QRCode = require('qrcode');
    return QRCode.toDataURL(metadata.url);
  }
}
