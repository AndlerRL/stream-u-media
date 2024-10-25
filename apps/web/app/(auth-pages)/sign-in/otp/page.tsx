import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthPageProps } from "@/types/auth";

export default async function Login({ searchParams }: AuthPageProps) {
  const query = await searchParams;
  return (
    <main className="layout_container px-4 py-16 top-0" style={{ background: "var(--gradient)" }}>
      <Card className="flex flex-col w-full mx-auto px-4 py-20 items-center justify-center">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <OTPForm query={query} />
        </CardContent>
      </Card>
    </main>
  );
}
