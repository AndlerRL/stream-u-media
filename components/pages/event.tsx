'use client'

import { Button } from '@/components/ui/button';
import { VideoRecorder } from '@/components/video-recorder';
import VideoSlider from '@/components/video-slider';
import VideoStreamer from '@/components/video-streamer';
import { createClient } from '@/utils/supabase/client';
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
    <div>
      <h1>{eventData.name}</h1>
      <p>{eventData.description}</p>
      {videos && videos.length > 0 ? (
        <VideoSlider videos={videos} />
      ) : (
        <p>No videos available for this event yet.</p>
      )}
      {isRecording ? (
        <VideoRecorder eventId={eventData.id} onVideoUploaded={handleVideoUploaded} />
      ) : (
        <>
          <VideoStreamer eventId={eventData.id} />
          <Button onClick={() => setIsRecording(true)}>Start New Recording</Button>
        </>
      )}
    </div>
  );
}