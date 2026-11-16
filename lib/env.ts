import { z } from "zod";

const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// As variáveis NEXT_PUBLIC_* precisam ser lidas por nome literal
// para o Next.js incluí-las no código do navegador.
const resultado = esquema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!resultado.success) {
  throw new Error(
    "Variáveis de ambiente do Supabase ausentes ou inválidas. " +
      "Confira NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (veja .env.example).",
  );
}

export const env = resultado.data;
