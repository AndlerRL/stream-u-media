import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";
import type { AuthPageProps } from "@/types/auth";

export default function Login({ searchParams }: AuthPageProps) {
  const { token } = searchParams;
  return (
    <main className="layout_container">
      <section className="flex flex-col w-full mx-auto px-4 py-20 items-center justify-center">
        <h1>Login</h1>
        <OTPForm token={token} />
      </section>
    </main>
  );
}
