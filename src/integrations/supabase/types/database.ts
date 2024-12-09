export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chatbot_settings: {
        Row: {
          answers: Json | null
          assistant_id: string | null
          bot_name: string
          buttons: Json | null
          created_at: string
          greeting_message: string
          id: string
          profile_id: string
          training_data: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          answers?: Json | null
          assistant_id?: string | null
          bot_name?: string
          buttons?: Json | null
          created_at?: string
          greeting_message?: string
          id?: string
          profile_id: string
          training_data?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          answers?: Json | null
          assistant_id?: string | null
          bot_name?: string
          buttons?: Json | null
          created_at?: string
          greeting_message?: string
          id?: string
          profile_id?: string
          training_data?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          position: number | null
          profile_id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          profile_id: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          profile_id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          custom_domain: string | null
          display_name: string | null
          has_customized_domain: boolean | null
          id: string
          theme: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_domain?: string | null
          display_name?: string | null
          has_customized_domain?: boolean | null
          id: string
          theme?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_domain?: string | null
          display_name?: string | null
          has_customized_domain?: boolean | null
          id?: string
          theme?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string
          id: string
          link_id: string | null
          profile_id: string | null
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link_id?: string | null
          profile_id?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string | null
          profile_id?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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