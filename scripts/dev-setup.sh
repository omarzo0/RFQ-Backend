echo "🛠️  Setting up development environment..."

# Start PostgreSQL (if using Homebrew on macOS)
if command -v brew &> /dev/null && brew services list | grep postgresql; then
    echo "📊 Starting PostgreSQL..."
    brew services start postgresql
fi

# Start Redis (if using Homebrew on macOS)
if command -v brew &> /dev/null && brew services list | grep redis; then
    echo "🔄 Starting Redis..."
    brew services start redis
fi

# Create logs directory
mkdir -p logs

# Check database connection
echo "🔍 Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env"
    exit 1
fi

# Check Redis connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful"
else
    echo "⚠️  Redis connection failed. Queue features will not work."
fi

echo "🚀 Development environment ready!"
