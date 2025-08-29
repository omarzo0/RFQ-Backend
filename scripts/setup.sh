echo "🚀 Setting up RFQ Automation Platform Backend"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. Some features may not work properly."
fi

echo "✅ Prerequisites check completed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding"
    read -p "Press enter when you've configured your .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Make sure Redis is running (optional but recommended)"
echo "3. Start the development server: npm run dev"
echo ""
echo "Default login credentials:"
echo "- Super Admin: admin@rfqplatform.com / SuperAdmin123!"
echo "- Demo Company User: john@company.com / DemoUser123! (development only)"
