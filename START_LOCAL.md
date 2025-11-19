# 🚀 Run RFQ Backend Locally (Without Docker)

## Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Version: 18 or higher
- Verify: `node --version`

### 2. Install PostgreSQL
- **Windows:** https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt install postgresql`

### 3. Install Redis (Optional)
- **Windows:** https://github.com/microsoftarchive/redis/releases
- **Mac:** `brew install redis`
- **Linux:** `sudo apt install redis-server`

---

## Setup Steps

### 1. Install Dependencies
```cmd
npm install
```

### 2. Setup PostgreSQL Database

**Option A: Using psql command line**
```cmd
psql -U postgres
```

Then run:
```sql
CREATE DATABASE rfq_platform;
CREATE USER rfq_user WITH PASSWORD 'simplepass123';
GRANT ALL PRIVILEGES ON DATABASE rfq_platform TO rfq_user;
\c rfq_platform
GRANT ALL ON SCHEMA public TO rfq_user;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Create new database: `rfq_platform`
3. Create new user: `rfq_user` with password `simplepass123`
4. Grant all privileges to the user

### 3. Configure Environment

Your `.env` file is already configured! It should have:
```env
DATABASE_URL="postgresql://rfq_user:simplepass123@localhost:5432/rfq_platform"
```

### 4. Run Database Migrations
```cmd
npx prisma migrate deploy
```

Or for development:
```cmd
npx prisma migrate dev
```

### 5. Generate Prisma Client
```cmd
npx prisma generate
```

### 6. Seed Database (Optional)
```cmd
npm run seed
```

### 7. Start the Server

**Development Mode (with hot reload):**
```cmd
npm run dev
```

**Production Mode:**
```cmd
npm run build
npm start
```

---

## Verify It's Working

### 1. Check Health
Open browser: http://localhost:3000/health

Or use curl:
```cmd
curl http://localhost:3000/health
```

### 2. Test Login
```cmd
curl -X POST http://localhost:3000/api/v1/auth/login/admin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"omarkhaled202080@gmail.com\",\"password\":\"564712Omar@@!!\"}"
```

---

## Common Issues

### Issue: Database Connection Failed

**Check if PostgreSQL is running:**
```cmd
# Windows (Services)
services.msc
# Look for "postgresql" service

# Or check with psql
psql -U postgres -c "SELECT version();"
```

**Fix:** Start PostgreSQL service

### Issue: Port 3000 Already in Use

**Change port in `.env`:**
```env
PORT=3001
```

### Issue: Redis Connection Failed

**If you don't have Redis:**
1. Comment out Redis-related code in `src/config/redis.ts`
2. Or install Redis

**If Redis is not critical for your testing, you can skip it.**

---

## Development Workflow

### Start Development Server
```cmd
npm run dev
```

This will:
- ✅ Start server on http://localhost:3000
- ✅ Watch for file changes
- ✅ Auto-reload on changes
- ✅ Show detailed logs

### View Database
```cmd
npx prisma studio
```

This opens a GUI at http://localhost:5555 to view/edit database.

### Run Migrations
```cmd
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Check Logs
Logs are saved in `logs/` directory:
- `logs/app.log` - All logs
- `logs/app.error.log` - Error logs only

---

## Production Deployment (Without Docker)

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

1. **Setup Server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install Redis
   sudo apt install redis-server
   ```

2. **Clone & Setup**
   ```bash
   git clone your-repo
   cd RFQ-Backend
   npm install
   npm run build
   ```

3. **Setup Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE rfq_platform;
   CREATE USER rfq_user WITH PASSWORD 'your-strong-password';
   GRANT ALL PRIVILEGES ON DATABASE rfq_platform TO rfq_user;
   ```

4. **Configure Environment**
   ```bash
   nano .env
   # Update DATABASE_URL, JWT_SECRET, etc.
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

6. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name rfq-backend
   pm2 save
   pm2 startup
   ```

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create App**
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   heroku addons:create heroku-redis:hobby-dev
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... set all other env vars
   ```

4. **Deploy**
   ```bash
   git push heroku main
   heroku run npx prisma migrate deploy
   ```

### Option 3: Vercel/Netlify (Serverless)

Not recommended for this app due to:
- Long-running processes (cron jobs)
- WebSocket connections
- Database connection pooling

Better suited for VPS or PaaS like Heroku.

### Option 4: Managed Services

**Railway.app:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Render.com:**
1. Connect GitHub repo
2. Add PostgreSQL database
3. Add Redis instance
4. Set environment variables
5. Deploy automatically

---

## Environment Variables for Production

Update these in `.env` before deploying:

```env
# CRITICAL: Change these!
NODE_ENV=production
JWT_SECRET=<generate-strong-random-32-char-string>
REFRESH_TOKEN_SECRET=<generate-strong-random-32-char-string>
SUPER_ADMIN_PASSWORD=<strong-password>

# Database (use production database URL)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Email (use production credentials)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_USER=your-production-user
EMAIL_PASSWORD=your-production-password

# Stripe (use production keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# CORS (your frontend domain)
CORS_ORIGINS=https://yourdomain.com
```

---

## Process Management

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start dist/app.js --name rfq-backend

# View logs
pm2 logs rfq-backend

# Restart
pm2 restart rfq-backend

# Stop
pm2 stop rfq-backend

# Auto-start on server reboot
pm2 startup
pm2 save
```

### Using systemd (Linux)

Create `/etc/systemd/system/rfq-backend.service`:
```ini
[Unit]
Description=RFQ Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/RFQ-Backend
ExecStart=/usr/bin/node dist/app.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable rfq-backend
sudo systemctl start rfq-backend
sudo systemctl status rfq-backend
```

---

## Monitoring

### View Logs
```bash
# Real-time logs
tail -f logs/app.log

# Error logs only
tail -f logs/app.error.log

# With PM2
pm2 logs rfq-backend
```

### Health Check
```bash
curl http://localhost:3000/health
```

### Database Status
```bash
psql -U rfq_user -d rfq_platform -c "SELECT COUNT(*) FROM companies;"
```

---

## Backup & Restore

### Backup Database
```bash
pg_dump -U rfq_user rfq_platform > backup.sql
```

### Restore Database
```bash
psql -U rfq_user rfq_platform < backup.sql
```

---

## Summary

**Local Development:**
```cmd
npm install
npx prisma migrate dev
npm run dev
```

**Production Deployment:**
```cmd
npm install
npm run build
npx prisma migrate deploy
npm start
```

**With PM2:**
```cmd
pm2 start dist/app.js --name rfq-backend
```

---

## Need Help?

- **Database issues:** Check PostgreSQL is running
- **Port conflicts:** Change PORT in .env
- **Migration errors:** Run `npx prisma migrate reset`
- **Build errors:** Run `npm run build` and check for TypeScript errors

**You don't need Docker!** Local development is often simpler and faster.
