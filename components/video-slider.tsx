import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

interface Video {
  id: string;
  url: string;
}

const VideoSlider: React.FC<{ videos: Video[] }> = ({ videos }) => {
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
        <div key={video.id}>
          <video src={video.url} controls width="100%" height="100%" />
        </div>
      ))}
    </Slider>
  );
};

export default VideoSlider;