import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";

export async function useServerSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const socialSession = await getServerSession();

  return {
    session: data.user,
    socialSession,
    error,
  };
}
