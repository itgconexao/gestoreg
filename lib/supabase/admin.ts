import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente com a chave de serviço do Supabase: ignora as regras de segurança (RLS).
 * Use só no servidor e só depois de confirmar que o usuário logado é admin.
 */
export function createAdminClient() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
