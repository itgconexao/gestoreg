-- Quem está na tela Receber (inclusive sem login, pelo QR code) pode cadastrar um corte novo.
create or replace function public.criar_corte_publico(p_nome text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text := regexp_replace(btrim(coalesce(p_nome, '')), '\s+', ' ', 'g');
  v_id bigint;
begin
  if char_length(v_nome) < 2 or char_length(v_nome) > 60 then
    raise exception 'nome invalido';
  end if;
  if exists (select 1 from public.cortes c where lower(c.nome) = lower(v_nome)) then
    raise exception 'corte ja existe' using errcode = '23505';
  end if;
  insert into public.cortes (nome) values (v_nome) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.criar_corte_publico(text) from public;
grant execute on function public.criar_corte_publico(text) to anon, authenticated;
