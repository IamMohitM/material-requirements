import { AppDataSource } from '../config/database';

/**
 * Run pending database migrations
 */
async function runMigrations() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connection established');
    }

    console.log('Running pending migrations...');
    await AppDataSource.runMigrations();
    console.log('✓ All migrations completed successfully');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

// Commented out during testing - migrations should not run during tests
// To run migrations in development/production, uncomment the line below:
// runMigrations();
