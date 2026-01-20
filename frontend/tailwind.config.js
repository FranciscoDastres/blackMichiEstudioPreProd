/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Trebuchet MS"', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: "hsl(var(--muted))",
        secondary: "hsl(var(--secondary))",
        border: "hsl(var(--border))",
      },

      // 👇 AQUI agregamos el background radial
      backgroundImage: {
        grid:
          "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.04) 1px, transparent 0)",
      },

      backgroundSize: {
        grid: "32px 32px",
      },
    },
  },
  plugins: [],
};
