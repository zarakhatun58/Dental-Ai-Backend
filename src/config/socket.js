import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

let io;

  export const initSocket = (server, app) => {

     const socketLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    message: 'Too many socket connections from this IP, please try again later',
  });

  app.use('/socket.io', socketLimiter);
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:8080',
        'https://dental-flow-ai-agent.lovable.app',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`👤 User ${userId} joined room`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
