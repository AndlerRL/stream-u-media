"use client";

import { EnlistNewEvent } from "@/components/enlist-new-event";
import { XitterIcon } from "@/components/icons/xitter-icon";
import { RootLayoutComponent } from "@/components/shared/root-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAllEvents, getUserEventsData } from "@/services/supabase-client.service";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import omit from "lodash.omit";
import { AtSignIcon, FacebookIcon, InstagramIcon, UserCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAsync } from "react-use";

export function EventsPageComponent({
  events,
}: { events: SupaTypes.Tables<"events">[] }) {
  return (
    <RootLayoutComponent className="top-14">
      <EventsComponent events={events} />
    </RootLayoutComponent>
  );
}

function EventsComponent({
  events,
}: {
  events: SupaTypes.Tables<"events">[]
}) {
  const session = useSession();
  const supabase = createClient();
  console.log("session!!", session);
  const {
    value: allEvents,
    error: allEventsError,
    loading: allEventsLoading,
  } = useAsync(async () => await getAllEvents(), []);
  const [userEvents, setUserEvents] = useState<SupaTypes.Tables<"events">[]>(events);

  const usersEventsSubscription = supabase
    .channel("custom-filter-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users_events",
        filter: `user_id=eq.${session?.user.id}`,
      },
      async (payload) => {
        console.log("Change received!", payload);
        if (payload.eventType === 'INSERT' && userEvents) {
          const newEvent = await getUserEventsData([payload.new.event_id]);

          setUserEvents([...newEvent, ...userEvents]);
        }
      },
    )
    .subscribe();


  const userData = Object.keys(
    omit(session?.user.user_metadata, [
      "avatar",
      "sub",
      "avatar",
      "phone_verified",
      "email_verified",
    ]),
  );

  if (!session?.user.user_metadata.instagram) {
    userData.push("instagram");
  }
  if (!session?.user.user_metadata.facebook) {
    userData.push("facebook");
  }
  if (!session?.user.user_metadata.twitter) {
    userData.push("twitter");
  }

  const connectSocialMedia = async (provider: 'twitter' | 'facebook' | 'instagram') => {
    switch (provider) {
      case 'twitter':
        console.log('Connecting Twitter...');
        break;
      case 'facebook':
        console.log('Connecting Facebook...');
        break;
      case 'instagram':
        console.log('Connecting Instagram...');
        break;
      default:
        console.error('Invalid Social Media Provider');
        break;
    }
  };

  const socialIcons = {
    twitter: <XitterIcon className="size-5" />,
    instagram: <InstagramIcon className="size-6" />,
    facebook: <FacebookIcon className="size-6" />,
  };
  const userInfoIcons = {
    twitter: <XitterIcon className="size-3" />,
    instagram: <InstagramIcon className="size-4" />,
    facebook: <FacebookIcon className="size-4" />,
    email: <AtSignIcon className="size-4" />,
    username: <UserCircleIcon className="size-4" />,
  };
  const availableUserData = userData.filter((key) => session?.user && key in session.user.user_metadata);
  const unavailableUserData = userData.filter((key) => !(session?.user && key in session.user.user_metadata));

  return (
    <ScrollArea className="flex-1 w-full flex flex-col gap-12 px-4 pt-10">
      <div className="flex flex-col gap-2 items-start">
        <Card className="flex flex-col items-start justify-center relative w-full pr-44">
          <CardHeader>
            <CardTitle className="font-bold text-2xl mb-4">
              Tu Presencia
            </CardTitle>
            <Avatar className="size-40 absolute top-3 bg-muted bottom-0 right-4 border-2">
              <AvatarImage
                src={session?.user.user_metadata.avatar}
                alt={session?.user.email || "User Avatar"}
              />
              <AvatarFallback>
                {session?.user.user_metadata.username?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <ul>
              {availableUserData
                .map((key) => {
                  return !key.match(/(facebook|instagram|twitter)/g) ? (
                    <li key={key} className="flex items-center gap-2">
                      <span className="font-bold">{userInfoIcons[key as keyof typeof userInfoIcons]}</span>
                      <span>{session?.user.user_metadata[key]}</span>
                    </li>
                  ) : (
                    <li key={key} className="flex gap-2">
                      <span
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "p-0 size-6",
                        )}
                      >
                        <span className="sr-only">{key}</span>
                        {userInfoIcons[key as keyof typeof userInfoIcons]}
                      </span>
                    </li>
                  );
                })}
              <div className="flex gap-4 my-2.5">
                {unavailableUserData
                  .map((key) => {
                    return (
                      <li key={key} className="flex gap-2">
                        <span
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "opacity-50 p-0 size-6",
                          )}
                        >
                          <span className="sr-only">{key}</span>
                          {userInfoIcons[key as keyof typeof userInfoIcons]}
                        </span>
                      </li>
                    );
                  })}
              </div>
            </ul>
            {unavailableUserData.length && (
              <div className="w-full flex flex-col gap-2 mt-12 mb-4">
                <h3 className="font-semibold w-full text-lg">
                  {/* Connect your media for instant sharing! */}
                  Conecta tus redes para compartir al instante!
                </h3>
                <div className="flex items-center gap-4 justify-start w-full">
                  {unavailableUserData.map((key) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-2"
                      onClick={() => connectSocialMedia(key as 'twitter' | 'facebook' | 'instagram')}
                    >
                      <span className="sr-only">{key}</span>
                      {socialIcons[key as keyof typeof socialIcons]}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="font-bold text-3xl mt-16 mb-8">Enlisted Events</h2>
      <ul className="w-full flex flex-col gap-10 items-center h-max">
        {userEvents?.map((event) => {
          const isEventReady = new Date(event.start_at).getDate() < Date.now();
          const isEventOver =
            !isEventReady && new Date(event.ends_at).getDate() < Date.now();
          const isEventComing = new Date(event.start_at).getDate() > Date.now();

          return (
            <li key={event.id} className="w-full">
              <Card>
                <CardHeader className="relative p-0 min-h-[320px]">
                  <Image
                    src={event.thumbnail as string}
                    alt={event.name}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    className="relative z-0 w-full max-h-[320px] object-cover rounded-lg"
                    fill
                  />
                </CardHeader>
                <CardContent className="flex flex-col gap-5 mt-6">
                  <CardTitle>
                    {event.name}
                  </CardTitle>
                  <CardDescription>
                    {event.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-auto mt-4">
                    <Link href={`/events/${event.slug}`}>
                      {isEventReady && "Go to Event"}
                      {isEventOver && "Watch Replay"}
                      {isEventComing && "Coming Soon"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </li>
          );
        })}
        <li className="w-full flex flex-col items-center gap-4 mt-auto py-16 border-t border-foreground/30">
          <EnlistNewEvent events={allEvents as SupaTypes.Tables<"events">[]} />
        </li>
      </ul>
    </ScrollArea>
  );
}
