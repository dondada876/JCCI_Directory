import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper function to handle errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'An unexpected error occurred',
  };
}

// Helper function to upload images
export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
}

// Helper function to generate unique claim number
export async function generateClaimNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { count } = await supabase
    .from('relief_claims')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);

  const sequence = String((count || 0) + 1).padStart(5, '0');
  return `HM-${year}-${sequence}`;
}

// Helper function to track analytics events
export async function trackEvent(
  eventName: string,
  properties: Record<string, any> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('analytics_events').insert({
    event_name: eventName,
    properties,
    user_id: user?.id,
    timestamp: new Date().toISOString(),
  });
}
