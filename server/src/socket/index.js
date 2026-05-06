const { Server } = require('socket.io');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('joinTenant', ({ tenantId }) => {
      socket.join(`tenant:${tenantId}`);
    });
  });

  return io;
}

function emit(tenantId, event, data) {
  if (io) io.to(`tenant:${tenantId}`).emit(event, data);
}

module.exports = { initSocket, emit };
