@echo off
echo 🛑 Stopping RFQ Backend...
echo.

docker-compose down

echo.
echo ✅ All services stopped.
echo.
echo 💡 To remove all data (including database), run:
echo    docker-compose down -v
echo.
pause
