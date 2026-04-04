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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      booking_holds: {
        Row: {
          booking_date: string
          booking_time: string
          client_user_id: string
          created_at: string
          expires_at: string
          id: string
          professional_id: string
          status: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_user_id: string
          created_at?: string
          expires_at?: string
          id?: string
          professional_id: string
          status?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_user_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          professional_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_holds_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone: string | null
          client_user_id: string | null
          created_at: string
          currency: string
          duration: number
          id: string
          price: number
          professional_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          client_email: string
          client_name: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          currency?: string
          duration: number
          id?: string
          price: number
          professional_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          client_email?: string
          client_name?: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          currency?: string
          duration?: number
          id?: string
          price?: number
          professional_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
        }
        Insert: {
          description: string
          icon: string
          id: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          client_user_id: string
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          professional_id: string
          receipt_url: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          client_user_id: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          professional_id: string
          receipt_url?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          client_user_id?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          professional_id?: string
          receipt_url?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_accounts: {
        Row: {
          created_at: string
          description: string | null
          free_booking_limit: number
          free_bookings_used: number
          id: string
          location: string
          onboarding_completed: boolean
          professional_name: string
          specialty: string
          subscription_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          free_booking_limit?: number
          free_bookings_used?: number
          id?: string
          location: string
          onboarding_completed?: boolean
          professional_name: string
          specialty: string
          subscription_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          free_booking_limit?: number
          free_bookings_used?: number
          id?: string
          location?: string
          onboarding_completed?: boolean
          professional_name?: string
          specialty?: string
          subscription_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_payment_settings: {
        Row: {
          accepted_methods: Database["public"]["Enums"]["payment_method"][]
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          binance_email: string | null
          created_at: string
          currency_preference: string
          id: string
          pago_movil_banco: string | null
          pago_movil_cedula: string | null
          pago_movil_phone: string | null
          professional_id: string
          requires_prepayment: boolean
          updated_at: string
          zelle_email: string | null
        }
        Insert: {
          accepted_methods?: Database["public"]["Enums"]["payment_method"][]
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          binance_email?: string | null
          created_at?: string
          currency_preference?: string
          id?: string
          pago_movil_banco?: string | null
          pago_movil_cedula?: string | null
          pago_movil_phone?: string | null
          professional_id: string
          requires_prepayment?: boolean
          updated_at?: string
          zelle_email?: string | null
        }
        Update: {
          accepted_methods?: Database["public"]["Enums"]["payment_method"][]
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          binance_email?: string | null
          created_at?: string
          currency_preference?: string
          id?: string
          pago_movil_banco?: string | null
          pago_movil_cedula?: string | null
          pago_movil_phone?: string | null
          professional_id?: string
          requires_prepayment?: boolean
          updated_at?: string
          zelle_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_payment_settings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          category_type: Database["public"]["Enums"]["category_type"]
          created_at: string
          currency: string
          description: string | null
          duration: number
          id: string
          languages: string[] | null
          location: string | null
          modality: Database["public"]["Enums"]["modality_type"][] | null
          name: string
          next_available: string | null
          photo: string | null
          price: number
          rating: number
          review_count: number
          specialty: string
          subcategory_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_type: Database["public"]["Enums"]["category_type"]
          created_at?: string
          currency?: string
          description?: string | null
          duration?: number
          id?: string
          languages?: string[] | null
          location?: string | null
          modality?: Database["public"]["Enums"]["modality_type"][] | null
          name: string
          next_available?: string | null
          photo?: string | null
          price: number
          rating?: number
          review_count?: number
          specialty: string
          subcategory_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_type?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          currency?: string
          description?: string | null
          duration?: number
          id?: string
          languages?: string[] | null
          location?: string | null
          modality?: Database["public"]["Enums"]["modality_type"][] | null
          name?: string
          next_available?: string | null
          photo?: string | null
          price?: number
          rating?: number
          review_count?: number
          specialty?: string
          subcategory_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          professional_id: string
          rating: number
          reviewer_name: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id: string
          rating: number
          reviewer_name: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          rating?: number
          reviewer_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          category_type: Database["public"]["Enums"]["category_type"]
          id: string
          name: string
          professional_count: number
        }
        Insert: {
          category_id: string
          category_type: Database["public"]["Enums"]["category_type"]
          id: string
          name: string
          professional_count?: number
        }
        Update: {
          category_id?: string
          category_type?: Database["public"]["Enums"]["category_type"]
          id?: string
          name?: string
          professional_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_professional_account:
        | {
            Args: {
              p_category_type: Database["public"]["Enums"]["category_type"]
              p_description?: string
              p_location: string
              p_professional_name: string
              p_specialty: string
              p_subcategory_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_description?: string
              p_location: string
              p_professional_name: string
              p_specialty: string
            }
            Returns: string
          }
      cleanup_expired_holds: { Args: never; Returns: undefined }
      expire_pending_payments: { Args: never; Returns: undefined }
      get_professional_booking_access: {
        Args: { p_professional_id: string }
        Returns: {
          accepting_bookings: boolean
          free_booking_limit: number
          free_bookings_remaining: number
          free_bookings_used: number
          is_near_limit: boolean
          limit_reached: boolean
          professional_id: string
          subscription_active: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_slot_held: {
        Args: { p_date: string; p_professional_id: string; p_time: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "professional" | "admin"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      category_type: "health" | "beauty" | "wellness"
      modality_type: "presencial" | "online"
      payment_method:
        | "pago_movil"
        | "transferencia_bdv"
        | "transferencia_mercantil"
        | "binance"
        | "tarjeta"
        | "zelle"
      payment_status: "pending" | "verifying" | "paid" | "rejected" | "expired"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["client", "professional", "admin"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      category_type: ["health", "beauty", "wellness"],
      modality_type: ["presencial", "online"],
      payment_method: [
        "pago_movil",
        "transferencia_bdv",
        "transferencia_mercantil",
        "binance",
        "tarjeta",
        "zelle",
      ],
      payment_status: ["pending", "verifying", "paid", "rejected", "expired"],
    },
  },
} as const
