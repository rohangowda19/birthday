const jwt = require('jsonwebtoken');
const User = require('../models/User');

function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];

      if (!token) return next(new Error('Not authenticated'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) return next(new Error('Not authenticated'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Not authenticated'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket;

    if (user.role === 'admin') {
      socket.join('admins');
    }
    socket.join(`requester:${user._id}`);

    socket.on('disconnect', () => {
      // no-op; rooms are cleaned up automatically
    });
  });
}

module.exports = initSocket;
