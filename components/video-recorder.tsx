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
  const socketRef = useRef<Socket | null>(null);

  const supabase = createClient();

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socketRef.current?.emit('join-room', eventId);
    });

    socketRef.current.on('viewer-joined', (viewerId) => {
      console.log('Viewer joined:', viewerId);
      // You might want to do something when a viewer joins, like sending initial stream data
    });

    return () => {
      stopStreamingAndRecording();
      socketRef.current?.disconnect();
    };
  }, [eventId]);

  const startStreamingAndRecording = async () => {
    try {
      console.log('Starting media stream');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Local video preview set');
      }

      setIsActive(true);
      console.log('Emitting start-stream event');
      socketRef.current?.emit('start-stream', eventId);

      // Set up MediaRecorder for local recording and streaming
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);

          // Send chunk via Socket.IO
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            socketRef.current?.emit('stream-chunk', { roomId: eventId, chunk: arrayBuffer });
          };
          reader.readAsArrayBuffer(event.data);
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
    setIsActive(false);
    socketRef.current?.emit('end-stream', eventId);
  };

  const createPreview = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    console.log('previewLink created: ', url);
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
    </div>
  );
};

export default VideoRecorder;