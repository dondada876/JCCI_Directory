#!/bin/bash

###############################################################################
# Supabase Database Setup Script
# Run this to initialize your Supabase database
###############################################################################

echo "🗄️  Setting up Supabase Database for Jamaica Connect"
echo "====================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create it from .env.example"
    exit 1
fi

# Load environment variables
source .env

echo ""
echo "This script will:"
echo "1. Create tables in your Supabase database"
echo "2. Set up RLS policies"
echo "3. Create indexes for performance"
echo "4. Insert seed data"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Execute schema
echo "📋 Executing database schema..."
if [ -f "supabase/schema.sql" ]; then
    # Option 1: Using Supabase CLI
    supabase db push

    # Option 2: Direct SQL execution (if you have psql)
    # psql "$DATABASE_URL" < supabase/schema.sql

    echo "✅ Database schema created successfully!"
else
    echo "❌ schema.sql not found in supabase/ directory"
    exit 1
fi

echo ""
echo "🎉 Supabase setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify tables in Supabase Dashboard"
echo "2. Add your Supabase credentials to .env"
echo "3. Test the connection: npm run dev"
echo ""
