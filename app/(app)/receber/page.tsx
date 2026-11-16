import type { Metadata } from "next";
import { FormMovimento } from "@/components/form-movimento";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Receber · Estoque de carnes",
};

export default async function PaginaReceber() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cortes")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  const cortes = (data ?? []).map((corte) => ({ ...corte, saldo: null }));

  return (
    <section>
      <h2 className="mb-3 text-base font-bold">Receber carnes</h2>
      <FormMovimento modo="entrada" cortes={cortes} />
    </section>
  );
}
