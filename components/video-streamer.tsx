// vide-streamer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoStreamerProps {
  eventId: number;
}

export function VideoStreamer({ eventId }: VideoStreamerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const setupPeerConnection = () => {
    console.log('Setting up peer connection');
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Comment out TURN server for local testing
        // {
        //   urls: 'turn:your-turn-server.com',
        //   username: 'your-username',
        //   credential: 'your-credential'
        // }
      ]
    });

    peerConnectionRef.current.ontrack = (event) => {
      console.log('Received track', event.track.kind);
      if (videoRef.current && event.streams && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(e => console.error('Error playing video:', e));
      }
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socketRef.current?.emit('ice-candidate', { roomId: eventId, candidate: event.candidate });
      }
    };

    peerConnectionRef.current.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState);
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnectionRef.current?.connectionState);
    };
  };

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Viewer connected to Socket.IO server');
      socketRef.current?.emit('join-room', eventId);
    });

    socketRef.current.on('start-stream', () => {
      console.log('Received start-stream event');
      setIsStreaming(true);
      setupPeerConnection();
    });

    socketRef.current.on('end-stream', () => {
      console.log('Received end-stream event');
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    });

    socketRef.current.on('offer', async (offer) => {
      console.log('Received offer from streamer');
      try {
        if (!peerConnectionRef.current) {
          setupPeerConnection();
        }

        console.log('Setting remote description');
        await peerConnectionRef.current!.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('Creating answer');
        const answer = await peerConnectionRef.current!.createAnswer();
        console.log('Setting local description');
        await peerConnectionRef.current!.setLocalDescription(answer);

        console.log('Sending answer');
        socketRef.current?.emit('answer', { roomId: eventId, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
        setError('Failed to connect to the live stream');
      }
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      console.log('Received ICE candidate');
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added successfully');
      } catch (err) {
        console.error('Error adding received ice candidate:', err);
      }
    });

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socketRef.current?.disconnect();
    };
  }, [eventId]);

  return (
    <div className="live-stream-viewer">
      {error && <div className="error">{error}</div>}
      <div className="live-stream">
        {isStreaming || videoRef.current ? (
          <video ref={videoRef} autoPlay playsInline controls />
        ) : (
          <div>Waiting for stream to start...</div>
        )}
      </div>
    </div>
  );
};

export default VideoStreamer;