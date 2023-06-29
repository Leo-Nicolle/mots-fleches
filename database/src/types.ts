import { GridStyle, GridState } from "grid"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface SBSchema {
  public: {
    Tables: {
      Grids: {
        Row: {
          created: string
          data: GridState
          id: string
          userid: string
        }
        Insert: {
          created?: string
          data?: GridState
          id: string
          userid?: string
        }
        Update: {
          created?: string
          data?: GridState
          id?: string
          userid?: string
        }
      }
      Options: {
        Row: {
          created: string
          data: GridStyle
          id: string
          userid: string
        }
        Insert: {
          created?: string
          data?: GridStyle
          id: string
          userid?: string
        }
        Update: {
          created?: string
          data?: GridStyle
          id?: string
          userid?: string
        }
      }
      Words: {
        Row: {
          data: string[]
          userid: string
        }
        Insert: {
          data?: string[]
          userid: string
        }
        Update: {
          data?: string[]
          userid?: string
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
