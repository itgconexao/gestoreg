"use client";

import { useActionState } from "react";
import { registrarContagem, criarCorte } from "@/app/(app)/estoque/actions";
import type { EstadoForm } from "@/app/(app)/movimentos/actions";
import { atualizarMeuNome, criarUsuario } from "@/app/(app)/usuarios/actions";
import { BotaoEnviar, Mensagem } from "@/components/ui";
import { campo, rotuloCampo } from "@/lib/estilos";

const INICIAL: EstadoForm = { n: 0 };

export function FormContagem({
  cortes,
}: {
  cortes: { id: number; nome: string }[];
}) {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    registrarContagem,
    INICIAL,
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className={rotuloCampo}>
            Corte
            <select name="corte_id" className={campo} required>
              {cortes.map((corte) => (
                <option key={corte.id} value={corte.id}>
                  {corte.nome}
                </option>
              ))}
            </select>
          </label>
          <label className={rotuloCampo}>
            Peso contado (kg)
            <input
              name="kg"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              required
              className={campo}
            />
          </label>
        </div>
        <BotaoEnviar texto="Registrar contagem" textoPendente="Registrando…" />
      </form>
    </div>
  );
}

export function FormNovoCorte() {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    criarCorte,
    INICIAL,
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Nome do novo corte
          <input
            name="nome"
            type="text"
            maxLength={60}
            placeholder="Ex.: Picanha"
            required
            className={campo}
          />
        </label>
        <BotaoEnviar texto="Adicionar corte" textoPendente="Adicionando…" />
      </form>
    </div>
  );
}

export function FormUsuario() {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    criarUsuario,
    INICIAL,
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />
      <form key={estado.n} action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Nome
          <input name="nome" type="text" maxLength={60} required className={campo} />
        </label>
        <label className={rotuloCampo}>
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="off"
            required
            className={campo}
          />
        </label>
        <label className={rotuloCampo}>
          Senha provisória (mínimo 8 caracteres)
          <input
            name="senha"
            type="text"
            autoComplete="off"
            minLength={8}
            required
            className={campo}
          />
        </label>
        <label className={rotuloCampo}>
          Papel
          <select name="papel" defaultValue="operador" className={campo}>
            <option value="operador">Operador (recebe e retira)</option>
            <option value="admin">Administrador (acesso total)</option>
          </select>
        </label>
        <BotaoEnviar texto="Criar usuário" textoPendente="Criando…" />
      </form>
    </div>
  );
}

export function FormNome({ nomeAtual }: { nomeAtual: string }) {
  const [estado, acao] = useActionState<EstadoForm, FormData>(
    atualizarMeuNome,
    INICIAL,
  );

  return (
    <div>
      <Mensagem ok={estado.ok} erro={estado.erro} />
      <form action={acao} className="flex flex-col gap-3">
        <label className={rotuloCampo}>
          Meu nome
          <input
            name="nome"
            type="text"
            maxLength={60}
            defaultValue={nomeAtual}
            required
            className={campo}
          />
        </label>
        <BotaoEnviar texto="Salvar nome" textoPendente="Salvando…" />
      </form>
    </div>
  );
}
