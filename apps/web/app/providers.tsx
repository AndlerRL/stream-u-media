'use client'

import { createClient } from "@/lib/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClient()
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </SessionContextProvider>
  );
}