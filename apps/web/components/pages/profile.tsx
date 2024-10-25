import RootLayout from "@/app/layout";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";

export async function ProfilePageComponent({ params }: { params: { username: string } }) {
  const userParams = params;
  return (
    <RootLayout>
      <Card>
        <CardHeader>Profile: {userParams.username}</CardHeader>
        <CardDescription>
          <p>Some user profile information...</p>
        </CardDescription>
      </Card>
    </RootLayout>
  )
}