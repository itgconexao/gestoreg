-- Depois de um fechamento com "zerar estoque", entradas, saídas e ajustes também
-- recomeçam do zero. O saldo continua sendo o acumulado (já zerado pelo ajuste do fechamento).
create or replace function public.estoque_atual()
returns table (
  corte_id bigint,
  nome text,
  entradas numeric,
  saidas numeric,
  ajustes numeric,
  saldo numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with ini as (
    select coalesce(max(f.fechado_em), '-infinity'::timestamptz) as t
    from public.fechamentos f
    where f.zerou
  )
  select
    c.id,
    c.nome,
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'entrada' and m.criado_em > ini.t), 0),
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'saida' and m.criado_em > ini.t), 0),
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'ajuste' and m.criado_em > ini.t), 0),
    coalesce(sum(case m.tipo when 'saida' then -m.quantidade_kg else m.quantidade_kg end), 0)
  from public.cortes c
  cross join ini
  left join public.movimentacoes m on m.corte_id = c.id
  where c.ativo
  group by c.id, c.nome
  order by c.nome;
$$;
