/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-elev': 'var(--surface-elev)',
        fg: 'var(--fg)',
        'fg-soft': 'var(--fg-soft)',
        'fg-mute': 'var(--fg-mute)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        'up-fg': 'var(--up-fg)',
        'up-bg': 'var(--up-bg)',
        'down-fg': 'var(--down-fg)',
        'down-bg': 'var(--down-bg)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
      },
      borderRadius: {
        card: '12px',
        modal: '14px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
