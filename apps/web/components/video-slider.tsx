"use client";

import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SupaTypes } from "@services/supabase";
import { GripHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Videos = SupaTypes.Tables<"videos">;

export function VideoSlider({
  videos,
  topContentComponent,
}: { videos: Videos[]; topContentComponent: React.ReactNode }) {
  const [selectedVideo, setSelectedVideo] = useState<Videos | null>(null);
  const [drawerHeight, setDrawerHeight] = useState(50); // Initial height 50%
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

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

  console.log("drawerHeight", drawerHeight);

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
        <DialogContent className="video-wrapper p-0 max-w-[92.666%] max-h-[92.666%] flex items-center justify-center bg-black">
          {selectedVideo && (
            // biome-ignore lint/a11y/useMediaCaption: <explanation>
            <video
              src={selectedVideo.source}
              className="video-preview rounded-lg"
              controls
              autoPlay
              playsInline
            />
          )}
          <DialogClose>
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VideoThumbnail({
  video,
  onSelect,
}: { video: Videos; onSelect: () => void }) {
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
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className="relative aspect-[9/16]" onClick={onSelect}>
      <video
        ref={videoRef}
        src={video.source}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-white text-sm truncate">{video.description}</h3>
      </div>
    </div>
  );
}
