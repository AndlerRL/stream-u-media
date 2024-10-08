'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { CameraIcon, ChevronDownIcon, SwitchCameraIcon, ZapIcon, ZapOffIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoRecorderProps {
  eventId: number;
  onVideoUploaded: (videoUrl: string) => void;
}

export function VideoRecorder({ eventId, onVideoUploaded }: VideoRecorderProps) {
  const [isActive, setIsActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const streamerVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const supabase = createClient();

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socketRef.current?.emit('join-room', eventId);
    });

    socketRef.current.on('viewer-joined', (viewerId) => {
      console.log('Viewer joined:', viewerId);
      // You might want to do something when a viewer joins, like sending initial stream data
    });

    return () => {
      stopStreamingAndRecording();
      socketRef.current?.disconnect();
    };
  }, [eventId]);

  useEffect(() => {
    const startMediaStream = async () => {
      console.log('Starting media stream');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      streamerVideoRef.current!.srcObject = stream;
      console.log('Local video preview set');
    }

    startMediaStream();
  }, []);

  const startStreamingAndRecording = async () => {
    try {
      setIsActive(true);
      console.log('Emitting start-stream event');
      socketRef.current?.emit('start-stream', eventId);

      // Set up MediaRecorder for local recording and streaming
      const mediaRecorder = new MediaRecorder(streamRef.current!, { mimeType: 'video/webm;codecs=vp9' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);

          // Send chunk via Socket.IO
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            socketRef.current?.emit('stream-chunk', { roomId: eventId, chunk: arrayBuffer });
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      mediaRecorder.onstop = createPreview;

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setPreviewUrl(undefined); // Clear any existing preview
    } catch (err) {
      console.error('Error starting stream and recording:', err);
      setError('Failed to start streaming and recording');
    }
  };

  const stopStreamingAndRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    socketRef.current?.emit('end-stream', eventId);
  };

  const createPreview = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    console.log('previewLink created: ', url);
    setPreviewUrl(url);
  };

  const uploadVideo = async () => {
    if (chunksRef.current.length === 0) {
      setError('No recorded data available');
      return;
    }

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const file = new File([blob], `event_${eventId}_${Date.now()}.webm`, { type: 'video/webm' });

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`event_${eventId}/${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      onVideoUploaded(publicUrl);
      chunksRef.current = []; // Clear chunks after successful upload
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video');
    }
  };

  return (
    <>
      {error && <div className="error">{error}</div>}

      <video
        className={cn('video-preview', { 'hidden': previewUrl && !isActive })}
        ref={streamerVideoRef}
        playsInline
        autoPlay
        muted
      />
      <video
        className={cn('video-preview', { 'hidden': !previewUrl || isActive })}
        src={previewUrl}
        controls
      />

      <CameraControls streamRef={streamRef} />

      {(previewUrl && !isActive) && (
        <div className="controls controls--event-details">
          <h3 className="font-bold">@username</h3>
          <p className="text-sm">Video description goes here #hashtag</p>
        </div>
      )}

      <div className="controls controls--recording">
        {!isActive ? (
          <>
            <Button onClick={startStreamingAndRecording}>Start Streaming and Recording</Button>
            {previewUrl && <Button onClick={uploadVideo}>Upload video</Button>}
          </>
        ) : (
          <Button onClick={stopStreamingAndRecording}>Stop Streaming and Recording</Button>
        )}
      </div>

    </>
  );
};

function CameraControls({ streamRef }: { streamRef: React.RefObject<MediaStream | null> }) {
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
          advanced: [{ zoom: zoomLevel }]
        });
      });
  };

  const flipCamera = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
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