FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Copy .env file (for Docker deployments)
# Note: In production, use docker-compose environment variables instead
COPY .env .env

# Create necessary directories
RUN mkdir -p uploads logs

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]