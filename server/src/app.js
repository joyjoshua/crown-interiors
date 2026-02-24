/**
 * Express Application Configuration
 *
 * Configures the Express app with all middleware, security headers,
 * rate limiting, logging, routes, and the global error handler.
 *
 * Middleware execution order:
 *   1. helmet          → Security headers (XSS, HSTS, etc.)
 *   2. cors            → Cross-origin request handling
 *   3. rate limiter    → Abuse prevention
 *   4. body parser     → JSON request body parsing
 *   5. morgan          → HTTP request logging
 *   6. routes          → Application route handlers
 *   7. error handler   → Global error catch (MUST be last)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler } = require('./middleware/errorHandler');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// ── Security Headers (Helmet) ──
// Sets various HTTP headers to help protect the app
app.use(helmet());

// ── CORS Configuration ──
// Restrict API access to the frontend origins
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim()) 
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// ── Rate Limiting ──
// Prevent abuse: max 100 requests per 15-minute window per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
});
app.use(limiter);

// ── Body Parsing ──
// Parse JSON request bodies with a 10MB limit (accounts for large service arrays)
app.use(express.json({ limit: '10mb' }));

// ── HTTP Request Logging ──
// 'combined' format in production for log aggregation; 'dev' for colorized output
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ──
// Simple endpoint for uptime monitoring and deployment health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'crown-interiors-api',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use('/api/invoices', invoiceRoutes);

// ── 404 Handler ──
// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Global Error Handler (MUST be the last middleware) ──
app.use(errorHandler);

module.exports = app;
