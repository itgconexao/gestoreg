# gestoreg

Gestão de estoque de carnes para estabelecimento: entrada, retirada, contagem física e QR codes para uso no celular.

## Tecnologias

- Next.js (App Router) com TypeScript
- Tailwind CSS
- Supabase (banco Postgres e autenticação)
- Vercel (publicação)

## Como rodar

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do Supabase (Project Settings > API).
3. Inicie: `npm run dev` e abra http://localhost:3000

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | verificação de código |
| `npm run typecheck` | verificação de tipos |
| `npm test` | testes |

## Banco de dados

As migrações ficam em `supabase/migrations/`. O banco tem as tabelas `perfis`, `cortes` e `movimentacoes`, todas com RLS ligada, e as funções `estoque_atual` e `registrar_contagem`. O primeiro usuário criado vira administrador.

## Estrutura

```
app/            páginas (App Router)
lib/            utilitários e clientes Supabase
types/          tipos gerados do banco
tests/          testes
supabase/       migrações SQL
legacy/         versão antiga em HTML único (referência)
```
