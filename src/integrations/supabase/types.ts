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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_speakers: {
        Row: {
          bio: string | null
          created_at: string
          event_id: string
          id: string
          name: string
          photo_url: string | null
          role_title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          event_id: string
          id?: string
          name: string
          photo_url?: string | null
          role_title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          role_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          cta_text: string | null
          date: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          end_time: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_recurring: boolean | null
          location: string
          member_price: number | null
          name: string
          organizer_logo: string | null
          organizer_name: string | null
          price_amount: number | null
          price_type: string
          programme: string | null
          recurrence_info: string | null
          registration_deadline: string | null
          spots_left: number
          start_time: string
          status: Database["public"]["Enums"]["content_status"]
          target_audience: string[] | null
          total_places: number
          updated_at: string
          what_you_learn: string[] | null
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          date: string
          description: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          location: string
          member_price?: number | null
          name: string
          organizer_logo?: string | null
          organizer_name?: string | null
          price_amount?: number | null
          price_type?: string
          programme?: string | null
          recurrence_info?: string | null
          registration_deadline?: string | null
          spots_left?: number
          start_time: string
          status?: Database["public"]["Enums"]["content_status"]
          target_audience?: string[] | null
          total_places?: number
          updated_at?: string
          what_you_learn?: string[] | null
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          date?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          location?: string
          member_price?: number | null
          name?: string
          organizer_logo?: string | null
          organizer_name?: string | null
          price_amount?: number | null
          price_type?: string
          programme?: string | null
          recurrence_info?: string | null
          registration_deadline?: string | null
          spots_left?: number
          start_time?: string
          status?: Database["public"]["Enums"]["content_status"]
          target_audience?: string[] | null
          total_places?: number
          updated_at?: string
          what_you_learn?: string[] | null
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      content_status: "draft" | "published" | "cancelled"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      event_type:
        | "workshop"
        | "networking"
        | "masterclass"
        | "meetup"
        | "conference"
        | "webinar"
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
      app_role: ["admin", "user"],
      content_status: ["draft", "published", "cancelled"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      event_type: [
        "workshop",
        "networking",
        "masterclass",
        "meetup",
        "conference",
        "webinar",
      ],
    },
  },
} as const
