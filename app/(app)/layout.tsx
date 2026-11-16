import { sair } from "@/app/actions";
import { Navegacao } from "@/components/navegacao";
import { exigirPerfil } from "@/lib/auth";
import { botaoSecundario } from "@/lib/estilos";

export default async function LayoutApp({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const perfil = await exigirPerfil();

  return (
    <div className="mx-auto max-w-[760px] p-3.5">
      <header className="mb-2 flex items-center justify-between gap-3 print:hidden">
        <h1 className="text-[21px] font-bold tracking-tight">
          Estoque de carnes
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-suave">{perfil.nome}</span>
          <form action={sair}>
            <button type="submit" className={botaoSecundario}>
              Sair
            </button>
          </form>
        </div>
      </header>

      <Navegacao admin={perfil.papel === "admin"} />
      {children}
    </div>
  );
}
