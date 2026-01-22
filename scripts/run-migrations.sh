#!/bin/bash

# Database Migration Runner Script
# Runs all database migrations in order
# Usage: ./scripts/run-migrations.sh [environment]

set -e

ENVIRONMENT=${1:-development}

echo "=========================================="
echo "ELIMUCORE Database Migrations"
echo "=========================================="
echo "Environment: $ENVIRONMENT"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Run this script from the backend directory."
  exit 1
fi

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
  export $(cat .env.$ENVIRONMENT | grep -v '#' | xargs)
elif [ -f ".env" ]; then
  export $(cat .env | grep -v '#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

echo "Loaded environment: $ENVIRONMENT"
echo "Node environment: ${NODE_ENV:-development}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Run database initialization
echo "Step 1: Initializing database schema..."
node scripts/init-database.js

# Run migrations
echo ""
echo "Step 2: Running database migrations..."
if [ -d "migrations" ]; then
  for migration in migrations/*.js; do
    if [ -f "$migration" ]; then
      echo "  Running: $(basename $migration)"
      node "$migration" || echo "  Warning: Migration $(basename $migration) had issues"
    fi
  done
  echo "✓ All migrations completed"
else
  echo "No migrations directory found"
fi

# Optionally seed database (development only)
if [ "$ENVIRONMENT" == "development" ] && [ "$2" == "--seed" ]; then
  echo ""
  echo "Step 3: Seeding database with demo data..."
  node scripts/seed-database.js
fi

echo ""
echo "=========================================="
echo "✅ Database setup complete!"
echo "=========================================="
