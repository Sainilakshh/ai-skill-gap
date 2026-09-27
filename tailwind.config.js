/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08090C',
        panel: '#0F1116',
        line: 'rgba(255,255,255,0.08)',
        violet: '#8B5CF6',
        cyan: '#22D3EE',
        amber: '#F5B942',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139,92,246,0.45)',
        glowCyan: '0 0 40px -10px rgba(34,211,238,0.45)',
      },
    },
  },
  plugins: [],
}
