import type { Metadata } from "next";
import { BotaoApagar } from "@/components/botao-apagar";
import { FormFechamento } from "@/components/form-fechamento";
import { FormContagem, FormNovoCorte } from "@/components/forms-admin";
import Link from "next/link";
import { getPerfil } from "@/lib/auth";
import {
  cabecalhoTabela,
  cartaoTabela,
  celulaTabela,
} from "@/lib/estilos";
import {
  formatarDataHora,
  formatarDataHoraCompleta,
  formatarKg,
} from "@/lib/formatar";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Estoque · Estoque de carnes",
};

const TIPOS = { entrada: "Entrada", saida: "Retirada", ajuste: "Contagem" };

export default async function PaginaEstoque() {
  const perfil = await getPerfil();
  const admin = perfil?.papel === "admin";
  const supabase = await createClient();

  const estoque = await supabase.rpc("estoque_atual");

  // Contagem, cortes e histórico são só do administrador.
  const [movimentos, perfis, cortes, fechamentos] = admin
    ? await Promise.all([
        supabase
          .from("movimentacoes")
          .select(
            "id, tipo, corte_id, quantidade_kg, fornecedor, destino, criado_por, nome_responsavel, criado_em",
          )
          .order("criado_em", { ascending: false })
          .limit(30),
        supabase.from("perfis").select("id, nome"),
        supabase.from("cortes").select("id, nome").order("nome"),
        supabase
          .from("fechamentos")
          .select("id, fechado_em, observacao, fechado_por_nome, zerou")
          .order("fechado_em", { ascending: false }),
      ])
    : [null, null, null, null];

  // Registros de períodos já fechados ficam travados (não podem ser apagados).
  const ultimoFechamento = fechamentos?.data?.[0]?.fechado_em ?? null;

  const nomeCorte = new Map((cortes?.data ?? []).map((c) => [c.id, c.nome]));
  const nomeUsuario = new Map((perfis?.data ?? []).map((p) => [p.id, p.nome]));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-base font-bold">Estoque atual</h2>
        <div className={cartaoTabela}>
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr>
                <th className={cabecalhoTabela}>Corte</th>
                <th className={cabecalhoTabela}>Saldo</th>
                <th className={cabecalhoTabela}>Entradas</th>
                <th className={cabecalhoTabela}>Saídas</th>
                <th className={cabecalhoTabela}>Ajustes</th>
              </tr>
            </thead>
            <tbody>
              {(estoque.data ?? []).map((linha) => (
                <tr key={linha.corte_id}>
                  <td className={celulaTabela}>{linha.nome}</td>
                  <td
                    className={cn(
                      celulaTabela,
                      "font-bold",
                      linha.saldo < 0 && "text-erro",
                    )}
                  >
                    {formatarKg(linha.saldo)}
                  </td>
                  <td className={celulaTabela}>{formatarKg(linha.entradas)}</td>
                  <td className={celulaTabela}>{formatarKg(linha.saidas)}</td>
                  <td className={celulaTabela}>{formatarKg(linha.ajustes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {admin ? (
        <>
      <section>
        <h2 className="mb-1 text-base font-bold">Contagem física</h2>
        <p className="mb-2 text-[13.5px] text-suave">
          Use para informar o estoque inicial ou conferir o freezer. O sistema
          registra a diferença entre o que ele calculava e o que você contou.
        </p>
        <FormContagem cortes={cortes?.data ?? []} />
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold">Novo corte</h2>
        <FormNovoCorte />
      </section>

      <section>
        <h2 className="mb-1 text-base font-bold">Fechamento de estoque</h2>
        <p className="mb-2 text-[13.5px] text-suave">
          {ultimoFechamento
            ? `Período atual: desde ${formatarDataHoraCompleta(ultimoFechamento)}.`
            : "Período atual: desde o início do uso do sistema."}{" "}
          Ao fechar, fica guardada uma cópia dos números do período.
        </p>
        <FormFechamento />

        {(fechamentos?.data ?? []).length > 0 ? (
          <div className={`${cartaoTabela} mt-3`}>
            <table className="w-full min-w-[420px] border-collapse">
              <thead>
                <tr>
                  <th className={cabecalhoTabela}>Fechamento</th>
                  <th className={cabecalhoTabela}>Estoque</th>
                  <th className={cabecalhoTabela}>
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(fechamentos?.data ?? []).map((f) => (
                  <tr key={f.id}>
                    <td className={celulaTabela}>
                      #{f.id} · {formatarDataHoraCompleta(f.fechado_em)}
                      {f.observacao ? ` · ${f.observacao}` : ""}
                    </td>
                    <td className={celulaTabela}>
                      {f.zerou ? "Zerado" : "Mantido"}
                    </td>
                    <td className={celulaTabela}>
                      <Link
                        href={`/estoque/fechamentos/${f.id}`}
                        className="text-[14px] font-semibold text-destaque"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold">Últimos registros</h2>
        <div className={cartaoTabela}>
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr>
                <th className={cabecalhoTabela}>Quando</th>
                <th className={cabecalhoTabela}>Tipo</th>
                <th className={cabecalhoTabela}>Corte</th>
                <th className={cabecalhoTabela}>kg</th>
                <th className={cabecalhoTabela}>Quem</th>
                <th className={cabecalhoTabela}>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(movimentos?.data ?? []).map((mov) => {
                const detalhe = mov.fornecedor ?? mov.destino;
                const sinal =
                  mov.tipo === "saida"
                    ? "-"
                    : mov.quantidade_kg > 0
                      ? "+"
                      : "";
                return (
                  <tr key={mov.id}>
                    <td className={celulaTabela}>
                      {formatarDataHora(mov.criado_em)}
                    </td>
                    <td className={celulaTabela}>
                      {TIPOS[mov.tipo]}
                      {detalhe ? ` (${detalhe})` : ""}
                    </td>
                    <td className={celulaTabela}>
                      {nomeCorte.get(mov.corte_id) ?? "-"}
                    </td>
                    <td className={celulaTabela}>
                      {sinal}
                      {formatarKg(Math.abs(mov.quantidade_kg))}
                    </td>
                    <td className={celulaTabela}>
                      {mov.nome_responsavel ??
                        (mov.criado_por ? nomeUsuario.get(mov.criado_por) : null) ??
                        "-"}
                    </td>
                    <td className={celulaTabela}>
                      {ultimoFechamento &&
                      new Date(mov.criado_em) <= new Date(ultimoFechamento) ? (
                        <span className="text-[13px] text-suave">Fechado</span>
                      ) : (
                        <BotaoApagar id={mov.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {(movimentos?.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-suave" colSpan={6}>
                    Nenhum registro ainda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : null}
    </div>
  );
}
