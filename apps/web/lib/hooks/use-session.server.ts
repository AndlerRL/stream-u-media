import { createClient } from "@/lib/supabase/server";

export async function useServerSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return {
    session: data.user,
    error,
  };
}
