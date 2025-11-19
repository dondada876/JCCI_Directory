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
      businesses: {
        Row: {
          id: string
          business_name: string
          slug: string
          owner_name: string
          email: string
          phone: string | null
          whatsapp: string | null
          category: string
          subcategory: string | null
          description: string | null
          country: string
          state_province: string | null
          city: string | null
          address: string | null
          coordinates: unknown | null
          website: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          logo_url: string | null
          cover_image_url: string | null
          business_hours: Json | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          views_count: number
          contact_clicks: number
          rating_average: number
          review_count: number
          created_at: string
          updated_at: string
          created_by: string | null
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          business_name: string
          slug: string
          owner_name: string
          email: string
          phone?: string | null
          whatsapp?: string | null
          category: string
          subcategory?: string | null
          description?: string | null
          country: string
          state_province?: string | null
          city?: string | null
          address?: string | null
          coordinates?: unknown | null
          website?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          business_hours?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          views_count?: number
          contact_clicks?: number
          rating_average?: number
          review_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          business_name?: string
          slug?: string
          owner_name?: string
          email?: string
          phone?: string | null
          whatsapp?: string | null
          category?: string
          subcategory?: string | null
          description?: string | null
          country?: string
          state_province?: string | null
          city?: string | null
          address?: string | null
          coordinates?: unknown | null
          website?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          business_hours?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          views_count?: number
          contact_clicks?: number
          rating_average?: number
          review_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      business_categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          description: string | null
          icon_url: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          description?: string | null
          icon_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          description?: string | null
          icon_url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      business_reviews: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          rating: number | null
          review_text: string | null
          owner_response: string | null
          response_date: string | null
          is_verified_customer: boolean
          is_flagged: boolean
          moderation_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          rating?: number | null
          review_text?: string | null
          owner_response?: string | null
          response_date?: string | null
          is_verified_customer?: boolean
          is_flagged?: boolean
          moderation_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string | null
          rating?: number | null
          review_text?: string | null
          owner_response?: string | null
          response_date?: string | null
          is_verified_customer?: boolean
          is_flagged?: boolean
          moderation_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      relief_claims: {
        Row: {
          id: string
          claim_number: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          whatsapp: string | null
          national_id: string | null
          parish: string
          community: string
          address: string
          coordinates: unknown | null
          household_size: number | null
          children_count: number | null
          elderly_count: number | null
          disabled_count: number | null
          damage_type: string[] | null
          damage_severity: string | null
          damage_photos: string[] | null
          immediate_needs: string[] | null
          verification_status: string
          verified_by: string | null
          verification_date: string | null
          verification_notes: string | null
          verification_partner: string | null
          approved_items: Json | null
          distribution_location: string | null
          pickup_date: string | null
          pickup_confirmed: boolean
          status: string
          priority_level: string
          public_notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
          fulfilled_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          claim_number: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          whatsapp?: string | null
          national_id?: string | null
          parish: string
          community: string
          address: string
          coordinates?: unknown | null
          household_size?: number | null
          children_count?: number | null
          elderly_count?: number | null
          disabled_count?: number | null
          damage_type?: string[] | null
          damage_severity?: string | null
          damage_photos?: string[] | null
          immediate_needs?: string[] | null
          verification_status?: string
          verified_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_partner?: string | null
          approved_items?: Json | null
          distribution_location?: string | null
          pickup_date?: string | null
          pickup_confirmed?: boolean
          status?: string
          priority_level?: string
          public_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          fulfilled_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          claim_number?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          whatsapp?: string | null
          national_id?: string | null
          parish?: string
          community?: string
          address?: string
          coordinates?: unknown | null
          household_size?: number | null
          children_count?: number | null
          elderly_count?: number | null
          disabled_count?: number | null
          damage_type?: string[] | null
          damage_severity?: string | null
          damage_photos?: string[] | null
          immediate_needs?: string[] | null
          verification_status?: string
          verified_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_partner?: string | null
          approved_items?: Json | null
          distribution_location?: string | null
          pickup_date?: string | null
          pickup_confirmed?: boolean
          status?: string
          priority_level?: string
          public_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          fulfilled_at?: string | null
          created_by?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          donor_name: string | null
          donor_email: string
          donor_country: string | null
          is_anonymous: boolean
          amount: number
          currency: string
          payment_method: string | null
          stripe_payment_id: string | null
          transaction_fee: number | null
          net_amount: number | null
          campaign_id: string | null
          designated_use: string | null
          allocation_status: string
          tax_receipt_issued: boolean
          tax_receipt_url: string | null
          tax_receipt_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_name?: string | null
          donor_email: string
          donor_country?: string | null
          is_anonymous?: boolean
          amount: number
          currency?: string
          payment_method?: string | null
          stripe_payment_id?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          campaign_id?: string | null
          designated_use?: string | null
          allocation_status?: string
          tax_receipt_issued?: boolean
          tax_receipt_url?: string | null
          tax_receipt_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_name?: string | null
          donor_email?: string
          donor_country?: string | null
          is_anonymous?: boolean
          amount?: number
          currency?: string
          payment_method?: string | null
          stripe_payment_id?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          campaign_id?: string | null
          designated_use?: string | null
          allocation_status?: string
          tax_receipt_issued?: boolean
          tax_receipt_url?: string | null
          tax_receipt_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          campaign_name: string
          slug: string
          campaign_type: string | null
          description: string | null
          image_url: string | null
          video_url: string | null
          goal_amount: number | null
          current_amount: number
          currency: string
          start_date: string
          end_date: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_name: string
          slug: string
          campaign_type?: string | null
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          goal_amount?: number | null
          current_amount?: number
          currency?: string
          start_date: string
          end_date?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_name?: string
          slug?: string
          campaign_type?: string | null
          description?: string | null
          image_url?: string | null
          video_url?: string | null
          goal_amount?: number | null
          current_amount?: number
          currency?: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          phone: string | null
          whatsapp: string | null
          country: string | null
          state_province: string | null
          city: string | null
          parish: string | null
          preferred_language: string
          notification_preferences: Json | null
          user_type: string
          businesses_claimed: string[] | null
          favorite_businesses: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          country?: string | null
          state_province?: string | null
          city?: string | null
          parish?: string | null
          preferred_language?: string
          notification_preferences?: Json | null
          user_type?: string
          businesses_claimed?: string[] | null
          favorite_businesses?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          country?: string | null
          state_province?: string | null
          city?: string | null
          parish?: string | null
          preferred_language?: string
          notification_preferences?: Json | null
          user_type?: string
          businesses_claimed?: string[] | null
          favorite_businesses?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      increment_business_views: {
        Args: { business_id: string }
        Returns: void
      }
      update_business_rating: {
        Args: { business_id: string }
        Returns: void
      }
      businesses_near_location: {
        Args: { lat: number; lng: number; radius_km: number }
        Returns: Database['public']['Tables']['businesses']['Row'][]
      }
      get_donation_stats: {
        Args: {}
        Returns: {
          total_raised: number
          total_allocated: number
          total_disbursed: number
          active_donors: number
        }
      }
      get_allocation_breakdown: {
        Args: {}
        Returns: {
          category: string
          amount: number
        }[]
      }
    }
  }
}
