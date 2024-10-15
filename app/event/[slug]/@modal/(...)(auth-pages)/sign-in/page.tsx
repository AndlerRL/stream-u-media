import { OTPForm } from "@/components/pages/sign-in/otp/otp-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";

export default function Login({ searchParams: { token } }: { searchParams: { token: string } }) {
  const session = useSession();

  return (
    <Dialog open={!Boolean(session?.user.id)}>
      <DialogContent>
        <h1>Login</h1>
        <OTPForm token={token} />
      </DialogContent>
    </Dialog>
  );
}
