"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const supabase = createClient();
  const origin = headers().get("origin");

  console.log('`${origin}/sign-in/otp`', `${origin}/sign-in/otp`)

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // emailRedirectTo: `${origin}/auth/confirm`,
      emailRedirectTo: `${origin}/sign-in/otp`,
    }
  });

  if (error) {
    console.log('error msg -> ', error.message)
    console.trace('error trace -> ', error)
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/sign-in/otp");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
