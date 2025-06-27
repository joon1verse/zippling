/** AUTO-GENERATED TYPES **/
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
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
          user_nickname: any;
          price: number | null;
          currency_type: any;
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
