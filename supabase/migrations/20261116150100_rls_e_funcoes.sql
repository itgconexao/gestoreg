-- Regras de seguranca (RLS) e funcoes de estoque

alter table public.perfis enable row level security;
alter table public.cortes enable row level security;
alter table public.movimentacoes enable row level security;

-- perfis: cada um ve o proprio; admin ve e altera todos
create policy perfis_select on public.perfis
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy perfis_update_admin on public.perfis
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- cortes: todos os logados leem; so admin altera
create policy cortes_select on public.cortes
  for select to authenticated
  using (true);

create policy cortes_insert_admin on public.cortes
  for insert to authenticated
  with check ((select private.is_admin()));

create policy cortes_update_admin on public.cortes
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy cortes_delete_admin on public.cortes
  for delete to authenticated
  using ((select private.is_admin()));

-- movimentacoes: operador ve e registra as proprias entradas/saidas; admin ve tudo
create policy mov_select on public.movimentacoes
  for select to authenticated
  using (criado_por = (select auth.uid()) or (select private.is_admin()));

create policy mov_insert on public.movimentacoes
  for insert to authenticated
  with check (
    criado_por = (select auth.uid())
    and (tipo in ('entrada', 'saida') or (select private.is_admin()))
  );

create policy mov_delete_admin on public.movimentacoes
  for delete to authenticated
  using ((select private.is_admin()));

-- Estoque atual por corte (visivel a todos os logados, sem expor o historico)
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
  select
    c.id,
    c.nome,
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'entrada'), 0),
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'saida'), 0),
    coalesce(sum(m.quantidade_kg) filter (where m.tipo = 'ajuste'), 0),
    coalesce(sum(case m.tipo when 'saida' then -m.quantidade_kg else m.quantidade_kg end), 0)
  from public.cortes c
  left join public.movimentacoes m on m.corte_id = c.id
  where c.ativo
  group by c.id, c.nome
  order by c.nome;
$$;

revoke all on function public.estoque_atual() from public, anon;
grant execute on function public.estoque_atual() to authenticated;

-- Contagem fisica (so admin): grava a diferenca entre o contado e o calculado
create or replace function public.registrar_contagem(p_corte_id bigint, p_kg numeric)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_saldo numeric;
  v_dif numeric;
begin
  if not (select private.is_admin()) then
    raise exception 'apenas administradores podem registrar contagem' using errcode = '42501';
  end if;
  if p_kg is null or p_kg < 0 then
    raise exception 'peso invalido' using errcode = '22023';
  end if;

  select coalesce(sum(case tipo when 'saida' then -quantidade_kg else quantidade_kg end), 0)
    into v_saldo
    from public.movimentacoes
    where corte_id = p_corte_id;

  v_dif := round(p_kg - v_saldo, 3);

  insert into public.movimentacoes (tipo, corte_id, quantidade_kg, observacao, criado_por)
  values ('ajuste', p_corte_id, v_dif, 'contagem fisica', (select auth.uid()));

  return v_dif;
end;
$$;

revoke all on function public.registrar_contagem(bigint, numeric) from public, anon;
grant execute on function public.registrar_contagem(bigint, numeric) to authenticated;
