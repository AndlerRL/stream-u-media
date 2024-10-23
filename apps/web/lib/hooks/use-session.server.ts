import { createClient } from "@/utils/supabase/server";

export async function useServerSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return {
    session: data.user,
    error,
  };
}
