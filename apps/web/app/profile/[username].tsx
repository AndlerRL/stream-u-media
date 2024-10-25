import { ProfilePageComponent } from "@/components/pages/profile";

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const userParams = await params;

  return (
    <ProfilePageComponent params={userParams} />
  )
}