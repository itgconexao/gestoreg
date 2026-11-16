"use client";

import { botaoSecundario } from "@/lib/estilos";

export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${botaoSecundario} print:hidden`}
    >
      Imprimir QR codes
    </button>
  );
}
