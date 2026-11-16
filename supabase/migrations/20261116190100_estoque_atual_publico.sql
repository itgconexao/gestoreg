-- Quem entra pelo QR code (sem login) pode consultar o saldo atual para decidir compras.
grant execute on function public.estoque_atual() to anon;
