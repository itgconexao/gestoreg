import { sair } from "@/app/actions";
import { exigirPerfil } from "@/lib/auth";

export default async function Home() {
  const perfil = await exigirPerfil();

  return (
    <main className="mx-auto max-w-[760px] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-[21px] font-bold tracking-tight">
          Estoque de carnes
        </h1>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-[10px] border border-borda px-3.5 py-2 text-[15px] font-semibold text-tinta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-destaque"
          >
            Sair
          </button>
        </form>
      </div>

      <p className="mb-3 text-suave">
        Olá, <b className="text-tinta">{perfil.nome}</b>. Seu papel:{" "}
        <b className="text-tinta">
          {perfil.papel === "admin" ? "administrador" : "operador"}
        </b>
        .
      </p>

      <p className="rounded-lg bg-aviso-fundo px-3 py-2.5 font-semibold text-aviso">
        Login funcionando. As telas de entrada, retirada e estoque chegam na
        próxima etapa.
      </p>
    </main>
  );
}
