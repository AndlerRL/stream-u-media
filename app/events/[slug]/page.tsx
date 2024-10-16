import { EventPageComponent } from '@/components/pages/event';

export default function EventPage({ params }: { params: { slug: string } }) {

  return <EventPageComponent params={params} />
}