#!/bin/bash

# Backend deployment script for EC2 or local testing

set -e

echo "=========================================="
echo "ELIMUCORE Backend Deployment"
echo "=========================================="

ENVIRONMENT=${ENVIRONMENT:-production}
APP_NAME="elimucore-api"
DEPLOY_USER="${DEPLOY_USER:-elimucore}"
DEPLOY_PATH="/opt/apps/${APP_NAME}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}\n"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd backend
npm ci --production

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run migrate

# Build/compile if needed
if [ -f "tsconfig.json" ]; then
    echo -e "${YELLOW}Compiling TypeScript...${NC}"
    npm run build || true
fi

# Create .env file if on EC2
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
NODE_ENV=$ENVIRONMENT
PORT=3000
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-elimucore_app}
DB_PASSWORD=${DB_PASSWORD:-change_me}
DB_NAME=elimucore_prod
DB_PORT=3306
JWT_SECRET=${JWT_SECRET:-change_me}
CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}
LOG_LEVEL=info
EOF
    echo -e "${GREEN}.env created (update with your values)${NC}"
fi

# Setup PM2
echo -e "${YELLOW}Setting up PM2...${NC}"
npm install -g pm2 || true

# Start application
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start server.js --name $APP_NAME
pm2 save
pm2 startup

# Configure Nginx if on EC2
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Configuring Nginx...${NC}"
    
    sudo tee /etc/nginx/sites-available/elimucore > /dev/null << 'EOF'
upstream backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name _;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/health {
        access_log off;
        proxy_pass http://backend;
    }
    
    # Health check endpoint
    location /__health__ {
        access_log off;
        return 200 "OK";
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/elimucore /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
fi

echo -e "${GREEN}=========================================="
echo "Backend deployment complete!"
echo "==========================================${NC}\n"
echo "Status: $(pm2 status)"
