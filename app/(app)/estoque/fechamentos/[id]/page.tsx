import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/auth";
import {
  botaoSecundario,
  cabecalhoTabela,
  cartaoTabela,
  celulaTabela,
} from "@/lib/estilos";
import { formatarDataHoraCompleta, formatarKg } from "@/lib/formatar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Fechamento · Estoque de carnes",
};

export default async function PaginaFechamento({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  await exigirAdmin();
  const { id: idTexto } = await params;
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = await createClient();
  const [fechamento, itens] = await Promise.all([
    supabase
      .from("fechamentos")
      .select("id, fechado_em, observacao, fechado_por_nome, zerou")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("fechamento_itens")
      .select("corte_id, nome, abertura, entradas, saidas, ajustes, saldo_final")
      .eq("fechamento_id", id)
      .order("nome"),
  ]);
  if (!fechamento.data) notFound();

  const linhas = (itens.data ?? []).map((item) => ({
    ...item,
    consumo: item.abertura + item.entradas - item.saldo_final,
  }));
  const total = (campo: "abertura" | "entradas" | "saidas" | "ajustes" | "saldo_final" | "consumo") =>
    linhas.reduce((soma, linha) => soma + linha[campo], 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="print:hidden">
        <Link href="/estoque" className="text-[14px] text-suave underline">
          ← Voltar ao estoque
        </Link>
      </div>

      <section>
        <h2 className="text-base font-bold">
          Fechamento #{fechamento.data.id} ·{" "}
          {formatarDataHoraCompleta(fechamento.data.fechado_em)}
        </h2>
        <p className="mt-1 text-[13.5px] text-suave">
          Por {fechamento.data.fechado_por_nome}.{" "}
          {fechamento.data.zerou
            ? "O estoque foi zerado ao fechar."
            : "O estoque seguiu com o saldo atual."}
          {fechamento.data.observacao ? ` Obs.: ${fechamento.data.observacao}` : ""}
        </p>
      </section>

      <div className={cartaoTabela}>
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className={cabecalhoTabela}>Corte</th>
              <th className={cabecalhoTabela}>Abertura</th>
              <th className={cabecalhoTabela}>Entradas</th>
              <th className={cabecalhoTabela}>Saídas</th>
              <th className={cabecalhoTabela}>Ajustes</th>
              <th className={cabecalhoTabela}>Saldo final</th>
              <th className={cabecalhoTabela}>Consumo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.corte_id}>
                <td className={celulaTabela}>{linha.nome}</td>
                <td className={celulaTabela}>{formatarKg(linha.abertura)}</td>
                <td className={celulaTabela}>{formatarKg(linha.entradas)}</td>
                <td className={celulaTabela}>{formatarKg(linha.saidas)}</td>
                <td className={celulaTabela}>{formatarKg(linha.ajustes)}</td>
                <td className={`${celulaTabela} font-bold`}>
                  {formatarKg(linha.saldo_final)}
                </td>
                <td className={celulaTabela}>{formatarKg(linha.consumo)}</td>
              </tr>
            ))}
            <tr>
              <td className={`${celulaTabela} font-bold`}>Total</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("abertura"))}</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("entradas"))}</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("saidas"))}</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("ajustes"))}</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("saldo_final"))}</td>
              <td className={`${celulaTabela} font-bold`}>{formatarKg(total("consumo"))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[13px] text-suave">
        Consumo = abertura + entradas − saldo final (inclui diferenças da
        contagem). Valores em kg: o sistema ainda não registra preços.
      </p>

      <div className="flex gap-2 print:hidden">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href={`/estoque/fechamentos/${fechamento.data.id}/csv`}
          className={botaoSecundario}
        >
          Baixar CSV (Excel)
        </a>
      </div>
    </div>
  );
}
