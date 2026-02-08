import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env';
import * as entities from '../entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: Object.values(entities),
  migrations: config.isDevelopment ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],
  synchronize: false, // Use migrations instead
  logging: config.isDevelopment,
  poolSize: config.DB_POOL_MAX,
  maxQueryExecutionTime: 1000, // Log slow queries
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection pool options
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20, // TypeORM pool max connections
};

export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 */
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('✓ Database connection established');

      // Run migrations only during startup
      try {
        console.log('Running pending migrations...');
        await AppDataSource.runMigrations({ transaction: 'each' });
        console.log('✓ All migrations completed successfully');
      } catch (migrationError: any) {
        console.warn('Migration warning (non-fatal):', migrationError.message);
      }
    }
  } catch (error) {
    console.error('✗ Failed to initialize database:', error);
    process.exit(1);
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
  }
}
