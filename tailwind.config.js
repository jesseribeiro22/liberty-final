/**tailwind.config.js */
/** @type {import('tailwindcss').Config} */
export default {
  // No v4 o "content" saiu do config e foi para o CSS via @source.
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  // Plugins do Tailwind no v4 podem (e no seu caso já estão) ser carregados no CSS:
  // usamos `@plugin "tailwindcss-animate";` dentro de src/index.css.
  // Por isso removi `plugins: [require(...)]` para evitar erro em ESM.
}
