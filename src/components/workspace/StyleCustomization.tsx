import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Image, 
  Layout, 
  Paintbrush, 
  Palette,
  Sliders
} from 'lucide-react';

interface StyleCustomizationProps {
  format: string;
  onStyleChange: (changes: any) => void;
}

export function StyleCustomization({ format, onStyleChange }: StyleCustomizationProps) {
  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 right-0 p-6 bg-white rounded-l-xl shadow-lg border-l">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Personalização</h3>
          
          {/* Tipografia */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Fonte
              </label>
              <select className="mt-1 w-full text-sm border rounded-md p-1">
                <option>Serif</option>
                <option>Sans Serif</option>
                <option>Monospace</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Tamanho do Texto
              </label>
              <input type="range" className="w-full" min="12" max="24" />
            </div>
          </div>

          {/* Cores */}
          <div className="space-y-4 mt-6">
            <label className="text-xs text-gray-500 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Esquema de Cores
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button className="w-8 h-8 rounded-full bg-blue-600"></button>
              <button className="w-8 h-8 rounded-full bg-green-600"></button>
              <button className="w-8 h-8 rounded-full bg-purple-600"></button>
              <button className="w-8 h-8 rounded-full bg-red-600"></button>
              <button className="w-8 h-8 rounded-full bg-yellow-600"></button>
              <button className="w-8 h-8 rounded-full bg-gray-600"></button>
            </div>
          </div>

          {/* Layout */}
          {format === 'blog' && (
            <div className="space-y-4 mt-6">
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 border rounded-md text-xs">Uma Coluna</button>
                <button className="p-2 border rounded-md text-xs">Duas Colunas</button>
              </div>
            </div>
          )}

          {/* Imagens */}
          {format !== 'video' && (
            <div className="space-y-4 mt-6">
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Estilo de Imagem
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 border rounded-md text-xs">Fotografia</button>
                <button className="p-2 border rounded-md text-xs">Ilustração</button>
                <button className="p-2 border rounded-md text-xs">3D</button>
                <button className="p-2 border rounded-md text-xs">Minimalista</button>
              </div>
            </div>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => {
            // Reset to defaults
          }}
        >
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
}
