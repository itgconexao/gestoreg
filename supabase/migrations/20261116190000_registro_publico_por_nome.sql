-- Registro de entrada/retirada sem login (QR codes): a pessoa informa só o nome.
alter table public.movimentacoes alter column criado_por drop not null;
alter table public.movimentacoes add column nome_responsavel text;
alter table public.movimentacoes add constraint movimentacoes_responsavel_check
  check (criado_por is not null or (nome_responsavel is not null and char_length(btrim(nome_responsavel)) between 2 and 60));

create or replace function public.cortes_publicos()
returns table (id bigint, nome text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id::bigint, c.nome from public.cortes c where c.ativo order by c.nome;
$$;

create or replace function public.registrar_movimento_publico(
  p_tipo public.tipo_movimentacao,
  p_nome text,
  p_detalhe text,
  p_itens jsonb
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text := btrim(coalesce(p_nome, ''));
  v_detalhe text := nullif(left(btrim(coalesce(p_detalhe, '')), 120), '');
  v_item jsonb;
  v_corte bigint;
  v_kg numeric;
  v_total integer := 0;
begin
  if p_tipo not in ('entrada', 'saida') then
    raise exception 'tipo invalido';
  end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 60 then
    raise exception 'nome invalido';
  end if;
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) not between 1 and 50 then
    raise exception 'itens invalidos';
  end if;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_corte := (v_item->>'corte_id')::bigint;
    v_kg := round((v_item->>'kg')::numeric, 3);
    if v_kg is null or v_kg <= 0 or v_kg > 100000 then
      raise exception 'peso invalido';
    end if;
    if not exists (select 1 from public.cortes c where c.id = v_corte and c.ativo) then
      raise exception 'corte invalido';
    end if;
    insert into public.movimentacoes
      (tipo, corte_id, quantidade_kg, fornecedor, destino, criado_por, nome_responsavel)
    values (
      p_tipo, v_corte, v_kg,
      case when p_tipo = 'entrada' then v_detalhe end,
      case when p_tipo = 'saida' then v_detalhe end,
      auth.uid(), v_nome
    );
    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;

revoke all on function public.cortes_publicos() from public;
revoke all on function public.registrar_movimento_publico(public.tipo_movimentacao, text, text, jsonb) from public;
grant execute on function public.cortes_publicos() to anon, authenticated;
grant execute on function public.registrar_movimento_publico(public.tipo_movimentacao, text, text, jsonb) to anon, authenticated;
