// Gerado a partir do schema do Supabase. Não edite à mão.
// Para atualizar após mudar o banco, gere os tipos de novo.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cortes: {
        Row: {
          ativo: boolean
          criado_em: string
          id: number
          nome: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: never
          nome: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: never
          nome?: string
        }
        Relationships: []
      }
      fechamento_itens: {
        Row: {
          abertura: number
          ajustes: number
          corte_id: number
          entradas: number
          fechamento_id: number
          nome: string
          saidas: number
          saldo_final: number
        }
        Insert: {
          abertura: number
          ajustes: number
          corte_id: number
          entradas: number
          fechamento_id: number
          nome: string
          saidas: number
          saldo_final: number
        }
        Update: {
          abertura?: number
          ajustes?: number
          corte_id?: number
          entradas?: number
          fechamento_id?: number
          nome?: string
          saidas?: number
          saldo_final?: number
        }
        Relationships: [
          {
            foreignKeyName: "fechamento_itens_fechamento_id_fkey"
            columns: ["fechamento_id"]
            isOneToOne: false
            referencedRelation: "fechamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      fechamentos: {
        Row: {
          fechado_em: string
          fechado_por: string | null
          fechado_por_nome: string
          id: number
          observacao: string | null
          zerou: boolean
        }
        Insert: {
          fechado_em: string
          fechado_por?: string | null
          fechado_por_nome: string
          id?: never
          observacao?: string | null
          zerou?: boolean
        }
        Update: {
          fechado_em?: string
          fechado_por?: string | null
          fechado_por_nome?: string
          id?: never
          observacao?: string | null
          zerou?: boolean
        }
        Relationships: []
      }
      movimentacoes: {
        Row: {
          corte_id: number
          criado_em: string
          criado_por: string | null
          destino: string | null
          fornecedor: string | null
          id: number
          nome_responsavel: string | null
          observacao: string | null
          quantidade_kg: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
        }
        Insert: {
          corte_id: number
          criado_em?: string
          criado_por?: string | null
          destino?: string | null
          fornecedor?: string | null
          id?: never
          nome_responsavel?: string | null
          observacao?: string | null
          quantidade_kg: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
        }
        Update: {
          corte_id?: number
          criado_em?: string
          criado_por?: string | null
          destino?: string | null
          fornecedor?: string | null
          id?: never
          nome_responsavel?: string | null
          observacao?: string | null
          quantidade_kg?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          criado_em: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_usuario"]
        }
        Insert: {
          criado_em?: string
          id: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_corte_publico: {
        Args: { p_nome: string }
        Returns: number
      }
      cortes_publicos: {
        Args: never
        Returns: {
          id: number
          nome: string
        }[]
      }
      excluir_fechamento: {
        Args: { p_id: number }
        Returns: number
      }
      fechar_estoque: {
        Args: { p_observacao: string; p_zerar: boolean }
        Returns: number
      }
      estoque_atual: {
        Args: never
        Returns: {
          ajustes: number
          corte_id: number
          entradas: number
          nome: string
          saidas: number
          saldo: number
        }[]
      }
      registrar_contagem: {
        Args: { p_corte_id: number; p_kg: number }
        Returns: number
      }
      registrar_movimento_publico: {
        Args: {
          p_detalhe: string
          p_itens: Json
          p_nome: string
          p_tipo: Database["public"]["Enums"]["tipo_movimentacao"]
        }
        Returns: number
      }
    }
    Enums: {
      papel_usuario: "admin" | "operador"
      tipo_movimentacao: "entrada" | "saida" | "ajuste"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      papel_usuario: ["admin", "operador"],
      tipo_movimentacao: ["entrada", "saida", "ajuste"],
    },
  },
} as const
