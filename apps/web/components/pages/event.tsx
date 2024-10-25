"use client";

import { RootLayoutComponent } from "@/components/shared/root-layout";
import { buttonVariants } from "@/components/ui/button";
import { VideoRecorder } from "@/components/video-recorder";
import { VideoSlider } from "@/components/video-slider";
import { VideoStreamer } from "@/components/video-streamer";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAsync } from "react-use";

const defaultVideos: SupaTypes.Tables<"videos">[] = [
  {
    id: 1,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "For Bigger Blazes",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
  {
    id: 2,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "For Bigger Escapes",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
  {
    id: 3,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "For Bigger Fun",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
  {
    id: 4,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    description: "For Bigger Joyrides",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
  {
    id: 5,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    description: "For Bigger Meltdowns",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
  {
    id: 6,
    source:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    description: "Sintel",
    loves: Math.floor(Math.random() * 100),
    event_id: 1,
    created_at: new Date().toISOString(),
    tags_id: [],
    title: null,
    user_id: "",
  },
];

export function EventPageComponent({ params }: { params: { slug: string } }) {
  const [isRecording, setIsRecording] = useState(false);
  const supabase = createClient();
  const { value: sessionData, error: sessionError } = useAsync(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }

    return data;
  });
  const { value: eventData, error: eventDataError } = useAsync(async () => {
    // Fetch event data from your API or Supabase
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", params.slug);

    if (error) {
      console.error("Error fetching event data:", error);
      return null;
    }

    return data[0];
  }, [params.slug]);

  const handleVideoUploaded = async (videoUrl: string) => {
    // Save the video information to the database
    const { data, error } = await supabase.from("videos").insert({
      event_id: eventData?.id as number,
      source: videoUrl,
      user_id: sessionData?.session?.user.id as string,
      tags_id: [],
    });

    if (error) {
      console.error("Error saving video information:", error);
    }

    setIsRecording(false);
  };

  const { value, error: videosError } = useAsync(async () => {
    if (!eventData?.id) return [];
    // Fetch videos associated with this event
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("event_id", eventData?.id as number);

    if (error) {
      console.error("Error fetching videos:", error);
      return [];
    }

    updateVideos(data.sort((a, b) => b.created_at.localeCompare(a.created_at)));

    return data;
  }, [eventData?.id]);
  const [videos, updateVideos] = useState<SupaTypes.Tables<"videos">[]>(value ?? []);

  console.log("💁 Data State", { eventData, videos, sessionData, params });

  const [activeStreams, setActiveStreams] = useState<SupaTypes.Tables<"streams">[]>([]);

  useEffect(() => {
    if (!eventData || activeStreams.length) return;

    document.body.style.overflow = "hidden";

    // Init stream state subscription
    const fetchActiveStreams = async () => {
      const { data, error } = await supabase
        .from("streams")
        // .select("*, auth.users(id, email, user_metadata)")
        .select("*")
        .eq("event_id", eventData?.id as number)
        .eq("status", "live");

      if (error) {
        console.error("Error fetching active streams:", error);
        return;
      }

      setActiveStreams(data);
    };

    fetchActiveStreams();

    return () => {
      document.body.style.overflow = "auto";
    }
  }, [eventData])

  useEffect(() => {
    if (!eventData) return;

    const streamSubscription = supabase
      .channel(`event-${eventData.id}-streams`)
      .on(
        'postgres_changes',
        {
          event: "*",
          schema: "public",
          table: "streams",
          filter: `event_id=eq.${eventData.id}`,
        },
        (payload) => {
          console.log("Stream update ->", payload);
          if (payload.eventType === "INSERT") {
            setActiveStreams((prev) => [...prev, payload.new as SupaTypes.Tables<"streams">]);
          } else if (payload.eventType === "DELETE") {
            setActiveStreams((prev) => prev.filter((stream) => stream.id !== payload.old.id));
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Error subscribing to stream updates:", err);
        }

        console.log("Stream subscription status: ", status);
      });

    const videoSubscription = supabase
      .channel(`event-${eventData.id}-videos`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "videos",
          filter: `event_id=eq.${eventData.id}`,
        },
        (payload) => {
          console.log("New video:", payload);
          // Update the videos state or show a notification
          updateVideos((prev) => [...prev, payload.new as SupaTypes.Tables<"videos">].sort((a, b) => b.created_at.localeCompare(a.created_at)));
        }
      )
      .subscribe();

    return () => {
      streamSubscription.unsubscribe();
      videoSubscription.unsubscribe();
    };
  }, [eventData, supabase]);

  if (!eventData) {
    return <div>Loading event data...</div>;
  }

  return (
    <RootLayoutComponent className="top-0">
      <Link href="/events" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'absolute top-5 left-5 z-50')}>
        <ArrowLeftIcon className="size-12" />
      </Link>
      <section className="video-wrapper">
        {isRecording ? (
          <VideoRecorder
            eventData={eventData}
            onVideoUploaded={handleVideoUploaded}
            onCancelStream={() => setIsRecording(false)}
          />
        ) : (
          <VideoSlider
            videos={videos ?? defaultVideos}
            topContentComponent={
              <VideoStreamer
                eventData={eventData}
                activeStreams={activeStreams}
                onNewRecording={() => setIsRecording(true)}
              />
            }
          />
        )}
      </section>
    </RootLayoutComponent>
  );
}
