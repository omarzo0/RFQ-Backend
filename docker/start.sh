#!/bin/bash

echo "🚀 Starting RFQ Backend with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database (optional)
read -p "Do you want to seed the database with initial data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🌱 Seeding database..."
    docker-compose exec -T app npm run seed
fi

# Show status
echo ""
echo "✅ RFQ Backend is running!"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🌐 Access Points:"
echo "   - API: http://localhost:3000"
echo "   - Health: http://localhost:3000/health"
echo "   - Database: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f app"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart app"
echo ""
