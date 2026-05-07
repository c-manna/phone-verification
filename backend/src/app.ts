import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import verificationRoutes from './routes/verification.routes';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: false
  })
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Phone verification API is running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
