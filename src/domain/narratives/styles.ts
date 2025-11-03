export interface StyleOptions {
  // Tipografia
  font: {
    family: string;
    size: number;
    weight: number;
    lineHeight: number;
  };
  
  // Cores
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  
  // Layout
  layout: {
    type: 'single' | 'double' | 'triple';
    width: 'narrow' | 'medium' | 'wide';
    spacing: number;
    padding: number;
  };
  
  // Elementos
  elements: {
    headings: {
      fontFamily: string;
      size: {
        h1: number;
        h2: number;
        h3: number;
      };
      weight: number;
      spacing: number;
      transform?: 'uppercase' | 'capitalize' | 'none';
    };
    images: {
      style: 'minimal' | 'bordered' | 'shadow';
      radius: number;
      filter?: string;
    };
    links: {
      style: 'underline' | 'bold' | 'subtle';
      color: string;
      hoverEffect: 'none' | 'underline' | 'highlight';
    };
    lists: {
      style: 'default' | 'custom';
      markerColor: string;
      spacing: number;
    };
    quotes: {
      style: 'simple' | 'decorative';
      fontSize: number;
      color: string;
      borderStyle?: string;
    };
    tables: {
      style: 'simple' | 'striped' | 'bordered';
      headerBackground: string;
      borderColor: string;
    };
  };

  // Animações
  animations: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'scale';
    duration: number;
  };
}

export const defaultStyleOptions: StyleOptions = {
  font: {
    family: 'Inter, system-ui, sans-serif',
    size: 16,
    weight: 400,
    lineHeight: 1.5,
  },
  colors: {
    primary: '#1a56db',
    secondary: '#7e22ce',
    background: '#ffffff',
    text: '#111827',
    accent: '#f59e0b',
  },
  layout: {
    type: 'single',
    width: 'medium',
    spacing: 24,
    padding: 32,
  },
  elements: {
    headings: {
      fontFamily: 'Inter, system-ui, sans-serif',
      size: {
        h1: 32,
        h2: 24,
        h3: 20,
      },
      weight: 700,
      spacing: 0.8,
    },
    images: {
      style: 'minimal',
      radius: 8,
    },
    links: {
      style: 'underline',
      color: '#1a56db',
      hoverEffect: 'underline',
    },
    lists: {
      style: 'default',
      markerColor: '#1a56db',
      spacing: 8,
    },
    quotes: {
      style: 'simple',
      fontSize: 18,
      color: '#4b5563',
    },
    tables: {
      style: 'simple',
      headerBackground: '#f3f4f6',
      borderColor: '#e5e7eb',
    },
  },
  animations: {
    enabled: true,
    type: 'fade',
    duration: 300,
  },
};
