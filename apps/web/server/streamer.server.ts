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

  private async joinRoom(
    socket: Socket,
    { roomId, username }: { roomId: string; username: string }
  ) {
    await socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    const streamerIds = this.streamers.get(roomId);

    if (streamerIds) {
      for (const streamerId of streamerIds) {
        if (streamerId !== socket.id) {
          const viewers = this.io.sockets.adapter.rooms.get(roomId)?.size || 0;
          socket.to(streamerId).emit("viewer-joined", { viewers, username });
        }
      }
    }
  }

  private startStream(
    socket: Socket,
    {
      roomId,
      streamId,
      username,
    }: { roomId: string; streamId: string; username: string }
  ) {
    if (!this.streamers.has(roomId)) {
      this.streamers.set(roomId, new Set());
    }
    this.streamers.get(roomId)?.add(socket.id);
    socket.to(roomId).emit("start-stream", { streamId, username });
    // console.log(
    //   `User ${username} ${socket.id} started stream ${streamId} in room ${roomId}`
    // );
    // update watchers count
    const viewers = this.io.sockets.adapter.rooms.get(roomId)?.size || 0;
    this.io.to(roomId).emit("viewer-joined", { viewers, username });
  }

  private endStream(
    socket: Socket,
    {
      roomId,
      streamId,
      username,
    }: { roomId: string; streamId: string; username: string }
  ) {
    this.streamers.get(roomId)?.delete(socket.id);
    socket.to(roomId).emit("end-stream", { streamId, username });
    // console.log(
    //   `User ${username} ${socket.id} ended stream ${streamId} in room ${roomId}`
    // );
    // update watchers count
    const viewers = this.io.sockets.adapter.rooms.get(roomId)?.size || 0;
    this.io
      .to(roomId)
      .emit("viewer-joined", { viewers, streamerId: socket.id });
  }

  private disconnect(socket: Socket) {
    for (const [roomId, streamers] of this.streamers.entries()) {
      if (streamers.has(socket.id)) {
        streamers.delete(socket.id);
        this.io.to(roomId).emit("end-stream", { streamId: socket.id }); // Use a proper streamId in production
        console.log(`Stream ended in room ${roomId} due to disconnection`);
      }
    }
    // console.log("User disconnected", socket.id);
  }

  private streamChunk(
    socket: Socket,
    {
      roomId,
      streamId,
      chunk,
      username,
    }: {
      roomId: string;
      streamId: string;
      chunk: ArrayBuffer;
      username: string;
    }
  ) {
    // console.log(
    //   `Broadcasting stream chunk to room ${roomId} from stream ${streamId}`
    // );
    socket
      .to(roomId)
      .emit("stream-chunk", { roomId, streamId, chunk, username });
  }
}
