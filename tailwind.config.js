/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Soft soothing light-orange cream to replace stark white everywhere
        white: '#fff9f2',
        // Soothing warm terracotta and rich amber-orange brand palette
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Soothing light orange canvas, soft warm apricot cards & deep espresso readable text
        slate: {
          50: '#fcf0e2',   // Soothing light orange-tinted background
          100: '#f8e4cf',  // Soft warm peach tint
          200: '#edd2b7',  // Light warm peach-sand border
          300: '#dfbe9e',  // Muted divider
          400: '#9a775e',  // High-contrast secondary text
          500: '#73523b',  // Crisp warm body text
          600: '#573b27',  // High-contrast readable text
          700: '#402a1a',  // Deep warm text
          800: '#27180e',  // Dark mode warm card
          900: '#1b0f08',  // Dark mode deep espresso surface
          950: '#100804',  // Dark mode darkest base
        },
      },
    },
  },
  plugins: [],
};
