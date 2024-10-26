import type { VideoStreamControlOption, VideoStreamControlState } from "@/components/shared/video-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SwitchCameraIcon,
  ZapIcon,
  ZapOffIcon,
  ZoomInIcon,
  ZoomOutIcon
} from "lucide-react";
import { useEffect } from "react";

export function CameraControls({
  streamMediaRef,
  streamerVideoRef,
  onControlHandler,
  controls,
}: {
  controls: VideoStreamControlState;
  streamMediaRef: React.RefObject<MediaStream | null>;
  streamerVideoRef: React.RefObject<HTMLVideoElement>;
  onControlHandler: (control: VideoStreamControlOption) => void;
}) {
  useEffect(() => {
    if (!streamerVideoRef.current) return;

    const videoEl = streamerVideoRef.current;
    videoEl.muted = controls.muted;

    // Set up error handling
    const handleError = (e: Event) => {
      console.error("Video error:", e);
    };

    videoEl.addEventListener("error", handleError);
    return () => videoEl.removeEventListener("error", handleError);
  }, [controls.muted]);

  const cameraOptions = [
    ...(controls.video.facingMode === 'environment' ? [{
      label: "torch",
      icon: !controls.flash ? (
        <ZapOffIcon className="size-6" />
      ) : (
        <ZapIcon className="size-6" />
      ),
      fnCallback: () => onControlHandler('flash'),
    }] : []),
    {
      label: "zoom-in",
      icon: <ZoomInIcon className="size-6" />,
      fnCallback: () => onControlHandler('camera-zoom-in'),
    },
    {
      label: "zoom-out",
      icon: <ZoomOutIcon className="size-6" />,
      fnCallback: () => onControlHandler('camera-zoom-out'),
    },
  ];

  return (
    <>
      <div className="controls controls--camera">
        {cameraOptions.map(({ label, fnCallback, icon }) => (
          <Button
            key={`camera-opt-${label}`}
            variant="ghost"
            size="icon"
            onClick={fnCallback}
            className={cn({ 'switch_camera_btn': label === 'camera-swipe' })}
          >
            <span className="sr-only">{label.replace("-", " ")}</span>
            {icon}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onControlHandler('camera-swipe')}
        className="controls switch_camera_btn"
      >
        <span className="sr-only">switch camera</span>
        <SwitchCameraIcon className="size-16" />
      </Button>
    </>
  );
}
