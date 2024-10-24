import { EventPageComponent } from '@/components/pages/event';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const eventParams = await params;
  return (
    <EventPageComponent params={eventParams} />
  )
}