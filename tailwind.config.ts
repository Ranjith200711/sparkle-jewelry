import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        gold: {
          50: '#fffdf5',
          100: '#fef9e8',
          200: '#fcf0c3',
          300: '#f8e18e',
          400: '#f2cd56',
          500: '#e5b326',
          600: '#c89218',
          700: '#9f6c15',
          800: '#815617',
          900: '#6d4617',
        },
      },
    },
  },
  plugins: [],
};
export default config;
