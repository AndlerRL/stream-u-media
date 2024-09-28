'use client';

import { Button } from '@/components/ui/button';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';

export function QRScanner({ onResult }: { onResult?: (result: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  const handleScanClick = () => {
    setScanning(true);
  };

  const handleScan: OnResultFunction = (result, error) => {
    if (error || !result || !scanning) {
      if (error || !result) {
        handleError(error || new Error('No QR code found'));
      }
      return;
    }

    const qrResults = result.getText();
    setScanning(false);
    onResult && onResult(qrResults);
    // Assume the QR code contains the event ID/slug
    const digestedResults = qrResults.replace(/(https|http):\/\/.*\//, '');
    const redirectionLink = !session?.user.id
      ? `/event/${digestedResults}`
      : `/sign-in?redirect=/event/${digestedResults}`;
    router.push(redirectionLink);
  };

  const handleError = (err: any) => {
    setError(err.message);
  };

  return (
    <div>
      {!scanning ? (
        <Button variant="secondary" onClick={handleScanClick}>Scan QR Code</Button>
      ) : (
        <QrReader
          constraints={{
            facingMode: 'environment',
            aspectRatio: 0.75,
            frameRate: 24,
            sampleSize: 124,
          }}
          onResult={handleScan}
          containerStyle={{ width: '100%' }}
        />
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};