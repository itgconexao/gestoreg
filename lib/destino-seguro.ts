/**
 * Valida o destino de um redirecionamento após o login.
 * Só aceita caminhos internos do próprio site, para evitar redirecionar
 * o usuário para um endereço externo (open redirect).
 */
export function destinoSeguro(destino: string | null | undefined): string {
  if (!destino) return "/";
  if (!destino.startsWith("/")) return "/";
  if (destino.startsWith("//") || destino.startsWith("/\\")) return "/";
  return destino;
}
