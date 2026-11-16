"use client";

import { useEffect, useState } from "react";
import { apagarMovimento } from "@/app/(app)/estoque/actions";

/** Apagar em dois toques: o primeiro pede confirmação e se desfaz sozinho após 4 segundos. */
export function BotaoApagar({ id }: { id: number }) {
  const [armado, setArmado] = useState(false);

  useEffect(() => {
    if (!armado) return;
    const tempo = setTimeout(() => setArmado(false), 4000);
    return () => clearTimeout(tempo);
  }, [armado]);

  if (!armado) {
    return (
      <button
        type="button"
        onClick={() => setArmado(true)}
        className="text-[14px] font-semibold text-erro"
      >
        Apagar
      </button>
    );
  }

  return (
    <form action={apagarMovimento.bind(null, id)}>
      <button type="submit" className="text-[14px] font-bold text-erro underline">
        Confirmar
      </button>
    </form>
  );
}
