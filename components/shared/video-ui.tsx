'use client'

import { EventCardDrawer } from "@/components/pages/event-card-drawer";
import { CameraControls } from "@/components/shared/camera-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tables } from "@/supabase/database.types";
import { Disc3Icon, HeartIcon, MessageCircleIcon, ShareIcon } from "lucide-react";
import { useSetState } from "react-use";

const defaultState = {
  openProfile: false,
  openChat: false,
  openShare: false,
  openAi: false,
}

export function VideoUI({
  eventData,
  error,
  previewUrl,
  streamerVideoRef,
  streamMediaRef,
  isStreaming,
  isStreamStart,
  streamer,
  onOpenAvatar,
  onLikeAction,
  onOpenChat,
  onShareAction,
  onToggleAiNarrator,
  onNewRecording,
  onStreamingStart,
  onStreamingStop,
  onUploadStreamedVideo,
}: VideoUIPropsWithStreamer) {
  const [state, setState] = useSetState<{
    openProfile: boolean,
    openChat: boolean,
    openShare: boolean,
    openAi: boolean,
  }>(defaultState)

  const drawerOpen = Object.keys(state).find((key) => state[key as keyof typeof state]);

  const toggleDrawer = (drawer: 'openProfile' | 'openChat' | 'openShare' | 'openAi') => {
    setState((state) => ({ [drawer]: !state[drawer] }))

    const { openAi, openProfile, openChat, openShare } = state

    if (drawer === 'openProfile') {
      if (openProfile) {
        onOpenAvatar?.();
      }
    } else if (drawer === 'openChat') {
      if (openChat) {
        onOpenChat?.();
      }
    } else if (drawer === 'openShare') {
      if (openShare) {
        onShareAction?.();
      }
    } else if (drawer === 'openAi') {
      if (openAi) {
        onToggleAiNarrator?.();
      }
    }
  }

  const mockUpDrawerData = (drawer: 'openProfile' | 'openChat' | 'openShare' | 'openAi') => {
    const data = {
      openProfile: {
        title: 'Profile',
        description: 'User profile information might go here...',
        action: 'View Profile',
      },
      openChat: {
        title: 'Chat',
        description: 'Chat with other viewers and the streamer...',
        action: 'Join Chat',
      },
      openShare: {
        title: 'Share',
        description: 'Share this stream with your friends...',
        action: 'Share Stream',
      },
      openAi: {
        title: 'AI Narrator',
        description: 'Enable AI Narrator to describe the stream...',
        action: 'Enable AI Narrator',
      },
    }

    return data[drawer];
  }


  console.log("drawerOpen", drawerOpen)

  return (
    <section className="video-wrapper">
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

      {/* User Info */}
      <div className="controls controls--event-details">
        <h3 className="font-bold">@streamerName</h3>
        <p className="text-sm">stream live description might go here...</p>
      </div>

      {/* Right Side CTAs */}
      <div className="controls controls--social h-1/2 md:h-1/3">
        <Avatar className="h-12 w-12 border-2 border-white" onClick={() => toggleDrawer('openProfile')}>
          <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${1234}`} alt="@username" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>

        <Button size="icon" variant="ghost" onClick={onLikeAction}>
          <HeartIcon className="h-8 w-8" />
        </Button>
        <span className="text-xs">100k</span>

        <Button size="icon" variant="ghost" onClick={() => toggleDrawer('openChat')}>
          <MessageCircleIcon className="h-8 w-8" />
        </Button>
        <span className="text-xs">1k</span>

        <Button size="icon" variant="ghost" className={cn({ 'hidden': streamer })} onClick={() => toggleDrawer('openShare')}>
          <ShareIcon className="h-8 w-8" />
        </Button>
        <span className={cn('text-xs', { 'hidden': streamer })}>500</span>

        <Button size="icon" variant="ghost" onClick={() => toggleDrawer('openAi')}>
          <Disc3Icon className={cn('h-8 w-8', { 'animate-spin': isStreamStart || streamerVideoRef.current })} />
        </Button>
      </div>

      {!streamer ? (
        <>
          {/* Comments Section
          <div className="controls controls--social__comments">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${12346789}`} alt="@commenter" />
                <AvatarFallback>CM</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-sm">@commenter</h4>
                <p className="text-xs">Great video! Keep it up 🔥</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add comment..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-gray-400"
              />
              <Button size="icon" variant="ghost">
                <SendHorizontalIcon className="h-5 w-5" />
              </Button>
            </div>
          </div> */}

          {/* Recording Controls */}
          <div className="controls controls--recording">
            <Button onClick={onNewRecording}>Start New Recording</Button>
          </div>
        </>
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

      <EventCardDrawer onClose={() => setState(defaultState)} open={Boolean(drawerOpen)} drawerData={mockUpDrawerData(drawerOpen as any)} />
    </section>
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
  onNewRecording?: () => void;
  onStreamingStart?: () => Promise<void>;
  onUploadStreamedVideo?: () => Promise<void>;
  onStreamingStop?: () => void;
  // add new onCLick actions below
  onOpenAvatar?: () => void;
  onLikeAction?: () => void;
  onOpenChat?: () => void;
  onShareAction?: () => void;
  onToggleAiNarrator?: () => void;
}

export type RequiredIfStreamer<T extends {
  streamMediaRef?: React.RefObject<MediaStream | null>;
  onStreamingStart?: VideoUIProps['onStreamingStart'];
  onUploadStreamedVideo?: VideoUIProps['onUploadStreamedVideo'];
  onStreamingStop?: VideoUIProps['onStreamingStop'];
  onOpenChat?: VideoUIProps['onOpenChat'];
  onOpenAvatar?: VideoUIProps['onOpenAvatar'];
  onToggleAiNarrator?: VideoUIProps['onToggleAiNarrator'];
}> = T & { streamer: true } & Required<Pick<T, 'onStreamingStart' | 'onUploadStreamedVideo' | 'onStreamingStop' | 'streamMediaRef' | 'onOpenChat' | 'onOpenAvatar' | 'onToggleAiNarrator'>>;

export type RequiredIfNotStreamer<T extends {
  onNewRecording?: VideoUIProps['onNewRecording'];
  onOpenChat?: VideoUIProps['onOpenChat'];
  onOpenAvatar?: VideoUIProps['onOpenAvatar'];
  onLikeAction?: VideoUIProps['onLikeAction'];
  onShareAction?: VideoUIProps['onShareAction'];
  onToggleAiNarrator?: VideoUIProps['onToggleAiNarrator'];
}> = T & { streamer?: false } & Required<Pick<T, 'onNewRecording' | 'onOpenChat' | 'onOpenAvatar' | 'onLikeAction' | 'onShareAction' | 'onToggleAiNarrator'>>;

export type VideoUIPropsWithStreamer = RequiredIfNotStreamer<VideoUIProps> | RequiredIfStreamer<VideoUIProps>;
