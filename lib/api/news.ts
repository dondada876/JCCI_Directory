import { supabase } from '@/lib/supabase';
import type { NewsArticle } from '@/lib/types';

/**
 * Fetch all news articles from Supabase
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt || '',
    content: article.content || '',
    author: article.author || 'Jamaica Connect Staff',
    date: article.published_date || article.created_at.split('T')[0],
    image: article.image_url || '',
    featured: article.featured,
  }));
}

/**
 * Fetch a single news article by ID
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching news article:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    excerpt: data.excerpt || '',
    content: data.content || '',
    author: data.author || 'Jamaica Connect Staff',
    date: data.published_date || data.created_at.split('T')[0],
    image: data.image_url || '',
    featured: data.featured,
  };
}

/**
 * Fetch news by category
 */
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('category', category)
    .order('published_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news by category:', error);
    return [];
  }

  return data.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt || '',
    content: article.content || '',
    author: article.author || 'Jamaica Connect Staff',
    date: article.published_date || article.created_at.split('T')[0],
    image: article.image_url || '',
    featured: article.featured,
  }));
}

/**
 * Search news articles
 */
export async function searchNews(query: string): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english',
    })
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error searching news:', error);
    return [];
  }

  return data.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt || '',
    content: article.content || '',
    author: article.author || 'Jamaica Connect Staff',
    date: article.published_date || article.created_at.split('T')[0],
    image: article.image_url || '',
    featured: article.featured,
  }));
}

/**
 * Get featured news
 */
export async function getFeaturedNews(limit: number = 3): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('featured', true)
    .order('published_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured news:', error);
    return [];
  }

  return data.map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt || '',
    content: article.content || '',
    author: article.author || 'Jamaica Connect Staff',
    date: article.published_date || article.created_at.split('T')[0],
    image: article.image_url || '',
    featured: article.featured,
  }));
}
