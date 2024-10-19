import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";

export default function Login({ searchParams: { token, token_hash, email } }: { searchParams: { otp: string, token: string, token_hash: string, email: string } }) {
  if (token_hash) {
    console.info("Token hash: ", token_hash);
  }

  return (
    <main className="layout_container">
      <section className="flex flex-col w-full mx-auto px-4 py-20 items-center justify-center">
        <h1>Login</h1>
        <OTPForm token={token} />
      </section>
    </main>
  );
}
