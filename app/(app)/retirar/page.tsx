import type { Metadata } from "next";
import { FormMovimento } from "@/components/form-movimento";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Retirar · Estoque de carnes",
};

export default async function PaginaRetirar() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("estoque_atual");

  const cortes = (data ?? []).map((linha) => ({
    id: linha.corte_id,
    nome: linha.nome,
    saldo: linha.saldo,
  }));

  return (
    <section>
      <h2 className="mb-3 text-base font-bold">Retirar carnes</h2>
      <FormMovimento modo="saida" cortes={cortes} />
    </section>
  );
}
