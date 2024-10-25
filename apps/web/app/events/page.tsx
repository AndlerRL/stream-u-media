import { EventsPageComponent } from "@/components/pages/events";
import { useServerSession } from "@/lib/hooks/use-session.server";
import { getUserEventsData } from "@/services/supabase-client.service";
import { createClient } from "@/utils/supabase/server";

export default async function EventsPage() {
  const supabase = await createClient();
  const auth = await useServerSession();
  const { data: userEvents, error: userEventsError } = await supabase.from("users_events").select("*").eq("user_id", auth.session?.id as string);
  const eventIds = userEvents?.map((event) => event.event_id) ?? [];
  const events = await getUserEventsData(eventIds);

  if (userEventsError) {
    console.error("Error fetching user events:", userEventsError);
  }

  return <EventsPageComponent events={events} />;
}
