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
      admins: {
        Row: {
          id: string
          created_at: string
          email: string
          password: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          password: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          password?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          order?: number
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          author_id: string
          published: boolean
          cover_image: string | null
          category: string
          tags: string[]
          summary: string
          layout: 'single' | 'two-column'
          type: 'article' | 'note' | 'tutorial'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          author_id: string
          published?: boolean
          cover_image?: string | null
          category: string
          tags?: string[]
          summary: string
          layout?: 'single' | 'two-column'
          type?: 'article' | 'note' | 'tutorial'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          author_id?: string
          published?: boolean
          cover_image?: string | null
          category?: string
          tags?: string[]
          summary?: string
          layout?: 'single' | 'two-column'
          type?: 'article' | 'note' | 'tutorial'
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
  }
} 