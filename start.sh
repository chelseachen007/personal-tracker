#!/bin/bash

echo "🚀 Starting Personal Tracker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "📖 Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "📖 Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create database directory if it doesn't exist
mkdir -p database

echo "📦 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "✅ Personal Tracker is now running!"
echo ""
echo "🌐 Access your app at:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   API Docs:  http://localhost:3001/docs"
echo ""
echo "📝 Default login: Register a new account on the login page"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📋 To view logs: docker-compose logs -f"
