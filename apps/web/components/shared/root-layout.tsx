'use client'

import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export function RootLayoutComponent({
  children,
}: { children: React.ReactNode }) {
  const supabaseClient = createClient();
  const path = usePathname()
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <header className="fixed z-50 w-full h-14 flex justify-between items-center px-4 py-2 bg-background border-b border-foreground/10">
        <Link href="/">
          <h1 className="text-xl font-bold">MintMoment</h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <nav>
            <ul className="flex gap-4">
              <li>
                <Link href="/events" className={cn({ 'text-accent': path.match(/\/events/g) })}>
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
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
