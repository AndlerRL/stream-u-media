import { createClient } from "@/lib/supabase/client";
import type { SupaTypes } from "@services/supabase";

const supabase = createClient();

export async function getUserEventsData(eventIds: number[]) {
  let events: SupaTypes.Tables<"events">[] = [];
  let error = "";

  try {
    const { data, error: errorEvents } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .order("start_at", { ascending: false });

    if (errorEvents) {
      console.error("Error fetching events:", errorEvents);
      throw new Error(errorEvents.message || "Error fetching events");
    }

    events = data;
  } catch (err) {
    console.error("Error fetching user events:", err);
    error = (err as Error).message;
  }

  return events;
}

export async function getAllEvents() {
  let events: SupaTypes.Tables<"events">[] = [];
  let error = "";

  try {
    const { data, error: errorEvents } = await supabase
      .from("events")
      .select("*")
      .order("start_at", { ascending: false });

    if (errorEvents) {
      console.error("Error fetching events:", errorEvents);
      throw new Error(errorEvents.message || "Error fetching events");
    }

    events = data;
  } catch (err) {
    console.error("Error fetching events:", err);
    error = (err as Error).message;
  }

  return events;
}
