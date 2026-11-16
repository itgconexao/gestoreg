import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fundo: "var(--bg)",
        superficie: "var(--sf)",
        tinta: "var(--ink)",
        suave: "var(--mut)",
        borda: "var(--line)",
        destaque: "var(--ac)",
        "destaque-fundo": "var(--acs)",
        aviso: "var(--wa)",
        "aviso-fundo": "var(--was)",
        erro: "var(--er)",
        "erro-fundo": "var(--ers)",
        saida: "var(--sa)",
        "saida-fundo": "var(--sas)",
      },
      fontFamily: {
        sans: [
          "var(--fonte-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
