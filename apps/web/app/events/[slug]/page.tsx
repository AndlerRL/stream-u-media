import { EventPageComponent } from '@/components/pages/event';

export default async function EventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ reg?: string }> }) {
  const search = await searchParams
  const eventParams = await params;

  return (
    <EventPageComponent params={eventParams} search={search} />
  )
}