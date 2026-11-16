"use server";

import { revalidatePath } from "next/cache";
import { exigirPerfil } from "@/lib/auth";
import { lerKg } from "@/lib/kg";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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
  await exigirPerfil();

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

  const linhas: Database["public"]["Tables"]["movimentacoes"]["Insert"][] =
    itens.map((item) => ({
      tipo,
      corte_id: item.corteId,
      quantidade_kg: item.kg,
      fornecedor: tipo === "entrada" ? campo || null : null,
      destino: tipo === "saida" ? campo || null : null,
    }));

  const supabase = await createClient();
  const { error } = await supabase.from("movimentacoes").insert(linhas);
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
