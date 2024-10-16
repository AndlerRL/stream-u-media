import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CameraIcon, ChevronDownIcon, SwitchCameraIcon, ZapIcon, ZapOffIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CameraControls({ streamMediaRef }: { streamMediaRef: React.RefObject<MediaStream | null> }) {
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [openCameraSettings, setOpenCameraSettings] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigatorRef = useRef<Navigator>();

  useEffect(() => {
    if (navigatorRef.current) return;

    navigatorRef.current = navigator;
  }, [navigatorRef.current]);

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    // Implement flash control logic here
    navigatorRef.current!.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const track = stream.getVideoTracks()[0];
        track.applyConstraints({
          // @ts-ignore
          advanced: [{ torch: flashEnabled }]
        });
      });
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3)); // Max zoom level 3x
    // Implement zoom-in logic here
    navigatorRef.current!.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const track = stream.getVideoTracks()[0];
        track.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: zoomLevel }]
        });
      });
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 1)); // Min zoom level 1x
    // Implement zoom-out logic here
    navigatorRef.current!.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const track = stream.getVideoTracks()[0];
        track.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: zoomLevel }]
        });
      });
  };

  const flipCamera = async () => {
    if (streamMediaRef.current) {
      const videoTrack = streamMediaRef.current.getVideoTracks()[0];
      const constraints = videoTrack.getConstraints();
      constraints.facingMode = constraints.facingMode === 'user' ? 'environment' : 'user';
      await videoTrack.applyConstraints(constraints);
    }
  };

  const cameraOptions = [
    {
      label: flashEnabled ? 'disable-flash' : 'enable-flash',
      icon: flashEnabled ? <ZapOffIcon className="size-6" /> : <ZapIcon className="size-6" />,
      fnCallback: toggleFlash,
    },
    {
      label: 'zoom-in',
      icon: <ZoomInIcon className="size-6" />,
      fnCallback: zoomIn,
    },
    {
      label: 'zoom-out',
      icon: <ZoomOutIcon className="size-6" />,
      fnCallback: zoomOut,
    },
    {
      label: 'flip-camera',
      icon: <SwitchCameraIcon className="size-6" />,
      fnCallback: flipCamera,
    },
  ];

  return (
    <div className="controls controls--camera">
      <DropdownMenu open={openCameraSettings} onOpenChange={setOpenCameraSettings}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <CameraIcon />
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <Command>
            <CommandList>
              <CommandGroup className="camera-controls">
                {cameraOptions.map(({ label, fnCallback, icon }) => (
                  <CommandItem
                    key={`camera-opt-${label}`}
                    value={label}
                    onSelect={(value) => {
                      fnCallback()
                    }}
                  >
                    <span className="sr-only">
                      {label.replace('-', ' ')}
                    </span>
                    {icon}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};