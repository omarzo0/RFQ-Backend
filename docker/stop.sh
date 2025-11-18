#!/bin/bash

echo "🛑 Stopping RFQ Backend..."

docker-compose down

echo "✅ All services stopped."
echo ""
echo "💡 To remove all data (including database), run:"
echo "   docker-compose down -v"
