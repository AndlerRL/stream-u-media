import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";

export default function Login({ searchParams: { token, token_hash, email } }: { searchParams: { otp: string, token: string, token_hash: string, email: string } }) {
  if (token_hash) {
    console.info("Token hash: ", token_hash);
  }

  return (
    <div>
      <h1>Login</h1>
      <OTPForm token={token} />
    </div>
  );
}
