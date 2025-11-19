/**
 * Migrate Static Data to Supabase
 *
 * This script migrates the existing static data from data/businesses.ts
 * and data/news.ts to your Supabase database.
 *
 * Run with: npx ts-node supabase/migrate-static-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { businesses as staticBusinesses, categories as staticCategories } from '../data/businesses';
import { newsArticles as staticNews } from '../data/news';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCategories() {
  console.log('📋 Migrating categories...');

  const { data, error } = await supabase
    .from('categories')
    .upsert(staticCategories, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error migrating categories:', error);
    return false;
  }

  console.log(`✅ Migrated ${staticCategories.length} categories`);
  return true;
}

async function migrateBusinesses() {
  console.log('🏢 Migrating businesses...');

  const businessData = staticBusinesses.map((business) => ({
    name: business.name,
    slug: business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: business.category,
    description: business.description,
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website || null,
    image_url: business.image,
    featured: business.featured,
  }));

  const { data, error } = await supabase
    .from('businesses')
    .insert(businessData);

  if (error) {
    console.error('❌ Error migrating businesses:', error);
    return false;
  }

  console.log(`✅ Migrated ${businessData.length} businesses`);
  return true;
}

async function migrateNews() {
  console.log('📰 Migrating news articles...');

  const newsData = staticNews.map((article) => ({
    title: article.title,
    slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    author: article.author,
    published_date: article.date,
    image_url: article.image,
    featured: article.featured,
  }));

  const { data, error } = await supabase
    .from('news_articles')
    .insert(newsData);

  if (error) {
    console.error('❌ Error migrating news:', error);
    return false;
  }

  console.log(`✅ Migrated ${newsData.length} news articles`);
  return true;
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');

  // Delete in correct order (due to foreign keys)
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('business_hours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('contact_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('news_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('✅ Cleared existing data');
}

async function main() {
  console.log('🇯🇲 Jamaica Connect - Data Migration');
  console.log('=====================================\n');

  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log('');

  // Ask for confirmation
  console.log('⚠️  This will clear existing data and migrate static data to Supabase.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // Clear existing data
    await clearExistingData();

    // Migrate in order
    const categoriesSuccess = await migrateCategories();
    if (!categoriesSuccess) {
      console.error('❌ Failed to migrate categories');
      process.exit(1);
    }

    const businessesSuccess = await migrateBusinesses();
    if (!businessesSuccess) {
      console.error('❌ Failed to migrate businesses');
      process.exit(1);
    }

    const newsSuccess = await migrateNews();
    if (!newsSuccess) {
      console.error('❌ Failed to migrate news');
      process.exit(1);
    }

    console.log('\n=====================================');
    console.log('🎉 Migration Complete!');
    console.log('=====================================\n');
    console.log('Next steps:');
    console.log('1. Check Supabase dashboard to verify data');
    console.log('2. Update your Next.js app to use Supabase API');
    console.log('3. Test the application\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
