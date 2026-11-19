/** Monta um CSV que o Excel em português abre direto: separador ";", decimal com vírgula e BOM UTF-8. */
export function montarCsv(linhas: (string | number)[][]): string {
  const celula = (valor: string | number): string => {
    const texto =
      typeof valor === "number"
        ? String(Math.round(valor * 1000) / 1000).replace(".", ",")
        : valor;
    return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  return `\uFEFF${linhas.map((linha) => linha.map(celula).join(";")).join("\r\n")}\r\n`;
}
