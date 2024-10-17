"use client";

import { VideoUI } from "@/components/shared/video-ui";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import { useEffect, useRef, useState } from "react";
import { type Socket, io } from "socket.io-client";

interface VideoRecorderProps {
  eventData: SupaTypes.Tables<"events">;
  onVideoUploaded: (videoUrl: string) => void;
}

export function VideoRecorder({
  eventData,
  onVideoUploaded,
}: VideoRecorderProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const streamerVideoRef = useRef<HTMLVideoElement>(null);
  const streamMediaRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const supabase = createClient();

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socketRef.current?.emit("join-room", eventData.id);
    });

    socketRef.current.on("viewer-joined", (viewerId) => {
      console.log("Viewer joined:", viewerId);
      // You might want to do something when a viewer joins, like sending initial stream data
    });

    return () => {
      stopStreamingAndRecording();
      socketRef.current?.disconnect();
    };
  }, [eventData.id]);

  const startMediaStream = async () => {
    console.log("Starting media stream");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    streamMediaRef.current = stream;

    if (streamerVideoRef.current) {
      streamerVideoRef.current.srcObject = stream;
    }
    console.log("Local video preview set");
    console.log("Audio tracks:", stream.getAudioTracks());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    startMediaStream();
  }, []);

  const startStreamingAndRecording = async () => {
    if (!streamMediaRef.current) {
      setError("No media stream available");
      return;
    }

    startMediaStream();

    try {
      // Create a stream record in Supabase
      const { data: streamData, error: streamError } = await supabase
        .from("streams")
        .insert({
          event_id: eventData.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: "live",
        })
        .select()
        .single();

      if (streamError) throw streamError;

      setIsStreaming(true);
      console.log("Stream started:", streamData);

      // Emit start-stream event with stream ID
      socketRef.current?.emit("start-stream", { eventId: eventData.id, streamId: streamData.id });

      setIsStreaming(true);
      console.log("Emitting start-stream event");
      socketRef.current?.emit("start-stream", eventData.id);

      // Set up MediaRecorder for local recording and streaming
      const mediaRecorder = new MediaRecorder(streamMediaRef.current, {
        mimeType: "video/webm; codecs=vp9,opus",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log("Data available:", event.data);
          // Send chunk via Socket.IO
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            socketRef.current?.emit("stream-chunk", {
              roomId: eventData.id,
              chunk: arrayBuffer,
            });
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      mediaRecorder.onstop = createPreview;
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setPreviewUrl(undefined); // Clear any existing preview
    } catch (err) {
      console.error("Error starting stream and recording:", err);
      setError("Failed to start streaming and recording");
    }
  };

  const stopStreamingAndRecording = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamMediaRef.current) {
      for (const track of streamMediaRef.current.getTracks()) {
        track.stop();
      }
    }

    // Update stream record in Supabase
    const { data: streamData, error: streamError } = await supabase
      .from("streams")
      .update({ status: "ended" })
      .eq("event_id", eventData.id)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .eq("status", "live")
      .select("id");

    if (streamError) {
      console.error("Error updating stream record:", streamError);
      setError("Failed to update stream record");
      throw streamError;
    }

    setIsStreaming(false);
    socketRef.current?.emit("end-stream", { eventId: eventData.id, streamId: streamData.id });
  };

  const createPreview = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    console.log("previewLink created: ", url);
    setPreviewUrl(url);
  };

  const uploadVideo = async () => {
    if (chunksRef.current.length === 0) {
      setError("No recorded data available");
      return;
    }

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const file = new File([blob], `event_${eventData.id}_${Date.now()}.webm`, {
      type: "video/webm",
    });

    try {
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(`event_${eventData.id}/${file.name}`, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(data.path);

      onVideoUploaded(publicUrl);
      chunksRef.current = []; // Clear chunks after successful upload
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("Failed to upload video");
    }
  };

  return (
    <VideoUI
      error={error}
      eventData={eventData}
      previewUrl={previewUrl}
      isStreaming={isStreaming}
      streamMediaRef={streamMediaRef}
      streamerVideoRef={streamerVideoRef}
      onUploadStreamedVideo={uploadVideo}
      onStreamingStop={stopStreamingAndRecording}
      onStreamingStart={startStreamingAndRecording}
      onOpenChat={() => console.log("Open chat")}
      onOpenAvatar={() => console.log("Open avatar")}
      onLikeAction={() => console.log("Like action")}
      onShareAction={() => console.log("Share action")}
      onToggleAiNarrator={() => console.log("Toggle AI narrator")}
      streamer
    />
  );
}
