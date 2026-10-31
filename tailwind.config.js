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
          forest: '#173B2C',      // Primary forest green
          deep: '#102B20',        // Deep green
          primary: '#176B49',     // Balanced natural green
          fresh: '#279565',       // Vibrant leaf green for accents/CTAs
          mint: '#D9EBDD',        // Soft mint green
          sage: '#E5F1E8',        // Secondary sage green
          cream: '#F6F4EA',       // Warm ivory background
          white: '#FFFFFF',       // Pure white
          beige: '#E9E2D3',       // Earth beige
          gold: '#C6A878',        // Harvest gold accent
          charcoal: '#24352D',    // Primary text
          muted: '#718078',       // Secondary text
          border: '#DCE5DC',      // Soft earthy border
          terracotta: '#B96F4B',  // Terracotta accent
        },
        forest: {
          50: '#f0fdf4',
          100: '#D9EBDD',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#279565',
          600: '#176B49',
          700: '#173B2C',
          800: '#102B20',
          900: '#081c15',
          950: '#030d09',
        },
        sage: {
          50: '#E5F1E8',
          100: '#e8ebe5',
          200: '#DCE5DC',
          300: '#b4c3ab',
          400: '#8fa583',
          500: '#718a64',
          600: '#586f4d',
          700: '#46583e',
          800: '#3a4734',
          900: '#24352D',
        },
        warmbg: {
          50: '#F6F4EA',
          100: '#f5f5f4',
          200: '#E9E2D3',
          300: '#DCE5DC',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'rural-soft': '0 2px 10px -2px rgba(23, 59, 44, 0.05), 0 1px 3px -1px rgba(23, 59, 44, 0.03)',
        'rural-card': '0 8px 30px -4px rgba(23, 59, 44, 0.07), 0 2px 8px -2px rgba(23, 59, 44, 0.04)',
        'rural-elevated': '0 20px 45px -10px rgba(23, 59, 44, 0.12), 0 4px 12px -2px rgba(23, 59, 44, 0.06)',
      }
    },
  },
  plugins: [],
}
