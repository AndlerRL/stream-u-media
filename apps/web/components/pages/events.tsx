'use client';

import { EnlistNewEvent } from "@/components/enlist-new-event";
import { RootLayoutComponent } from "@/components/shared/root-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@services/supabase/src/database.types";
import { useSession } from "@supabase/auth-helpers-react";
import omit from 'lodash.omit';
import { InfoIcon } from "lucide-react";
import Link from "next/link";

export function EventsPageComponent({
  events,
}: { events: Tables<"events">[] }) {
  return (
    <RootLayoutComponent>
      <EventsComponent events={events} />
    </RootLayoutComponent>
  );
}

function EventsComponent({
  events,
}: { events: Tables<"events">[] }) {
  const session = useSession();
  console.log('session!!', session)

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your profile data</h2>
        <Card className="flex flex-col items-start justify-center relative w-full pr-44 h-44">
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
            <Avatar className="size-40 absolute top-0 right-0">
              <AvatarImage
                src={session?.user.user_metadata.avatar}
                alt={session?.user.email}
              />
              <AvatarFallback>
                {session?.user.user_metadata.username?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <ul>
              {Object.keys(omit(session?.user.user_metadata, ['avatar', 'sub', 'avatar', 'phone_verified', 'email_verified'])).map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="font-bold">{key}</span>
                  <span>{session?.user.user_metadata[key]}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-bold text-2xl">Enlisted Events</h2>
      <ul className="w-full flex flex-col gap-10 items-center h-full">
        {events?.map((event) => {
          const isEventReady = new Date(event.start_at).getDate() < Date.now();
          const isEventOver = !isEventReady && new Date(event.ends_at).getDate() < Date.now();
          const isEventComing = new Date(event.start_at).getDate() > Date.now();

          return (
            <li
              key={event.id}
              className="p-4 bg-accent text-foreground rounded-md"
            >
              <h3 className="text-lg font-bold">{event.name}</h3>
              <p>{event.description}</p>

              <Button asChild className="w-auto mt-4">
                <Link href={`/events/${event.slug}`}>
                  {isEventReady && 'Go to Event'}
                  {isEventOver && 'Watch Replay'}
                  {isEventComing && 'Coming Soon'}
                </Link>
              </Button>
            </li>
          )
        })}
        <li className="w-full flex flex-col items-center gap-4 mt-auto py-12 border-t border-foreground/30">
          <EnlistNewEvent events={events} />
        </li>
      </ul>
    </div>
  )
}
