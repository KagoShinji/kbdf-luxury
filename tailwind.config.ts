import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#2f4065',
          pink: '#fb7a90',
          peach: '#fac29f',
          coral: '#f79492',
        },
        typography: {
          primary: '#2f4065',
          accent: '#f16881',
          muted: '#666666',
        },
        surface: {
          white: '#ffffff',
          offWhite: '#fcf1f1',
          light: '#fae6e6',
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', '"Helvetica"', '"Arial"', 'sans-serif'],
        serif: ['"Playfair Display"', '"Times New Roman"', 'serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      boxShadow: {
        'diffusion': '0 20px 40px -15px rgba(52, 84, 120, 0.05)',
        'inner-glass': 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  plugins: [],
} satisfies Config
