export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          light: "#FAF9F6",
          dark: "#0B0E14",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#141824",
        },
        ink: {
          light: "#14161C",
          dark: "#E7E9EE",
        },
        muted: {
          light: "#6B7280",
          dark: "#9AA1B1",
        },
        primary: {
          DEFAULT: "#00C2A8",
          50: "#E6FBF7",
          100: "#CCF7EF",
          200: "#99EFDF",
          300: "#66E7CF",
          400: "#33DFBF",
          500: "#00C2A8",
          600: "#009B86",
          700: "#007465",
          800: "#004D43",
          900: "#002622",
        },
        accent: {
          DEFAULT: "#FFB020",
          light: "#FFD98A",
          dark: "#CC8800",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(0, 194, 168, 0.45)",
        card: "0 4px 24px -8px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        spinSlow: "spinSlow 12s linear infinite",
      },
    },
  },
  plugins: [],
};
