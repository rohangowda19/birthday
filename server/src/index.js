require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const initSocket = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const Request = require('./models/Request');

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

// Surface anything that slips past asyncHandler/try-catch instead of letting
// the process die silently or in an inconsistent state.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

async function start() {
  await connectDB();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: CLIENT_ORIGINS, credentials: true },
  });

  app.set('io', io);
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xssClean());

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', globalLimiter);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/requests', requestRoutes);

  app.use(notFound);
  app.use(errorHandler);

  initSocket(io);

  // Periodic sweep to flip stale pending requests to "expired" and notify.
  const sweepInterval = setInterval(async () => {
    try {
      const now = new Date();
      const stale = await Request.find({ status: 'pending', expiresAt: { $lte: now } });
      if (stale.length === 0) return;

      await Request.updateMany(
        { _id: { $in: stale.map((r) => r._id) } },
        { $set: { status: 'expired' } }
      );

      stale.forEach((r) => {
        io.to('admins').emit('request:updated', { ...r.toObject(), status: 'expired' });
        io.to(`requester:${r.requester}`).emit('request:updated', { ...r.toObject(), status: 'expired' });
      });
    } catch (err) {
      console.error('[sweep] Failed to expire stale requests:', err.message);
    }
  }, 30 * 1000);

  server.listen(PORT, () => {
    console.log(`[server] UPI Relay backend listening on port ${PORT}`);
  });

  // Render (and most hosts) send SIGTERM before restarting/redeploying a
  // service. Without handling it, in-flight requests get cut and the Mongo
  // connection isn't closed cleanly.
  function shutdown(signal) {
    console.log(`[server] Received ${signal}, shutting down gracefully…`);
    clearInterval(sweepInterval);
    server.close(async () => {
      await mongoose.connection.close();
      console.log('[server] Shutdown complete');
      process.exit(0);
    });
    // Force-exit if something hangs longer than 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});