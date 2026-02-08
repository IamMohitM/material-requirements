import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env';
import * as entities from '../entities';

// Determine if we're running from compiled dist or source
const isCompiledRuntime = __dirname.includes('dist');
const migrationsPath = isCompiledRuntime ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: Object.values(entities),
  migrations: migrationsPath,
  synchronize: false, // Use migrations instead
  logging: config.isDevelopment,
  poolSize: 10,
  maxQueryExecutionTime: 5000, // Log slow queries
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 * Note: Migrations are run separately via 'npm run migrate' to avoid connection pool issues
 */
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('✓ Database connection established');
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

/**
 * Wrapper to handle TypeORM connection errors with automatic retry
 * Solves the "Driver not Connected" issue by reconnecting when needed
 */
export async function withDatabaseConnection<T>(
  callback: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await callback();
    } catch (error: any) {
      const isConnectionError =
        error?.message?.includes('Driver not Connected') ||
        error?.message?.includes('client closed') ||
        error?.message?.includes('Connection lost') ||
        error?.code === 'ECONNREFUSED';

      if (isConnectionError && attempt < retries) {
        console.warn(`Database connection error on attempt ${attempt}, reconnecting...`);
        try {
          // Destroy and reinitialize the connection
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
          }
          await AppDataSource.initialize();
          console.log('✓ Connection restored');
          // Retry the operation
          continue;
        } catch (reInitError) {
          console.error('Failed to restore connection:', reInitError);
          throw error;
        }
      }
      // If not a connection error or we're out of retries, throw the original error
      throw error;
    }
  }
  throw new Error('Failed after all retries');
}
