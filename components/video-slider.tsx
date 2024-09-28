import { Tables } from '@/supabase/database.types';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

type Videos = Tables<'videos'>;

const VideoSlider: React.FC<{ videos: Videos[] }> = ({ videos }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
  };

  return (
    <Slider {...settings}>
      {videos.map((video) => (
        <div key={`video_${video.id}_${video.event_id}`}>
          <video src={video.source} controls width="100%" height="100%" />
        </div>
      ))}
    </Slider>
  );
};

export default VideoSlider;