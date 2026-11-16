"use client";

import { useActionState } from "react";
import {
  registrarEntrada,
  registrarSaida,
  type EstadoForm,
} from "@/app/(app)/movimentos/actions";
import { BotaoEnviar, Mensagem } from "@/components/ui";
import { campo, rotuloCampo } from "@/lib/estilos";
import { formatarKg } from "@/lib/formatar";

export type CorteLinha = { id: number; nome: string; saldo: number | null };

const DESTINOS = ["Almoço", "Jantar", "Marmitas", "Outro"];

export function FormMovimento({
  modo,
  cortes,
}: {
  modo: "entrada" | "saida";
  cortes: CorteLinha[];
}) {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    modo === "entrada" ? registrarEntrada : registrarSaida,
    { n: 0 },
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />

      {/* A chave muda a cada registro bem-sucedido e limpa os campos. */}
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        {modo === "entrada" ? (
          <label className={rotuloCampo}>
            Fornecedor
            <input
              name="fornecedor"
              type="text"
              maxLength={120}
              placeholder="Nome do fornecedor"
              className={campo}
            />
          </label>
        ) : (
          <label className={rotuloCampo}>
            Para qual produção?
            <select name="destino" className={campo}>
              {DESTINOS.map((destino) => (
                <option key={destino}>{destino}</option>
              ))}
            </select>
          </label>
        )}

        <ul className="flex flex-col gap-2">
          {cortes.map((corte) => (
            <li
              key={corte.id}
              className="grid grid-cols-[1fr_110px] items-center gap-2 rounded-[10px] border border-borda bg-superficie px-2.5 py-2"
            >
              <label htmlFor={`kg_${corte.id}`} className="font-semibold">
                {corte.nome}
                {corte.saldo !== null ? (
                  <small className="ml-2 font-normal text-suave">
                    {formatarKg(corte.saldo)}
                  </small>
                ) : null}
              </label>
              <input
                id={`kg_${corte.id}`}
                name={`kg_${corte.id}`}
                type="text"
                inputMode="decimal"
                placeholder="kg"
                autoComplete="off"
                className={campo}
              />
            </li>
          ))}
        </ul>

        <BotaoEnviar
          texto={modo === "entrada" ? "Registrar entrada" : "Registrar retirada"}
          textoPendente="Registrando…"
          variante={modo === "entrada" ? "principal" : "saida"}
        />
      </form>
    </div>
  );
}
