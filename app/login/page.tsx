import type { Metadata } from "next";
import { FormLogin } from "./form-login";

export const metadata: Metadata = {
  title: "Entrar · Estoque de carnes",
};

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-[420px] p-4 pt-10">
      <h1 className="mb-1 text-[21px] font-bold tracking-tight">
        Estoque de carnes
      </h1>
      <p className="mb-5 text-suave">Entre com a sua conta para continuar.</p>
      <FormLogin next={next} />
    </main>
  );
}
