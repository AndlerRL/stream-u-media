"use server";

import { createClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInAction = async (formData: FormData) => {
  const reqHeaders = await headers();
  const searchParams = formData.get("searchParams");
  const searchParamsObj = JSON.parse(searchParams as string);
  const email = formData.get("email") || searchParamsObj.email;
  const supabase = await createClient();
  const origin = reqHeaders.get("origin") as string;
  const emailRedirectTo = `/${searchParamsObj.redirect_to || "events"}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("error msg -> ", error.message);
    console.trace("error trace -> ", error);
    return encodedRedirect(
      "error",
      `/sign-in?redirect_to=${emailRedirectTo.replace(origin, "")}&email=${email}&error=${error.message}`,
      error.message
    );
  }

  return redirect(
    `/sign-in/otp?redirect_to=${emailRedirectTo.replace(origin, "")}&email=${email}`
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
