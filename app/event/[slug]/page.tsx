import { EventPageComponent } from '@/components/pages/event';

export default function EventPage({ params }: { params: { id: string } }) {

  return <EventPageComponent params={params} />
}