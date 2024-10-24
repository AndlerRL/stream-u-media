"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInAction = async (formData: FormData) => {
  const reqHeaders = await headers();
  const email = formData.get("email") as string;
  const searchParams = formData.get("searchParams");
  const searchParamsObj = JSON.parse(searchParams as string);
  const supabase = await createClient();
  const origin = reqHeaders.get("origin") as string;
  const emailRedirectTo = `${origin}/${searchParamsObj.redirect_to || "events"}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  });

  if (error) {
    console.log("error msg -> ", error.message);
    console.trace("error trace -> ", error);
    return encodedRedirect(
      "error",
      `/sign-in?redirect_to=${emailRedirectTo.replace(origin, "")}`,
      error.message
    );
  }

  return redirect(
    `/sign-in/otp?redirect_to=${emailRedirectTo.replace(origin, "")}`
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
