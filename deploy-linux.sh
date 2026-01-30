#!/bin/bash

# Personal Tracker - Linux Deployment Script

set -e

echo "=========================================="
echo "  Personal Tracker - Linux Deployment"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Running as root. Creating directories with proper permissions..."
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo ""
    echo "Install Docker on Ubuntu/Debian:"
    echo "  curl -fsSL https://get.docker.com | sh"
    echo ""
    echo "Install Docker on CentOS/RHEL:"
    echo "  curl -fsSL https://get.docker.com | sh"
    echo ""
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    echo ""
    echo "Install Docker Compose:"
    echo "  sudo apt-get install docker-compose"
    echo ""
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
DOCKER_COMPOSE="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Docker Compose found: $($DOCKER_COMPOSE version | head -1)"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database
chmod 755 database

# Check .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and set a secure JWT_SECRET:"
    echo "   nano .env"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Generate random JWT_SECRET if not set
if grep -q "your-strong-random-secret-key-change-this" .env 2>/dev/null; then
    echo ""
    echo "🔑 Generating secure JWT_SECRET..."
    RANDOM_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "change-this-$(date +%s)-random")
    sed -i "s/your-strong-random-secret-key-change-this/$RANDOM_SECRET/" .env
    echo "✅ JWT_SECRET updated in .env"
fi

# Detect server IP for API_BASE_URL
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$SERVER_IP" ] && ! grep -q "http://$SERVER_IP" .env 2>/dev/null; then
    echo ""
    echo "🌐 Detected server IP: $SERVER_IP"
    read -p "Use this IP for API_BASE_URL? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i "s|API_BASE_URL=.*|API_BASE_URL=http://$SERVER_IP:3001|" .env
        echo "✅ API_BASE_URL updated to http://$SERVER_IP:3001"
    fi
fi

echo ""
echo "🔨 Building and starting services..."
$DOCKER_COMPOSE down 2>/dev/null || true
$DOCKER_COMPOSE up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "=========================================="
echo "  Service Status"
echo "=========================================="

if $DOCKER_COMPOSE ps | grep -q "Up"; then
    echo "✅ Services are running"
    echo ""
    echo "📱 Access URLs:"
    $DOCKER_COMPOSE ps | grep "0.0.0.0" | awk '{print "   " $1 " -> http://localhost:" $NF}' | sed 's/->0.0.0.0://'
    echo ""
    echo "📚 API Documentation: http://localhost:3001/docs"
    echo ""
    echo "=========================================="
    echo "  Useful Commands"
    echo "=========================================="
    echo "View logs:      $DOCKER_COMPOSE logs -f"
    echo "Stop services:  $DOCKER_COMPOSE down"
    echo "Restart:        $DOCKER_COMPOSE restart"
    echo "Update:         $DOCKER_COMPOSE up -d --build"
    echo ""
else
    echo "❌ Services failed to start. Check logs:"
    echo "   $DOCKER_COMPOSE logs"
    exit 1
fi
