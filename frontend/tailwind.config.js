/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Bhoomi palette: deep indigo ledger-blue + parchment + seal-red accent
        ink: {
          950: "#0F1A2E",
          900: "#152238",
          800: "#1F3050",
          700: "#2B4270",
          600: "#3A5590",
          500: "#4E6DAD",
          400: "#6B8BC5",
          300: "#8FAAD6",
        },
        parchment: {
          50: "#FBF8F1",
          100: "#F4EEDF",
          200: "#E9DFC6",
          300: "#D6CBB0",
        },
        seal: {
          400: "#D05E3E",
          500: "#B5482E",
          600: "#943A25",
        },
        moss: {
          400: "#5E9A5C",
          500: "#4C7A4A",
          600: "#3A5F39",
        },
        amber: {
          400: "#D9A035",
          500: "#C4872A",
          600: "#9E6C1F",
        },
        saffron: {
          500: "#FF9933",
          600: "#E88A2D",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "progress-fill": "progressFill 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        progressFill: { "0%": { width: "0%" }, "100%": { width: "var(--fill-pct)" } },
      },
    },
  },
  plugins: [],
};
