/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy brand tokens (kept for backward compatibility during migration)
        brand: {
          primary: "#1B4F72",
          accent: "#2E75B6",
          light: "#F8FAFC",
        },
        // Reservio design system tokens — values come from CSS variables
        // Light mode defaults in :root, dark mode overrides in .dark
        "rv-bg":           "var(--rv-bg)",
        "rv-surface":      "var(--rv-surface)",
        "rv-surface2":     "var(--rv-surface2)",
        "rv-border":       "var(--rv-border)",
        "rv-border2":      "var(--rv-border2)",
        "rv-accent-soft":  "var(--rv-accent-soft)",
        "rv-success-soft": "var(--rv-success-soft)",
        "rv-warning-soft": "var(--rv-warning-soft)",
        "rv-danger-soft":  "var(--rv-danger-soft)",
        // Opacity-capable tokens (RGB channel format for Tailwind /opacity modifier)
        "rv-accent":   "rgb(var(--rv-accent) / <alpha-value>)",
        "rv-text":     "rgb(var(--rv-text) / <alpha-value>)",
        "rv-muted":    "rgb(var(--rv-muted) / <alpha-value>)",
        "rv-subtle":   "rgb(var(--rv-subtle) / <alpha-value>)",
        "rv-success":  "rgb(var(--rv-success) / <alpha-value>)",
        "rv-warning":  "rgb(var(--rv-warning) / <alpha-value>)",
        "rv-danger":   "rgb(var(--rv-danger) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
