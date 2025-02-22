import { Providers } from "@/app/providers";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./css/globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MintMoment",
  description: "Stream your media with ease!",
};


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // console.log('🐕‍🦺 session [GLOBAL] --> ', user);

  return (
    <html lang="en">
      <body className="flex flex-col w-full justify-start items-center">
        <NextThemesProvider defaultTheme="system">
          <NextTopLoader initialPosition={0.16333} />
          <Providers>
            {children}
          </Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
            }}
            richColors
            closeButton
          />
        </NextThemesProvider>
      </body>
    </html>
  );
}
