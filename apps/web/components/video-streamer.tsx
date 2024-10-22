"use client";


import { VideoUI } from "@/components/shared/video-ui";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import { useEffect, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";
import { toast } from "sonner";

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
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [isStreamStart, setIsStreamStart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const chunksQueue = useRef<Uint8Array[]>([]);

  useEffect(() => {
    if (!window.MediaSource) {
      setError("MediaSource API is not supported");
      return;
    }
    if (!MediaSource.isTypeSupported('video/webm; codecs="vp9,opus"')) {
      setError("WebM is not supported");
      return;
    }
  }, []);

  const resetStream = () => {
    console.log("Resetting stream state");
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    if (mediaSourceRef.current?.readyState === "open") {
      mediaSourceRef.current.endOfStream();
    }
    mediaSourceRef.current = null;
    sourceBufferRef.current = null;
    chunksQueue.current = [];
  };

  const joinNewStream = (streamId: string) => {
    console.log("Joining new stream:", streamId);
    resetStream(); // Reset before joining new stream
    setCurrentStreamId(streamId);
    setIsStreamStart(true);
    initMediaSource(); // Always initialize new MediaSource
    socketRef.current?.emit("join-room", eventData.id);
  };

  const initMediaSource = () => {
    console.log("Initializing MediaSource");
    try {
      if (mediaSourceRef.current) {
        console.log("MediaSource already exists, cleaning up");
        if (mediaSourceRef.current.readyState === "open") {
          mediaSourceRef.current.endOfStream();
        }
        mediaSourceRef.current = null;
        sourceBufferRef.current = null;
      }

      // Create new MediaSource
      mediaSourceRef.current = new MediaSource();

      const handleSourceOpen = () => {
        console.log("MediaSource opened:", mediaSourceRef.current?.readyState);
        if (!mediaSourceRef.current || mediaSourceRef.current.readyState !== "open") return;

        try {
          if (!sourceBufferRef.current) {
            sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(
              'video/webm;codecs="vp9,opus"'
            );
            sourceBufferRef.current.mode = "segments";
            console.log("Source buffer added successfully");

            // Try to play video when source buffer is ready
            if (videoRef.current) {
              videoRef.current.play().catch(e => {
                console.warn("Autoplay failed:", e);
                // Keep video muted if autoplay fails
              });
            }
          }
        } catch (e) {
          console.error("Error adding source buffer:", e);
          setError(`Error adding source buffer: ${e.message}`);
        }
      };

      if (videoRef.current) {
        // Set up video element first
        videoRef.current.autoplay = true;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.controls = true; // Add controls for testing

        // Then set the MediaSource
        const mediaUrl = URL.createObjectURL(mediaSourceRef.current);
        console.log("Setting video source to:", mediaUrl);
        videoRef.current.src = mediaUrl;

        // Add source open listener
        mediaSourceRef.current.addEventListener("sourceopen", handleSourceOpen);
      }
    } catch (e) {
      console.error("Error in initMediaSource:", e);
      setError(`MediaSource initialization error: ${e.message}`);
    }
  };

  const appendNextChunk = () => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;
    if (chunksQueue.current.length === 0) return;
    if (sourceBufferRef.current.updating) return;
    if (mediaSourceRef.current.readyState !== "open") return;

    try {
      const chunk = chunksQueue.current.shift();
      if (chunk) {
        console.log("Appending chunk of size:", chunk.length);
        sourceBufferRef.current.appendBuffer(chunk);

        // Schedule next chunk append
        if (chunksQueue.current.length > 0) {
          requestAnimationFrame(appendNextChunk);
        }
      }
    } catch (e) {
      console.error("Error appending buffer:", e);
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        if (sourceBufferRef.current.buffered.length > 0) {
          const start = sourceBufferRef.current.buffered.start(0);
          const end = sourceBufferRef.current.buffered.end(0);
          sourceBufferRef.current.remove(start, Math.max(start, end - 10));
          // Try to append again after removing old data
          requestAnimationFrame(appendNextChunk);
        }
      }
    }
  };

  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  // Add this useEffect at the beginning to handle initial stream setup
  useEffect(() => {
    console.log("Active streams changed:", activeStreams.map(s => s.id));
    console.log("Current stream ID:", currentStreamId);

    if (activeStreams.length > 0 && !currentStreamId) {
      console.log("Initializing first stream:", activeStreams[0].id);
      setCurrentStreamId(activeStreams[0].id);
      setIsStreamStart(true);

      // Add a small delay to ensure socket connection is ready
      setTimeout(() => {
        console.log("Initializing MediaSource for first stream");
        initMediaSource();
        socketRef.current?.emit("join-room", eventData.id);
      }, 100);
    }
  }, [activeStreams]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Viewer connected to Socket.IO server");
      socketRef.current?.emit("join-room", eventData.id);
    });

    socketRef.current.on("start-stream", async ({ streamId, roomId }) => {
      console.log("Received start-stream event for stream:", streamId);
      joinNewStream(streamId); // Use joinNewStream to handle new streams

      toast.info(`A User is Streaming.`, {
        action: {
          label: <span className={buttonVariants({ variant: 'secondary' })}>Watch</span>,
          onClick: () => joinNewStream(streamId),
        }
      });
    });

    socketRef.current.on("end-stream", ({ streamId }) => {
      console.log("Received end-stream event for stream:", streamId);
      if (currentStreamId === streamId) {
        resetStream();
        setCurrentStreamId(null);
        setIsStreamStart(false);
      }
    });

    socketRef.current.on("stream-chunk", ({ streamId, roomId, chunk }: { streamId: string, roomId: number, chunk: ArrayBuffer }) => {
      if (roomId !== eventData.id || streamId !== currentStreamId) return;

      try {
        const uint8Array = new Uint8Array(chunk);
        chunksQueue.current.push(uint8Array);
        console.log(`Added chunk to queue. Queue size: ${chunksQueue.current.length}`);

        // Only try to append if we're ready
        if (sourceBufferRef.current &&
          !sourceBufferRef.current.updating &&
          mediaSourceRef.current?.readyState === "open") {
          requestAnimationFrame(appendNextChunk);
        } else {
          console.log("Not ready to append chunk:",
            "sourceBuffer:", !!sourceBufferRef.current,
            "updating:", sourceBufferRef.current?.updating,
            "mediaSource state:", mediaSourceRef.current?.readyState
          );
        }
      } catch (e) {
        console.error("Error processing stream chunk:", e);
      }
    });

    return () => {
      if (mediaSourceRef.current?.readyState === "open") {
        mediaSourceRef.current.endOfStream();
      }
      socketRef.current?.disconnect();
    };
  }, [eventData.id, currentStreamId]);

  useEffect(() => {
    if (!activeStreams.length) {
      setCurrentStreamId(null);
      return;
    }

    const getAllUserStreamers = async () => {
      for await (const stream of activeStreams) {
        if (stream.id !== currentStreamId) {
          // const userData = await getUserData(stream.user_id as string);
          // console.log('userData', userData)
          toast(`A user is streaming`, {
            action: {
              label: "Watch",
              onClick: () => joinNewStream(stream.id),
            },
            dismissible: false,
          });
        }
      }
    }

    getAllUserStreamers();
  }, [activeStreams, currentStreamId]);

  return (
    <>
      <VideoUI
        error={error}
        eventData={eventData}
        streamerVideoRef={videoRef}
        isStreamStart={Boolean(currentStreamId) && isStreamStart}
        onNewRecording={onNewRecording}
        onOpenAvatar={() => console.log("Open Avatar")}
        onOpenChat={() => console.log("Open Chat")}
        onShareAction={() => console.log("Share Action")}
        onLikeAction={() => console.log("Like Action")}
        onToggleAiNarrator={() => console.log("Toggle AI Narrator")}
      />
    </>
  );
}
