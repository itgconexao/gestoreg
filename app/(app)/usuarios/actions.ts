"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/app/(app)/movimentos/actions";
import { exigirAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const esquemaUsuario = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome.")
    .max(60, "O nome está muito longo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(8, "A senha provisória deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
  papel: z.enum(["admin", "operador"]),
});

export async function criarUsuario(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  await exigirAdmin();

  const dados = esquemaUsuario.safeParse(Object.fromEntries(formData));
  if (!dados.success) {
    return { n, erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      n,
      erro: "Falta configurar a chave de serviço (SUPABASE_SERVICE_ROLE_KEY) na Vercel.",
    };
  }

  const { nome, email, senha, papel } = dados.data;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (error || !data.user) {
    const jaExiste = error?.message.toLowerCase().includes("already");
    return {
      n,
      erro: jaExiste
        ? "Já existe um usuário com esse e-mail."
        : "Não foi possível criar o usuário.",
    };
  }

  if (papel === "admin") {
    const { error: erroPapel } = await admin
      .from("perfis")
      .update({ papel: "admin" })
      .eq("id", data.user.id);
    if (erroPapel) {
      return {
        n: n + 1,
        erro: "Usuário criado, mas não foi possível torná-lo administrador.",
      };
    }
  }

  revalidatePath("/usuarios");
  return {
    n: n + 1,
    ok: `Usuário ${nome} criado. Entregue a senha provisória pessoalmente.`,
  };
}

const esquemaNome = z
  .string()
  .trim()
  .min(2, "Informe o nome.")
  .max(60, "O nome está muito longo.");

export async function atualizarMeuNome(
  anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const n = anterior.n;
  const perfil = await exigirAdmin();

  const nome = esquemaNome.safeParse(String(formData.get("nome") ?? ""));
  if (!nome.success) {
    return { n, erro: nome.error.issues[0]?.message ?? "Nome inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfis")
    .update({ nome: nome.data })
    .eq("id", perfil.id);
  if (error) return { n, erro: "Não foi possível salvar o nome." };

  revalidatePath("/", "layout");
  return { n: n + 1, ok: "Nome atualizado." };
}
