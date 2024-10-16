'use client'

import { VideoRecorder } from '@/components/video-recorder';
import { VideoSlider } from '@/components/video-slider';
import { VideoStreamer } from '@/components/video-streamer';
import { Tables } from '@/supabase/database.types';
import { createClient } from '@/utils/supabase/client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { useAsync } from 'react-use';

const defaultVideos: Tables<'videos'>[] = [
  { id: 1, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'For Bigger Blazes', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
  { id: 2, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'For Bigger Escapes', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
  { id: 3, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'For Bigger Fun', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
  { id: 4, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', description: 'For Bigger Joyrides', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
  { id: 5, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'For Bigger Meltdowns', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
  { id: 6, source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Sintel', loves: Math.floor(Math.random() * 100), event_id: 1, created_at: new Date().toISOString(), tags_id: [], title: null, user_id: '' },
];

export function EventPageComponent({ params }: { params: { slug: string } }) {
  const [isRecording, setIsRecording] = useState(false);
  const supabase = createClient();
  const { value: sessionData, error: sessionError } = useAsync(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data;
  });
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
    <SessionContextProvider supabaseClient={supabase}>
      <section className="video-wrapper">
        {isRecording ? (
          <VideoRecorder eventData={eventData} onVideoUploaded={handleVideoUploaded} />
        ) :
          <VideoSlider
            videos={defaultVideos}
            topContentComponent={<VideoStreamer eventData={eventData} onNewRecording={() => setIsRecording(true)} />}
          />
        }
      </section>
    </SessionContextProvider>
  );
}