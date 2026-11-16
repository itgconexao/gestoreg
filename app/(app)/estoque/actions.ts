"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/app/(app)/movimentos/actions";
import { exigirAdmin } from "@/lib/auth";
import { formatarKg } from "@/lib/formatar";
import { lerKg } from "@/lib/kg";
import { createClient } from "@/lib/supabase/server";

export async function registrarContagem(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  await exigirAdmin();

  const corteId = Number(formData.get("corte_id"));
  const kg = lerKg(String(formData.get("kg") ?? ""), true);

  if (!Number.isInteger(corteId) || corteId <= 0) {
    return { n, erro: "Escolha o corte." };
  }
  if (kg === null) {
    return { n, erro: "Informe o peso contado em kg (use 0 se acabou)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("registrar_contagem", {
    p_corte_id: corteId,
    p_kg: kg,
  });
  if (error) return { n, erro: "Não foi possível registrar a contagem." };

  revalidatePath("/estoque");
  revalidatePath("/retirar");

  const diferenca = data ?? 0;
  const sinal = diferenca > 0 ? "+" : "";
  return {
    n: n + 1,
    ok: `Contagem registrada. Diferença para o estoque calculado: ${sinal}${formatarKg(diferenca)}.`,
  };
}

const esquemaCorte = z
  .string()
  .trim()
  .min(2, "Informe o nome do corte.")
  .max(60, "O nome do corte está muito longo.");

export async function criarCorte(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  await exigirAdmin();

  const nome = esquemaCorte.safeParse(String(formData.get("nome") ?? ""));
  if (!nome.success) {
    return { n, erro: nome.error.issues[0]?.message ?? "Nome inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cortes").insert({ nome: nome.data });
  if (error) {
    return {
      n,
      erro:
        error.code === "23505"
          ? "Esse corte já existe."
          : "Não foi possível adicionar o corte.",
    };
  }

  revalidatePath("/estoque");
  revalidatePath("/receber");
  revalidatePath("/retirar");
  return { n: n + 1, ok: `Corte "${nome.data}" adicionado.` };
}

export async function apagarMovimento(id: number, _formData: FormData) {
  void _formData;
  await exigirAdmin();

  const supabase = await createClient();
  await supabase.from("movimentacoes").delete().eq("id", id);

  revalidatePath("/estoque");
  revalidatePath("/retirar");
}
