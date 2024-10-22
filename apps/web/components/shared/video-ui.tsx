"use client";

import { EventCardDrawer } from "@/components/pages/event-card-drawer";
import { CameraControls } from "@/components/shared/camera-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import {
  Disc3Icon,
  HeartIcon,
  ShareIcon,
  SparklesIcon,
  Volume2Icon,
  VolumeOffIcon
} from "lucide-react";
import { useEffect } from "react";
import { useSetState } from "react-use";

const defaultState = {
  drawers: {
    openProfile: false,
    openChat: false,
    openShare: false,
    openAi: false,
  },
  enableSound: false,
};

const DEFAULT_AVATAR =
  "https://api.dicebear.com/9.x/adventurer/svg?seed=12346789";

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
  const session = useSession();
  const [state, setState] = useSetState<{
    drawers: {
      openProfile: boolean;
      openChat: boolean;
      openShare: boolean;
      openAi: boolean;
    }
    enableSound: boolean;
  }>(defaultState);
  const userData = session?.user.user_metadata;

  useEffect(() => {
    if (!streamerVideoRef.current) return;

    if (isStreamStart) {
      streamerVideoRef.current.srcObject = streamMediaRef?.current || null;
    } else {
      streamerVideoRef.current.srcObject = null;
    }
  }, [isStreamStart])

  useEffect(() => {
    if (!streamerVideoRef.current || !streamMediaRef) return;

    streamerVideoRef.current.muted = state.enableSound;
    streamMediaRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = state.enableSound;
    });
  }, [state.enableSound])

  console.log('streamerVideoRef.current.muted', streamerVideoRef.current?.muted)
  console.log('streamerVideoRef.current.muted', streamerVideoRef.current?.volume)

  const drawerOpen = Object.keys(state.drawers).find(
    (key) => state[key as keyof typeof state],
  );

  const toggleDrawer = (
    drawer: "openProfile" | "openChat" | "openShare" | "openAi",
  ) => {
    setState((state) => ({
      drawers: {
        ...state.drawers,
        [drawer]: !state.drawers[drawer],
      },
    }));

    const { openAi, openProfile, openChat, openShare } = state.drawers;

    if (drawer === "openProfile") {
      if (openProfile) {
        onOpenAvatar?.();
      }
    } else if (drawer === "openChat") {
      if (openChat) {
        onOpenChat?.();
      }
    } else if (drawer === "openShare") {
      if (openShare) {
        onShareAction?.();
      }
    } else if (drawer === "openAi") {
      if (openAi) {
        onToggleAiNarrator?.();
      }
    }
  };

  const mockUpDrawerData = (
    drawer: "openProfile" | "openChat" | "openShare" | "openAi",
  ) => {
    const data = {
      openProfile: {
        title: "Profile",
        description: "User profile information might go here...",
        action: "View Profile",
      },
      openChat: {
        title: "Chat",
        description: "Chat with other viewers and the streamer...",
        action: "Join Chat",
      },
      openShare: {
        title: "Share",
        description: "Share this stream with your friends...",
        action: "Share Stream",
      },
      openAi: {
        title: "AI Narrator",
        description: "Enable AI Narrator to describe the stream...",
        action: "Enable AI Narrator",
      },
    };

    return data[drawer];
  };

  console.log("drawerOpen", drawerOpen);

  const toggleSound = () => {
    setState({ enableSound: !state.enableSound });
  }

  return (
    <section
      className={cn("video-wrapper", { "max-h-[110%]": !isStreamStart })}
    >
      {error && <div className="error">{error}</div>}

      {streamer || isStreamStart ? (
        <>
          <video
            className={cn("video-preview", {
              hidden: previewUrl && !isStreaming && streamer,
            })}
            ref={streamerVideoRef}
            playsInline
            autoPlay
            muted={state.enableSound}
          />
          {streamer && (
            <video
              className={cn("video-preview", {
                hidden: !previewUrl || (isStreaming && streamer),
              })}
              src={previewUrl}
              controls
            >
              <track kind="captions" srcLang="en" label="English captions" />
            </video>
          )}
        </>
      ) : null}

      {!streamer && !isStreamStart && (
        <div className="video-preview video-preview--no-video">
          Waiting for stream to start...
        </div>
      )}

      {streamer && streamMediaRef?.current && (
        <CameraControls streamMediaRef={streamMediaRef} />
      )}

      {/* User Info */}
      <div className="controls controls--event-details">
        <h3 className="font-bold">@{userData?.username}</h3>
        <p className="text-sm">
          stream live event description might go here...
        </p>
      </div>

      {/* Right Side CTAs */}
      <div className="controls controls--social h-1/2 md:h-1/3">
        <Avatar
          className="fixed size-14 border-2 top-10 bg-accent"
          onClick={() => toggleDrawer("openProfile")}
        >
          <AvatarImage
            src={userData?.avatar || DEFAULT_AVATAR}
            alt="@username"
          />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>

        <Button size="icon" variant="ghost" onClick={toggleSound}>
          {state.enableSound ? <Volume2Icon className="h-8 w-8 text-foreground" /> : <VolumeOffIcon className="h-8 w-8 text-foreground" />}
        </Button>

        <Button size="icon" variant="ghost" onClick={onLikeAction}>
          <HeartIcon className="h-8 w-8 text-foreground" />
        </Button>
        <span className="text-xs font-extrabold drop-shadow-lg">100k</span>

        {/* <Button
          size="icon"
          variant="ghost"
          onClick={() => toggleDrawer("openChat")}
        >
          <MessageCircleIcon className="h-8 w-8 text-foreground" />
        </Button>
        <span className="text-xs font-extrabold drop-shadow-lg">1k</span> */}

        <Button
          size="icon"
          variant="ghost"
          className={cn({ hidden: streamer })}
          onClick={() => toggleDrawer("openShare")}
        >
          <ShareIcon className="h-8 w-8 text-foreground" />
        </Button>
        <span
          className={cn("text-xs font-extrabold drop-shadow-lg", {
            hidden: streamer,
          })}
        >
          500
        </span>

        <Button
          size="icon"
          variant="ghost"
          className="relative"
          onClick={() => toggleDrawer("openAi")}
        >
          <Disc3Icon
            className={cn("h-8 w-8 text-foreground", {
              "animate-spin": isStreamStart || streamerVideoRef.current,
            })}
          />
          <SparklesIcon className="absolute -top-1.5 right-0 h-5 w-5 text-foreground" />
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
                <SendHorizontalIcon className="h-5 w-5 text-foreground" />
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
              <Button onClick={onStreamingStart}>
                Start Streaming and Recording
              </Button>
              {previewUrl && (
                <Button onClick={onUploadStreamedVideo}>Upload video</Button>
              )}
            </>
          ) : (
            <Button onClick={onStreamingStop}>
              Stop Streaming and Recording
            </Button>
          )}
        </div>
      )}

      <EventCardDrawer
        onClose={() => setState(defaultState)}
        open={Boolean(drawerOpen)}
        drawerData={mockUpDrawerData(drawerOpen as keyof typeof state)}
      />
    </section>
  );
}

export interface VideoUIProps {
  eventData: SupaTypes.Tables<"events">;
  error: string | null;
  streamerVideoRef: React.RefObject<HTMLVideoElement>;
  streamMediaRef?: React.RefObject<MediaStream>;
  previewUrl?: string;
  isStreaming?: boolean;
  isStreamStart?: boolean;
  streamer?: boolean;
  onNewRecording?: () => void;
  onStreamingStart?: () => Promise<void>;
  onUploadStreamedVideo?: () => Promise<void>;
  onStreamingStop?: () => void;
  onOpenAvatar?: () => void;
  onLikeAction?: () => void;
  onOpenChat?: () => void;
  onShareAction?: () => void;
  onToggleAiNarrator?: () => void;
}

export type RequiredIfStreamer<
  T extends {
    streamMediaRef?: React.RefObject<MediaStream>;
    onStreamingStart?: VideoUIProps["onStreamingStart"];
    onUploadStreamedVideo?: VideoUIProps["onUploadStreamedVideo"];
    onStreamingStop?: VideoUIProps["onStreamingStop"];
    onOpenChat?: VideoUIProps["onOpenChat"];
    onOpenAvatar?: VideoUIProps["onOpenAvatar"];
    onToggleAiNarrator?: VideoUIProps["onToggleAiNarrator"];
  },
> = T & { streamer: true } & Required<
  Pick<
    T,
    | "onStreamingStart"
    | "onUploadStreamedVideo"
    | "onStreamingStop"
    | "streamMediaRef"
    | "onOpenChat"
    | "onOpenAvatar"
    | "onToggleAiNarrator"
  >
>;

export type RequiredIfNotStreamer<
  T extends {
    onNewRecording?: VideoUIProps["onNewRecording"];
    onOpenChat?: VideoUIProps["onOpenChat"];
    onOpenAvatar?: VideoUIProps["onOpenAvatar"];
    onLikeAction?: VideoUIProps["onLikeAction"];
    onShareAction?: VideoUIProps["onShareAction"];
    onToggleAiNarrator?: VideoUIProps["onToggleAiNarrator"];
  },
> = T & { streamer?: false } & Required<
  Pick<
    T,
    | "onNewRecording"
    | "onOpenChat"
    | "onOpenAvatar"
    | "onLikeAction"
    | "onShareAction"
    | "onToggleAiNarrator"
  >
>;

export type VideoUIPropsWithStreamer =
  | RequiredIfNotStreamer<VideoUIProps>
  | RequiredIfStreamer<VideoUIProps>;
