import type { Metadata } from "next";
import { FormMovimento } from "@/components/form-movimento";
import { getPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Receber · Estoque de carnes",
};

export default async function PaginaReceber() {
  const supabase = await createClient();
  const [perfil, { data }] = await Promise.all([
    getPerfil(),
    supabase.rpc("cortes_publicos"),
  ]);

  const cortes = (data ?? []).map((corte) => ({ ...corte, saldo: null }));

  return (
    <section>
      <h2 className="mb-3 text-base font-bold">Receber carnes</h2>
      <FormMovimento
        modo="entrada"
        cortes={cortes}
        nomeInicial={perfil?.nome}
      />
    </section>
  );
}
