# 🚀 RFQ Backend - Direct Server Deployment Guide

## Overview

This guide covers deploying the RFQ Backend directly to a server (VPS, cloud instance, or dedicated server) without Docker.

---

## 📋 Prerequisites

### Server Requirements
- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (Linux recommended)
- **RAM:** Minimum 2GB, Recommended 4GB+
- **CPU:** 2+ cores
- **Storage:** 20GB+ available
- **Node.js:** v18 or higher
- **PostgreSQL:** v13 or higher
- **Redis:** v6 or higher (optional but recommended)

---

## 🔧 Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

### 3. Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 4. Install Redis (Optional but Recommended)
```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installation
redis-cli ping  # Should return PONG
```

### 5. Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE rfq_platform;
CREATE USER rfq_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE rfq_platform TO rfq_user;

# Connect to the database
\c rfq_platform

# Grant schema privileges
GRANT ALL ON SCHEMA public TO rfq_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rfq_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rfq_user;

# Exit PostgreSQL
\q
```

### 2. Configure PostgreSQL for Remote Access (if needed)
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/13/main/postgresql.conf

# Find and modify:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add this line:
host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 📦 Application Deployment

### 1. Create Application Directory
```bash
# Create directory
sudo mkdir -p /var/www/rfq-backend
cd /var/www/rfq-backend

# Set ownership
sudo chown -R $USER:$USER /var/www/rfq-backend
```

### 2. Upload Application Files

**Option A: Using Git**
```bash
cd /var/www/rfq-backend
git clone <your-repository-url> .
```

**Option B: Using SCP/SFTP**
```bash
# From your local machine
scp -r /path/to/RFQ-Backend/* user@server:/var/www/rfq-backend/
```

**Option C: Using rsync**
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' /path/to/RFQ-Backend/ user@server:/var/www/rfq-backend/
```

### 3. Install Dependencies
```bash
cd /var/www/rfq-backend
npm install --production
```

### 4. Configure Environment Variables
```bash
# Create .env file
nano .env
```

**Production .env Configuration:**
```env
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL="postgresql://rfq_user:your_secure_password_here@localhost:5432/rfq_platform"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=100

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=
REDIS_DB=0

# JWT Authentication - CHANGE THESE!
JWT_SECRET=generate-a-strong-random-secret-minimum-32-characters
JWT_EXPIRES_IN=720m
REFRESH_TOKEN_SECRET=generate-another-strong-random-secret-minimum-32-characters
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-brevo-user
EMAIL_PASSWORD=your-brevo-password
EMAIL_FROM_NAME="RFQ Platform"
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# File Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=/var/www/rfq-backend/uploads
MAX_FILE_SIZE=10485760

# Payment Processing (Stripe) - Use production keys!
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS Origins
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/www/rfq-backend/logs/app.log

# Feature Flags
ENABLE_AI_PARSING=true
ENABLE_WEBHOOKS=true
ENABLE_ANALYTICS=true

# Seeding - CHANGE THESE!
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=strong-admin-password-here
COMPANY_EMAIL=company@yourdomain.com
COMPANY_PASSWORD=strong-company-password-here

# Mock Email
MOCK_EMAIL_PROVIDER=false

# AI Services
OPENAI_API_KEY=your-openai-api-key
```

### 5. Generate Strong Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy output and use as JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy output and use as REFRESH_TOKEN_SECRET
```

### 6. Run Database Migrations
```bash
cd /var/www/rfq-backend
npx prisma generate
npx prisma migrate deploy
```

### 7. Seed Database (Optional)
```bash
npm run seed
```

### 8. Build Application
```bash
npm run build
```

### 9. Create Required Directories
```bash
mkdir -p /var/www/rfq-backend/uploads
mkdir -p /var/www/rfq-backend/logs
chmod 755 /var/www/rfq-backend/uploads
chmod 755 /var/www/rfq-backend/logs
```

---

## 🚀 Start Application with PM2

### 1. Start Application
```bash
cd /var/www/rfq-backend
pm2 start dist/app.js --name rfq-backend
```

### 2. Configure PM2 Startup
```bash
# Generate startup script
pm2 startup

# Save PM2 process list
pm2 save
```

### 3. Useful PM2 Commands
```bash
# View logs
pm2 logs rfq-backend

# Monitor
pm2 monit

# Restart
pm2 restart rfq-backend

# Stop
pm2 stop rfq-backend

# Delete
pm2 delete rfq-backend

# List all processes
pm2 list

# View detailed info
pm2 show rfq-backend
```

---

## 🔒 Security Configuration

### 1. Configure Firewall
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (if accessing directly)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 2. Setup Nginx Reverse Proxy (Recommended)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rfq-backend
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (after obtaining certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rfq-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Logging

### 1. View Application Logs
```bash
# PM2 logs
pm2 logs rfq-backend

# Application logs
tail -f /var/www/rfq-backend/logs/app.log
tail -f /var/www/rfq-backend/logs/app.error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/rfq-backend
```

**Logrotate Configuration:**
```
/var/www/rfq-backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
cd /var/www/rfq-backend

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Restart application
pm2 restart rfq-backend
```

### Database Backup
```bash
# Create backup script
nano /usr/local/bin/backup-rfq-db.sh
```

**Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/rfq-backend"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U rfq_user rfq_platform > $BACKUP_DIR/rfq_platform_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/rfq_platform_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: rfq_platform_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-rfq-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-rfq-db.sh
```

---

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-03T...",
  "uptime": 123.45,
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Test API Endpoints
```bash
# Test admin login
curl -X POST http://localhost:3000/api/v1/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"your-password"}'
```

---

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs rfq-backend --lines 100

# Check if port is in use
sudo lsof -i :3000

# Check environment variables
pm2 env 0
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U rfq_user -d rfq_platform -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/rfq-backend

# Fix permissions
chmod -R 755 /var/www/rfq-backend
chmod -R 755 /var/www/rfq-backend/uploads
chmod -R 755 /var/www/rfq-backend/logs
```

---

## 📝 Checklist

Before going live:

- [ ] Update all passwords and secrets in `.env`
- [ ] Use production Stripe keys
- [ ] Configure proper CORS origins
- [ ] Setup SSL certificate
- [ ] Configure firewall
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Test all API endpoints
- [ ] Setup monitoring
- [ ] Document admin credentials securely

---

## 🎯 Quick Commands Reference

```bash
# Start application
pm2 start dist/app.js --name rfq-backend

# Restart application
pm2 restart rfq-backend

# View logs
pm2 logs rfq-backend

# Stop application
pm2 stop rfq-backend

# Database backup
pg_dump -U rfq_user rfq_platform > backup.sql

# Database restore
psql -U rfq_user rfq_platform < backup.sql

# View application logs
tail -f /var/www/rfq-backend/logs/app.log

# Check application status
pm2 status

# Monitor resources
pm2 monit
```

---

## 📞 Support

For issues or questions:
1. Check application logs: `pm2 logs rfq-backend`
2. Check database logs: `sudo tail -f /var/log/postgresql/postgresql-13-main.log`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Your RFQ Backend is now deployed and ready for production!** 🎉
