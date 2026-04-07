/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1B4F72",
          accent: "#2E75B6",
          light: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
