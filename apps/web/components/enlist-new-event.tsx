"use client";

import { Calendar, CalendarPlusIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { createClient } from "@/utils/supabase/client";
import type { SupaTypes } from "@services/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import { useAsync } from "react-use";
import { toast } from "sonner";

export function EnlistNewEvent({
  events,
}: { events: SupaTypes.Tables<"events">[] }) {
  const [open, setOpen] = React.useState(false);
  const supabase = createClient();
  const session = useSession();
  const {
    value: enlistedEvents,
    error,
    loading,
  } = useAsync(async () => {
    if (!session?.user.id) return;

    const getUserEvents = await supabase
      .from("users_events")
      .select("*")
      .eq("user_id", session.user.id);

    return getUserEvents;
  }, [session?.user.id]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key) {
        case "e":
          e.preventDefault();
          setOpen((open) => !open);
          break;
        case "j":
          e.preventDefault();
          createNewEvent();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getReadableDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const createNewEvent = () => {
    toast.info("Feature Coming Soon!");
  };

  const enlistToEvent = async (eventId: string) => {
    if (!session?.user.id) return;

    const { data, error } = await supabase.from("users_events").insert({
      user_id: session.user.id,
      event_id: Number.parseInt(eventId, 10),
    });

    if (error) {
      console.error("Error enlisting to event:", error);
      return;
    }

    toast.success("Enlisted to event successfully!");
    setOpen(false);
  };

  console.log('enlistedEvents', enlistedEvents)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" className="text-xl">Enlist to an Event</Button>
      <p className="text-sm text-muted-foreground">
        Or press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘ (ctrl)</span>+ E
        </kbd>{" "}
        to open
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Available Events">
            {events?.map((event) => {
              const isUserEnlisted = enlistedEvents?.data?.some(
                (e) => e.event_id === event.id,
              );
              return (
                <CommandItem
                  key={event.id}
                  disabled={isUserEnlisted}
                  className="flex flex-col !px-0"
                  value={event.id.toString()}
                  onSelect={enlistToEvent}
                >
                  <div className="flex w-full justify-center px-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{event.name}</span>
                    <div className="ml-auto flex flex-col items-end justify-end text-xs font-bold">
                      <code>Starts: {getReadableDate(event.start_at)}</code>
                      <code>Ends: {getReadableDate(event.ends_at)}</code>
                    </div>
                  </div>
                  {isUserEnlisted && (
                    <strong className="w-full text-center bg-destructive text-destructive-foreground relative left-0 rounded-b-sm bottom-0 text-xs">
                      You are already enlisted!
                    </strong>
                  )}
                </CommandItem>
              );
            })}
            {additionalOptions.map((option) => (
              <CommandItem
                key={option.label}
                value={option.value}
                onSelect={createNewEvent}
              >
                {option.icon && option.icon}
                <span>{option.label}</span>
                {option.hotkey && (
                  <CommandShortcut>{option.hotkey}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

const additionalOptions = [
  {
    icon: <CalendarPlusIcon className="mr-2 h-4 w-4" />,
    label: "Create New Event",
    value: "create-new-event",
    hotkey: "⌘ (ctrl) + J",
  },
];
