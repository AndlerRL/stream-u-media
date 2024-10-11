'use client'

import { EventCardDrawer } from '@/components/pages/event-card-drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoRecorder } from '@/components/video-recorder';
import VideoSlider from '@/components/video-slider';
import { VideoStreamer } from '@/components/video-streamer';
import { createClient } from '@/utils/supabase/client';
import { Disc3Icon, HeartIcon, MessageCircleIcon, SendHorizontalIcon, ShareIcon } from 'lucide-react';
import { useState } from 'react';
import { useAsync } from 'react-use';

export function EventPageComponent({ params }: { params: { slug: string } }) {
  const [isRecording, setIsRecording] = useState(false);
  const { value: sessionData, error: sessionError } = useAsync(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data;
  });
  const supabase = createClient();
  const { value: eventData, error: eventDataError } = useAsync(async () => {
    // Fetch event data from your API or Supabase
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', params.slug)

    if (error) {
      console.error('Error fetching event data:', error);
      return null;
    }

    return data[0];
  }, [params.slug]);

  const handleVideoUploaded = async (videoUrl: string) => {
    // Save the video information to the database
    const { data, error } = await supabase
      .from('videos')
      .insert({
        event_id: eventData?.id as number,
        source: videoUrl,
        user_id: sessionData?.session?.user.id as string,
        tags_id: []
      });

    if (error) {
      console.error('Error saving video information:', error);
    }

    setIsRecording(false);
  };

  const { value: videos, error: videosError } = useAsync(async () => {
    // Fetch videos associated with this event
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('event_id', eventData?.id as number);

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data;
  }, [eventData?.id]);

  console.log('💁 Data State', { eventData, videos, sessionData, params });

  // if (!!sessionData?.session) {
  //   redirect(`/sign-in?redirect=/event/${params.slug}`);
  // }

  if (!eventData) {
    return <div>Loading event data...</div>;
  }

  return (
    <section className="video-wrapper">
      {videos && videos.length > 0 ? (
        <VideoSlider videos={videos} />
      ) : (
        <p className="absolute top-0 bg-red-200 text-red-600 w-full leading-loose font-semibold text-center">No videos available for this event yet.</p>
      )}
      {isRecording ? (
        <VideoRecorder eventData={eventData} onVideoUploaded={handleVideoUploaded} />
      ) : (
        <>
          <VideoStreamer eventData={eventData} />
          {/* User Info */}
          <div className="controls controls--event-details">
            <h3 className="font-bold">@username</h3>
            <p className="text-sm">Video description goes here #hashtag</p>
          </div>

          {/* Right Side CTAs */}
          <div className="controls controls--social">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${1234}`} alt="@username" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="ghost">
              <HeartIcon className="h-8 w-8" />
            </Button>
            <span className="text-xs">100k</span>
            <Button size="icon" variant="ghost">
              <MessageCircleIcon className="h-8 w-8" />
            </Button>
            <span className="text-xs">1k</span>
            <Button size="icon" variant="ghost">
              <ShareIcon className="h-8 w-8" />
            </Button>
            <span className="text-xs">500</span>
            <Button size="icon" variant="ghost">
              <Disc3Icon className="h-8 w-8 animate-spin" />
            </Button>
          </div>

          {/* Comments Section */}
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
          </div>

          {/* Recording Controls */}
          <div className="controls controls--recording">
            <Button onClick={() => setIsRecording(true)}>Start New Recording</Button>
            <EventCardDrawer eventData={eventData} />
          </div>
        </>
      )}
    </section>
  );
}