import serverless from 'serverless-http';
import app from './app';
import { connectDB } from './config/db';

const serverlessHandler = serverless(app);

export const handler = async (
  event: unknown,
  context: { callbackWaitsForEmptyEventLoop?: boolean } = {}
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return serverlessHandler(event as never, context as never);
};
