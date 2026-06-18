import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5b3df5",
          50: "#f1eefe",
          100: "#e2dafe",
          500: "#5b3df5",
          600: "#4628d6",
          700: "#3920ad",
        },
        ink: {
          DEFAULT: "#0f0f1a",
          muted: "#5a5a72",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
