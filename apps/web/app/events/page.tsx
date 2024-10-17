import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EventsPage() {
  const supabase = createClient()
  const events = await supabase.from("events").select("*");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

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
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <ul>
        {events?.data?.map((event) => (
          <li key={event.id} className="p-4 bg-accent text-foreground rounded-md">
            <h3 className="text-lg font-bold">{event.name}</h3>
            <p>{event.description}</p>

            <Button asChild className="w-auto">
              <Link href={`/events/${event.slug}`}>
                View event
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
