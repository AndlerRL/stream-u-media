// video-recorder.tsx
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoRecorderProps {
  eventId: number;
  onVideoUploaded: (videoUrl: string) => void;
}

export function VideoRecorder({ eventId, onVideoUploaded }: VideoRecorderProps) {
  const [isActive, setIsActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const supabase = createClient();

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socketRef.current?.emit('join-room', eventId);
    });

    socketRef.current.on('viewer-joined', async (viewerId) => {
      console.log('Viewer joined, creating offer', viewerId);
      if (viewerId) {
        await createAndSendOffer(viewerId);
      } else {
        console.error('Received viewer-joined event without viewerId');
      }
    });

    socketRef.current.on('answer', async (answer) => {
      try {
        console.log('Received answer from viewer');
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error setting remote description:', err);
      }
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding received ice candidate:', err);
      }
    });

    return () => {
      stopStreamingAndRecording();
      socketRef.current?.disconnect();
    };
  }, [eventId]);

  const createAndSendOffer = async (viewerId: string) => {
    if (peerConnectionRef.current && streamRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current?.emit('offer', { roomId: eventId, viewerId, offer });
    }
  };

  const startStreamingAndRecording = async () => {
    try {
      console.log('Starting media stream');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Local video preview set');
      }

      console.log('Creating peer connection');
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ]
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate', event.candidate);
          socketRef.current?.emit('ice-candidate', { roomId: eventId, candidate: event.candidate });
        }
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState);
      };

      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection', track.kind);
        peerConnectionRef.current?.addTrack(track, stream);
      });

      setIsActive(true);
      console.log('Emitting start-stream event');
      socketRef.current?.emit('start-stream', eventId);

      // Set up MediaRecorder for local recording
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = createPreview;

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setPreviewUrl(undefined); // Clear any existing preview
    } catch (err) {
      console.error('Error starting stream and recording:', err);
      setError('Failed to start streaming and recording');
    }
  };

  const stopStreamingAndRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsActive(false);
    socketRef.current?.emit('end-stream', eventId);
  };

  const createPreview = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    console.log('previewLink created: ', url)
    setPreviewUrl(url);
  };

  const uploadVideo = async () => {
    if (chunksRef.current.length === 0) {
      setError('No recorded data available');
      return;
    }

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const file = new File([blob], `event_${eventId}_${Date.now()}.webm`, { type: 'video/webm' });

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`event_${eventId}/${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      onVideoUploaded(publicUrl);
      chunksRef.current = []; // Clear chunks after successful upload
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video');
    }
  };

  return (
    <div className="video-recorder">
      {error && <div className="error">{error}</div>}

      <video
        className={cn('video-preview', { 'hidden': previewUrl && !isActive })}
        ref={videoRef}
        playsInline
        autoPlay
        muted
      />
      <video
        className={cn('video-preview', { 'hidden': isActive })}
        src={previewUrl}
        controls
      />

      <div className="controls">
        {!isActive ? (
          <>
            <Button onClick={startStreamingAndRecording}>Start Streaming and Recording</Button>
            {previewUrl && <Button onClick={uploadVideo}>Upload video</Button>}
          </>
        ) : (
          <Button onClick={stopStreamingAndRecording}>Stop Streaming and Recording</Button>
        )}
      </div>
    </div >
  );
};

// time in milliseconds
function videoCounter(time: number) {
  const seconds = time / 1000;
  const minutes = Math.floor(seconds / 60).toFixed(2);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return <div className="video-counter">{`${minutes}:${remainingSeconds}`}</div>;
};
