"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function BotaoEnviar({
  texto,
  textoPendente,
  variante = "principal",
}: {
  texto: string;
  textoPendente: string;
  variante?: "principal" | "saida";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full rounded-[10px] p-3.5 text-[17px] font-bold text-fundo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-destaque disabled:opacity-60",
        variante === "saida" ? "bg-saida" : "bg-destaque",
      )}
    >
      {pending ? textoPendente : texto}
    </button>
  );
}

export function Mensagem({ ok, erro }: { ok?: string; erro?: string }) {
  if (erro) {
    return (
      <p
        role="alert"
        className="my-2.5 rounded-lg bg-erro-fundo px-3 py-2.5 font-semibold text-erro"
      >
        {erro}
      </p>
    );
  }
  if (ok) {
    return (
      <p
        role="status"
        className="my-2.5 rounded-lg bg-destaque-fundo px-3 py-2.5 font-semibold text-destaque"
      >
        {ok}
      </p>
    );
  }
  return null;
}
