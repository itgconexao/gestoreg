-- Fechamento de estoque: cópia imutável dos números de um período.
create table public.fechamentos (
  id bigint generated always as identity primary key,
  fechado_em timestamptz not null,
  observacao text check (observacao is null or char_length(observacao) <= 200),
  fechado_por uuid references auth.users (id) on delete set null,
  fechado_por_nome text not null
);

create table public.fechamento_itens (
  fechamento_id bigint not null references public.fechamentos (id) on delete cascade,
  corte_id bigint not null,
  nome text not null,
  abertura numeric(12,3) not null,
  entradas numeric(12,3) not null,
  saidas numeric(12,3) not null,
  ajustes numeric(12,3) not null,
  saldo_final numeric(12,3) not null,
  primary key (fechamento_id, corte_id)
);

alter table public.fechamentos enable row level security;
alter table public.fechamento_itens enable row level security;

-- Só o admin lê. Ninguém grava direto: a escrita é só pela função fechar_estoque().
create policy fechamentos_select_admin on public.fechamentos
  for select to authenticated using ((select private.is_admin()));
create policy fechamento_itens_select_admin on public.fechamento_itens
  for select to authenticated using ((select private.is_admin()));

revoke insert, update, delete, truncate on public.fechamentos from anon, authenticated;
revoke insert, update, delete, truncate on public.fechamento_itens from anon, authenticated;
revoke all on public.fechamentos from anon;
revoke all on public.fechamento_itens from anon;

-- Registros de períodos já fechados não podem mais ser apagados.
drop policy mov_delete_admin on public.movimentacoes;
create policy mov_delete_admin on public.movimentacoes
  for delete to authenticated
  using (
    (select private.is_admin())
    and criado_em > coalesce((select max(f.fechado_em) from public.fechamentos f), '-infinity'::timestamptz)
  );

create or replace function public.fechar_estoque(p_observacao text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_agora timestamptz := clock_timestamp();
  v_obs text := nullif(left(btrim(coalesce(p_observacao, '')), 200), '');
  v_prev_id bigint;
  v_prev_em timestamptz;
  v_nome text;
  v_id bigint;
begin
  if not (select private.is_admin()) then
    raise exception 'apenas administradores podem fechar o estoque' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(7001);

  select f.id, f.fechado_em into v_prev_id, v_prev_em
    from public.fechamentos f order by f.fechado_em desc limit 1;

  if not exists (
    select 1 from public.movimentacoes m
    where m.criado_em <= v_agora and (v_prev_em is null or m.criado_em > v_prev_em)
  ) then
    raise exception 'sem movimentacoes desde o ultimo fechamento' using errcode = 'P0002';
  end if;

  select p.nome into v_nome from public.perfis p where p.id = (select auth.uid());

  insert into public.fechamentos (fechado_em, observacao, fechado_por, fechado_por_nome)
  values (v_agora, v_obs, (select auth.uid()), coalesce(v_nome, 'Administrador'))
  returning id into v_id;

  insert into public.fechamento_itens
    (fechamento_id, corte_id, nome, abertura, entradas, saidas, ajustes, saldo_final)
  select
    v_id, c.id, c.nome, t.abertura, t.entradas, t.saidas, t.ajustes,
    t.abertura + t.entradas - t.saidas + t.ajustes
  from public.cortes c
  cross join lateral (
    select
      coalesce((select fi.saldo_final from public.fechamento_itens fi
                where fi.fechamento_id = v_prev_id and fi.corte_id = c.id), 0) as abertura,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'entrada'), 0) as entradas,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'saida'), 0) as saidas,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'ajuste'), 0) as ajustes
    from public.movimentacoes m
    where m.corte_id = c.id
      and m.criado_em <= v_agora
      and (v_prev_em is null or m.criado_em > v_prev_em)
  ) t;

  return v_id;
end;
$$;

revoke all on function public.fechar_estoque(text) from public, anon;
grant execute on function public.fechar_estoque(text) to authenticated;
