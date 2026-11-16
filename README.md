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

## Variáveis de ambiente

| Variável | Onde | Para que serve |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | local e Vercel | endereço do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | local e Vercel | chave pública (protegida pelas regras RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | só no servidor (Vercel) | criar usuários pela tela Usuários. Nunca use o prefixo `NEXT_PUBLIC_` nela |

## Telas

- **Receber** e **Retirar**: qualquer usuário logado registra entradas e retiradas (os QR codes apontam para elas).
- **Estoque**, **QR codes** e **Usuários**: somente administradores. No Estoque ficam o saldo, a contagem física, os cortes e o histórico.

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
