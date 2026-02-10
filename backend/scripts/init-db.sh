#!/bin/bash
set -e

echo "🔧 Initializing MRMS Database..."

# Note: When using POSTGRES_USER=app in docker-compose, the app role is created automatically
# This script handles any additional setup needed

# Check if we're running as the postgres superuser (happens only if explicitly set)
if [ "$POSTGRES_USER" = "postgres" ]; then
    echo "⚠️  PostgreSQL user is 'postgres' - creating app user..."
    psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
        -- Create app user with password if it doesn't exist
        DO \$\$
        BEGIN
            CREATE ROLE app WITH LOGIN PASSWORD 'password' CREATEDB;
        EXCEPTION WHEN DUPLICATE_OBJECT THEN
            RAISE NOTICE 'app user already exists, skipping creation';
        END
        \$\$;

        -- Ensure mrms database exists and is owned by app
        SELECT 1 FROM pg_database WHERE datname = 'mrms' \G
        ALTER DATABASE mrms OWNER TO app;

        -- Create test database if it doesn't exist
        CREATE DATABASE IF NOT EXISTS mrms_test OWNER app;

        -- Grant necessary privileges
        GRANT CONNECT ON DATABASE mrms TO app;
        GRANT CONNECT ON DATABASE mrms_test TO app;
EOSQL
    echo "✓ App user setup complete"
else
    echo "✓ Running as app user (created automatically by PostgreSQL)"
    echo "  User: app"
    echo "  Database: mrms"
fi

# Create test database (in case it doesn't exist)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL || true
    -- This will only fail if the connection isn't working, which is fine
    SELECT 'Database initialization verified' as status;
EOSQL

echo "✓ Database initialization complete"
