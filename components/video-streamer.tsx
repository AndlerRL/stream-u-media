// video-streamer.tsx
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
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

  const setupPeerConnection = () => {
    console.log('Setting up peer connection');
    if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== 'closed') {
      console.log('Peer connection already exists and is not closed');
      return;
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
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
      if (peerConnectionRef.current?.connectionState === 'failed') {
        console.log('Connection failed, requesting new offer');
        requestNewOffer();
      }
    };
  };

  const requestNewOffer = () => {
    console.log('Requesting new offer');
    socketRef.current?.emit('request-offer', { roomId: eventId });
  };

  const addIceCandidates = async () => {
    if (peerConnectionRef.current?.remoteDescription) {
      while (iceCandidatesQueue.current.length) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await peerConnectionRef.current.addIceCandidate(candidate!);
          console.log('Added queued ICE candidate');
        } catch (err) {
          console.error('Error adding queued ICE candidate:', err);
        }
      }
    }
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
      requestNewOffer(); // Request an offer when the stream starts
    });

    socketRef.current.on('end-stream', () => {
      console.log('Received end-stream event');
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    });

    socketRef.current.on('offer', async (offer) => {
      console.log('Received offer from streamer');
      try {
        setupPeerConnection(); // Ensure peer connection is set up

        if (peerConnectionRef.current?.signalingState === 'closed') {
          console.log('Peer connection was closed, reinitializing');
          setupPeerConnection();
        }

        await peerConnectionRef.current!.setRemoteDescription(new RTCSessionDescription(offer));
        await addIceCandidates(); // Add any queued ICE candidates

        const answer = await peerConnectionRef.current!.createAnswer();
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
      if (peerConnectionRef.current?.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('ICE candidate added successfully');
        } catch (err) {
          console.error('Error adding received ice candidate:', err);
        }
      } else {
        // Queue the candidate if remote description is not set yet
        iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
        console.log('ICE candidate queued');
      }
    });

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socketRef.current?.disconnect();
    };
  }, [eventId]);

  // console.log('videoRef.current', videoRef.current)

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