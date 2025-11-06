export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          schedule: Json;
          created_at: string;
          updated_at: string;
          share_token: string | null;
          share_role: 'viewer' | 'editor' | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          description?: string | null;
          schedule?: Json;
          share_token?: string | null;
          share_role?: 'viewer' | 'editor' | null;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      project_collaborators: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'viewer' | 'editor';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: 'viewer' | 'editor';
        };
        Update: Partial<Database['public']['Tables']['project_collaborators']['Insert']>;
      };
      project_invites: {
        Row: {
          id: string;
          project_id: string;
          email: string;
          role: 'viewer' | 'editor';
          token: string;
          expires_at: string;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          email: string;
          role?: 'viewer' | 'editor';
          token: string;
          expires_at: string;
          accepted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['project_invites']['Insert']>;
      };
    };
    Functions: {};
  };
}
