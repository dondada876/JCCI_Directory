# Jamaica Connect - Complete Integration Guide

## Architecture Overview

Jamaica Connect uses a **hybrid architecture** that combines WordPress (for content management and bookings) with Next.js (for the fast, modern frontend), all connected through Supabase as the single source of truth.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        JAMAICA CONNECT ECOSYSTEM                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
│   WordPress CMS     │         │    Next.js App       │         │    Supabase      │
│   (SiteGround)      │────────▶│  (DO Droplet)        │────────▶│   (PostgreSQL)   │
│                     │         │                      │         │                  │
│ • Astra Pro Theme   │         │ • Public Directory   │         │ • Businesses     │
│ • Amelia (Booking)  │         │ • News Hub           │         │ • News Articles  │
│ • ACF Forms         │         │ • Contact Forms      │         │ • Bookings       │
│ • Content Editor    │         │ • Fast Frontend      │         │ • Contact Forms  │
│ • Business Listings │         │ • API Routes         │         │ • Reviews        │
└─────────────────────┘         └──────────────────────┘         └──────────────────┘
         │                               │                               ▲
         │                               │                               │
         └───────────────────────────────┴───────────────────────────────┘
                        All data syncs to Supabase
```

## Why This Architecture?

1. **WordPress (SiteGround)**:
   - Easy content management for non-technical users
   - Amelia handles complex booking logic
   - ACF provides flexible form building
   - Astra Pro for quick customization

2. **Next.js (DigitalOcean)**:
   - Lightning-fast performance
   - Modern UX/UI
   - SEO optimized
   - Better mobile experience
   - Image optimization

3. **Supabase**:
   - Single source of truth
   - Real-time updates
   - Scalable PostgreSQL database
   - Built-in authentication (future use)
   - REST API for easy integration

---

## 🚀 Complete Setup Guide

### Step 1: Supabase Setup

1. **Create a Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create a new project
   # Save your credentials
   ```

2. **Run Database Schema**
   ```bash
   cd /path/to/JCCI_Directory

   # Install Supabase CLI (if not installed)
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Apply the schema
   supabase db push

   # Or manually: Go to Supabase Dashboard > SQL Editor
   # Copy and paste the contents of supabase/schema.sql
   ```

3. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy:
     - Project URL
     - Anon/Public Key
     - Service Role Key (keep secret!)

---

### Step 2: WordPress Setup (SiteGround)

#### 2.1 Install Required Plugins

```bash
# Required plugins:
- Amelia (Booking system)
- Advanced Custom Fields (ACF) Pro
- WP REST API extensions (if needed)
```

#### 2.2 Install Jamaica Connect Sync Plugin

1. Upload `wordpress-integration/jamaica-connect-sync.php` to WordPress plugins folder:
   ```bash
   # Via SFTP to SiteGround:
   /public_html/wp-content/plugins/jamaica-connect-sync/jamaica-connect-sync.php
   ```

2. Activate in WordPress admin:
   ```
   WordPress Admin → Plugins → Activate "Jamaica Connect - Supabase Sync"
   ```

3. Configure the plugin:
   ```
   WordPress Admin → Settings → Jamaica Connect
   - Supabase URL: https://your-project.supabase.co
   - Supabase Service Role Key: [your-service-role-key]
   - Enable Sync: ✓
   - Save Changes
   ```

#### 2.3 Create Custom Post Types

Add to `functions.php` or create a custom plugin:

```php
// Register Business Custom Post Type
function jc_register_business_post_type() {
    register_post_type('business', array(
        'labels' => array(
            'name' => 'Businesses',
            'singular_name' => 'Business'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'jc_register_business_post_type');
```

#### 2.4 Configure ACF Fields

Create field groups for:

**Business Fields:**
- Category (Select)
- Address (Text)
- Phone (Text)
- Email (Email)
- Website (URL)
- Featured (True/False)

**Contact Form Fields:**
- Name (Text)
- Email (Email)
- Subject (Select)
- Message (Textarea)
- Business Listing (Checkbox)

#### 2.5 Configure Amelia

1. Set up services (tours, bookings, etc.)
2. Link services to businesses using custom fields
3. Bookings will automatically sync to Supabase

---

### Step 3: Next.js App Setup (DigitalOcean Droplet)

#### 3.1 Create DigitalOcean Droplet

1. Log into DigitalOcean
2. Create Droplet:
   - **Distribution**: Ubuntu 22.04 LTS
   - **Size**: Basic $12/month (2GB RAM) or higher
   - **Region**: Choose closest to your audience
   - **Add SSH Key**

#### 3.2 Deploy to DigitalOcean

```bash
# 1. SSH into your droplet
ssh root@your-droplet-ip

# 2. Clone the repository
git clone https://github.com/dondada876/JCCI_Directory.git
cd JCCI_Directory

# 3. Set environment variables
export DOMAIN="jamaicaconnect.com"  # Your domain
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_KEY="your-service-key"
export WORDPRESS_URL="https://yourwordpress.com"
export WORDPRESS_API_KEY="your-wp-api-key"

# 4. Run deployment script
chmod +x deployment-scripts/deploy-to-digital-ocean.sh
./deployment-scripts/deploy-to-digital-ocean.sh

# 5. The script will:
# - Install Node.js, PM2, Nginx
# - Build the Next.js app
# - Configure SSL with Let's Encrypt
# - Set up firewall
# - Start the app
```

#### 3.3 Point Your Domain

1. **In DigitalOcean:**
   ```
   Networking → Domains → Add Domain
   - Domain: jamaicaconnect.com
   - A Record: @ → your-droplet-ip
   - A Record: www → your-droplet-ip
   ```

2. **In Your Domain Registrar:**
   ```
   Update nameservers to:
   - ns1.digitalocean.com
   - ns2.digitalocean.com
   - ns3.digitalocean.com
   ```

---

### Step 4: Connect Everything Together

#### 4.1 Environment Variables

**Next.js (.env)**
```env
# Production environment
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
WORDPRESS_URL=https://yoursite.com
NODE_ENV=production
```

**WordPress (Plugin Settings)**
```
Settings → Jamaica Connect
- Supabase URL: https://xxx.supabase.co
- Service Role Key: your-service-key
- Enable Sync: Yes
```

#### 4.2 Test the Integration

1. **Create a test business in WordPress:**
   ```
   WordPress Admin → Businesses → Add New
   - Fill in all fields
   - Publish
   ```

2. **Check Supabase:**
   ```
   Supabase Dashboard → Table Editor → businesses
   - Should see the new business with wp_post_id
   ```

3. **Check Next.js:**
   ```
   Visit: https://yoursite.com/directory
   - Should see the business listed
   ```

4. **Test booking flow:**
   ```
   - Create a booking in Amelia
   - Check Supabase → bookings table
   - Should see the booking with amelia_booking_id
   ```

---

## 📊 Data Flow Examples

### Creating a Business

```
User creates business in WordPress
              ↓
WordPress saves to wp_posts
              ↓
jamaica-connect-sync plugin triggered
              ↓
Data sent to Supabase via REST API
              ↓
Supabase stores in businesses table
              ↓
Next.js fetches from Supabase
              ↓
Business appears on directory page
```

### Making a Booking

```
Customer books via Amelia on WordPress
              ↓
Amelia processes booking
              ↓
AmeliaBookingAdded hook triggered
              ↓
Plugin syncs to Supabase bookings table
              ↓
(Optional) Next.js displays in dashboard
              ↓
Business owner gets notification
```

### Contact Form Submission

```
User submits form on Next.js site
              ↓
API route handles submission
              ↓
Data saved to Supabase
              ↓
WordPress plugin can fetch submissions
              ↓
Admin receives email notification
```

---

## 🔧 Maintenance & Updates

### Updating Next.js App

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Run update command
update-jamaica-connect

# Or manually:
cd /var/www/jamaica-connect
git pull origin main
npm install --production
npm run build
pm2 restart jamaica-connect
```

### Monitoring

```bash
# Check app status
pm2 status

# View logs
pm2 logs jamaica-connect

# Monitor resources
pm2 monit

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy

1. **Supabase**:
   - Automatic daily backups (built-in)
   - Export via Dashboard > Database > Backups

2. **WordPress**:
   - Use SiteGround backup tools
   - Or UpdraftPlus plugin

3. **Next.js**:
   - Code in Git (already backed up)
   - Environment variables saved separately

---

## 🎯 Use Cases

### Use Case 1: Adding a New Business

**WordPress Admin:**
1. Go to Businesses → Add New
2. Enter business details
3. Upload featured image
4. Set category and mark as featured
5. Publish

**Result:**
- Automatically appears in Next.js directory
- Searchable and filterable
- Available via API

### Use Case 2: Customer Makes a Booking

**Customer Journey:**
1. Finds business in Next.js directory
2. Clicks "Book Now" → Redirects to WordPress/Amelia
3. Completes booking form
4. Receives confirmation email

**Behind the Scenes:**
- Amelia creates booking
- Sync plugin sends to Supabase
- Business owner can view in admin
- (Optional) Display on Next.js dashboard

### Use Case 3: Publishing News

**WordPress Admin:**
1. Create new post in News category
2. Add featured image and content
3. Set news category (Tourism, Business, etc.)
4. Publish

**Result:**
- Appears on Next.js news page
- Featured articles highlighted
- Related articles suggested
- Social sharing enabled

---

## 🚨 Troubleshooting

### Business not appearing in Next.js

1. Check WordPress sync status:
   ```
   Settings → Jamaica Connect → Manual Sync
   ```

2. Check Supabase:
   ```
   Dashboard → Table Editor → businesses
   Look for wp_post_id matching WordPress post ID
   ```

3. Check Next.js logs:
   ```bash
   pm2 logs jamaica-connect
   ```

### Bookings not syncing

1. Check Amelia webhooks are firing
2. Verify Supabase credentials in WordPress
3. Check WordPress debug log
4. Test manual API call:
   ```bash
   curl -X POST https://yourwordpress.com/wp-json/jamaica-connect/v1/sync
   ```

### SSL Certificate Issues

```bash
# Renew certificate
certbot renew

# Test auto-renewal
certbot renew --dry-run
```

---

## 📈 Scaling & Performance

### For High Traffic:

1. **DigitalOcean Droplet:**
   - Upgrade to larger droplet
   - Add load balancer
   - Use DigitalOcean Spaces for media

2. **Supabase:**
   - Upgrade to Pro plan
   - Enable read replicas
   - Use connection pooling

3. **WordPress:**
   - Enable SiteGround caching
   - Use CDN (Cloudflare)
   - Optimize images

4. **Next.js:**
   - Enable ISR (Incremental Static Regeneration)
   - Add Redis cache
   - Use CDN for static assets

---

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Never commit .env files
   - Use different keys for dev/production
   - Rotate keys regularly

2. **Supabase:**
   - Enable RLS (Row Level Security)
   - Use anon key for public access
   - Use service key only server-side

3. **WordPress:**
   - Keep plugins updated
   - Use strong passwords
   - Enable 2FA
   - Regular backups

4. **DigitalOcean:**
   - Keep system updated
   - Use SSH keys (no passwords)
   - Enable firewall
   - Regular security audits

---

## 📞 Support

For issues or questions:
- Check logs first (PM2, Nginx, WordPress)
- Review this documentation
- Check Supabase dashboard for errors
- Contact: support@jamaicaconnect.com

---

## 🎉 You're All Set!

Your Jamaica Connect platform is now fully integrated with:
- ✅ WordPress for content management
- ✅ Amelia for bookings
- ✅ ACF for forms
- ✅ Supabase as source of truth
- ✅ Next.js for fast frontend
- ✅ DigitalOcean for hosting

Enjoy building the world's best Jamaica directory! 🇯🇲
