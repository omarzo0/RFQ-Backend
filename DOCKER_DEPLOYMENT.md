# 🐳 Docker Deployment Guide - RFQ Backend

## Problem Fixed ✅

**Issue:** `DATABASE_URL environment variable not found`

**Root Cause:** The `.env` file wasn't being loaded in Docker container, and docker-compose.yml was missing most environment variables.

**Solution:** Updated docker-compose.yml with all required environment variables and improved Dockerfile.

---

## Quick Start (Windows)

### Option 1: Using Batch Files (Easiest)

```cmd
cd docker
start.bat
```

This will:
- ✅ Build Docker images
- ✅ Start PostgreSQL, Redis, and the API
- ✅ Run database migrations
- ✅ Optionally seed the database

### Option 2: Manual Commands

```cmd
cd docker
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed
```

---

## What Changed

### 1. Updated `docker-compose.yml`
- ✅ Added ALL environment variables (60+ variables)
- ✅ Added Redis service
- ✅ Added health checks for database and Redis
- ✅ Added volume mounts for uploads and logs
- ✅ Fixed build context to use parent directory

### 2. Updated `Dockerfile`
- ✅ Added .env file copy (as fallback)
- ✅ Improved build process

### 3. Created Helper Scripts
- ✅ `start.bat` - Start everything (Windows)
- ✅ `stop.bat` - Stop all services (Windows)
- ✅ `logs.bat` - View logs (Windows)
- ✅ `start.sh` - Start everything (Linux/Mac)
- ✅ `stop.sh` - Stop all services (Linux/Mac)

### 4. Created Documentation
- ✅ `docker/README.md` - Comprehensive Docker guide
- ✅ `docker/.env.docker` - Environment template for Docker
- ✅ `.dockerignore` - Optimize Docker builds

---

## Services Running

After starting, you'll have:

| Service | Port | URL |
|---------|------|-----|
| **API** | 3000 | http://localhost:3000 |
| **PostgreSQL** | 5432 | localhost:5432 |
| **Redis** | 6379 | localhost:6379 |

---

## Verify It's Working

### 1. Check Health

```cmd
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

### 2. Check Logs

```cmd
cd docker
docker-compose logs app
```

You should see:
```
✅ Database connected successfully
⏰ Cron jobs started
🚀 Server running on port 3000
```

### 3. Test Login

```cmd
curl -X POST http://localhost:3000/api/v1/auth/login/admin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"omarkhaled202080@gmail.com\",\"password\":\"564712Omar@@!!\"}"
```

---

## Common Commands

### View Logs
```cmd
cd docker
docker-compose logs -f app
```

### Stop Services
```cmd
cd docker
docker-compose down
```

### Restart Services
```cmd
cd docker
docker-compose restart app
```

### Rebuild After Code Changes
```cmd
cd docker
docker-compose up -d --build
```

### Access Database
```cmd
docker-compose exec db psql -U rfq_user -d rfq_platform
```

### Run Migrations
```cmd
docker-compose exec app npx prisma migrate deploy
```

### Seed Database
```cmd
docker-compose exec app npm run seed
```

### Shell into Container
```cmd
docker-compose exec app sh
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:** Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Issue: Database Connection Failed

**Check database status:**
```cmd
docker-compose exec db pg_isready -U rfq_user
```

**View database logs:**
```cmd
docker-compose logs db
```

### Issue: Container Won't Start

**View detailed logs:**
```cmd
docker-compose logs app
```

**Check environment variables:**
```cmd
docker-compose exec app env | findstr DATABASE_URL
```

### Issue: Need to Reset Everything

**Stop and remove all data:**
```cmd
docker-compose down -v
```

**Then start fresh:**
```cmd
start.bat
```

---

## Environment Variables

All environment variables are set in `docker-compose.yml`. Key variables:

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_POOL_MIN` - Minimum connections (5)
- `DATABASE_POOL_MAX` - Maximum connections (100)

### Authentication
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration (720m)
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh expiration (7d)

### Email
- `EMAIL_HOST` - SMTP host (smtp-relay.brevo.com)
- `EMAIL_PORT` - SMTP port (587)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password

### Payment
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Webhook secret

---

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change `REFRESH_TOKEN_SECRET` to a strong random value
- [ ] Update `SUPER_ADMIN_PASSWORD` to a strong password
- [ ] Update `COMPANY_PASSWORD` to a strong password
- [ ] Use production Stripe keys (not test keys)
- [ ] Update email credentials
- [ ] Set proper `CORS_ORIGINS`
- [ ] Add real `OPENAI_API_KEY` if using AI features
- [ ] Use strong database password
- [ ] Enable Redis password
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper logging
- [ ] Set up monitoring

### Generate Strong Secrets

```cmd
# Generate JWT secret (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Development vs Docker

### Local Development (Recommended for Development)
```cmd
npm run dev
```
- Uses `.env` file in project root
- Hot reload with nodemon
- Direct database access
- Faster iteration

### Docker (Recommended for Production/Testing)
```cmd
cd docker
start.bat
```
- Uses docker-compose environment variables
- Production-like environment
- Isolated services
- Easy deployment

---

## Next Steps

1. ✅ **Start the services:** Run `docker/start.bat`
2. ✅ **Test the API:** Visit http://localhost:3000/health
3. ✅ **Check logs:** Run `docker/logs.bat`
4. ✅ **Test authentication:** Try logging in
5. ✅ **Create RFQs:** Use the API endpoints

---

## Support

If you encounter issues:

1. **Check logs:** `docker-compose logs app`
2. **Check database:** `docker-compose logs db`
3. **Check Redis:** `docker-compose logs redis`
4. **Verify environment:** `docker-compose exec app env`
5. **Restart services:** `docker-compose restart`

---

## Summary

✅ **Fixed:** DATABASE_URL not found error
✅ **Added:** Complete environment variable configuration
✅ **Added:** Redis service
✅ **Added:** Health checks
✅ **Added:** Helper scripts for Windows
✅ **Added:** Comprehensive documentation

**Your Docker deployment is now ready to use!** 🎉

Run `cd docker && start.bat` to get started.
