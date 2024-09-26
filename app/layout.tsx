import { createAuthClient } from "@/utils/supabase/client";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAuthClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('🐕‍🦺 session ', session);

  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
