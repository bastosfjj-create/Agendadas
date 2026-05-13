import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#D4AF37', // Dourado
          dark: '#B08D28',
        },
        navy: {
          DEFAULT: '#0F172A',
        },
        dark: {
          100: '#2A2A2A',
          200: '#1E1E1E',
          300: '#121212',
        }
      },
    },
  },
  plugins: [],
};
export default config;
