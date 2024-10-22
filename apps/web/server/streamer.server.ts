import type { Server } from "node:http";
import { type Socket, Server as SocketIOServer } from "socket.io";

export class Streamer {
  private server: Server;
  private io: SocketIOServer;
  private socket?: Socket;
  private streamers: Map<string, Set<string>> = new Map(); // roomId -> Set of streamerIds

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

      socket.on("stream-chunk", this.streamChunk.bind(this, socket));

      socket.on("disconnect", this.disconnect.bind(this, socket));
    });
  }

  private async joinRoom(socket: Socket, roomId: string) {
    await socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    const streamerIds = this.streamers.get(roomId);

    if (streamerIds) {
      for (const streamerId of streamerIds) {
        if (streamerId !== socket.id) {
          socket.to(streamerId).emit("viewer-joined", socket.id);
        }
      }
    }
  }

  private startStream(
    socket: Socket,
    { roomId, streamId }: { roomId: string; streamId: string }
  ) {
    if (!this.streamers.has(roomId)) {
      this.streamers.set(roomId, new Set());
    }
    this.streamers.get(roomId)?.add(socket.id);
    socket.to(roomId).emit("start-stream", { streamId });
    console.log(
      `User ${socket.id} started stream ${streamId} in room ${roomId}`
    );
  }

  private endStream(
    socket: Socket,
    { roomId, streamId }: { roomId: string; streamId: string }
  ) {
    this.streamers.get(roomId)?.delete(socket.id);
    socket.to(roomId).emit("end-stream", { streamId });
    console.log(`User ${socket.id} ended stream ${streamId} in room ${roomId}`);
  }

  private disconnect(socket: Socket) {
    for (const [roomId, streamers] of this.streamers.entries()) {
      if (streamers.has(socket.id)) {
        streamers.delete(socket.id);
        this.io.to(roomId).emit("end-stream", { streamId: socket.id }); // Use a proper streamId in production
        console.log(`Stream ended in room ${roomId} due to disconnection`);
      }
    }
    console.log("User disconnected", socket.id);
  }

  private streamChunk(
    socket: Socket,
    {
      roomId,
      streamId,
      chunk,
    }: { roomId: string; streamId: string; chunk: ArrayBuffer }
  ) {
    console.log(
      `Broadcasting stream chunk to room ${roomId} from stream ${streamId}`
    );
    socket.to(roomId).emit("stream-chunk", { roomId, streamId, chunk });
  }
}
