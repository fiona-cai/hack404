export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coordinates: {
        Row: {
          created_at: string
          id: number
          latitude: number | null
          longitude: number | null
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "coordinates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gotcha_cards: {
        Row: {
          id: string
          title: string
          description: string
          type: 'compliment' | 'question' | 'challenge' | 'fun_fact' | 'icebreaker' | 'dare' | 'memory' | 'prediction'
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          icon_emoji: string
          background_color: string
          text_color: string
          is_dynamic: boolean
          tags: string[]
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'compliment' | 'question' | 'challenge' | 'fun_fact' | 'icebreaker' | 'dare' | 'memory' | 'prediction'
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          icon_emoji: string
          background_color: string
          text_color: string
          is_dynamic?: boolean
          tags?: string[]
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'compliment' | 'question' | 'challenge' | 'fun_fact' | 'icebreaker' | 'dare' | 'memory' | 'prediction'
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          icon_emoji?: string
          background_color?: string
          text_color?: string
          is_dynamic?: boolean
          tags?: string[]
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gotcha_events: {
        Row: {
          id: string
          user_a_id: number
          user_b_id: number
          card_id: string
          location_lat: number | null
          location_lng: number | null
          created_at: string
          completed_at: string | null
          completion_notes: string | null
        }
        Insert: {
          id?: string
          user_a_id: number
          user_b_id: number
          card_id: string
          location_lat?: number | null
          location_lng?: number | null
          created_at?: string
          completed_at?: string | null
          completion_notes?: string | null
        }
        Update: {
          id?: string
          user_a_id?: number
          user_b_id?: number
          card_id?: string
          location_lat?: number | null
          location_lng?: number | null
          created_at?: string
          completed_at?: string | null
          completion_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gotcha_events_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gotcha_events_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gotcha_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "gotcha_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string
          birthday: string | null
          created_at: string
          id: number
          interests: string[]
          name: string
          phone_number: string | null
        }
        Insert: {
          avatar: string
          birthday?: string | null
          created_at?: string
          id?: number
          interests?: string[]
          name?: string
          phone_number?: string | null
        }
        Update: {
          avatar?: string
          birthday?: string | null
          created_at?: string
          id?: number
          interests?: string[]
          name?: string
          phone_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
