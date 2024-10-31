import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthPageProps } from "@/types/auth";

export default async function Login({ searchParams }: AuthPageProps) {
  const query = await searchParams;
  return (
    <main className="layout_container px-4 py-16 top-0" style={{ background: "var(--gradient)" }}>
      <Card className="flex flex-col w-full max-w-[450px] mx-auto px-4 py-20 items-center justify-center">
        <CardHeader>
          <CardTitle>
            MintMoments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <CardDescription>
            Type the OTP sent to your email
          </CardDescription>
          <OTPForm query={query} />
        </CardContent>
      </Card>
    </main>
  );
}
