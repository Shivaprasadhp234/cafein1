import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          50: '#FAF9F6',  // Creamy White
          100: '#f5f5f4', // stone-100 (keeping for subtle backgrounds)
          200: '#e7e5e4', // stone-200
          600: '#d97706', // amber-600 (keeping for accents)
          700: '#b45309', // amber-700
          charcoal: '#1A1110', // Deep Coffee Black
          slate: '#78716C', // Warm Slate (Stone 500)
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
