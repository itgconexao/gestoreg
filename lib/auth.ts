import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Perfil do usuário logado (ou null). Chamado várias vezes, consulta uma só vez por requisição. */
export const getPerfil = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, nome, papel")
    .eq("id", user.id)
    .single();

  return perfil;
});

/** Garante que há um usuário logado; senão manda para o login. */
export async function exigirPerfil() {
  const perfil = await getPerfil();
  if (!perfil) redirect("/login");
  return perfil;
}

/** Garante que o usuário logado é admin; senão manda para a página inicial. */
export async function exigirAdmin() {
  const perfil = await exigirPerfil();
  if (perfil.papel !== "admin") redirect("/");
  return perfil;
}
