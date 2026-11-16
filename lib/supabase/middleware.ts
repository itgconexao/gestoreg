import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

// Receber, Retirar e Estoque abrem sem login (acesso pelos QR codes).
const ROTAS_PUBLICAS = ["/login", "/receber", "/retirar", "/estoque"];

function ehRotaPublica(caminho: string): boolean {
  // A página inicial só redireciona para /retirar.
  if (caminho === "/") return true;
  return ROTAS_PUBLICAS.some(
    (rota) => caminho === rota || caminho.startsWith(`${rota}/`),
  );
}

/**
 * Renova a sessão do Supabase a cada requisição e redireciona:
 * - visitante sem login, em páginas que não são públicas, para /login (guardando o destino);
 * - usuário já logado que abre /login para a página inicial.
 */
export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesParaGravar: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesParaGravar.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          resposta = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valida o token no servidor do Supabase (getSession() não valida).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;

  function redirecionar(url: URL) {
    const redirecionamento = NextResponse.redirect(url);
    // Mantém os cookies de sessão renovados na resposta de redirecionamento.
    resposta.cookies.getAll().forEach((cookie) => {
      redirecionamento.cookies.set(cookie);
    });
    return redirecionamento;
  }

  if (!user && !ehRotaPublica(caminho)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${caminho}${request.nextUrl.search}`);
    return redirecionar(url);
  }

  if (user && caminho === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirecionar(url);
  }

  return resposta;
}
