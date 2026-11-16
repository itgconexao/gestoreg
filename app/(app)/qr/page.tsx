import type { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { BotaoImprimir } from "@/components/botao-imprimir";
import { exigirAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "QR codes · Estoque de carnes",
};

const CODIGOS = [
  { caminho: "/retirar", titulo: "Retirar carnes", dica: "Cole no freezer" },
  { caminho: "/receber", titulo: "Receber carnes", dica: "Cole no recebimento" },
];

export default async function PaginaQr() {
  await exigirAdmin();

  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "";
  const protocolo =
    cabecalhos.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const base = `${protocolo}://${host}`;

  const codigos = await Promise.all(
    CODIGOS.map(async (codigo) => ({
      ...codigo,
      url: `${base}${codigo.caminho}`,
      imagem: await QRCode.toDataURL(`${base}${codigo.caminho}`, {
        width: 220,
        margin: 1,
      }),
    })),
  );

  return (
    <section>
      <h2 className="mb-1 text-base font-bold print:hidden">QR codes</h2>
      <p className="mb-3 text-[13.5px] text-suave print:hidden">
        Os códigos apontam para este endereço: <b>{base}</b>. Gere e imprima
        esta página pelo endereço definitivo do site, não por um endereço de
        teste. Quem ler o código não precisa de login: informa só o nome e
        pode registrar entrada ou retirada e consultar o estoque.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        {codigos.map((codigo) => (
          <div
            key={codigo.caminho}
            className="rounded-[10px] border border-borda bg-white p-3.5 text-center text-[#111]"
          >
            <b className="text-xl">{codigo.titulo}</b>
            <div className="my-2 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={codigo.imagem}
                alt={`QR code para ${codigo.titulo}`}
                width={220}
                height={220}
              />
            </div>
            <span>{codigo.dica}</span>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <BotaoImprimir />
      </div>
    </section>
  );
}
