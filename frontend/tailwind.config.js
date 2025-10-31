/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#d4f4ff',
          100: '#81dbfd',
          200: '#7bccf4',
          300: '#60a5fa',
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#0a438c',
          900: '#1e3a8a',
        },
        // Figma color palette
        brand: {
          blue: '#0A438C',
          'blue-light': '#85CEE8',
          'blue-pale': '#EBF2FF',
          'blue-dark': '#003366',
          'blue-medium': '#3A79C9',
          white: '#FFFFFF',
          gray: {
            light: '#F5F5F5',
            medium: '#E7E7E7',
            dark: '#888888',
            'dark-2': '#6E6C70',
            'dark-3': '#888292',
          },
          green: '#007E2C',
          orange: '#E97726',
          red: '#FD0505',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a438c 0%, #1e40af 25%, #2563eb 50%, #3b82f6 75%, #7bccf4 100%)',
      },
    },
  },
  plugins: [],
}
