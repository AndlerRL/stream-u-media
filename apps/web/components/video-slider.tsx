"use client";

import { VideoUI } from "@/components/shared/video-ui";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/utils/supabase/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import { GripHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Videos = SupaTypes.Tables<"videos">;

export function VideoSlider({
  videos,
  eventData,
  topContentComponent,
}: { eventData: SupaTypes.Tables<'events'>; videos: Videos[]; topContentComponent: React.ReactNode }) {
  const supabase = createClient();
  const session = useSession();
  const [selectedVideo, setSelectedVideo] = useState<Videos | null>(null);
  const [drawerHeight, setDrawerHeight] = useState(50); // Initial height 50%
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  const handleDragStart = (clientY: number) => {
    isDraggingRef.current = true;
    startYRef.current = clientY;
    startHeightRef.current = drawerHeight;
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startYRef.current - clientY;
    const deltaHeight = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(
      Math.max(startHeightRef.current + deltaHeight, 20),
      90,
    );
    setDrawerHeight(newHeight);
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  };

  const increaseLoveCount = async (video: SupaTypes.Tables<'videos'>) => {
    const currentLoves = video.loves || [];

    const isUserLoved = currentLoves.find((love) => love === session?.user.user_metadata.username)
    const newLoves = isUserLoved
      ? currentLoves.filter((love) => love !== session?.user.user_metadata.username)
      : [...currentLoves, session?.user.user_metadata.username]

    await supabase.from("videos")
    .update({
      loves: newLoves,
    })
    .eq("id", video.id);
  }

  const shareEvent = async () => {
    await navigator.share({
      title: eventData.name,
      text: eventData.description,
      url: window.location.href,
    }).then(() => toast.success("Event shared successfully"))
      .catch((error) => toast.error("Error sharing event: " + error));
  }

  return (
    <div className="min-h-screen">
      <div
        className="flex-grow overflow-hidden"
        style={{ height: `${100 - drawerHeight}vh` }}
      >
        {topContentComponent}
      </div>
      <div
        ref={drawerRef}
        className="relative z-20 bg-gray-900 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${drawerHeight + 1.6}vh` }}
      >
        <div
          className="h-5 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          tabIndex={0}
          aria-label="Drag to resize video grid"
          role="slider"
          aria-valuemin={20}
          aria-valuemax={90}
          aria-valuenow={Math.round(drawerHeight)}
        >
          <GripHorizontalIcon className="text-gray-500 size-5" />
        </div>
        <ScrollArea className="h-[calc(100%-2.5rem)] overflow-x-hidden">
          <div className="grid grid-cols-2 gap-1 p-1">
            {videos.length ? (
              videos.map((video) => (
                <VideoThumbnail
                  key={video.id}
                  video={video}
                  eventData={eventData}
                  onSelect={() => setSelectedVideo(video)}
                />
              ))
            ) : (
              <p className="absolute top-0 bg-red-200 text-red-600 w-full leading-loose font-semibold text-center">
                No videos available for this event yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="p-0 max-w-[92.666%] max-h-[92.666%] flex items-center justify-center bg-black">
          <DialogDescription className="relative w-full h-full flex items-center flex-1 justify-center">
            {selectedVideo && (
              // biome-ignore lint/a11y/useMediaCaption: <explanation>
              <VideoUI
                error={error}
                eventData={eventData}
                video={selectedVideo}
                previewUrl={selectedVideo.source}
                streamerVideoRef={videoRef}
                onShareAction={shareEvent}
                onToggleAiNarrator={() => console.log("Toggle AI narrator")}
                onLikeAction={() => increaseLoveCount(selectedVideo)}
              />
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VideoThumbnail({
  video,
  eventData,
  onSelect,
}: { video: Videos; eventData: SupaTypes.Tables<'events'>; onSelect: () => void }) {
  const supabase = createClient();
  const session = useSession();
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play();

        const timeout: any = setTimeout(() => {
          const currentViews = video.views || [];
          const isAlreadyViewed = currentViews.find((view) => view === session?.user.user_metadata.username)

          if (isAlreadyViewed) return clearTimeout(timeout)

          const newViews = [...currentViews, session?.user.user_metadata.username]

          supabase.from("videos").update({
            views: newViews,
          }).eq("id", video.id);
        }, 5000)

        return () => clearTimeout(timeout);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  const increaseLoveCount = async () => {
    const currentLoves = video.loves || [];

    const isUserLoved = currentLoves.find((love) => love === session?.user.user_metadata.username)
    const newLoves = isUserLoved
      ? currentLoves.filter((love) => love !== session?.user.user_metadata.username)
      : [...currentLoves, session?.user.user_metadata.username]

    await supabase.from("videos").update({
      loves: newLoves,
    }).eq("id", video.id);
  }

  const shareEvent = async () => {
    await navigator.share({
      title: eventData.name,
      text: eventData.description,
      url: window.location.href,
    }).then(() => toast.success("Event shared successfully"))
      .catch((error) => toast.error("Error sharing event: " + error));
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className="relative aspect-[9/16]" onClick={onSelect}>
      <VideoUI
        video={video}
        error={error}
        eventData={eventData}
        previewUrl={video.source}
        streamerVideoRef={videoRef}
        onToggleAiNarrator={() => console.log("Toggle AI narrator")}
        onShareAction={shareEvent}
        onLikeAction={increaseLoveCount}
      />
      <div className="absolute -bottom-2 left-0 right-0 pb-1 pt-3 px-2 bg-gradient-to-t from-black to-transparent line-clamp-2">
        <h3 className="text-white text-sm truncate">@{video.username}</h3>
        <p>{video.description}</p>
      </div>
    </div>
  );
}
