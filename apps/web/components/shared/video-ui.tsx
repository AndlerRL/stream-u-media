"use client";

import { EventCardDrawer } from "@/components/pages/event-card-drawer";
import { CameraControls } from "@/components/shared/camera-controls";
import { Countdown } from "@/components/shared/countdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { defaultVideoConstraints } from "@/lib/constants/events";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import {
  CircleIcon,
  CircleStopIcon,
  CircleXIcon,
  Disc3Icon,
  EyeIcon,
  HeartIcon,
  PodcastIcon,
  ShareIcon,
  SparklesIcon,
  UploadIcon,
  Volume2Icon,
  VolumeOffIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  video,
  eventData,
  viewersCount,
  streamerUsername,
  error,
  previewUrl,
  streamerVideoRef,
  streamMediaRef,
  isStreaming,
  isUploading,
  isStreamStart,
  streamer,
  onOpenAvatar,
  onLikeAction,
  onOpenChat,
  onShareAction,
  onToggleAiNarrator,
  updateStreamMediaRef,
  onNewRecording,
  onCancelStream,
  onStreamingStart,
  onStreamingStop,
}: VideoUIPropsWithStreamer) {
  const supabase = createClient();
  const [uiState, setState] = useSetState<{
    drawers: {
      openProfile: boolean;
      openChat: boolean;
      openShare: boolean;
      openAi: boolean;
    }
  }>(defaultState);
  const [controlsState, setControls] = useSetState<VideoStreamControlState>(defaultVideoConstraints);
  const [videoToggleFullDescription, setVideoToggleFullDescription] = useState(false);
  const navigatorRef = useRef<Navigator | null>(null);
  const session = useSession()

  useEffect(() => {
    if (!streamerVideoRef.current || !streamMediaRef?.current) return;

    streamerVideoRef.current.srcObject = streamMediaRef.current;
  }, [streamMediaRef?.current]);

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
        description: "Enable AI Narrator to describe the stream is coming soon!",
        action: "Enable AI Narrator",
      },
    };

    return data[drawer];
  };

  useEffect(() => {
    if (!video) return;

    // update video views by reading current username session
    // ? We wait to update because the user is watching the video at this point, so we first check if it is playing
    const currentViews = video.views || [];
    const isAlreadyViewed = currentViews.find((view) => view === session?.user.user_metadata.username);

    if (isAlreadyViewed) return;

    const newViews = [...currentViews, session?.user.user_metadata.username];

    let timeout: any;

    if (streamerVideoRef?.current?.paused) {
      clearTimeout(timeout);
    } else {
      timeout = setTimeout(async () => {
        // update video views
        await supabase.from("videos").update({
          views: newViews,
        }).eq("id", video.id);
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [streamerVideoRef?.current?.paused]);

  useEffect(() => {
    if (navigatorRef.current) return;
    navigatorRef.current = navigator;

    () => {
      // clean up camera controls
      if (controlsState.flash) {
        toggleControlOption("flash");
      }

      if (controlsState.muted) {
        toggleControlOption("sound");
      }
    }
  }, [])

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
        const newZoomLevel = Math.min(controlsState.video.zoom + 0.4, 4); // Max zoom level 4x

        await videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: newZoomLevel }],
        });
        setControls({ video: { ...controlsState.video, zoom: newZoomLevel } });
        break;
      }
      case 'camera-zoom-out': {
        const newZoomLevel = Math.max(controlsState.video.zoom - 0.4, 0.7); // Min zoom level 0.7x

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
        streamerVideoRef.current.srcObject = null;
        // TODO: Use the new facing mode from a hook instead of the current state (so as the video recorder and streamer can be in sync)
        const newFacingMode = controlsState.video.facingMode === "user" ? "environment" : "user";
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
          audio: true,
        });

        if (updateStreamMediaRef) updateStreamMediaRef(stream);

        setControls({ video: { ...controlsState.video, facingMode: newFacingMode } });
        break;
      }
      default:
        console.log("Invalid control option");
        break;
    }
  }

  return (
    <div
      className={cn("video-wrapper", { "max-h-[110%]": !isStreamStart })}
    >
      {error && <div className="error">{error}</div>}

      <video
        className={cn("video-preview")}
        ref={streamerVideoRef}
        src={previewUrl}
        playsInline
        autoPlay
        loop={Boolean(video)}
        muted={video ? false : streamer || controlsState.muted}
        controls={Boolean(video) || Boolean(previewUrl)}
      />

      {!streamer && !isStreamStart && !video && (
        <div className="video-preview video-preview--no-video">
          Waiting for stream to start...
        </div>
      )}

      {streamer && (
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

      {video && (
        <div className="controls controls--video-details">
          <Avatar
            className="size-14 border-2 bg-accent"
            onClick={() => toggleDrawer("openProfile")}
          >
            <AvatarImage
              src={defaultAvatar(video.username as string)}
              alt={`@${video.username}`}
            />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div role="button" className="flex flex-col gap-1 text-left" onClick={() => setVideoToggleFullDescription(prev => !prev)}>
            <p className="font-bold text-lg w-full">@{video.username || 'usr_not_found'}</p>
            <p className={cn('text-sm w-full', { 'line-clamp-2': !videoToggleFullDescription })}>
              {video.description}
            </p>
          </div>
        </div>
      )}

      {/* Right Side CTAs */}
      <div className="controls controls--social h-1/2 md:h-1/3">
        {!streamer && !video && (
          <Button size="icon" variant="ghost" onClick={() => toggleControlOption('sound')}>
            {!controlsState.muted ? <Volume2Icon className="h-8 w-8 text-foreground" /> : <VolumeOffIcon className="h-8 w-8 text-foreground" />}
          </Button>
        )}
        <div className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'bg-transparent hover:bg-transparent')}>
          <EyeIcon className={cn("h-8 w-8 text-foreground", { "size-4": Boolean(video), })} />
        </div>
        <span
          className={cn("text-xs font-extrabold drop-shadow-lg", {
            hidden: streamer,
          })}
        >
          {viewersCount || video?.views?.length || '0'}
        </span>

        {video && (
          <>
            <Button size="icon" variant="ghost" className="size-auto p-3" onClick={onLikeAction}>
              <HeartIcon className={cn(" h-8 w-8 text-foreground", { "size-4": Boolean(video), })} />
            </Button>
            <span className="text-xs font-extrabold drop-shadow-lg">{video?.loves?.length || '0'}</span>
          </>
        )}

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
          className={cn("size-auto p-3", {
            hidden: streamer,
          })}
          onClick={onShareAction}
        >
          <ShareIcon className={cn("h-8 w-8 text-foreground", { "size-4": Boolean(video), })} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="relative size-auto p-3"
          onClick={() => toggleDrawer("openAi")}
        >
          <Disc3Icon
            className={cn("h-8 w-8 text-foreground", {
              "animate-spin": isStreamStart || streamer,
              "size-4": Boolean(video),
            })}
          />
          <SparklesIcon className={cn("absolute -top-1.5 right-0 h-5 w-5 text-foreground", {
            "size-3 top-1.5 right-1.5": Boolean(video),
          })} />
        </Button>
      </div>

      {
        !streamer && !video ? (
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
        ) : null
      }

      {
        streamer && (
          <div className="controls controls--recording">
            {!isStreaming ? (
              <>
                <Button onClick={onStreamingStart} variant="ghost" size="icon" className="size-auto">
                  <span className="sr-only">Start Streaming and Recording</span>
                  <CircleIcon className="size-28 fill-destructive" />
                </Button>
                <Button onClick={onCancelStream} variant="ghost" size="icon" className="size-auto">
                  <span className="sr-only">Cancel stream</span>
                  <CircleXIcon className="size-8 text-destructive" />
                </Button>
                {!isUploading && previewUrl && (
                  <Button onClick={onStreamingStop} size="lg" className="text-lg">
                    Upload
                    <UploadIcon className="size-8" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Countdown initialTime={60} onEnd={onStreamingStop as () => void} />
                <Button onClick={onStreamingStop} variant="ghost" size="icon" className="size-auto">
                  <span className="sr-only">Stop Streaming and Recording</span>
                  <CircleStopIcon className="size-28 text-destructive" />
                </Button>
              </>
            )}
          </div>
        )
      }

      <EventCardDrawer
        onClose={() => setState(defaultState)}
        open={Boolean(drawerOpen)}
        drawerData={drawerOpen ? mockUpDrawerData(drawerOpen) : undefined}
      />
    </div >
  );
}

export interface VideoUIProps {
  eventData: SupaTypes.Tables<"events">;
  error: string | null;
  streamerVideoRef: React.RefObject<HTMLVideoElement>;
  video?: SupaTypes.Tables<"videos">;
  viewersCount?: number;
  streamMediaRef?: React.RefObject<MediaStream | null>;
  previewUrl?: string;
  isStreaming?: boolean;
  isStreamStart?: boolean;
  streamer?: boolean;
  isUploading?: boolean;
  streamerUsername?: string;
  updateStreamMediaRef?: (stream: MediaStream) => void;
  onCancelStream?: () => void;
  onNewRecording?: () => void;
  onStreamingStart?: () => Promise<void>;
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
    viewersCount?: number;
    streamMediaRef?: React.RefObject<MediaStream | null>;
    mediaRecorderRef?: React.RefObject<MediaRecorder | null>;
    updateStreamMediaRef?: VideoUIProps["updateStreamMediaRef"];
    onStreamingStart?: VideoUIProps["onStreamingStart"];
    onCancelStream?: VideoUIProps["onCancelStream"];
    onStreamingStop?: VideoUIProps["onStreamingStop"];
    onToggleAiNarrator?: VideoUIProps["onToggleAiNarrator"];
  },
> = T & { streamer: true } & Required<
  Pick<
    T,
    | "isUploading"
    | "viewersCount"
    | "onStreamingStart"
    | "updateStreamMediaRef"
    | "onCancelStream"
    | "mediaRecorderRef"
    | "onStreamingStop"
    | "streamMediaRef"
    | "onToggleAiNarrator"
  >
>;

export type RequiredIfNotStreamer<
  T extends {
    streamerUsername?: string;
    viewersCount?: number;
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
    | "viewersCount"
    | "onNewRecording"
    | "onOpenChat"
    | "onOpenAvatar"
    | "onLikeAction"
    | "onShareAction"
    | "onToggleAiNarrator"
  >
>;

export type RequiredIfThumbnail<
  T extends {
    previewUrl?: string;
    video?: VideoUIProps["video"];
    onLikeAction?: VideoUIProps["onLikeAction"];
    onShareAction?: VideoUIProps["onShareAction"];
    onToggleAiNarrator?: VideoUIProps["onToggleAiNarrator"];
  },
> = T & Required<Pick<
  T,
  | "previewUrl"
  | "video"
  | "onLikeAction"
  | "onShareAction"
  | "onToggleAiNarrator"
>
>;

export type VideoUIPropsWithStreamer =
  | RequiredIfNotStreamer<VideoUIProps>
  | RequiredIfStreamer<VideoUIProps>
  | RequiredIfThumbnail<VideoUIProps>;

export type VideoStreamControlOption = 'sound' | 'flash' | 'camera-swipe' | 'camera-zoom-in' | 'camera-zoom-out';
export type VideoStreamControlState = {
  video: MediaTrackConstraintSet & {
    zoom: number;
  };
  muted: boolean;
  flash: boolean;
}