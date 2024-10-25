"use client";

import { EventCardDrawer } from "@/components/pages/event-card-drawer";
import { CameraControls } from "@/components/shared/camera-controls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { defaultVideoConstraints } from "@/lib/constants/events";
import { cn } from "@/lib/utils";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import {
  CirclePlayIcon,
  CircleStopIcon,
  CircleXIcon,
  Disc3Icon,
  HeartIcon,
  PodcastIcon,
  ShareIcon,
  SparklesIcon,
  UploadIcon,
  Volume2Icon,
  VolumeOffIcon
} from "lucide-react";
import { useEffect, useRef } from "react";
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

const defaultAvatar = (seed = 'MintMoment') =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

export function VideoUI({
  eventData,
  streamerUsername,
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
  onCancelStream,
  onStreamingStart,
  onStreamingStop,
  onUploadStreamedVideo,
}: VideoUIPropsWithStreamer) {
  const session = useSession();
  const [uiState, setState] = useSetState<{
    drawers: {
      openProfile: boolean;
      openChat: boolean;
      openShare: boolean;
      openAi: boolean;
    }
  }>(defaultState);
  const [controlsState, setControls] = useSetState<VideoStreamControlState>(defaultVideoConstraints);
  const navigatorRef = useRef<Navigator>();

  useEffect(() => {
    if (!streamerVideoRef.current) return;

    if (isStreamStart) {
      streamerVideoRef.current.srcObject = streamMediaRef?.current || null;
    }
  }, [isStreamStart, streamerVideoRef.current, streamMediaRef?.current]);

  const drawerOpen = Object.keys(uiState.drawers).find(
    (key) => uiState.drawers[key as keyof typeof uiState.drawers],
  ) as "openProfile" | "openChat" | "openShare" | "openAi" | undefined;

  const toggleDrawer = (
    drawer: "openProfile" | "openChat" | "openShare" | "openAi",
  ) => {
    setState((state) => ({
      drawers: {
        ...state.drawers,
        [drawer]: !uiState.drawers[drawer],
      },
    }));

    const { openAi, openProfile, openChat, openShare } = uiState.drawers;

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

  useEffect(() => {
    if (navigatorRef.current) return;
    navigatorRef.current = navigator;
  })

  const toggleControlOption = async (option: VideoStreamControlOption) => {
    const videoTrack = streamMediaRef?.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    switch (option) {
      case "sound":
        setControls({ muted: !controlsState.muted });
        break;
      case 'flash': {
        const newFlashState = !controlsState.flash;
        await videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ torch: newFlashState }],
        });
        setControls({ flash: newFlashState });
        break;
      }
      case 'camera-zoom-in': {
        const newZoomLevel = Math.min(controlsState.video.zoom + 0.3, 4); // Max zoom level 4x

        await videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: newZoomLevel }],
        });
        setControls({ video: { ...controlsState.video, zoom: newZoomLevel } });
        break;
      }
      case 'camera-zoom-out': {
        const newZoomLevel = Math.max(controlsState.video.zoom - 0.3, 0.7); // Min zoom level 1x

        await videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: newZoomLevel }],
        });
        setControls({ video: { ...controlsState.video, zoom: newZoomLevel } });
        break;
      }
      case 'camera-swipe': {
        const navigator = navigatorRef.current;

        if (!navigator || !streamerVideoRef?.current || !streamMediaRef?.current) return;

        const currentStream = streamerVideoRef.current.srcObject as MediaStream;
        if (currentStream) {
          for (const track of currentStream.getTracks()) {
            track.stop();
          }
        }
        const newFacingMode = controlsState.video.facingMode === "user" ? "environment" : "user";
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
          audio: true,
        });

        streamMediaRef.current = stream;
        streamerVideoRef.current.srcObject = stream;

        setControls({ video: { ...controlsState.video, facingMode: newFacingMode } });
        break;
      }
      default:
        console.log("Invalid control option");
        break;
    }
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
            muted={streamer || controlsState.muted}
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
        <CameraControls
          controls={controlsState}
          onControlHandler={toggleControlOption}
          streamMediaRef={streamMediaRef}
          streamerVideoRef={streamerVideoRef}
        />
      )}

      {/* Video Info */}
      {streamerUsername && (
        <div className="controls controls--streamer-details">
          <div className="flex flex-col gap-1 text-right">
            <p className="font-bold text-lg w-full">@{streamerUsername}</p>
            <p className="text-sm w-full">
              Check what is happening in {eventData.name}
            </p>
          </div>
          <Avatar
            className="size-14 border-2 bg-accent"
            onClick={() => toggleDrawer("openProfile")}
          >
            <AvatarImage
              src={defaultAvatar(streamerUsername)}
              alt={`@${streamerUsername}`}
            />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Right Side CTAs */}
      <div className="controls controls--social h-1/2 md:h-1/3">
        {!streamer && (
          <Button size="icon" variant="ghost" onClick={() => toggleControlOption('sound')}>
            {!controlsState.muted ? <Volume2Icon className="h-8 w-8 text-foreground" /> : <VolumeOffIcon className="h-8 w-8 text-foreground" />}
          </Button>
        )}
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
            <Button onClick={onNewRecording} size="icon" className="px-10 size-auto font-bold text-lg">
              <span className="sr-only">Start New Recording</span>
              STREAM <PodcastIcon className="size-16" />
            </Button>
          </div>
        </>
      ) : null}

      {streamer && (
        <div className="controls controls--recording">
          {!isStreaming ? (
            <>
              <Button onClick={onStreamingStart} variant="ghost" size="icon" className="size-auto">
                <span className="sr-only">Start Streaming and Recording</span>
                <CirclePlayIcon className="size-28" />
              </Button>
              <Button onClick={onCancelStream} variant="ghost" size="icon" className="size-auto">
                <span className="sr-only">Cancel stream</span>
                <CircleXIcon className="size-8 text-destructive" />
              </Button>
              {previewUrl && (
                <Button onClick={onUploadStreamedVideo} size="lg" className="text-lg">
                  Upload
                  <UploadIcon className="size-8" />
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onStreamingStop} variant="ghost" size="icon" className="size-auto">
              <span className="sr-only">Stop Streaming and Recording</span>
              <CircleStopIcon className="size-28 text-destructive" />
            </Button>
          )}
        </div>
      )}

      <EventCardDrawer
        onClose={() => setState(defaultState)}
        open={Boolean(drawerOpen)}
        drawerData={drawerOpen ? mockUpDrawerData(drawerOpen) : undefined}
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
  isUploading?: boolean;
  streamerUsername?: string;
  onCancelStream?: () => void;
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
    isUploading?: boolean;
    streamMediaRef?: React.RefObject<MediaStream>;
    mediaRecorderRef?: React.RefObject<MediaRecorder>;
    onStreamingStart?: VideoUIProps["onStreamingStart"];
    onCancelStream?: VideoUIProps["onCancelStream"];
    onUploadStreamedVideo?: VideoUIProps["onUploadStreamedVideo"];
    onStreamingStop?: VideoUIProps["onStreamingStop"];
    onOpenChat?: VideoUIProps["onOpenChat"];
    onOpenAvatar?: VideoUIProps["onOpenAvatar"];
    onToggleAiNarrator?: VideoUIProps["onToggleAiNarrator"];
  },
> = T & { streamer: true } & Required<
  Pick<
    T,
    | "isUploading"
    | "onStreamingStart"
    | "onCancelStream"
    | "mediaRecorderRef"
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
    streamerUsername?: string;
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
    | "streamerUsername"
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

export type VideoStreamControlOption = 'sound' | 'flash' | 'camera-swipe' | 'camera-zoom-in' | 'camera-zoom-out';
export type VideoStreamControlState = {
  video: MediaTrackConstraintSet & {
    zoom: number;
  };
  muted: boolean;
  flash: boolean;
}