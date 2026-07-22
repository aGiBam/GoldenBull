import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { ordersRouter } from './routes/orders.routes';
import { discountsRouter } from './routes/discounts.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// CORS_ORIGIN can be a single URL or a comma-separated list (e.g. when the
// frontend runs on a non-default `ng serve` port). In development, any
// localhost/127.0.0.1 origin is allowed regardless of port so you don't have
// to babysit this every time you change ports; set CORS_ORIGIN explicitly for
// production instead of relying on the localhost fallback.
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      const isLocalhost = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost || allowedOrigins.includes(origin ?? '')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
  })
);
// Raised from the default 100kb so checkout can attach a base64-encoded
// payment-proof screenshot (see orders.routes.ts / paymentProof).
app.use(express.json({ limit: '6mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/discounts', discountsRouter);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Golden Bull API listening on http://localhost:${port}`);
});
