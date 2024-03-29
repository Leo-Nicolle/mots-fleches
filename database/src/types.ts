import { GridStyle, GridState } from "grid";

export type Font = {
  family: string;
  content: string;
  updated: number;
};
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json; }
  | Json[];

export type Book = {
  id: string;
  title: string;
  grids: string[];
  comment: string;
  created: number;
  updated: number;
  style: string;
  solutionStyle: string;
};

export interface SBSchema {
  public: {
    Tables: {
      Grids: {
        Row: {
          created: string;
          data: GridState;
          id: string;
          userid: string;
        };
        Insert: {
          created?: string;
          data?: GridState;
          id: string;
          userid?: string;
        };
        Update: {
          created?: string;
          data?: GridState;
          id?: string;
          userid?: string;
        };
      };
      Books: {
        Row: {
          created: string;
          data: Book;
          id: string;
          userid: string;
        };
        Insert: {
          created?: string;
          data?: Book;
          id: string;
          userid?: string;
        };
        Update: {
          created?: string;
          data?: Book;
          id?: string;
          userid?: string;
        };
      };
      Options: {
        Row: {
          created: string;
          data: GridStyle;
          id: string;
          userid: string;
        };
        Insert: {
          created?: string;
          data?: GridStyle;
          id: string;
          userid?: string;
        };
        Update: {
          created?: string;
          data?: GridStyle;
          id?: string;
          userid?: string;
        };
      };
      Words: {
        Row: {
          data: string[];
          userid: string;
        };
        Insert: {
          data?: string[];
          userid: string;
        };
        Update: {
          data?: string[];
          userid?: string;
        };
      };
    };
    Fonts: {
      Row: {
        updated: string;
        fileId: string;
        id: string;
        userid: string;
      };
      Insert: {
        updated: string;
        fileId: string;
        id: string;
        userid?: string;
      };
      Update: {
        updated: string;
        fileId: string;
        id?: string;
        userid?: string;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}