import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Paleta suave para largas jornadas - Verde suave
        primary: {
          50: '#f8faf9',
          100: '#f1f5f3',
          200: '#e2ebe6',
          300: '#c7d6ce',
          400: '#a8beb1',
          500: '#8ba394', // Verde principal suave
          600: '#6d8a7a',
          700: '#5a7263',
          800: '#4a5d52',
          900: '#3e4e45',
        },
        // Paleta secundaria - Azul suave
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Azul principal suave
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Paleta de acento - Gris cálido
        accent: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c', // Gris cálido principal
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // Información - Azul marino
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Azul información
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Estados con colores suaves
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#8ba394', // Verde suave
          600: '#6d8a7a',
        },
        warning: {
          50: '#fefce8',
          100: '#fef3c7',
          500: '#d97706', // Naranja suave
          600: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc2626', // Rojo suave
          600: '#b91c1c',
        },
        // Estados de OT con colores suaves
        planificada: {
          50: '#fefce8',
          500: '#d97706', // Naranja suave para planificada
        },
        en_ejecucion: {
          50: '#e0f2fe',
          500: '#0ea5e9', // Azul suave para en ejecución
        },
        completada: {
          50: '#f0fdf4',
          500: '#8ba394', // Verde suave para completada
        },
        retrasada: {
          50: '#fef2f2',
          500: '#dc2626', // Rojo suave para retrasada
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #8ba394 0%, #6d8a7a 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
        'gradient-accent': 'linear-gradient(135deg, #78716c 0%, #57534e 100%)',
        'gradient-info': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-warning': 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'gradient-success': 'linear-gradient(135deg, #8ba394 0%, #6d8a7a 100%)',
        'gradient-dark': 'linear-gradient(135deg, #4a5d52 0%, #3e4e45 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8faf9 0%, #f1f5f3 100%)',
        'gradient-agricultural': 'linear-gradient(45deg, #8ba394, #64748b, #0ea5e9)',
        'gradient-nature': 'linear-gradient(135deg, #f8faf9 0%, #f1f5f3 50%, #e2ebe6 100%)',
        'gradient-earth': 'linear-gradient(135deg, #8ba394 0%, #6d8a7a 50%, #5a7263 100%)',
        'gradient-sky': 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(100, 116, 139, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(100, 116, 139, 0.8)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
