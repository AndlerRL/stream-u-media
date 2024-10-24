import { EventsPageComponent } from "@/components/pages/events";
import { useServerSession } from "@/lib/hooks/use-session.server";
import { createClient } from "@/utils/supabase/server";
import type { SupaTypes } from "@services/supabase";

export default async function EventsPage() {
  const supabase = await createClient();
  const auth = await useServerSession();
  const { data: userEvents, error: userEventsError } = await supabase.from("users_events").select("*").eq("user_id", auth.session?.id as string);

  if (userEventsError) {
    console.error("Error fetching user events:", userEventsError);
  }

  const usersEventsSubscription = supabase
    .channel("custom-filter-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users_events",
        filter: `user_id=eq.${auth.session?.id}`,
      },
      (payload) => {
        console.log("Change received!", payload);
        if (payload.eventType === 'INSERT' && userEvents) {
          userEvents.push(payload.new as { event_id: number; user_id: string });
          getEvents()
        }
      },
    )
    .subscribe();

  let events: SupaTypes.Tables<"events">[] = [];

  const getEvents = async () => {
    if (userEvents?.length) {
      console.log('userEvents', userEvents)
      const { data, error: errorEvents } = await supabase
        .from("events")
        .select("*")
        .in(
          "id",
          userEvents.map((event) => event.event_id),
        );

      if (errorEvents) {
        console.error("Error fetching events:", errorEvents);
        return <div>Whops, no se lograron cargar los eventos.</div>;
      }

      events = data
    };
  }

  await getEvents()

  return <EventsPageComponent events={events} />;
}
