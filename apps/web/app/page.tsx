import { AuthButton } from '@/components/header-auth';
import { QRScanner } from '@/components/qr-scanner';
import { RootLayoutComponent } from '@/components/shared/root-layout';

export default function HomePage() {
  return (
    <RootLayoutComponent>
      <section className="page-screen-wrapper">
        <AuthButton />

        <div className="w-full flex flex-col gap-2 items-center justify-center">
          <h1 className="text-3xl font-bold">MintMoment!</h1>
          <p className="text-lg text-center font-medium">Scan the event QR code to begging your journey!</p>
        </div>

        <QRScanner />
      </section>
    </RootLayoutComponent>
  );
}