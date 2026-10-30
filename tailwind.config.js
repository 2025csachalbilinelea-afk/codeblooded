/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#1b4332',
          900: '#081c15',
          950: '#030d09',
        },
        sage: {
          50: '#f6f7f5',
          100: '#e8ebe5',
          200: '#d3dbcd',
          300: '#b4c3ab',
          400: '#8fa583',
          500: '#718a64',
          600: '#586f4d',
          700: '#46583e',
          800: '#3a4734',
          900: '#323c2d',
        },
        warmbg: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

