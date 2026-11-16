"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ABAS = [
  { href: "/receber", rotulo: "Receber", admin: false },
  { href: "/retirar", rotulo: "Retirar", admin: false },
  { href: "/estoque", rotulo: "Estoque", admin: false },
  { href: "/qr", rotulo: "QR codes", admin: true },
  { href: "/usuarios", rotulo: "Usuários", admin: true },
];

export function Navegacao({ admin }: { admin: boolean }) {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="mb-3 flex gap-1 overflow-x-auto border-b border-borda print:hidden"
    >
      {ABAS.filter((aba) => admin || !aba.admin).map((aba) => (
        <Link
          key={aba.href}
          href={aba.href}
          aria-current={caminho === aba.href ? "page" : undefined}
          className={cn(
            "whitespace-nowrap border-b-[3px] px-3.5 py-2.5 font-semibold",
            caminho === aba.href
              ? "border-destaque text-destaque"
              : "border-transparent text-suave",
          )}
        >
          {aba.rotulo}
        </Link>
      ))}
    </nav>
  );
}
