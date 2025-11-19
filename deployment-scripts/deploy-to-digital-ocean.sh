#!/bin/bash

###############################################################################
# Jamaica Connect - DigitalOcean Droplet Deployment Script
# This script deploys the Next.js app to a DigitalOcean droplet
###############################################################################

set -e  # Exit on error

echo "🇯🇲 Jamaica Connect - DigitalOcean Deployment"
echo "=============================================="

# Configuration
APP_NAME="jamaica-connect"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="${DOMAIN:-your-domain.com}"  # Set via environment variable
NODE_VERSION="20"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Update system
print_step "Updating system packages..."
apt-get update
apt-get upgrade -y

# Step 2: Install Node.js
print_step "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Step 3: Install PM2 (Process Manager)
print_step "Installing PM2..."
npm install -g pm2

# Step 4: Install Nginx
print_step "Installing Nginx..."
apt-get install -y nginx

# Step 5: Install Certbot for SSL
print_step "Installing Certbot for SSL..."
apt-get install -y certbot python3-certbot-nginx

# Step 6: Create app directory
print_step "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Step 7: Clone repository (or copy files)
print_step "Deploying application files..."
if [ -d ".git" ]; then
    git pull origin main
else
    print_warning "Cloning repository..."
    git clone https://github.com/dondada876/JCCI_Directory.git .
fi

# Step 8: Install dependencies
print_step "Installing Node.js dependencies..."
npm install --production

# Step 9: Create .env file
print_step "Setting up environment variables..."
cat > .env << EOF
# Environment
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://$DOMAIN

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# WordPress
WORDPRESS_URL=$WORDPRESS_URL
WORDPRESS_API_KEY=$WORDPRESS_API_KEY
EOF

print_warning "Make sure to edit /var/www/$APP_NAME/.env with your actual credentials!"

# Step 10: Build the application
print_step "Building Next.js application..."
npm run build

# Step 11: Configure PM2
print_step "Configuring PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start the app with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Step 12: Configure Nginx
print_step "Configuring Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Increase client_max_body_size for image uploads
    client_max_body_size 50M;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Step 13: Setup SSL with Let's Encrypt
print_step "Setting up SSL certificate..."
if [ "$DOMAIN" != "your-domain.com" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
else
    print_warning "Skipping SSL setup. Set DOMAIN environment variable and run: certbot --nginx -d your-domain.com"
fi

# Step 14: Setup firewall
print_step "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Step 15: Create deployment script for updates
print_step "Creating update script..."
cat > /usr/local/bin/update-jamaica-connect << 'EOF'
#!/bin/bash
cd /var/www/jamaica-connect
git pull origin main
npm install --production
npm run build
pm2 restart jamaica-connect
echo "✅ Jamaica Connect updated successfully!"
EOF

chmod +x /usr/local/bin/update-jamaica-connect

# Step 16: Setup log rotation
print_step "Setting up log rotation..."
cat > /etc/logrotate.d/$APP_NAME << EOF
$APP_DIR/.next/log/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
EOF

print_step "Deployment complete! 🎉"
echo ""
echo "=============================================="
echo "Jamaica Connect is now running!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo "1. Edit environment variables: nano $APP_DIR/.env"
echo "2. Restart the app: pm2 restart $APP_NAME"
echo "3. View logs: pm2 logs $APP_NAME"
echo "4. Monitor: pm2 monit"
echo ""
echo "🌐 Your site should be accessible at: http://$DOMAIN"
echo "📊 PM2 Dashboard: pm2 monit"
echo "🔄 To update: run 'update-jamaica-connect'"
echo ""
echo "=============================================="
