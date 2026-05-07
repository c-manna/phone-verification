declare module 'serverless-http' {
  import type { RequestHandler } from 'express';

  type ServerlessHandler = (event: unknown, context: unknown) => Promise<unknown>;

  function serverless(app: RequestHandler): ServerlessHandler;

  export default serverless;
}
