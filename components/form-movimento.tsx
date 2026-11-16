"use client";

import { useActionState, useEffect, useState } from "react";
import {
  criarCortePublico,
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
  nomeInicial,
}: {
  modo: "entrada" | "saida";
  cortes: CorteLinha[];
  /** Nome do usuário logado; sem login, a pessoa digita e o navegador lembra. */
  nomeInicial?: string;
}) {
  const [nome, setNome] = useState(nomeInicial ?? "");

  useEffect(() => {
    if (nomeInicial) return;
    try {
      const guardado = localStorage.getItem("gestoreg:nome");
      if (guardado) setNome(guardado);
    } catch {
      // Sem armazenamento disponível: a pessoa digita o nome a cada vez.
    }
  }, [nomeInicial]);

  function mudarNome(valor: string) {
    setNome(valor);
    try {
      localStorage.setItem("gestoreg:nome", valor);
    } catch {
      // Ignorado de propósito.
    }
  }

  const [estado, acao] = useActionState<EstadoForm, FormData>(
    modo === "entrada" ? registrarEntrada : registrarSaida,
    { n: 0 },
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />

      {/* A chave muda a cada registro bem-sucedido e limpa os campos. */}
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Seu nome
          <input
            name="nome"
            type="text"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            placeholder="Quem está registrando"
            value={nome}
            onChange={(e) => mudarNome(e.target.value)}
            className={campo}
          />
        </label>

        {modo === "entrada" ? (
          <label className={rotuloCampo}>
            Fornecedor
            <input
              name="fornecedor"
              type="text"
              required
              minLength={2}
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

export function FormNovoCortePublico() {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    criarCortePublico,
    { n: 0 },
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Nome do novo corte
          <input
            name="nome_corte"
            type="text"
            required
            minLength={2}
            maxLength={60}
            placeholder="Ex.: Picanha"
            className={campo}
          />
        </label>
        <BotaoEnviar texto="Adicionar corte" textoPendente="Adicionando…" />
      </form>
    </div>
  );
}
