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
          id: string
          profile_id: string
          bot_name: string
          greeting_message: string
          training_data: string | null
          created_at: string
          updated_at: string
          assistant_id: string | null
          buttons: Json | null
          user_type: string | null
          answers: {
            business: string[]
            creator: string[]
            other: string[]
          } | null
        }
        Insert: {
          id?: string
          profile_id: string
          bot_name?: string
          greeting_message?: string
          training_data?: string | null
          created_at?: string
          updated_at?: string
          assistant_id?: string | null
          buttons?: Json | null
          user_type?: string | null
          answers?: Json | null
        }
        Update: {
          id?: string
          profile_id?: string
          bot_name?: string
          greeting_message?: string
          training_data?: string | null
          created_at?: string
          updated_at?: string
          assistant_id?: string | null
          buttons?: Json | null
          user_type?: string | null
          answers?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          theme: string | null
          created_at: string
          updated_at: string
          custom_domain: string | null
          has_customized_domain: boolean | null
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          theme?: string | null
          created_at?: string
          updated_at?: string
          custom_domain?: string | null
          has_customized_domain?: boolean | null
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          theme?: string | null
          created_at?: string
          updated_at?: string
          custom_domain?: string | null
          has_customized_domain?: boolean | null
        }
      }
      links: {
        Row: {
          id: string
          profile_id: string
          title: string
          url: string
          icon: string | null
          position: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          url: string
          icon?: string | null
          position?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          url?: string
          icon?: string | null
          position?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          link_id: string | null
          profile_id: string | null
          visitor_ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          link_id?: string | null
          profile_id?: string | null
          visitor_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string | null
          profile_id?: string | null
          visitor_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
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