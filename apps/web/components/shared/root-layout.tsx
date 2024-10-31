'use client'

import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useAsync } from "react-use";

export function RootLayoutComponent({
  children,
  className,
  style
}: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const supabaseClient = createClient();
  const { value, loading, error } = useAsync(async () => {
    return await supabaseClient.auth.getSession()
  }, [])

  const userSession = { user: value?.data.session?.user, expires: new Date(value?.data.session?.expires_at as number) }

  return (
    <Suspense fallback={<div>Loading user data...</div>}>
      <SessionContextProvider supabaseClient={supabaseClient} initialSession={value?.data.session}>
        <SessionProvider>
          <RootLayoutContentComponent className={className} style={style}>
            {children}
          </RootLayoutContentComponent>
        </SessionProvider>
      </SessionContextProvider>
    </Suspense>
  )
}

function RootLayoutContentComponent({
  children,
  className,
  style,
}: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const session = useSession();
  const path = usePathname()
  return (
    <>
      {path.match(/^\/(events$|profile)/g) && (
        <header className="fixed z-50 w-full h-14 flex justify-between items-center px-4 py-2 bg-background border-b border-foreground/10">
          <Link href="/">
            <h1 className="text-xl font-bold">MintMoment</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <nav>
              <ul className="flex gap-4">
                <li>
                  <Link href="/events" className={cn({ 'opacity-50 hover:opacity-100': path !== '/events' })}>
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link href={`/profile/${session?.user.user_metadata.username}`} className={cn({ 'opacity-50 hover:opacity-100': !path.match("/profile") })}>
                    Perfil
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      )}
      <main className={cn('layout_container', className)} style={style}>
        {children}
      </main>
    </>
  )
}
