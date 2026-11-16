import type { Metadata } from "next";
import { FormNome, FormUsuario } from "@/components/forms-admin";
import { exigirAdmin } from "@/lib/auth";
import {
  cabecalhoTabela,
  cartaoTabela,
  celulaTabela,
} from "@/lib/estilos";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Usuários · Estoque de carnes",
};

export default async function PaginaUsuarios() {
  const perfil = await exigirAdmin();
  const supabase = await createClient();

  const { data: usuarios } = await supabase
    .from("perfis")
    .select("id, nome, papel")
    .order("criado_em");

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-base font-bold">Usuários</h2>
        <div className={cartaoTabela}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={cabecalhoTabela}>Nome</th>
                <th className={cabecalhoTabela}>Papel</th>
              </tr>
            </thead>
            <tbody>
              {(usuarios ?? []).map((usuario) => (
                <tr key={usuario.id}>
                  <td className={celulaTabela}>{usuario.nome}</td>
                  <td className={celulaTabela}>
                    {usuario.papel === "admin" ? "Administrador" : "Operador"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold">Novo usuário</h2>
        <FormUsuario />
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold">Meu nome</h2>
        <FormNome nomeAtual={perfil.nome} />
      </section>
    </div>
  );
}
