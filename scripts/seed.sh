#!/bin/bash
set -e

ENV_FILE=${1:-.env.local}

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

# Load env vars from file
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in $ENV_FILE"
  echo "Add it to $ENV_FILE:"
  echo "  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
  exit 1
fi

echo "Seeding from: $ENV_FILE"
echo "Target:       $DATABASE_URL"
echo ""

# Run from supabase/ so that \i relative paths resolve correctly
cd "$(dirname "$0")/../supabase"
psql "$DATABASE_URL" < seed.sql

echo ""
echo "Seed complete."
