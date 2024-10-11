'use client'

import { CameraControls } from "@/components/shared/camera-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tables } from "@/supabase/database.types";

export function VideoUI({
  eventData,
  error,
  previewUrl,
  streamerVideoRef,
  streamMediaRef,
  isStreaming,
  isStreamStart,
  streamer,
  onStreamingStart,
  onStreamingStop,
  onUploadStreamedVideo,
}: VideoUIPropsWithStreamer) {

  return (
    <>
      {error && <div className="error">{error}</div>}

      {streamer || isStreamStart ? (
        <>
          <video
            className={cn('video-preview', { 'hidden': previewUrl && (!isStreaming && streamer) })}
            ref={streamerVideoRef}
            playsInline
            autoPlay
            muted
          />
          {streamer && <video
            className={cn('video-preview', { 'hidden': !previewUrl || (isStreaming && streamer) })}
            src={previewUrl}
            controls
          />}
        </>
      ) : null}

      {!streamer && !isStreamStart && (
        <div className="video-preview video-preview--no-video">Waiting for stream to start...</div>
      )}

      {streamer && streamMediaRef?.current && (
        <CameraControls streamMediaRef={streamMediaRef} />
      )}

      {(previewUrl && !isStreaming) || isStreamStart ? (
        <div className="controls controls--event-details">
          <h3 className="font-bold">@streamerName</h3>
          <p className="text-sm">stream live description might go here...</p>
        </div>
      ) : null}

      {streamer && (
        <div className="controls controls--recording">
          {!isStreaming ? (
            <>
              <Button onClick={onStreamingStart}>Start Streaming and Recording</Button>
              {previewUrl && <Button onClick={onUploadStreamedVideo}>Upload video</Button>}
            </>
          ) : (
            <Button onClick={onStreamingStop}>Stop Streaming and Recording</Button>
          )}
        </div>
      )}
    </>
  )
}

export interface VideoUIProps {
  eventData: Tables<'events'>;
  error: string | null;
  streamerVideoRef: React.RefObject<HTMLVideoElement | null>;
  streamMediaRef?: React.RefObject<MediaStream | null>;
  previewUrl?: string;
  isStreaming?: boolean;
  isStreamStart?: boolean;
  streamer?: boolean;
  onStreamingStart?: () => Promise<void>;
  onUploadStreamedVideo?: () => Promise<void>;
  onStreamingStop?: () => void;
}

export type RequiredIfStreamer<T extends {
  streamMediaRef?: React.RefObject<MediaStream | null>;
  onStreamingStart?: VideoUIProps['onStreamingStart'];
  onUploadStreamedVideo?: VideoUIProps['onUploadStreamedVideo'];
  onStreamingStop?: VideoUIProps['onStreamingStop'];
}> = T & { streamer: true } & Required<Pick<T, 'onStreamingStart' | 'onUploadStreamedVideo' | 'onStreamingStop'>>;

export type VideoUIPropsWithStreamer = VideoUIProps | RequiredIfStreamer<VideoUIProps>;
