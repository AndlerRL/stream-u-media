'use client';

import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export function ShareButton({ platform, content }: { platform: 'facebook' | 'instagram' | 'twitter'; content: string; media: string[] }) {
  const { data: session } = useSession();

  const shareContent = async () => {
    if (!session) {
      alert('You need to be logged in to share content');
      return;
    }

    try {
      const response = await axios.post(`/api/share/${platform}`, {
        accessToken: session.accessToken,
        content,
      });
      alert('Content shared successfully!');
    } catch (error) {
      console.error('Error sharing content:', error);
      alert('Failed to share content');
    }
  };

  return <Button onClick={shareContent}>Share on {platform}</Button>;
}