import { StyleOptions } from '@/domain/narratives/styles';

export function generateCSS(options: StyleOptions): string {
  return `
    .content {
      font-family: ${options.font.family};
      font-size: ${options.font.size}px;
      font-weight: ${options.font.weight};
      line-height: ${options.font.lineHeight};
      color: ${options.colors.text};
      background-color: ${options.colors.background};
      padding: ${options.layout.padding}px;
    }

    .content h1,
    .content h2,
    .content h3 {
      font-family: ${options.elements.headings.fontFamily};
      letter-spacing: ${options.elements.headings.spacing}px;
      font-weight: ${options.elements.headings.weight};
      color: ${options.colors.primary};
    }

    .content h1 {
      font-size: ${options.elements.headings.size.h1}px;
      margin-bottom: ${options.layout.spacing * 1.5}px;
    }

    .content h2 {
      font-size: ${options.elements.headings.size.h2}px;
      margin-bottom: ${options.layout.spacing}px;
    }

    .content h3 {
      font-size: ${options.elements.headings.size.h3}px;
      margin-bottom: ${options.layout.spacing * 0.75}px;
    }

    .content p {
      margin-bottom: ${options.layout.spacing}px;
    }

    .content a {
      color: ${options.elements.links.color};
      text-decoration: ${options.elements.links.style === 'underline' ? 'underline' : 'none'};
      font-weight: ${options.elements.links.style === 'bold' ? '600' : '400'};
      transition: all ${options.animations.duration}ms ease-in-out;
    }

    .content a:hover {
      ${options.elements.links.hoverEffect === 'underline' ? 'text-decoration: underline;' : ''}
      ${options.elements.links.hoverEffect === 'highlight' ? `background-color: ${options.colors.accent}20;` : ''}
    }

    .content img {
      border-radius: ${options.elements.images.radius}px;
      ${options.elements.images.style === 'bordered' ? `border: 1px solid ${options.colors.primary}20;` : ''}
      ${options.elements.images.style === 'shadow' ? 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);' : ''}
      ${options.elements.images.filter ? `filter: ${options.elements.images.filter};` : ''}
      margin: ${options.layout.spacing}px 0;
    }

    .content blockquote {
      font-size: ${options.elements.quotes.fontSize}px;
      color: ${options.elements.quotes.color};
      padding: ${options.layout.spacing}px;
      margin: ${options.layout.spacing}px 0;
      ${options.elements.quotes.style === 'decorative' ? `
        border-left: 4px solid ${options.colors.primary};
        background-color: ${options.colors.primary}05;
      ` : ''}
    }

    .content ul,
    .content ol {
      margin: ${options.layout.spacing}px 0;
      padding-left: ${options.layout.spacing * 1.5}px;
    }

    .content li {
      margin-bottom: ${options.elements.lists.spacing}px;
    }

    .content ul li::marker {
      color: ${options.elements.lists.markerColor};
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: ${options.layout.spacing}px 0;
    }

    .content th {
      background-color: ${options.elements.tables.headerBackground};
      padding: ${options.layout.spacing * 0.75}px;
      text-align: left;
    }

    .content td {
      padding: ${options.layout.spacing * 0.75}px;
      ${options.elements.tables.style === 'bordered' ? `border: 1px solid ${options.elements.tables.borderColor};` : ''}
    }

    .content tr:nth-child(even) {
      ${options.elements.tables.style === 'striped' ? `background-color: ${options.colors.primary}05;` : ''}
    }

    ${options.animations.enabled ? `
      .content * {
        transition: all ${options.animations.duration}ms ease-in-out;
      }

      .content [data-animate] {
        opacity: 0;
        transform: translateY(10px);
      }

      .content [data-animate].animated {
        opacity: 1;
        transform: translateY(0);
      }
    ` : ''}

    ${options.layout.type === 'double' ? `
      .content {
        column-count: 2;
        column-gap: ${options.layout.spacing * 2}px;
      }
    ` : options.layout.type === 'triple' ? `
      .content {
        column-count: 3;
        column-gap: ${options.layout.spacing * 2}px;
      }
    ` : ''}

    ${options.layout.width === 'narrow' ? `
      .content {
        max-width: 680px;
        margin: 0 auto;
      }
    ` : options.layout.width === 'medium' ? `
      .content {
        max-width: 920px;
        margin: 0 auto;
      }
    ` : ''}
  `;
}
