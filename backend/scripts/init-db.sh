#!/bin/bash
set -e

# Create app user with password
psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    CREATE ROLE app WITH LOGIN PASSWORD 'password' CREATEDB;

    -- mrms database is already created by POSTGRES_DB in docker-compose
    -- Just reassign ownership and grant privileges
    ALTER DATABASE mrms OWNER TO app;
    CREATE DATABASE mrms_test OWNER app;

    -- Grant privileges on mrms database to app user
    GRANT CONNECT ON DATABASE mrms TO app;
    GRANT CONNECT ON DATABASE mrms_test TO app;
EOSQL

echo "✓ Database initialization complete: created app user and configured databases"
