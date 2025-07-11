import { Server } from "socket.io";

let io;

export const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
       'http://localhost:8080',
  'https://dental-flow-ai-agent.lovable.app/',
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // 🔒 Listen for user joining their room
    socket.on("join", (userId, ack) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
    if (ack) ack("joined");
  });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
