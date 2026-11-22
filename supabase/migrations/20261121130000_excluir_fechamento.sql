-- Exclui o fechamento MAIS RECENTE e os registros do período dele (útil para limpar dados de teste).
-- Só o admin; só o último fechamento, para o saldo dos anteriores nunca ficar inconsistente.
create or replace function public.excluir_fechamento(p_id bigint)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ultimo_id bigint;
  v_em timestamptz;
  v_ini timestamptz;
  v_apagados integer;
begin
  if not (select private.is_admin()) then
    raise exception 'apenas administradores podem excluir fechamentos' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(7001);

  select f.id, f.fechado_em into v_ultimo_id, v_em
    from public.fechamentos f order by f.fechado_em desc limit 1;

  if v_ultimo_id is null or v_ultimo_id <> p_id then
    raise exception 'so o fechamento mais recente pode ser excluido' using errcode = 'P0003';
  end if;

  select max(f.fechado_em) into v_ini from public.fechamentos f where f.id <> p_id;

  delete from public.movimentacoes m
   where m.criado_em <= v_em
     and (v_ini is null or m.criado_em > v_ini);
  get diagnostics v_apagados = row_count;

  delete from public.fechamentos where id = p_id;  -- os itens saem junto (cascade)

  return v_apagados;
end;
$$;

revoke all on function public.excluir_fechamento(bigint) from public, anon;
grant execute on function public.excluir_fechamento(bigint) to authenticated;
