require('dotenv').config();

const express = require('express');
const http = require('http');
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

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] UPI Relay backend listening on port ${PORT}`);
});
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

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
  setInterval(async () => {
    const Request = require('./models/Request');
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
  }, 30 * 1000);

  server.listen(PORT, () => {
    console.log(`[server] UPI Relay backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
