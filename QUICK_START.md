# Jamaica Connect - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Option 1: Use Existing Static Data (Development)

```bash
# 1. Clone and install
git clone https://github.com/dondada876/JCCI_Directory.git
cd JCCI_Directory
npm install

# 2. Run development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000
```

The app will work with static data - no database required for testing!

---

### Option 2: Full Production Setup with Supabase

#### Prerequisites
- Supabase account (free tier works)
- WordPress with Astra Pro, Amelia, ACF (on SiteGround)
- DigitalOcean Droplet (Ubuntu 22.04)

#### 1. Setup Supabase (5 minutes)

```bash
# Create project at https://supabase.com
# Copy Project URL and Keys

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

```bash
# Install dependencies
npm install

# Run database schema
# Option A: Via Supabase Dashboard
# Go to SQL Editor, paste contents of supabase/schema.sql

# Option B: Via CLI
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

```bash
# Migrate static data to Supabase (optional)
npm install -D ts-node dotenv
npx ts-node supabase/migrate-static-data.ts
```

#### 2. Setup WordPress on SiteGround (10 minutes)

```bash
# Upload plugin via SFTP or WordPress admin
# File: wordpress-integration/jamaica-connect-sync.php
# To: /wp-content/plugins/jamaica-connect-sync/

# Activate in WordPress:
# Plugins → Activate "Jamaica Connect - Supabase Sync"

# Configure:
# Settings → Jamaica Connect
# - Add Supabase URL and Service Key
# - Enable Sync
```

Create custom post type for businesses (add to functions.php):
```php
function jc_register_business_post_type() {
    register_post_type('business', array(
        'labels' => array('name' => 'Businesses'),
        'public' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'jc_register_business_post_type');
```

#### 3. Deploy to DigitalOcean (15 minutes)

```bash
# Create Ubuntu 22.04 droplet
# SSH into droplet

ssh root@your-droplet-ip

# Clone repo
git clone https://github.com/dondada876/JCCI_Directory.git
cd JCCI_Directory

# Set environment variables
export DOMAIN="yourdomain.com"
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run deployment
chmod +x deployment-scripts/deploy-to-digital-ocean.sh
./deployment-scripts/deploy-to-digital-ocean.sh
```

Point your domain to the droplet IP in DigitalOcean DNS.

Done! 🎉

---

## 🎯 Architecture Summary

```
WordPress (SiteGround)     →    Supabase (Database)    ←    Next.js (DO Droplet)
   Content Management            Source of Truth            Public Website
```

**Data Flow:**
1. Create business/news in WordPress → Syncs to Supabase
2. Amelia booking → Syncs to Supabase
3. Next.js reads from Supabase → Shows on website
4. Contact forms → Save to Supabase → WordPress can access

---

## 📚 Documentation

- **Full Integration Guide**: `INTEGRATION_GUIDE.md`
- **Database Schema**: `supabase/schema.sql`
- **WordPress Plugin**: `wordpress-integration/jamaica-connect-sync.php`
- **Deployment Scripts**: `deployment-scripts/`

---

## 🆘 Quick Troubleshooting

**Businesses not showing?**
```bash
# Check Supabase table
# Dashboard → Table Editor → businesses

# Restart Next.js
pm2 restart jamaica-connect
```

**Build fails?**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**SSL issues?**
```bash
certbot renew
systemctl restart nginx
```

---

## 📞 Support

Need help? Check `INTEGRATION_GUIDE.md` for detailed troubleshooting.

---

**Ready to connect the world to Jamaica! 🇯🇲**
