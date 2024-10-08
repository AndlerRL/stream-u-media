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
  const socketRef = useRef<Socket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const chunksQueue = useRef<Uint8Array[]>([]);

  const initMediaSource = () => {
    const mediaSource = new MediaSource()
    mediaSourceRef.current = mediaSource;
    if (videoRef.current && mediaSourceRef.current) {
      videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);
    }
    mediaSourceRef.current.addEventListener('sourceopen', () => {
      if (mediaSourceRef.current) {
        try {
          sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('video/webm; codecs="vp9,opus"');
          sourceBufferRef.current.addEventListener('updateend', appendNextChunk);
        } catch (e) {
          console.error('Error adding source buffer:', e);
          setError('Error adding source buffer');
        }
      }
    });
  };

  const appendNextChunk = () => {
    if (chunksQueue.current.length > 0 && sourceBufferRef.current && !sourceBufferRef.current.updating) {
      const chunk = chunksQueue.current.shift();
      try {
        sourceBufferRef.current.appendBuffer(chunk!);
      } catch (e) {
        console.error('Error appending buffer:', e);
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

      const interval = setInterval(() => {
        if (!mediaSourceRef.current) {
          initMediaSource();
        } else {
          clearInterval(interval)
        }
      }, 140)
    });

    socketRef.current.on('end-stream', () => {
      console.log('Received end-stream event');
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.src = '';
      }
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
    });

    socketRef.current.on('stream-chunk', (chunk: ArrayBuffer) => {
      console.log('Received stream chunk', chunk);
      const uint8Array = new Uint8Array(chunk);
      chunksQueue.current.push(uint8Array);
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        appendNextChunk();
      }
    });

    return () => {
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
      socketRef.current?.disconnect();
    };
  }, [eventId, mediaSourceRef.current?.readyState]);

  return (
    <>
      {error && <div className="error">{error}</div>}
      {isStreaming ? (
        <video ref={videoRef} className="video-preview" autoPlay playsInline controls />
      ) : (
        <div className="video-preview video-preview--no-video">Waiting for stream to start...</div>
      )}
    </>
  );
};
