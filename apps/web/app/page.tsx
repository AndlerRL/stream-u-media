import { AuthButton } from '@/components/header-auth';
import { QRScanner } from '@/components/qr-scanner';
import { RootLayoutComponent } from '@/components/shared/root-layout';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <RootLayoutComponent className="p-16 top-0" style={{ background: "var(--gradient)" }}>
      <section className="page-screen-wrapper">
        <ThemeSwitcher />
        <Card className="w-full flex flex-col items-center">
          <CardHeader>

            <CardTitle className="text-4xl font-bold text-center">
              MintMoment!
            </CardTitle>
            <p className="text-lg text-center">Mint every moment,<br />stream your media with ease!</p>
          </CardHeader>
          <CardContent className="w-full flex flex-col items-center">
            <AuthButton />

            <div className="flex items-center justify-center gap-4 my-10">
              <hr className="border-none bg-secondary w-[100px] h-0.5" />
              OR
              <hr className="border-none bg-secondary w-[100px] h-0.5" />
            </div>

            <div className="w-full flex flex-col gap-2 items-center justify-center">
              <p className="text-lg text-center font-medium">Scan the Event QR code to begging your journey!</p>

              <QRScanner />
            </div>
          </CardContent>
        </Card>

      </section>
    </RootLayoutComponent>
  );
}