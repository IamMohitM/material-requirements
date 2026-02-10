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

// Run migrations when this file is executed directly
runMigrations();
