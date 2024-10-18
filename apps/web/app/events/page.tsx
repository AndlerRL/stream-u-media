import { EventsPageComponent } from "@/components/pages/events";
import { createClient } from "@/utils/supabase/server";

export default async function EventsPage() {
  const supabase = createClient()
  const { data: events, error } = await supabase.from("events").select("*");

  if (error) {
    console.error("Error fetching events:", error);
    return <div>Error loading events</div>;
  }

  return (
    <EventsPageComponent events={events} />
  );
}
