@echo off
echo 📋 Viewing RFQ Backend logs...
echo Press Ctrl+C to exit
echo.

docker-compose logs -f app
