import { ProfilePageComponent } from "@/components/pages/profile";
import { RootLayoutComponent } from "@/components/shared/root-layout";

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const userParams = await params;

  return (
    <RootLayoutComponent>
      <ProfilePageComponent params={userParams} />
    </RootLayoutComponent>
  )
}