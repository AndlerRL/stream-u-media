import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateUsername } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams: reqSearchParams } = new URL(request.url);
  const token = reqSearchParams.get("token") ?? "";
  const email = reqSearchParams.get("email") ?? "";
  const type = reqSearchParams.get("type") as EmailOtpType | null;
  let next = `${process.env.APP_URL}${reqSearchParams.get("redirect_to") ?? ""}`;

  // if (next.match(/^\/events\/.*/g)) {
  if (next.includes("/events/eth-pura-vida")) {
    next = `${next.includes("?") ? "&" : "?"}reg=true`;
  }

  console.log("reqSearchParams -> ", reqSearchParams.toString());

  if (token && type) {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      type,
      token,
      // token_hash,
      email,
    });

    if (!session) {
      console.error("Error verifying OTP token: ", error);
      return redirect("/error");
    }

    if (
      !("username" in session.user.user_metadata) &&
      !("avatar" in session.user.user_metadata)
    ) {
      const sanitizedEmail = session.user.email
        ?.split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "");
      session.user.user_metadata.username = generateUsername(
        sanitizedEmail || "user"
      );
      session.user.user_metadata.avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${session.user.user_metadata.username}`;

      await supabase.auth.updateUser({
        data: session.user.user_metadata,
      });
    }

    console.log("Session created! 🔑 ");

    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
