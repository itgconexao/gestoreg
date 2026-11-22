"use client";

import { useState } from "react";
import { excluirFechamento } from "@/app/(app)/estoque/fechamento-actions";
import { botaoSecundario } from "@/lib/estilos";

/** Exclusão em duas etapas: mostra o que será apagado e só então confirma. */
export function BotaoExcluirFechamento({
  id,
  registros,
}: {
  id: number;
  registros: number;
}) {
  const [armado, setArmado] = useState(false);

  if (!armado) {
    return (
      <button
        type="button"
        onClick={() => setArmado(true)}
        className={`${botaoSecundario} text-erro`}
      >
        Excluir este fechamento e os dados do período
      </button>
    );
  }

  return (
    <div className="rounded-[10px] border border-erro bg-erro-fundo p-3.5">
      <p className="mb-3 font-semibold text-erro">
        Isso apaga o fechamento #{id} e {registros}{" "}
        {registros === 1 ? "registro" : "registros"} de entrada, retirada e
        contagem deste período. Não dá para desfazer.
      </p>
      <div className="flex flex-wrap gap-2">
        <form action={excluirFechamento.bind(null, id)}>
          <button
            type="submit"
            className="rounded-[10px] bg-erro px-3.5 py-2 text-[15px] font-bold text-fundo"
          >
            Sim, excluir tudo
          </button>
        </form>
        <button
          type="button"
          onClick={() => setArmado(false)}
          className={botaoSecundario}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
