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
      // Deferred to later stories: success-surface/text, warning/danger fills, chart
      // series, overlay. Slate text ramp and surface white use Tailwind defaults
      // (slate-*, white); focus rings use ring-brand / ring-accent (ring == brand).
      colors: {
        brand: {
          DEFAULT: '#1690E8',
          hover: '#0E7BCB',
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
        },
        ink: {
          DEFAULT: '#0A1929',
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
