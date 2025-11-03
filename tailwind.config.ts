// ARQUIVO: tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Cores do Arquiteto de Narrativas V. 3.0
        'bg-profound-blue': '#000033', // Azul Marinho Profundo
        'neon-gold': '#FFD700',        // Ouro Vivo para Destaques
        'text-accent': '#CFB53B',      // Ouro Suave para Textos
        'critical-red': '#FF4500',     // OrangeRed para Alertas Críticos/Analíticos
        'sidebar-bg': '#000022',       // Fundo da Barra Lateral (um pouco mais escuro)
        neon: {
          gold: '#FFD700',
          yellow: '#FFFF00',
          orange: '#FFA500',
        },
      },
      boxShadow: {
        'neon': '0 0 5px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3)',
        'neon-hover': '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;