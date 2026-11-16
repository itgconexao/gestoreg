/**
 * Lê um peso em kg digitado pelo usuário.
 * Aceita vírgula ou ponto como separador decimal ("2,5" ou "2.5").
 * Retorna null se o texto não for um número válido.
 * Por padrão exige valor maior que zero; com permitirZero aceita 0 (usado na contagem).
 */
export function lerKg(texto: string, permitirZero = false): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpo)) return null;

  const valor = Number(limpo);
  if (!Number.isFinite(valor) || valor > 100000) return null;
  if (valor === 0 && !permitirZero) return null;

  return Math.round(valor * 1000) / 1000;
}
