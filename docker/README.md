# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# From the project root directory
cd docker
docker-compose up -d
```

This will start:
- **PostgreSQL** database on port 5432
- **Redis** cache on port 6379
- **RFQ Backend** API on port 3000

### 2. Check Status

```bash
docker-compose ps
docker-compose logs -f app
```

### 3. Run Database Migrations

```bash
# Run migrations inside the container
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npm run seed
```

### 4. Access the Application

- API: http://localhost:3000
- Health Check: http://localhost:3000/health
- Database: localhost:5432

## Environment Variables

The `docker-compose.yml` file contains all necessary environment variables. For production:

1. **Copy `.env.docker` to project root as `.env`**
2. **Update sensitive values** (JWT secrets, Stripe keys, passwords)
3. **Rebuild the container**: `docker-compose up -d --build`

## Production Deployment

### Option 1: Use Environment Variables (Recommended)

Edit `docker-compose.yml` and update the environment variables directly. This is more secure as the `.env` file won't be in the container.

### Option 2: Use .env File

1. Copy `.env.docker` to project root as `.env`
2. Update all values
3. The Dockerfile will copy it into the container

### Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- [ ] Update `SUPER_ADMIN_PASSWORD` and `COMPANY_PASSWORD`
- [ ] Set real Stripe keys (not test keys)
- [ ] Update email credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGINS`
- [ ] Add OpenAI API key if using AI features
- [ ] Use strong database password
- [ ] Enable Redis password if needed

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Access database
docker-compose exec db psql -U rfq_user -d rfq_platform

# Access Redis CLI
docker-compose exec redis redis-cli

# Shell into app container
docker-compose exec app sh

# Remove all data (WARNING: Deletes database!)
docker-compose down -v
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec db pg_isready -U rfq_user

# View database logs
docker-compose logs db
```

### Application Won't Start

```bash
# Check app logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep DATABASE_URL
```

### Port Already in Use

If ports 3000, 5432, or 6379 are already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port (left side)
```

## Development vs Production

### Development (Local)
- Use `.env` file in project root
- Run `npm run dev` directly
- Database on localhost:5432

### Production (Docker)
- Use `docker-compose.yml` environment variables
- Run `docker-compose up -d`
- Database on internal Docker network

## Scaling

To run multiple app instances:

```bash
docker-compose up -d --scale app=3
```

Add a load balancer (nginx) in front of the app containers.

## Backup & Restore

### Backup Database

```bash
docker-compose exec db pg_dump -U rfq_user rfq_platform > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T db psql -U rfq_user rfq_platform
```

## Monitoring

Add monitoring services to `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

## Support

For issues, check:
1. Application logs: `docker-compose logs app`
2. Database logs: `docker-compose logs db`
3. Redis logs: `docker-compose logs redis`
