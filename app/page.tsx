import { AuthButton } from '@/components/header-auth';
import { QRScanner } from '@/components/qr-scanner';

export default function HomePage() {
  return (
    <div>
      <AuthButton />
      <h1>Welcome to Event Streaming App</h1>
      <QRScanner />
    </div>
  );
}