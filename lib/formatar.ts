/** Formata um peso em kg no padrão brasileiro, com até 2 casas decimais. */
export function formatarKg(valor: number): string {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
}

/** Formata data e hora no fuso de São Paulo, ex.: "16/11, 15:00". */
export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
