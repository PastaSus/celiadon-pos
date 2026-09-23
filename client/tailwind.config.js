/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Palette tokens: hex values from DESIGN.md frontmatter, key names per UX-DR1.
      // brand = primary family, accent = accent family, commit = success deep-teal,
      // ink = navy chrome, canvas = page bg, panel = surface-muted, line = border.
      // Deferred to later stories: chart series, overlay. Slate text ramp and
      // surface white use Tailwind defaults (slate-*, white); focus rings use
      // ring-brand / ring-accent (ring == brand). Navy-chrome accents live
      // under ink (ink-line dividers, ink-text meta) per the Header spec.
      colors: {
        brand: {
          DEFAULT: '#0D75C4',
          hover: '#0A6BB4',
          strong: '#0B5EA6',
          surface: '#D8EEFD',
          subtle: '#EBF6FE',
        },
        accent: {
          DEFAULT: '#02F0FD',
          ink: '#07333D',
        },
        teal: {
          DEFAULT: '#3FE0D0',
        },
        commit: {
          DEFAULT: '#0B7E71',
          hover: '#0A6B61',
          surface: '#CCFBF1',
          text: '#115E59',
        },
        warning: {
          DEFAULT: '#EAB308',
          surface: '#FEF9C3',
          text: '#854D0E',
        },
        danger: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          surface: '#FEE2E2',
          text: '#991B1B',
        },
        ink: {
          DEFAULT: '#0A1929',
          line: '#334155',
          text: '#CBD5E1',
        },
        canvas: {
          DEFAULT: '#E8EDF3',
        },
        panel: {
          DEFAULT: '#F5F8FB',
        },
        line: {
          DEFAULT: '#E0E0E0',
          strong: '#C2CFDB',
        },
      },
    },
  },
  plugins: [],
}
