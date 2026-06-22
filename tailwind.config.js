/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0E1A',
        surface: '#121829',
        'surface-2': '#1A2238',
        subtle: '#243049',
        accent: '#38BDF8',
        accent2: '#A78BFA',
        'text-primary': '#E6EDF7',
        'text-muted': '#8593AD',
        'text-dim': '#54607A',
        'st-idle': '#54607A',
        'st-work': '#38BDF8',
        'st-wait': '#FBBF24',
        'st-done': '#34D399',
        'st-err': '#F87171',
      },
    },
  },
  plugins: [],
}
