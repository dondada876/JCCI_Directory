import { supabase } from '@/lib/supabase';
import type { Business } from '@/lib/types';

/**
 * Fetch all businesses from Supabase
 */
export async function getAllBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data.map(business => ({
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website,
    image: business.image_url || '',
    featured: business.featured,
  }));
}

/**
 * Fetch a single business by ID
 */
export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching business:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website,
    image: data.image_url || '',
    featured: data.featured,
  };
}

/**
 * Fetch businesses by category
 */
export async function getBusinessesByCategory(category: string): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('category', category)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses by category:', error);
    return [];
  }

  return data.map(business => ({
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website,
    image: business.image_url || '',
    featured: business.featured,
  }));
}

/**
 * Search businesses
 */
export async function searchBusinesses(query: string): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english',
    })
    .order('featured', { ascending: false });

  if (error) {
    console.error('Error searching businesses:', error);
    return [];
  }

  return data.map(business => ({
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website,
    image: business.image_url || '',
    featured: business.featured,
  }));
}

/**
 * Get featured businesses
 */
export async function getFeaturedBusinesses(limit: number = 3): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured businesses:', error);
    return [];
  }

  return data.map(business => ({
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website,
    image: business.image_url || '',
    featured: business.featured,
  }));
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}
