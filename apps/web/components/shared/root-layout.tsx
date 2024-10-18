'use client'

import { createClient } from "@/utils/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Toaster } from "sonner";

export function RootLayoutComponent({
  children,
}: { children: React.ReactNode }) {
  const supabaseClient = createClient();
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <main className="layout_container">
        {children}
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
        }}
        richColors
        closeButton
      />
    </SessionContextProvider>
  )
}
