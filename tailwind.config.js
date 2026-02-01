/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // The Dark Background
        background: "#0b0f19",
        // The Glass Card Background
        surface: "rgba(15, 23, 42, 0.6)", 
        // Your Brand Blue
        primary: {
          DEFAULT: "#2563eb", // blue-600
          hover: "#1d4ed8",   // blue-700
          foreground: "#ffffff",
        },
        // Borders
        border: "rgba(255, 255, 255, 0.1)",
      },
      borderRadius: {
        lg: "1rem", // Centralized radius
        xl: "1.25rem",
      }
    },
  },
  plugins: [],
}