import { signOutAction } from "@/app/(auth-pages)/actions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";

export async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <Button asChild size="lg" variant="outline" className="text-lg mx-auto">
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );
}
