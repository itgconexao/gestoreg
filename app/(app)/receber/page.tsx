import type { Metadata } from "next";
import { FormMovimento, FormNovoCortePublico } from "@/components/form-movimento";
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
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-base font-bold">Receber carnes</h2>
        <FormMovimento
          modo="entrada"
          cortes={cortes}
          nomeInicial={perfil?.nome}
        />
      </section>

      <section>
        <h2 className="mb-1 text-base font-bold">Novo corte</h2>
        <p className="mb-2 text-[13.5px] text-suave">
          Chegou um corte que não está na lista? Cadastre aqui e ele aparece
          acima para você registrar a entrada.
        </p>
        <FormNovoCortePublico />
      </section>
    </div>
  );
}
