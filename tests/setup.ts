import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock das funções de fetch para testes
global.fetch = vi.fn();

// Configuração do matchMedia para componentes que precisam
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Limpa todos os mocks depois de cada teste
afterEach(() => {
  vi.clearAllMocks();
});
