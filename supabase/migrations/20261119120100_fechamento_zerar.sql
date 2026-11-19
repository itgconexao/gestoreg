-- No fechamento, o admin escolhe: manter a rodagem (saldo continua) ou zerar o estoque.
alter table public.fechamentos add column zerou boolean not null default false;

drop function public.fechar_estoque(text);

create or replace function public.fechar_estoque(p_observacao text, p_zerar boolean)
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
  v_prev_zerou boolean;
  v_nome text;
  v_id bigint;
begin
  if not (select private.is_admin()) then
    raise exception 'apenas administradores podem fechar o estoque' using errcode = '42501';
  end if;
  if p_zerar is null then
    raise exception 'informe se o estoque deve ser zerado' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(7001);

  select f.id, f.fechado_em, f.zerou into v_prev_id, v_prev_em, v_prev_zerou
    from public.fechamentos f order by f.fechado_em desc limit 1;

  if not exists (
    select 1 from public.movimentacoes m
    where m.criado_em <= v_agora and (v_prev_em is null or m.criado_em > v_prev_em)
  ) then
    raise exception 'sem movimentacoes desde o ultimo fechamento' using errcode = 'P0002';
  end if;

  select p.nome into v_nome from public.perfis p where p.id = (select auth.uid());

  insert into public.fechamentos (fechado_em, observacao, fechado_por, fechado_por_nome, zerou)
  values (v_agora, v_obs, (select auth.uid()), coalesce(v_nome, 'Administrador'), p_zerar)
  returning id into v_id;

  insert into public.fechamento_itens
    (fechamento_id, corte_id, nome, abertura, entradas, saidas, ajustes, saldo_final)
  select
    v_id, c.id, c.nome, t.abertura, t.entradas, t.saidas, t.ajustes,
    t.abertura + t.entradas - t.saidas + t.ajustes
  from public.cortes c
  cross join lateral (
    select
      case when coalesce(v_prev_zerou, false) then 0 else coalesce(
        (select fi.saldo_final from public.fechamento_itens fi
          where fi.fechamento_id = v_prev_id and fi.corte_id = c.id), 0) end as abertura,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'entrada'), 0) as entradas,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'saida'), 0) as saidas,
      coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'ajuste'), 0) as ajustes
    from public.movimentacoes m
    where m.corte_id = c.id
      and m.criado_em <= v_agora
      and (v_prev_em is null or m.criado_em > v_prev_em)
  ) t;

  -- Zerar: lança um ajuste que leva o saldo de cada corte a zero. Ele tem o mesmo
  -- instante do fechamento, então não entra na cópia nem no período seguinte.
  if p_zerar then
    insert into public.movimentacoes
      (tipo, corte_id, quantidade_kg, observacao, criado_por, criado_em)
    select 'ajuste', fi.corte_id, -fi.saldo_final,
           'zeragem no fechamento #' || v_id, (select auth.uid()), v_agora
    from public.fechamento_itens fi
    where fi.fechamento_id = v_id and fi.saldo_final <> 0;
  end if;

  return v_id;
end;
$$;

revoke all on function public.fechar_estoque(text, boolean) from public, anon;
grant execute on function public.fechar_estoque(text, boolean) to authenticated;
