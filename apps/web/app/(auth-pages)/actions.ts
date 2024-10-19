"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const searchParams = formData.get("searchParams");
  const searchParamsObj = JSON.parse(searchParams as string);
  const supabase = createClient();
  const emailRedirectTo = `/${searchParamsObj.redirect_to || "events"}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    }
  });

  if (error) {
    console.log('error msg -> ', error.message)
    console.trace('error trace -> ', error)
    return encodedRedirect("error", `/sign-in?redirect_to=${emailRedirectTo}`, error.message);
  }

  return redirect(`/sign-in/otp?redirect_to=${emailRedirectTo}`);
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
