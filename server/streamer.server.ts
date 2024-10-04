// streamer.server.ts
import type { Server } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";

export class Streamer {
  private server: Server;
  private io: SocketIOServer;
  private socket!: Socket;

  constructor({ server }: { server: Server }) {
    console.log('Streamer is created');

    this.server = server;
    this.io = new SocketIOServer(this.server);

    this.io.on('connection', (socket, ...args) => {
      this.socket = socket;

      console.log('A user connected ', args);

      socket.on('join-room', this.joinRoom.bind(this, socket));

      socket.on('stream-chunk', this.streamChunk.bind(this, socket));

      socket.on('start-stream', this.startStream.bind(this, socket));

      socket.on('end-stream', this.endStream.bind(this, socket));

      socket.on('offer', ({ roomId, viewerId, offer }) => {
        console.log(`Offer from ${socket.id} to ${viewerId} in room ${roomId}`);
        socket.to(viewerId).emit('offer', offer);
      });

      socket.on('answer', ({ roomId, answer }) => {
        console.log(`Answer from ${socket.id} in room ${roomId}`);
        socket.to(roomId).emit('answer', answer);
      });

      socket.on('ice-candidate', ({ roomId, candidate }) => {
        console.log(`ICE candidate from ${socket.id} in room ${roomId}`);
        socket.to(roomId).emit('ice-candidate', candidate);
      });

      socket.on('disconnect', this.disconnect.bind(this, socket));
    });
  }

  private async joinRoom(socket: Socket, roomId: string, ...args: any[]) {
    await socket.join(roomId);
    console.log(`User joined room ${roomId}. args: `, args);
    socket.to(roomId).emit('viewer-joined', socket.id);
  }

  private async leaveRoom(socket: Socket, roomId: string, ...args: any[]) {
    await socket.leave(roomId);
    console.log(`User left room ${roomId}. args: `, args);
  }

  private streamChunk(socket: Socket, { roomId, chunk, ...args }: { roomId: string, chunk: ArrayBuffer }) {
    console.log(`Received stream-chunk event for room ${roomId}`);
    socket.to(roomId).emit('stream-chunk', chunk);
    console.log(`Broadcasted stream-chunk event to room ${roomId}`);
  }

  private startStream(socket: Socket, roomId: string, ...args: any[]) {
    socket.to(roomId).emit('start-stream');
    console.log(`User started stream in room ${roomId}. args: `, args);
  }

  private endStream(socket: Socket, roomId: string, ...args: any[]) {
    socket.to(roomId).emit('end-stream');
    console.log(`User ended stream in room ${roomId}. args: `, args);
  }

  private disconnect(socket: Socket) {
    socket.disconnect();
    console.log('User disconnected');
  }
}
