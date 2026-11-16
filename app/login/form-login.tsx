"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { entrar, type EstadoLogin } from "./actions";

function BotaoEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-destaque p-3.5 text-[17px] font-bold text-fundo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-destaque disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

const campo =
  "w-full min-w-0 rounded-lg border border-borda bg-superficie p-[11px] text-tinta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-destaque";

export function FormLogin({ next }: { next?: string }) {
  const [estado, acao] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next ?? ""} />

      <label className="flex flex-col gap-1 text-[13px] text-suave">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1 text-[13px] text-suave">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={campo}
        />
      </label>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-lg bg-erro-fundo px-3 py-2.5 font-semibold text-erro"
        >
          {estado.erro}
        </p>
      ) : null}

      <BotaoEntrar />
    </form>
  );
}
