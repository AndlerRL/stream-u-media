'use client';

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const QRScanner: React.FC<{ onResult: (result: string) => void }> = ({ onResult }) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result) {
      onResult(result.text);
    }
  };

  const handleError = (err: any) => {
    setError(err.message);
  };

  return (
    <div>
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={handleScan}
        containerStyle={{ width: '100%' }}
      />
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default QRScanner;