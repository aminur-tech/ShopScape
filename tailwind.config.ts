import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f9ec",
          100: "#dcf0cc",
          400: "#8fce55",
          500: "#6fb93a",
          600: "#5aa02c",
          700: "#478023",
        },
        sale: "#e5342b",
      },
      fontFamily: {
        sans: [
          "Hind Siliguri",
          "Noto Sans Bengali",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
