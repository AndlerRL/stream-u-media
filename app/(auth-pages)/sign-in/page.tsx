import { signInAction } from "@/app/(auth-pages)/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <form className="relative flex-1 flex w-full flex-col items-center justify-center min-w-64">
      <Button asChild variant="link" className="absolute top-5 left-5 font-medium">
        <Link href="/" className="flex gap-1">
          <ArrowLeftIcon className="size-5" />
          Back
        </Link>
      </Button>
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="text-lg text-center font-medium">Sign in with an OTP</p>
      <section className="flex flex-col w-full max-w-xs gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        {/* <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        /> */}
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </section>
    </form>
  );
}
