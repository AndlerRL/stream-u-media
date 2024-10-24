"use client";

import { EnlistNewEvent } from "@/components/enlist-new-event";
import { XitterIcon } from "@/components/icons/xitter-icon";
import { RootLayoutComponent } from "@/components/shared/root-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import type { Tables } from "@services/supabase/src/database.types";
import { useSession } from "@supabase/auth-helpers-react";
import omit from "lodash.omit";
import { FacebookIcon, InstagramIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useAsync } from "react-use";

export function EventsPageComponent({
  events,
}: { events: Tables<"events">[] }) {
  return useMemo(() => (
    <RootLayoutComponent>
      <EventsComponent events={events} />
    </RootLayoutComponent>
  ), [events]);
}

function EventsComponent({ events }: { events: Tables<"events">[] }) {
  const session = useSession();
  console.log("session!!", session);
  const {
    value: allEvents,
    error: allEventsError,
    loading: allEventsLoading,
  } = useAsync(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*");

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return data;
  }, []);

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

  const socialIcons = {
    twitter: <XitterIcon className="size-3" />,
    instagram: <InstagramIcon className="size-4" />,
    facebook: <FacebookIcon className="size-4" />,
  };

  return (
    <ScrollArea className="flex-1 w-full flex flex-col gap-12 px-4">
      <div className="flex flex-col gap-2 items-start">
        <Card className="flex flex-col items-start justify-center relative w-full pr-44">
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
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
              {userData
                .filter(
                  (key) => session?.user && key in session.user.user_metadata,
                )
                .map((key) => {
                  return !key.match(/(facebook|instagram|twitter)/g) ? (
                    <li key={key} className="flex gap-2">
                      <span className="font-bold">{key}</span>
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
                        {socialIcons[key as keyof typeof socialIcons]}
                      </span>
                    </li>
                  );
                })}
              <div className="flex gap-4 my-2.5">
                {userData
                  .filter(
                    (key) =>
                      !(session?.user && key in session.user.user_metadata),
                  )
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
                          {socialIcons[key as keyof typeof socialIcons]}
                        </span>
                      </li>
                    );
                  })}
              </div>
            </ul>
            <div className="w-full flex flex-col gap-2 mt-12 mb-4">
              <h3 className="font-semibold w-full text-lg">
                {/* Connect your media for instant sharing! */}
                Conecta tus redes para compartir al instante!
              </h3>
              <div className="flex items-center gap-4 justify-start w-full">
                <Button variant="ghost" size="icon">
                  <FacebookIcon size="24px" />
                </Button>
                <Button variant="ghost" size="icon">
                  <InstagramIcon size="24px" />
                </Button>
                <Button variant="ghost" size="icon">
                  <XitterIcon />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-bold text-3xl mt-16 mb-8">Enlisted Events</h2>
      <ul className="w-full flex flex-col gap-10 items-center h-full">
        {events?.map((event) => {
          const isEventReady = new Date(event.start_at).getDate() < Date.now();
          const isEventOver =
            !isEventReady && new Date(event.ends_at).getDate() < Date.now();
          const isEventComing = new Date(event.start_at).getDate() > Date.now();

          return (
            <li key={event.id}>
              <Card>
                <CardHeader className="relative p-0 min-h-[320px]">
                  <Image
                    src={event.thumbnail as string}
                    alt={event.name}
                    height={320}
                    width={640}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    className="relative z-0 w-full object-cover rounded-lg"
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
        <li className="w-full flex flex-col items-center gap-4 mt-auto py-12 border-t border-foreground/30">
          <EnlistNewEvent events={allEvents as SupaTypes.Tables<"events">[]} />
        </li>
      </ul>
    </ScrollArea>
  );
}
