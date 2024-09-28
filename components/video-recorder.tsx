'use client';

import { createClient } from '@/utils/supabase/client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VideoRecorderProps {
  eventId: number;
  onVideoUploaded: (videoUrl: string) => void;
}

export function VideoRecorder({ eventId, onVideoUploaded }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const supabase = createClient();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera and microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  }, [recordedChunks]);

  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  const uploadVideo = useCallback(async () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const file = new File([blob], `event_${eventId}_${Date.now()}.webm`, { type: 'video/webm' });

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`event_${eventId}/${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      if (urlError) throw urlError;

      onVideoUploaded(publicUrl);
      setRecordedChunks([]);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video');
    }
  }, [eventId, recordedChunks, supabase, onVideoUploaded]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-recorder">
      {error && <div className="error">{error}</div>}

      <video ref={videoRef} autoPlay muted playsInline className="video-preview" />

      {previewUrl && (
        <video src={previewUrl} controls className="recorded-preview" />
      )}

      <div className="controls">
        {!isRecording && !previewUrl && (
          <button onClick={startRecording}>Start Recording</button>
        )}
        {isRecording && (
          <>
            <button onClick={stopRecording}>Stop Recording</button>
            <button onClick={togglePause}>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <div className="recording-time">{formatTime(recordingTime)}</div>
          </>
        )}
        {previewUrl && (
          <button onClick={uploadVideo}>Upload Video</button>
        )}
      </div>
    </div>
  );
};
