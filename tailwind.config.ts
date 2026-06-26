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
        background: "#FFFFFF",
        surface: "#FFFFFF",
        foreground: "#000000",
        shell: "#085020",
        primary: "#F83028",
        accent: "#80B040",
        fleshLight: "#FF7878",
        cream: "#D0C098",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #000000",
        "brutal-sm": "3px 3px 0 0 #000000",
      },
      borderRadius: {
        brutal: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
