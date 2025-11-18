import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jamaica: {
          gold: '#FDB913',
          green: '#009B3A',
          black: '#000000',
        },
      },
    },
  },
  plugins: [],
};

export default config;
