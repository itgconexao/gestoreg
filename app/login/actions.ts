"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { destinoSeguro } from "@/lib/destino-seguro";
import { createClient } from "@/lib/supabase/server";

const esquemaLogin = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
  next: z.string().optional(),
});

export type EstadoLogin = { erro?: string };

export async function entrar(
  _anterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const dados = esquemaLogin.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    next: formData.get("next") ?? undefined,
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error) {
    // Mensagem genérica: não revela se o e-mail existe.
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect(destinoSeguro(dados.data.next));
}
