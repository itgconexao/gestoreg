"use client";

import { useActionState, useState } from "react";
import { fecharEstoque } from "@/app/(app)/estoque/fechamento-actions";
import type { EstadoForm } from "@/app/(app)/movimentos/actions";
import { BotaoEnviar, Mensagem } from "@/components/ui";
import { botaoSecundario, campo, rotuloCampo } from "@/lib/estilos";

const OPCOES = [
  {
    valor: "manter",
    titulo: "Manter a rodagem",
    texto:
      "O estoque atual continua valendo e vira o saldo inicial do próximo período.",
  },
  {
    valor: "zerar",
    titulo: "Zerar o estoque",
    texto:
      "Todos os saldos voltam a 0 e o próximo período começa do zero (use ao sair do período de teste).",
  },
];

export function FormFechamento() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao] = useActionState<EstadoForm, FormData>(fecharEstoque, {
    n: 0,
  });

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={botaoSecundario}
      >
        Fechar estoque
      </button>
    );
  }

  return (
    <div className="rounded-[10px] border border-borda bg-superficie p-3.5">
      <p className="mb-2 text-[13.5px] text-suave">
        Faça a contagem física antes de fechar. O fechamento guarda uma cópia
        dos números do período e não pode ser desfeito; os registros dele não
        poderão mais ser apagados.
      </p>
      <Mensagem erro={estado.erro} />

      <form action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Observação (opcional)
          <input
            name="observacao"
            type="text"
            maxLength={200}
            placeholder="Ex.: Fim do teste / CMV de novembro"
            className={campo}
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] text-suave">
            O que fazer com o estoque atual?
          </legend>
          {OPCOES.map((opcao) => (
            <label
              key={opcao.valor}
              className="flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-borda p-2.5"
            >
              <input
                type="radio"
                name="modo"
                value={opcao.valor}
                required
                className="mt-1"
              />
              <span>
                <b>{opcao.titulo}</b>
                <span className="block text-[13.5px] text-suave">
                  {opcao.texto}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <BotaoEnviar
          texto="Confirmar fechamento"
          textoPendente="Fechando…"
        />
        <button
          type="button"
          onClick={() => setAberto(false)}
          className={botaoSecundario}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
