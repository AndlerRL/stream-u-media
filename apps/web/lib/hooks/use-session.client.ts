import { useSession } from "@supabase/auth-helpers-react";
import { useSession as useSocialSession } from "next-auth/react";

export function useClientSession() {
  const session = useSession();
  const socialSession = useSocialSession() as { data: { user: { [key in 'twitter' | 'facebook' | 'instagram']?: any } } };

  if (socialSession.data?.user && session?.user) {
    const socialMediaKeys = ['twitter', 'facebook', 'instagram'] as const;

    socialMediaKeys.forEach((key) => {
      if (!session.user.user_metadata[key] && socialSession.data.user?.[key]) {
        session.user.user_metadata[key] = {
          ...socialSession.data.user[key],
        };
      }
    });
  }

  return {
    session: session?.user,
    socialSession,
  }
}