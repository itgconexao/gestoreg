import { getPerfil } from "@/lib/auth";
import { montarCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const perfil = await getPerfil();
  if (perfil?.papel !== "admin") {
    return new Response("Acesso negado", { status: 403 });
  }

  const { id: idTexto } = await params;
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Não encontrado", { status: 404 });
  }

  const supabase = await createClient();
  const [fechamento, itens] = await Promise.all([
    supabase
      .from("fechamentos")
      .select("id, fechado_em, observacao, zerou")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("fechamento_itens")
      .select("nome, abertura, entradas, saidas, ajustes, saldo_final")
      .eq("fechamento_id", id)
      .order("nome"),
  ]);
  if (!fechamento.data) {
    return new Response("Não encontrado", { status: 404 });
  }

  const linhas: (string | number)[][] = [
    ["Corte", "Abertura (kg)", "Entradas (kg)", "Saídas (kg)", "Ajustes (kg)", "Saldo final (kg)", "Consumo (kg)"],
    ...(itens.data ?? []).map((item) => [
      item.nome,
      item.abertura,
      item.entradas,
      item.saidas,
      item.ajustes,
      item.saldo_final,
      item.abertura + item.entradas - item.saldo_final,
    ]),
  ];

  const data = fechamento.data.fechado_em.slice(0, 10);
  return new Response(montarCsv(linhas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fechamento-${fechamento.data.id}-${data}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
