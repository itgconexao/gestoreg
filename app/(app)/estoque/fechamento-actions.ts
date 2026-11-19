"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoForm } from "@/app/(app)/movimentos/actions";
import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function fecharEstoque(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  await exigirAdmin();

  const modo = String(formData.get("modo") ?? "");
  if (modo !== "manter" && modo !== "zerar") {
    return { n, erro: "Escolha se o estoque deve ser mantido ou zerado." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fechar_estoque", {
    p_observacao: String(formData.get("observacao") ?? "").slice(0, 200),
    p_zerar: modo === "zerar",
  });

  if (error) {
    return {
      n,
      erro:
        error.code === "P0002"
          ? "Não há movimentações desde o último fechamento."
          : "Não foi possível fechar o estoque. Tente de novo.",
    };
  }

  revalidatePath("/estoque");
  revalidatePath("/retirar");
  redirect(`/estoque/fechamentos/${data}`);
}
