-- Schema inicial do gestoreg: estoque de carnes

create schema if not exists private;
grant usage on schema private to authenticated;

create type public.papel_usuario as enum ('admin', 'operador');
create type public.tipo_movimentacao as enum ('entrada', 'saida', 'ajuste');

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  papel public.papel_usuario not null default 'operador',
  criado_em timestamptz not null default now()
);

create table public.cortes (
  id bigint generated always as identity primary key,
  nome text not null unique,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.movimentacoes (
  id bigint generated always as identity primary key,
  tipo public.tipo_movimentacao not null,
  corte_id bigint not null references public.cortes (id),
  quantidade_kg numeric(10, 3) not null,
  fornecedor text,
  destino text,
  observacao text,
  criado_por uuid not null default auth.uid() references auth.users (id),
  criado_em timestamptz not null default now(),
  constraint quantidade_valida check (
    tipo = 'ajuste' or quantidade_kg > 0
  )
);

create index movimentacoes_corte_idx on public.movimentacoes (corte_id);
create index movimentacoes_criado_em_idx on public.movimentacoes (criado_em desc);
create index movimentacoes_criado_por_idx on public.movimentacoes (criado_por);

-- Funcao auxiliar: o usuario logado e admin?
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and papel = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Cria o perfil quando um usuario e criado. O primeiro usuario vira admin.
create or replace function private.novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    case
      when exists (select 1 from public.perfis) then 'operador'::public.papel_usuario
      else 'admin'::public.papel_usuario
    end
  );
  return new;
end;
$$;

revoke all on function private.novo_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario
after insert on auth.users
for each row execute function private.novo_usuario();
