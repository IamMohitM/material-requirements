import { initializeDatabase, closeDatabase } from '@config/database';
import { createApp, startServer } from './app';
import logger from '@utils/logger';

async function main() {
  try {
    // Initialize database
    await initializeDatabase();

    // Create and start server
    const app = createApp();
    await startServer(app);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\nShutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();
