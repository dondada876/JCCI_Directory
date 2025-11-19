import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const getServiceRoleClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Database Types
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          image_url: string | null;
          featured: boolean;
          wp_post_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          excerpt: string | null;
          content: string | null;
          author: string | null;
          published_date: string | null;
          image_url: string | null;
          featured: boolean;
          wp_post_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['news_articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['news_articles']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          business_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          service_name: string | null;
          booking_date: string;
          duration_minutes: number | null;
          status: string;
          amelia_booking_id: number | null;
          price: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
          notes: string | null;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string | null;
          business_listing: boolean;
          acf_form_id: number | null;
          wp_post_id: number | null;
          status: string;
          created_at: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          author_name: string;
          author_email: string | null;
          rating: number;
          review_text: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          display_order: number;
        };
      };
    };
  };
}
