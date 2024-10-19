import { EventPageComponent } from '@/components/pages/event';
import { RootLayoutComponent } from '@/components/shared/root-layout';

export default function EventPage({ params }: { params: { slug: string } }) {

  return (
    <RootLayoutComponent>
      <EventPageComponent params={params} />
    </RootLayoutComponent>
  )
}