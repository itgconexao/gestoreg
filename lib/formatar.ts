/** Formata um peso em kg no padrão brasileiro, com até 2 casas decimais. */
export function formatarKg(valor: number): string {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
}
