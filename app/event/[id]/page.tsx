'use client';

import QRScanner from '@/components/qr-scanner';
import VideoPlayer from '@/components/video-player';
import { useState } from 'react';

export default function EventPage({ params }: { params: { id: string } }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleQRResult = (result: string) => {
    // Assume the QR code contains the video URL
    setVideoUrl(result);
  };

  return (
    <div>
      <h1>Event {params.id}</h1>
      {!videoUrl ? (
        <QRScanner onResult={handleQRResult} />
      ) : (
        <VideoPlayer src={videoUrl} />
      )}
    </div>
  );
}