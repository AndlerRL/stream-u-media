import { createClient } from "@/utils/supabase/server";
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
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('🐕‍🦺 session [GLOBAL] --> ', session);

  return (
    <html lang="en">
      <body className="flex flex-col w-full justify-start items-center">
        {children}
      </body>
    </html>
  );
}
