/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#ede9fe',
          300: '#c4b5fd',
          500: '#8b5cf6',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        accent: {
          100: '#ecfeff',
          300: '#67e8f9',
          500: '#06b6d4',
          700: '#0e7490',
          900: '#083344',
        },
        neutral: {
          100: '#f5f5f5',
          300: '#374151',
          500: '#1f2937',
          700: '#111827',
          900: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
}

