"use client";

import { VideoUI } from "@/components/shared/video-ui";
import type { SupaTypes } from "@services/supabase";
import { useEffect, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";

interface VideoStreamerProps {
  eventData: SupaTypes.Tables<"events">;
  activeStreams: SupaTypes.Tables<"streams">[];
  onNewRecording: () => void;
}

export function VideoStreamer({
  eventData,
  activeStreams,
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
      videoRef.current.play();
      videoRef.current.muted = false;
      videoRef.current.controls = false;
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
      !sourceBufferRef.current.updating &&
      mediaSourceRef.current &&
      mediaSourceRef.current.readyState === "open"
    ) {
      const chunk = chunksQueue.current.shift();
      try {
        if (!chunk) throw new Error("Chunk is empty");

        sourceBufferRef.current.appendBuffer(chunk);
        console.log("Appended chunk to source buffer: ", chunk);
      } catch (e) {
        console.error("Error appending buffer:", e);
      }
    }
  };

  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  useEffect(() => {
    if (activeStreams.length > 0 && !currentStreamId) {
      setCurrentStreamId(activeStreams[0].id);
    }
  }, [activeStreams, currentStreamId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Viewer connected to Socket.IO server");
      socketRef.current?.emit("join-room", eventData.id);
    });

    socketRef.current.on("start-stream", ({ streamId }) => {
      console.log("Received start-stream event for stream:", streamId);
      if (!currentStreamId) {
        setCurrentStreamId(streamId);
      }
      // You might want to show a notification that a new stream has started
    });

    socketRef.current.on("end-stream", ({ streamId }) => {
      console.log("Received end-stream event for stream:", streamId);
      if (currentStreamId === streamId) {
        setCurrentStreamId(null);
      }
      // You might want to show a notification that a stream has ended
    });

    socketRef.current.on("stream-chunk", (chunk: ArrayBuffer) => {
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
  }, [eventData.id, currentStreamId]);

  return (
    <>
      <VideoUI
        error={error}
        eventData={eventData}
        streamerVideoRef={videoRef}
        isStreamStart={Boolean(currentStreamId)}
        onNewRecording={onNewRecording}
        onOpenAvatar={() => console.log("Open Avatar")}
        onOpenChat={() => console.log("Open Chat")}
        onShareAction={() => console.log("Share Action")}
        onLikeAction={() => console.log("Like Action")}
        onToggleAiNarrator={() => console.log("Toggle AI Narrator")}
      />
      {activeStreams.length > 1 && (
        <div>
          <h3>Active Streams:</h3>
          {activeStreams.map((stream) => (
            <button
              key={stream.id}
              type="button"
              onClick={() => setCurrentStreamId(stream.id)}
              className={currentStreamId === stream.id ? "active" : ""}
            >
              {stream.user_id}'s Stream
            </button>
          ))}
        </div>
      )}
    </>
  );
}
