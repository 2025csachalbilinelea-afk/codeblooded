/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rural: {
          forest: '#123D2C',      // Deep forest green
          deep: '#0B2B20',        // Dark botanical green
          primary: '#176B49',     // Balanced natural green
          fresh: '#279565',       // Vibrant leaf green for accents/CTAs
          mint: '#DDF2E5',        // Soft mint green
          sage: '#EDF5EC',        // Pale sage background
          cream: '#F8F6EF',       // Warm cream background
          white: '#FFFFFF',       // Pure white
          beige: '#E9E2D3',       // Subtle earth beige
          charcoal: '#24352C',    // Dark charcoal-green text
          muted: '#68776D',       // Muted botanical text
          border: '#DCE5DA',      // Soft earthy border
          terracotta: '#B96F4B',  // Restrained terracotta accent
        },
        // Retain existing color tokens for smooth compatibility
        forest: {
          50: '#f0fdf4',
          100: '#DDF2E5',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#279565',
          600: '#176B49',
          700: '#123D2C',
          800: '#0B2B20',
          900: '#081c15',
          950: '#030d09',
        },
        sage: {
          50: '#EDF5EC',
          100: '#e8ebe5',
          200: '#DCE5DA',
          300: '#b4c3ab',
          400: '#8fa583',
          500: '#718a64',
          600: '#586f4d',
          700: '#46583e',
          800: '#3a4734',
          900: '#24352C',
        },
        warmbg: {
          50: '#F8F6EF',
          100: '#f5f5f4',
          200: '#E9E2D3',
          300: '#DCE5DA',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'rural-soft': '0 2px 10px -2px rgba(18, 61, 44, 0.05), 0 1px 3px 0 rgba(18, 61, 44, 0.03)',
        'rural-card': '0 4px 20px -4px rgba(18, 61, 44, 0.08), 0 2px 6px -1px rgba(18, 61, 44, 0.04)',
        'rural-elevated': '0 10px 30px -5px rgba(18, 61, 44, 0.12), 0 4px 10px -2px rgba(18, 61, 44, 0.05)',
      }
    },
  },
  plugins: [],
}
