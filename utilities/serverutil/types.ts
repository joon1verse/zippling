/** AUTO-GENERATED TYPES **/
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      "vancouver_community": {
        Row: {
          id: number;
          user_nickname: any;
          created_at: string;
          title: any;
          content: any;
          user_id: any;
          upvotes: number;
          downvotes: number;
          is_notice: boolean;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["vancouver_community"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["vancouver_community"]["Row"]>;
      };
      "vancouver_community_votes": {
        Row: {
          id: number;
          post_id: number;
          user_id: any;
          vote_type: any;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["vancouver_community_votes"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["vancouver_community_votes"]["Row"]>;
      };
      "vancouver_community_comments": {
        Row: {
          id: number;
          content: any;
          created_at: string;
          post_id: number;
          user_id: any;
          user_nickname: any | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["vancouver_community_comments"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["vancouver_community_comments"]["Row"]>;
      };
      "hot_deal_votes": {
        Row: {
          id: number;
          post_id: number;
          user_id: any;
          vote_type: any;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["hot_deal_votes"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["hot_deal_votes"]["Row"]>;
      };
      "hot_deal_comments": {
        Row: {
          id: number;
          content: any;
          created_at: string;
          post_id: number;
          user_id: any;
          user_nickname: any | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["hot_deal_comments"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["hot_deal_comments"]["Row"]>;
      };
      "vancouver_roomlistings": {
        Row: {
          id: any;
          title: any;
          link: any;
          price: any | null;
          tag: any | null;
          source: any | null;
          postedAt: string | null;
          crawledAt: string | null;
          event_time: string | null;
          is_notice: boolean;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["vancouver_roomlistings"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["vancouver_roomlistings"]["Row"]>;
      };
      "hot_deal_posts": {
        Row: {
          id: number;
          title: any;
          content: any | null;
          thumbnail_url: any | null;
          created_at: string;
          user_id: any;
          user_nickname: any | null;
          price: number | null;
          currency_type: any;
          upvotes: number;
          downvotes: number;
          is_notice: boolean;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["hot_deal_posts"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["hot_deal_posts"]["Row"]>;
      };
      "user_profiles": {
        Row: {
          id: any;
          full_name: any;
          user_nickname: any;
          email: any;
          birthdate: string | null;
          phone: any | null;
          created_at: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
