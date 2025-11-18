# 🚀 Quick Start - RFQ Backend Docker

## Start Everything (One Command)

```cmd
cd docker
start.bat
```

That's it! 🎉

---

## What It Does

1. ✅ Starts PostgreSQL database
2. ✅ Starts Redis cache
3. ✅ Starts RFQ Backend API
4. ✅ Runs database migrations
5. ✅ Seeds initial data (optional)

---

## Access Points

| Service | URL |
|---------|-----|
| **API** | http://localhost:3000 |
| **Health Check** | http://localhost:3000/health |
| **Database** | localhost:5432 |
| **Redis** | localhost:6379 |

---

## Common Commands

```cmd
# Start services
cd docker
start.bat

# View logs
logs.bat

# Stop services
stop.bat

# Test everything
test.bat
```

---

## Test Login

### Admin Login
```cmd
curl -X POST http://localhost:3000/api/v1/auth/login/admin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"omarkhaled202080@gmail.com\",\"password\":\"564712Omar@@!!\"}"
```

### Company Login
```cmd
curl -X POST http://localhost:3000/api/v1/auth/login/company ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"uomarkhaled202080@gmail.com\",\"password\":\"564712Omar@@!!\"}"
```

---

## Troubleshooting

### Services won't start?
```cmd
docker-compose down -v
start.bat
```

### Check logs?
```cmd
logs.bat
```

### Port already in use?
Edit `docker-compose.yml` and change:
```yaml
ports:
  - "3001:3000"  # Use different port
```

---

## Full Documentation

- **Complete Guide:** `../DOCKER_DEPLOYMENT.md`
- **Docker Details:** `README.md`
- **Fix Summary:** `../DOCKER_FIX_SUMMARY.md`

---

**That's all you need to know!** 🎉

Just run `start.bat` and you're good to go!
