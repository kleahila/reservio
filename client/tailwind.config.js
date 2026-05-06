/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        sans:  ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:  ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        // Flat tokens (used directly, no opacity modifier)
        "rv-bg":           "var(--rv-bg)",
        "rv-surface":      "var(--rv-surface)",
        "rv-surface2":     "var(--rv-surface2)",
        "rv-border":       "var(--rv-border)",
        "rv-border2":      "var(--rv-border2)",
        "rv-accent-soft":  "var(--rv-accent-soft)",
        "rv-success-soft": "var(--rv-success-soft)",
        "rv-warning-soft": "var(--rv-warning-soft)",
        "rv-danger-soft":  "var(--rv-danger-soft)",
        // Opacity-capable tokens (RGB channel → Tailwind /opacity modifier)
        "rv-accent":  "rgb(var(--rv-accent) / <alpha-value>)",
        "rv-sea":     "rgb(var(--rv-sea) / <alpha-value>)",
        "rv-olive":   "rgb(var(--rv-olive) / <alpha-value>)",
        "rv-text":    "rgb(var(--rv-text) / <alpha-value>)",
        "rv-muted":   "rgb(var(--rv-muted) / <alpha-value>)",
        "rv-subtle":  "rgb(var(--rv-subtle) / <alpha-value>)",
        "rv-success": "rgb(var(--rv-success) / <alpha-value>)",
        "rv-warning": "rgb(var(--rv-warning) / <alpha-value>)",
        "rv-danger":  "rgb(var(--rv-danger) / <alpha-value>)",
        // Named Mediterranean swatches (for direct use without opacity)
        "med-terracotta": "#C65D3B",
        "med-sand":       "#F2E9DC",
        "med-sea":        "#3A6F73",
        "med-olive":      "#6A7B4F",
      },
    },
  },
  plugins: [],
};
