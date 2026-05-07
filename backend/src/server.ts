import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

export async function start(): Promise<void> {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
}
