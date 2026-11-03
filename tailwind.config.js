/** @type {import('tailwindcss').Config} */
// Charte de la page JVJ (« Nuit 2 étoiles ») : noir #0B0B0C, blanc cassé, un
// seul accent, l'or #E3B64F. Inter Tight pour les titres, Inter pour le reste.
// Les noms de couleur sont ceux de l'espace d'origine (navy = titres, ink =
// texte…) : les écrans n'ont pas à changer, seules les valeurs ont basculé.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#F5F2EA',            // titres et texte fort
        ink: '#C9C7C1',             // texte courant
        muted: '#A8A6A0',           // texte secondaire
        line: '#232326',
        'line-strong': '#343438',
        accent: '#E3B64F',          // l'or
        'accent-light': '#F0D898',
        'accent-pastel': '#221C0D', // fond teinté d'or
        'on-accent': '#0B0B0C',     // texte posé sur l'or
        canvas: '#0B0B0C',          // fond de page
        surface: '#141416',         // cartes
        panel: '#1A1A1D',           // blocs mis en avant
        success: '#5BC98C',
        'success-bg': '#0E2418',
        red: {
          50: '#2A1012',
          100: '#3A1517',
          200: '#5C2023',
          600: '#FF8A8D',
          700: '#FFB0B2',
        },
      },
      fontFamily: {
        display: ['Inter Tight', 'Inter', 'sans-serif'],
        title: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,.03) inset',
        lift: '0 18px 40px rgba(0,0,0,.55)',
      },
    },
  },
  plugins: [],
}
