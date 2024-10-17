import type { Server } from "http";
import { type Socket, Server as SocketIOServer } from "socket.io";

export class Streamer {
  private server: Server;
  private io: SocketIOServer;
  private socket!: Socket;
  private streamers: Map<string, string> = new Map(); // roomId -> streamerId

  constructor({ server }: { server: Server }) {
    console.log("Streamer is created");

    this.server = server;
    this.io = new SocketIOServer(this.server);

    this.io.on("connection", (socket) => {
      this.socket = socket;

      console.log("A user connected ", socket.id);

      socket.on("join-room", this.joinRoom.bind(this, socket));

      socket.on("start-stream", this.startStream.bind(this, socket));

      socket.on("end-stream", this.endStream.bind(this, socket));

      socket.on("stream-chunk", ({ roomId, chunk }) => {
        console.log(`Received stream chunk for room ${roomId}`);
        socket.to(roomId).emit("stream-chunk", chunk);
      });

      socket.on("disconnect", this.disconnect.bind(this, socket));
    });
  }

  private async joinRoom(socket: Socket, roomId: string) {
    await socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    const streamerId = this.streamers.get(roomId);
    if (streamerId && streamerId !== socket.id) {
      socket.to(streamerId).emit("viewer-joined", socket.id);
    }
  }

  private startStream(socket: Socket, roomId: string) {
    this.streamers.set(roomId, socket.id);
    socket.to(roomId).emit("start-stream");
    console.log(`User ${socket.id} started stream in room ${roomId}`);
  }

  private endStream(socket: Socket, roomId: string) {
    this.streamers.delete(roomId);
    socket.to(roomId).emit("end-stream");
    console.log(`User ${socket.id} ended stream in room ${roomId}`);
  }

  private disconnect(socket: Socket) {
    for (const [roomId, streamerId] of this.streamers.entries()) {
      if (streamerId === socket.id) {
        this.streamers.delete(roomId);
        this.io.to(roomId).emit("end-stream");
        console.log(`Stream ended in room ${roomId} due to disconnection`);
      }
    }
    console.log("User disconnected", socket.id);
  }
}
