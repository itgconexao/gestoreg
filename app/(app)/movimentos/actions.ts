"use server";

import { revalidatePath } from "next/cache";
import { lerKg } from "@/lib/kg";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { n: number; ok?: string; erro?: string };

type Item = { corteId: number; kg: number };

/** Lê os campos kg_<id> do formulário. Devolve a lista de itens ou uma mensagem de erro. */
function lerItens(formData: FormData): Item[] | string {
  const itens: Item[] = [];

  for (const [chave, valor] of formData.entries()) {
    if (!chave.startsWith("kg_")) continue;
    if (typeof valor !== "string" || valor.trim() === "") continue;

    const corteId = Number(chave.slice(3));
    const kg = lerKg(valor);
    if (!Number.isInteger(corteId) || kg === null) {
      return `Peso inválido: "${valor}". Use um número maior que zero, como 2,5.`;
    }
    itens.push({ corteId, kg });
  }

  return itens;
}

async function registrar(
  tipo: "entrada" | "saida",
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2 || nome.length > 60) {
    return { n, erro: "Informe seu nome (entre 2 e 60 letras)." };
  }

  const itens = lerItens(formData);
  if (typeof itens === "string") return { n, erro: itens };
  if (itens.length === 0) {
    return { n, erro: "Informe o peso em kg de pelo menos um corte." };
  }

  const campo = String(
    formData.get(tipo === "entrada" ? "fornecedor" : "destino") ?? "",
  )
    .trim()
    .slice(0, 120);

  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_movimento_publico", {
    p_tipo: tipo,
    p_nome: nome,
    p_detalhe: campo,
    p_itens: itens.map((item) => ({ corte_id: item.corteId, kg: item.kg })),
  });
  if (error) {
    return {
      n,
      erro: "Não foi possível registrar. Confira a conexão e tente de novo.",
    };
  }

  revalidatePath("/retirar");
  revalidatePath("/estoque");

  const rotulo = tipo === "entrada" ? "Entrada" : "Retirada";
  const total = itens.length;
  return {
    n: n + 1,
    ok: `${rotulo} registrada: ${total} ${total === 1 ? "corte" : "cortes"}.`,
  };
}

export async function registrarEntrada(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  return registrar("entrada", anterior, formData);
}

export async function registrarSaida(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  return registrar("saida", anterior, formData);
}
