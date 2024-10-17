"use client";

import { VideoUI } from "@/components/shared/video-ui";
import type { Tables } from "@/supabase/database.types";
import { useEffect, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";

interface VideoStreamerProps {
  eventData: Tables<"events">;
  onNewRecording: () => void;
}

export function VideoStreamer({
  eventData,
  onNewRecording,
}: VideoStreamerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStreamStart, setIsStreamStart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const chunksQueue = useRef<Uint8Array[]>([]);

  useEffect(() => {
    if (mediaSourceRef.current) return;
    if (!window.MediaSource) {
      setError("MediaSource API is not supported");
      return;
    }
    if (!MediaSource.isTypeSupported('video/webm; codecs="vp9,opus"')) {
      setError("WebM is not supported");
      return;
    }
    mediaSourceRef.current = new MediaSource();
  }, []);

  const initMediaSource = () => {
    if (!mediaSourceRef.current) {
      setError("MediaSource is not initialized");
      return;
    };

    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);
    }
    const onSourceOpen = () => {
      try {
        if (!mediaSourceRef.current) {
          throw new Error("MediaSource is not initialized");
        }

        sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(
          'video/webm; codecs="vp9,opus"'
        );
        sourceBufferRef.current.addEventListener("updateend", appendNextChunk);
        console.log("sourceBufferRef.current", sourceBufferRef.current);
      } catch (e) {
        console.error("Error adding source buffer:", e);
        setError("Error adding source buffer");
      }
    };

    if (mediaSourceRef.current.readyState === "open") {
      onSourceOpen();
    } else {
      mediaSourceRef.current.addEventListener("sourceopen", onSourceOpen);
    }

    console.log('mediaSource.readyState', mediaSourceRef.current.readyState);
  };

  const appendNextChunk = () => {
    if (
      chunksQueue.current.length > 0 &&
      sourceBufferRef.current &&
      !sourceBufferRef.current.updating
    ) {
      const chunk = chunksQueue.current.shift();
      try {
        sourceBufferRef.current.appendBuffer(chunk);
      } catch (e) {
        console.error("Error appending buffer:", e);
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Viewer connected to Socket.IO server");
      socketRef.current?.emit("join-room", eventData.id);
    });

    socketRef.current.on("start-stream", () => {
      console.log("Received start-stream event");
      setIsStreamStart(true);

      const interval = setInterval(() => {
        if (mediaSourceRef.current && mediaSourceRef.current.readyState !== "open") {
          initMediaSource();
        } else {
          clearInterval(interval);
        }
      }, 140);

    });

    socketRef.current.on("end-stream", () => {
      console.log("Received end-stream event");
      setIsStreamStart(false);
      if (videoRef.current) {
        videoRef.current.src = "";
      }
      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open"
      ) {
        mediaSourceRef.current.endOfStream();
      }
    });

    socketRef.current.on("stream-chunk", (chunk: ArrayBuffer) => {
      console.log("Received stream chunk", chunk);
      const uint8Array = new Uint8Array(chunk);
      chunksQueue.current.push(uint8Array);
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        appendNextChunk();
      }
    });

    return () => {
      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open"
      ) {
        mediaSourceRef.current.endOfStream();
      }
      socketRef.current?.disconnect();
    };
  }, [eventData.id, mediaSourceRef.current?.readyState]);

  return (
    <VideoUI
      error={error}
      eventData={eventData}
      streamerVideoRef={videoRef}
      isStreamStart={isStreamStart}
      onNewRecording={onNewRecording}
      onOpenAvatar={() => console.log("Open Avatar")}
      onOpenChat={() => console.log("Open Chat")}
      onShareAction={() => console.log("Share Action")}
      onLikeAction={() => console.log("Like Action")}
      onToggleAiNarrator={() => console.log("Toggle AI Narrator")}
    />
  );
}
