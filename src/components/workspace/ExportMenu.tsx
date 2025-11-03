import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Copy, 
  Share2, 
  FileText, 
  FileImage, 
  LayoutPanelTop,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';

interface ExportMenuProps {
  format: string;
  onExport: (type: string) => void;
}

export function ExportMenu({ format, onExport }: ExportMenuProps) {
  const exportOptions = [
    { id: 'copy', label: 'Copiar para Clipboard', icon: Copy },
    { id: 'pdf', label: 'Exportar como PDF', icon: FileText },
    { id: 'docx', label: 'Exportar como DOCX', icon: FileText },
    { id: 'images', label: 'Exportar Imagens', icon: FileImage },
    { id: 'slides', label: 'Exportar Slides', icon: LayoutPanelTop },
  ];

  const socialOptions = [
    { id: 'twitter', label: 'Compartilhar no Twitter', icon: Twitter },
    { id: 'linkedin', label: 'Compartilhar no LinkedIn', icon: Linkedin },
    { id: 'facebook', label: 'Compartilhar no Facebook', icon: Facebook },
  ];

  return (
    <div className="fixed bottom-0 right-0 p-6 bg-white rounded-tl-xl shadow-lg border-t border-l">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Exportar</h3>
          <div className="flex flex-wrap gap-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(option.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Compartilhar</h3>
          <div className="flex flex-wrap gap-2">
            {socialOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(option.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
